"use server";

import { revalidatePath } from "next/cache";
import { getCart, saveCart } from "@/lib/cart";
import { getMenuItem } from "@/lib/db";

function parseIdQty(formData: FormData) {
  const id = Number(formData.get("id"));
  const qty = Number(formData.get("qty") ?? 1);
  if (!Number.isInteger(id) || id < 1) return null;
  if (!Number.isInteger(qty) || qty < 0 || qty > 20) return null;
  return { id, qty };
}

export async function addToCart(formData: FormData) {
  const parsed = parseIdQty(formData);
  if (!parsed) return;
  const item = getMenuItem(parsed.id);
  if (!item || !item.available) return;
  const cart = await getCart();
  const existing = cart.find((l) => l.id === parsed.id);
  if (existing) existing.qty = Math.min(20, existing.qty + Math.max(1, parsed.qty));
  else cart.push({ id: parsed.id, qty: Math.max(1, parsed.qty) });
  await saveCart(cart);
  revalidatePath("/", "layout");
}

export async function updateCartLine(formData: FormData) {
  const parsed = parseIdQty(formData);
  if (!parsed) return;
  const cart = (await getCart()).filter((l) => l.id !== parsed.id);
  if (parsed.qty > 0) cart.push({ id: parsed.id, qty: parsed.qty });
  await saveCart(cart);
  revalidatePath("/", "layout");
}

export async function clearCart() {
  await saveCart([]);
  revalidatePath("/", "layout");
}
