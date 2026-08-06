/** Máscara e normalização de telefone brasileiro/internacional. */

export function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

/** Formata para exibição: +55 (11) 99999-9999 */
export function formatPhone(value: string) {
  const d = onlyDigits(value).slice(0, 13);
  if (!d) return "";
  if (d.length <= 2) return `+${d}`;
  const ddi = d.slice(0, 2);
  const ddd = d.slice(2, 4);
  const rest = d.slice(4);
  let out = `+${ddi}`;
  if (ddd) out += ` (${ddd}`;
  if (ddd.length === 2) out += ")";
  if (rest) {
    const head = rest.length > 8 ? rest.slice(0, 5) : rest.slice(0, 4);
    const tail = rest.slice(head.length);
    out += ` ${head}`;
    if (tail) out += `-${tail}`;
  }
  return out;
}

/** Formata número local do paciente: (11) 99999-9999 */
export function formatLocalPhone(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  const head = rest.length > 8 ? rest.slice(0, 5) : rest.slice(0, 4);
  const tail = rest.slice(head.length);
  return `(${ddd}) ${head}${tail ? `-${tail}` : ""}`;
}

export function isValidWhatsapp(value: string) {
  const d = onlyDigits(value);
  return d.length >= 10 && d.length <= 13;
}

export function whatsappLink(number: string, message?: string) {
  const d = onlyDigits(number);
  return `https://wa.me/${d}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
