"use server";

import { redirect } from "next/navigation";
import { cartSummary, saveCart } from "@/lib/cart";
import { getDb, getSetting } from "@/lib/db";
import {
  cleanMessage,
  outwardCode,
  requireEmail,
  requirePhone,
  requirePostcode,
  requireText,
} from "@/lib/validation";

export type OrderState = { error?: string };

function nextReference() {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const n = Math.floor(1000 + Math.random() * 9000);
  return `KK-${day}-${n}`;
}

export async function placeOrder(
  _prev: OrderState,
  formData: FormData,
): Promise<OrderState> {
  const { items, subtotal, deliveryFee, deliveryMin } = await cartSummary();
  if (items.length === 0) return { error: "Your bag is empty." };

  const name = requireText(formData.get("name"), 80);
  const email = requireEmail(formData.get("email"));
  const phone = requirePhone(formData.get("phone"));
  const fulfilment = String(formData.get("fulfilment") ?? "");
  const notes = cleanMessage(formData.get("notes"), 500);
  const allergensOk = formData.get("allergens_ok") === "on";
  const termsOk = formData.get("terms_ok") === "on";

  if (!name || !email || !phone) {
    return { error: "Name, email and a UK-style phone number are required." };
  }
  if (fulfilment !== "collection" && fulfilment !== "delivery") {
    return { error: "Choose collection or delivery." };
  }
  if (!allergensOk || !termsOk) {
    return { error: "Please confirm allergens and the terms of sale." };
  }

  let deliveryPence = 0;
  let address: Record<string, string> | null = null;

  if (fulfilment === "delivery") {
    if (getSetting("delivery_enabled", "1") !== "1") {
      return { error: "Delivery is paused. Please collect." };
    }
    if (subtotal < deliveryMin) {
      return { error: `Delivery wants a minimum order of ${(deliveryMin / 100).toFixed(2)}.` };
    }
    const line = requireText(formData.get("address"), 120);
    const city = requireText(formData.get("city"), 60);
    const postcode = requirePostcode(formData.get("postcode"));
    if (!line || !city || !postcode) {
      return { error: "Delivery needs a street, city and full UK postcode." };
    }
    const allowed = getSetting("delivery_postcodes", "SW2")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    const outward = outwardCode(postcode);
    if (allowed.length && !allowed.some((code) => outward.startsWith(code))) {
      return { error: `We only deliver to ${allowed.join(", ")} at the moment.` };
    }
    deliveryPence = deliveryFee;
    address = { line, city, postcode };
  }

  const total = subtotal + deliveryPence;
  const reference = nextReference();
  const database = getDb();
  const result = database
    .prepare(
      `INSERT INTO orders
        (reference, source, status, fulfilment, customer_name, customer_email, customer_phone,
         address_json, notes, subtotal_pence, delivery_pence, total_pence, payment)
       VALUES (?, 'native', 'received', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pay_on_fulfilment')`,
    )
    .run(
      reference,
      fulfilment,
      name,
      email,
      phone,
      address ? JSON.stringify(address) : null,
      notes,
      subtotal,
      deliveryPence,
      total,
    );

  const orderId = Number(result.lastInsertRowid);
  const insertItem = database.prepare(
    "INSERT INTO order_items (order_id, menu_item_id, name, quantity, unit_pence) VALUES (?, ?, ?, ?, ?)",
  );
  for (const item of items) {
    insertItem.run(orderId, item.id, item.name, item.qty, item.price_pence);
  }

  await saveCart([]);
  redirect(`/order/thanks/${reference}`);
}
