import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getMenuItem, getSetting } from "@/lib/db";

const COOKIE = "kk_cart";
const MAX_AGE = 60 * 60 * 24 * 7;

export type CartLine = { id: number; qty: number };

function secret() {
  return process.env.SESSION_SECRET || "dev-only-session-secret-change-me";
}

function sign(payload: string) {
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function unsign(token: string) {
  const cut = token.lastIndexOf(".");
  if (cut < 1) return null;
  const payload = token.slice(0, cut);
  const sig = token.slice(cut + 1);
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return payload;
}

export async function getCart(): Promise<CartLine[]> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return [];
  const payload = unsign(raw);
  if (!payload) return [];
  try {
    const parsed = JSON.parse(payload) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l) => Number.isInteger(l.id) && Number.isInteger(l.qty) && l.qty > 0)
      .slice(0, 40);
  } catch {
    return [];
  }
}

export async function saveCart(lines: CartLine[]) {
  const cleaned = lines.filter((l) => l.qty > 0).slice(0, 40);
  const store = await cookies();
  if (cleaned.length === 0) {
    store.delete(COOKIE);
    return;
  }
  store.set(COOKIE, sign(JSON.stringify(cleaned)), {
    httpOnly: true,
    sameSite: "lax",
    secure: (process.env.APP_URL || "").startsWith("https"),
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function cartSummary() {
  const lines = await getCart();
  const items = [];
  let subtotal = 0;
  let count = 0;
  for (const line of lines) {
    const item = getMenuItem(line.id);
    if (!item || !item.available) continue;
    const lineTotal = item.price_pence * line.qty;
    subtotal += lineTotal;
    count += line.qty;
    items.push({ ...item, qty: line.qty, lineTotal });
  }
  const deliveryFee = Number(getSetting("delivery_fee_pence", "350"));
  const deliveryMin = Number(getSetting("delivery_min_pence", "2000"));
  return { items, count, subtotal, deliveryFee, deliveryMin };
}
