import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { SmileQuiz } from "@/components/smile/SmileQuiz";
import {
  COPY_LABELS,
  DEFAULT_COPY,
  DEFAULT_IMAGES,
  IMAGE_LABELS,
  STEP_BLOCKS,
} from "@/config/quiz";
import { FONT_PAIRS, PALETTES } from "@/config/theme";
import { formatPhone, isValidWhatsapp, onlyDigits } from "@/lib/phone";
import { saveClinic, type ClinicInput, type PublicClinic } from "@/lib/clinics.functions";

const input =
  "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[14px] text-foreground outline-none focus:border-gold";
const label = "block text-[12px] text-muted-foreground";

export function ClinicForm({ initial }: { initial: ClinicInput }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<ClinicInput>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const set = (patch: Partial<ClinicInput>) => setForm((f) => ({ ...f, ...patch }));

  const whatsappOk = isValidWhatsapp(form.whatsapp);

  const previewClinic: PublicClinic = useMemo(
    () => ({
      id: "preview",
      slug: form.slug || "preview",
      name: form.name || "Sua clínica",
      city: form.city ?? null,
      whatsapp: onlyDigits(form.whatsapp) || "5511999999999",
      logo_url: form.logo_url || null,
      palette: form.palette,
      font_pair: form.font_pair,
      images: form.images,
      copy: form.copy,
    }),
    [form],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappOk) {
      setMsg("Informe o WhatsApp com DDI e DDD. Ex.: +55 (11) 99999-9999");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const r = await saveClinic({ data: { ...form, whatsapp: onlyDigits(form.whatsapp) } });
      setMsg("Alterações salvas.");
      // Depois de criar, o gestor vai direto para o acompanhamento da clínica.
      if (!form.id && r.id) {
        navigate({ to: "/admin/clinicas/$id", params: { id: r.id }, search: { tab: "analytics" } });
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_430px]">
      <form onSubmit={submit} className="grid gap-5">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-serif text-[18px] text-foreground">Dados da clínica</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className={label}>
              Nome
              <input className={input} value={form.name} onChange={(e) => set({ name: e.target.value })} required />
            </label>
            <label className={label}>
              Link (slug) — /c/{form.slug || "…"}
              <input className={input} value={form.slug} onChange={(e) => set({ slug: e.target.value })} required />
            </label>
            <label className={label}>
              Cidade
              <input className={input} value={form.city ?? ""} onChange={(e) => set({ city: e.target.value })} />
            </label>
            <label className={label}>
              WhatsApp de atendimento
              <span className="relative mt-1 block">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                    <path d="M20 3.5A11.5 11.5 0 003 19l-1 4 4.2-1.1A11.5 11.5 0 1020 3.5zm-8.5 18a9.5 9.5 0 01-4.9-1.4l-.3-.2-2.5.7.7-2.4-.2-.4A9.5 9.5 0 1111.5 21.5z" />
                  </svg>
                </span>
                <input
                  className={`${input} mt-0 pl-9`}
                  value={formatPhone(form.whatsapp)}
                  inputMode="numeric"
                  onChange={(e) => set({ whatsapp: onlyDigits(e.target.value) })}
                  placeholder="+55 (11) 99999-9999"
                  required
                />
              </span>
              <span className={`mt-1 block text-[11px] ${whatsappOk ? "text-muted-foreground" : "text-red-600"}`}>
                {whatsappOk
                  ? "É para este número que os pacientes serão enviados."
                  : "Digite DDI + DDD + número. Ex.: +55 (11) 99999-9999"}
              </span>
            </label>
            <label className={`${label} sm:col-span-2`}>
              Logo (URL)
              <input className={input} value={form.logo_url ?? ""} onChange={(e) => set({ logo_url: e.target.value })} />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-serif text-[18px] text-foreground">Contrato e venda</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className={label}>
              Início do contrato
              <input
                type="date"
                className={input}
                value={form.contract_start ?? ""}
                onChange={(e) => set({ contract_start: e.target.value })}
              />
            </label>
            <label className={label}>
              Término do contrato
              <input
                type="date"
                className={input}
                value={form.contract_end ?? ""}
                onChange={(e) => set({ contract_end: e.target.value })}
              />
            </label>
            <label className={label}>
              Valor da venda (R$)
              <input
                type="number"
                step="0.01"
                min="0"
                className={input}
                value={form.contract_value ?? ""}
                onChange={(e) =>
                  set({ contract_value: e.target.value === "" ? null : Number(e.target.value) })
                }
              />
            </label>
            <label className={label}>
              Data da venda
              <input
                type="date"
                className={input}
                value={form.sale_date ?? ""}
                onChange={(e) => set({ sale_date: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 text-[13px] text-foreground">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => set({ is_active: e.target.checked })}
              />
              Link ativo
            </label>
          </div>
          {form.contract_start && form.contract_start > new Date().toISOString().slice(0, 10) && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
              O contrato começa no futuro: o link só abrirá a partir de{" "}
              {new Date(`${form.contract_start}T00:00:00`).toLocaleDateString("pt-BR")}.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-serif text-[18px] text-foreground">Identidade visual</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">As mudanças aparecem no preview ao lado.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {PALETTES.map((p) => (
              <button
                type="button"
                key={p.key}
                onClick={() => set({ palette: p.key })}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left ${form.palette === p.key ? "border-gold" : "border-border"}`}
              >
                <span className="flex gap-1">
                  {p.swatch.map((c) => (
                    <span key={c} className="h-5 w-5 rounded-full" style={{ background: c }} />
                  ))}
                </span>
                <span className="text-[13px] text-foreground">{p.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {FONT_PAIRS.map((f) => (
              <button
                type="button"
                key={f.key}
                onClick={() => set({ font_pair: f.key })}
                className={`rounded-xl border p-3 text-[13px] text-foreground ${form.font_pair === f.key ? "border-gold" : "border-border"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {STEP_BLOCKS.map((block) => (
          <section key={block.key} className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-serif text-[18px] text-foreground">{block.title}</h2>
            {block.hint && <p className="mt-1 text-[12px] text-muted-foreground">{block.hint}</p>}

            {block.images.length > 0 && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {block.images.map((key) => (
                  <ImageField
                    key={key}
                    label={IMAGE_LABELS[key] ?? key}
                    value={form.images[key] ?? ""}
                    fallback={DEFAULT_IMAGES[key]}
                    onChange={(v) => set({ images: { ...form.images, [key]: v } })}
                  />
                ))}
              </div>
            )}

            <div className="mt-4 grid gap-3">
              {block.fields.map((key) => (
                <label key={key} className={label}>
                  {COPY_LABELS[key] ?? key}
                  <input
                    className={input}
                    value={form.copy[key] ?? DEFAULT_COPY[key] ?? ""}
                    onChange={(e) => set({ copy: { ...form.copy, [key]: e.target.value } })}
                  />
                </label>
              ))}
            </div>
          </section>
        ))}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-primary px-5 py-3 text-[14px] text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="rounded-xl border border-border px-4 py-3 text-[13px] text-muted-foreground lg:hidden"
          >
            {showPreview ? "Ocultar preview" : "Ver preview"}
          </button>
          {msg && <p className="text-[13px] text-muted-foreground">{msg}</p>}
        </div>
      </form>

      <aside className={`${showPreview ? "" : "hidden"} lg:block`}>
        <div className="sticky top-6">
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Preview em tempo real
          </p>
          <div className="overflow-hidden rounded-[28px] border border-border bg-background shadow-card">
            <div className="h-[720px] overflow-hidden">
              <SmileQuiz key={`${form.palette}-${form.font_pair}`} clinic={previewClinic} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ImageField({
  label: title,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string;
  fallback?: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const src = value || fallback;
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-[12px] text-muted-foreground">{title}</p>
      {src && (
        <img
          src={src}
          alt={title}
          className="mt-2 aspect-[16/10] w-full rounded-lg object-cover"
          loading="lazy"
        />
      )}
      {editing ? (
        <div className="mt-2 flex gap-2">
          <input
            autoFocus
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-gold"
            placeholder="Cole a URL da imagem"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="shrink-0 rounded-lg bg-primary px-3 text-[12px] text-primary-foreground"
          >
            Ok
          </button>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:text-foreground"
          >
            Alterar imagem
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[12px] text-muted-foreground underline"
            >
              Usar padrão
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export const EMPTY_CLINIC: ClinicInput = {
  slug: "",
  name: "",
  city: "",
  whatsapp: "",
  logo_url: "",
  contract_start: null,
  contract_end: null,
  contract_value: null,
  sale_date: null,
  is_active: true,
  palette: "marfim",
  font_pair: "cormorant",
  images: {},
  copy: {},
};
