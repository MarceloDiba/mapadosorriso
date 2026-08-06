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

/* ------------------------------ Público ------------------------------ */

export const getClinicBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 80) }))
  .handler(async ({ data }): Promise<PublicClinic | null> => {
    const { data: row } = await publicClient()
      .from("clinics")
      .select("id, slug, name, city, whatsapp, logo_url, palette, font_pair, images, copy")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!row) return null;
    return {
      ...row,
      images: (row.images ?? {}) as Record<string, string>,
      copy: (row.copy ?? {}) as Record<string, string>,
    } as PublicClinic;
  });

export const startSession = createServerFn({ method: "POST" })
  .inputValidator((data: { clinicId: string }) => ({ clinicId: String(data.clinicId) }))
  .handler(async ({ data }) => {
    const { data: row } = await publicClient()
      .from("clinic_sessions")
      .insert({ clinic_id: data.clinicId })
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
    if (Object.keys(patch).length === 0) return { ok: true };
    await publicClient().from("clinic_sessions").update(patch).eq("id", data.sessionId);
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
      .select("id, slug, name, city, is_active, contract_start, contract_end, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
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
