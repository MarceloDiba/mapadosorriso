import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { COPY_FIELDS, DEFAULT_COPY, IMAGE_SLOTS } from "@/config/quiz";
import { FONT_PAIRS, PALETTES } from "@/config/theme";
import { saveClinic, type ClinicInput } from "@/lib/clinics.functions";

const input =
  "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-[14px] text-foreground outline-none focus:border-gold";
const label = "block text-[12px] text-muted-foreground";

export function ClinicForm({ initial }: { initial: ClinicInput }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<ClinicInput>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const set = (patch: Partial<ClinicInput>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const r = await saveClinic({ data: form });
      setMsg("Alterações salvas.");
      if (!form.id && r.id) navigate({ to: "/admin/clinicas/$id", params: { id: r.id } });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
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
            WhatsApp (com DDI e DDD, só números)
            <input
              className={input}
              value={form.whatsapp}
              onChange={(e) => set({ whatsapp: e.target.value })}
              placeholder="5511999999999"
              required
            />
          </label>
          <label className={`${label} sm:col-span-2`}>
            Logo (URL)
            <input className={input} value={form.logo_url ?? ""} onChange={(e) => set({ logo_url: e.target.value })} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-serif text-[18px] text-foreground">Contrato</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className={label}>
            Início
            <input
              type="date"
              className={input}
              value={form.contract_start ?? ""}
              onChange={(e) => set({ contract_start: e.target.value })}
            />
          </label>
          <label className={label}>
            Término
            <input
              type="date"
              className={input}
              value={form.contract_end ?? ""}
              onChange={(e) => set({ contract_end: e.target.value })}
            />
          </label>
          <label className="mt-6 flex items-center gap-2 text-[13px] text-foreground">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set({ is_active: e.target.checked })}
            />
            Link ativo
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-serif text-[18px] text-foreground">Identidade visual</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">Use variações para testes A/B.</p>
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

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-serif text-[18px] text-foreground">Imagens</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Cole a URL de cada foto. Em branco, usamos a imagem padrão.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {IMAGE_SLOTS.map((slot) => (
            <label key={slot.key} className={label}>
              {slot.label}
              <input
                className={input}
                value={form.images[slot.key] ?? ""}
                onChange={(e) => set({ images: { ...form.images, [slot.key]: e.target.value } })}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-serif text-[18px] text-foreground">Textos</h2>
        <div className="mt-4 grid gap-3">
          {COPY_FIELDS.map((f) => (
            <label key={f.key} className={label}>
              {f.label}
              <input
                className={input}
                placeholder={DEFAULT_COPY[f.key]}
                value={form.copy[f.key] ?? ""}
                onChange={(e) => set({ copy: { ...form.copy, [f.key]: e.target.value } })}
              />
            </label>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-primary px-5 py-3 text-[14px] text-primary-foreground disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar"}
        </button>
        {msg && <p className="text-[13px] text-muted-foreground">{msg}</p>}
      </div>
    </form>
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
  is_active: true,
  palette: "marfim",
  font_pair: "cormorant",
  images: {},
  copy: {},
};
