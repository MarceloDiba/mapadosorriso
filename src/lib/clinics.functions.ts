import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

/* --------------------------- Cliente público --------------------------- */

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type PublicClinic = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  whatsapp: string;
  logo_url: string | null;
  palette: string;
  font_pair: string;
  images: Record<string, string>;
  copy: Record<string, string>;
};

export type ClinicStatusReason = "ok" | "not_found" | "inactive" | "scheduled" | "expired";

export type ClinicResolution = {
  clinic: PublicClinic | null;
  reason: ClinicStatusReason;
  startsAt?: string | null;
};

/* ------------------------------ Público ------------------------------ */

export const getClinicBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 80) }))
  .handler(async ({ data }): Promise<ClinicResolution> => {
    const { data: row } = await publicClient()
      .from("clinics")
      .select(
        "id, slug, name, city, whatsapp, logo_url, palette, font_pair, images, copy, is_active, contract_start, contract_end",
      )
      .eq("slug", data.slug)
      .maybeSingle();
    if (!row) return { clinic: null, reason: "not_found" };
    if (!row.is_active) return { clinic: null, reason: "inactive" };
    const today = new Date().toISOString().slice(0, 10);
    if (row.contract_start && row.contract_start > today) {
      return { clinic: null, reason: "scheduled", startsAt: row.contract_start };
    }
    if (row.contract_end && row.contract_end < today) return { clinic: null, reason: "expired" };

    return {
      reason: "ok",
      clinic: {
        ...row,
        images: (row.images ?? {}) as Record<string, string>,
        copy: (row.copy ?? {}) as Record<string, string>,
      } as PublicClinic,
    };
  });

export const startSession = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      clinicId: string;
      utmSource?: string | null;
      utmMedium?: string | null;
      utmCampaign?: string | null;
    }) => data,
  )
  .handler(async ({ data }) => {
    const trim = (v?: string | null) => (v ? String(v).slice(0, 80) : null);
    const { data: row } = await publicClient()
      .from("clinic_sessions")
      .insert({
        clinic_id: data.clinicId,
        utm_source: trim(data.utmSource),
        utm_medium: trim(data.utmMedium),
        utm_campaign: trim(data.utmCampaign),
      })
      .select("id")
      .maybeSingle();
    return { id: row?.id ?? null };
  });

export const updateSession = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      sessionId: string;
      style?: string | null;
      concerns?: string[];
      objection?: string | null;
      decision?: string | null;
      completed?: boolean;
      whatsappClicked?: boolean;
      funnelStep?: string | null;
      leadName?: string | null;
      leadPhone?: string | null;
    }) => data,
  )
  .handler(async ({ data }) => {
    const patch: Record<string, unknown> = {};
    if (data.style !== undefined) patch["style"] = data.style;
    if (data.concerns !== undefined) patch["concerns"] = data.concerns.slice(0, 5);
    if (data.objection !== undefined) patch["objection"] = data.objection;
    if (data.decision !== undefined) patch["decision"] = data.decision;
    if (data.completed !== undefined) patch["completed"] = data.completed;
    if (data.whatsappClicked !== undefined) patch["whatsapp_clicked"] = data.whatsappClicked;
    if (data.funnelStep) patch["funnel_step"] = String(data.funnelStep).slice(0, 30);
    if (data.leadName) patch["lead_name"] = String(data.leadName).slice(0, 80);
    if (data.leadPhone) patch["lead_phone"] = String(data.leadPhone).slice(0, 30);
    if (Object.keys(patch).length === 0) return { ok: true };
    await publicClient()
      .from("clinic_sessions")
      .update(patch as never)
      .eq("id", data.sessionId);
    return { ok: true };
  });

/* ------------------------------- Admin ------------------------------- */

async function assertAdmin(supabase: ReturnType<typeof publicClient>, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Acesso restrito a administradores.");
}

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { admin: !!data };
  });

export const listClinics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data, error } = await context.supabase
      .from("clinics")
      .select(
        "id, slug, name, city, whatsapp, is_active, contract_start, contract_end, contract_value, sale_date, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** Visão geral do painel: ativos, cliques, finalizados, gargalo e vendas. */
export const getOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { days?: number }) => ({
    days: data?.days && [7, 30, 90, 365].includes(data.days) ? data.days : 30,
  }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const sinceDate = new Date(Date.now() - data.days * 86400000);
    const since = sinceDate.toISOString();
    const sinceDay = since.slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    const [{ data: clinics }, { data: sessions }] = await Promise.all([
      context.supabase
        .from("clinics")
        .select("id, name, is_active, contract_start, contract_end, contract_value, sale_date"),
      context.supabase
        .from("clinic_sessions")
        .select("id, completed, whatsapp_clicked, funnel_step, utm_source, created_at")
        .gte("created_at", since)
        .limit(5000),
    ]);

    const list = clinics ?? [];
    const active = list.filter(
      (c) =>
        c.is_active &&
        (!c.contract_start || c.contract_start <= today) &&
        (!c.contract_end || c.contract_end >= today),
    );
    const expiringSoon = list.filter((c) => {
      if (!c.contract_end) return false;
      const diff = (new Date(c.contract_end).getTime() - Date.now()) / 86400000;
      return diff >= 0 && diff <= 15;
    });
    const scheduled = list.filter((c) => c.contract_start && c.contract_start > today);
    const expired = list.filter((c) => c.contract_end && c.contract_end < today);

    const s = sessions ?? [];
    const views = s.length;
    const completed = s.filter((r) => r.completed).length;
    const clicks = s.filter((r) => r.whatsapp_clicked).length;

    const dropoff: Record<string, number> = {};
    for (const step of FUNNEL_STEPS) dropoff[step.key] = 0;
    for (const row of s) {
      const step = FUNNEL_STEPS.find((f) => f.value === row.funnel_step);
      if (step && !row.whatsapp_clicked) dropoff[step.key] = (dropoff[step.key] ?? 0) + 1;
    }
    const bottleneck = FUNNEL_STEPS.slice(0, 4).reduce(
      (best, step) => ((dropoff[step.key] ?? 0) > (dropoff[best] ?? 0) ? step.key : best),
      FUNNEL_STEPS[0].key,
    );

    const sales = list.filter((c) => c.sale_date && c.sale_date >= sinceDay);
    const revenue = sales.reduce((sum, c) => sum + Number(c.contract_value ?? 0), 0);

    const sources: Record<string, number> = {};
    for (const row of s) {
      const key = row.utm_source || "direto";
      sources[key] = (sources[key] ?? 0) + 1;
    }

    return {
      days: data.days,
      totalClinics: list.length,
      activeClinics: active.length,
      scheduled: scheduled.map((c) => ({ id: c.id, name: c.name, date: c.contract_start })),
      expired: expired.map((c) => ({ id: c.id, name: c.name, date: c.contract_end })),
      expiringSoon: expiringSoon.map((c) => ({ id: c.id, name: c.name, date: c.contract_end })),
      views,
      completed,
      clicks,
      completionRate: views ? Math.round((completed / views) * 100) : 0,
      dropoff,
      bottleneck,
      salesCount: sales.length,
      revenue,
      sources,
    };
  });

export const getClinic = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => ({ id: String(data.id) }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data: row, error } = await context.supabase
      .from("clinics")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export type ClinicInput = {
  id?: string;
  slug: string;
  name: string;
  city?: string | null;
  whatsapp: string;
  logo_url?: string | null;
  contract_start?: string | null;
  contract_end?: string | null;
  contract_value?: number | null;
  sale_date?: string | null;
  is_active: boolean;
  palette: string;
  font_pair: string;
  images: Record<string, string>;
  copy: Record<string, string>;
};

const RESERVED = ["admin", "api", "c", "auth", "login", "assets", "public"];

export const saveClinic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: ClinicInput) => data)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase as never, context.userId);

    const slug = data.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (slug.length < 3) throw new Error("O link precisa de pelo menos 3 caracteres.");
    if (RESERVED.includes(slug)) throw new Error("Este link é reservado pelo sistema.");
    if (!data.name.trim()) throw new Error("Informe o nome da clínica.");

    const whatsapp = data.whatsapp.replace(/\D/g, "");
    if (whatsapp.length < 10) throw new Error("Informe o WhatsApp com DDI e DDD.");

    const payload = {
      slug,
      name: data.name.trim(),
      city: data.city?.trim() || null,
      whatsapp,
      logo_url: data.logo_url?.trim() || null,
      contract_start: data.contract_start || null,
      contract_end: data.contract_end || null,
      is_active: data.is_active,
      palette: data.palette,
      font_pair: data.font_pair,
      images: data.images,
      copy: data.copy,
    };

    if (data.id) {
      const { error } = await context.supabase.from("clinics").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    const { data: row, error } = await context.supabase
      .from("clinics")
      .insert(payload)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { id: row?.id as string };
  });

export const setClinicActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; active: boolean }) => data)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase
      .from("clinics")
      .update({ is_active: data.active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteClinic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase.from("clinics").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getClinicAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; days?: number }) => ({
    id: String(data.id),
    days: data.days && [7, 30, 90].includes(data.days) ? data.days : 30,
  }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const since = new Date(Date.now() - data.days * 86400000).toISOString();
    const { data: rows, error } = await context.supabase
      .from("clinic_sessions")
      .select("id, style, concerns, objection, decision, completed, whatsapp_clicked, created_at")
      .eq("clinic_id", data.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    const list = rows ?? [];
    const views = list.length;
    const completed = list.filter((r) => r.completed).length;
    const clicks = list.filter((r) => r.whatsapp_clicked).length;
    return {
      days: data.days,
      views,
      completed,
      clicks,
      completionRate: views ? Math.round((completed / views) * 100) : 0,
      leads: list.filter((r) => r.completed),
    };
  });
