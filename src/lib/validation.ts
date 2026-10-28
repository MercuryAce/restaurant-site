const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[0-9+\s()-]{8,20}$/;
const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export function requireText(value: FormDataEntryValue | null, max = 200) {
  const text = String(value ?? "").trim();
  if (!text || text.length > max) return null;
  return text;
}

export function requireEmail(value: FormDataEntryValue | null) {
  const text = requireText(value, 120);
  if (!text || !EMAIL.test(text)) return null;
  return text.toLowerCase();
}

export function requirePhone(value: FormDataEntryValue | null) {
  const text = requireText(value, 24);
  if (!text || !PHONE.test(text)) return null;
  return text;
}

export function requirePostcode(value: FormDataEntryValue | null) {
  const text = requireText(value, 12);
  if (!text || !POSTCODE.test(text)) return null;
  return text.toUpperCase().replace(/\s+/g, " ");
}

export function outwardCode(postcode: string) {
  return postcode.trim().toUpperCase().split(" ")[0] ?? "";
}

export function cleanMessage(value: FormDataEntryValue | null, max = 2000) {
  return String(value ?? "").trim().slice(0, max);
}
