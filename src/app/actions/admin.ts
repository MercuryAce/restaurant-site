"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, setSetting } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { hashPassword } from "@/lib/password";
import { syncConnector } from "@/lib/connectors";
import { parsePoundsToPence } from "@/lib/money";
import { UK_ALLERGENS } from "@/lib/allergens";
import { requireEmail, requireText } from "@/lib/validation";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function saveSettings(formData: FormData) {
  await requireAdmin();
  const keys = [
    "business_name",
    "tagline",
    "intro",
    "address_line",
    "city",
    "postcode",
    "phone",
    "email",
    "hours",
    "delivery_postcodes",
    "allergy_note",
    "justeat_storefront_url",
    "deliveroo_storefront_url",
    "ubereats_storefront_url",
  ];
  for (const key of keys) {
    setSetting(key, String(formData.get(key) ?? "").trim());
  }
  setSetting("delivery_enabled", formData.get("delivery_enabled") === "on" ? "1" : "0");
  const fee = parsePoundsToPence(String(formData.get("delivery_fee") ?? "0"));
  const min = parsePoundsToPence(String(formData.get("delivery_min") ?? "0"));
  if (fee !== null) setSetting("delivery_fee_pence", String(fee));
  if (min !== null) setSetting("delivery_min_pence", String(min));
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

export async function saveMenuItem(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const name = requireText(formData.get("name"), 80);
  const description = String(formData.get("description") ?? "").trim().slice(0, 400);
  const categoryId = Number(formData.get("category_id"));
  const price = parsePoundsToPence(String(formData.get("price") ?? ""));
  const image = String(formData.get("image") ?? "").trim().slice(0, 200) || null;
  if (!name || !categoryId || price === null) return;

  const allergens = UK_ALLERGENS.filter((a) => formData.get(`allergen_${a.id}`) === "on").map(
    (a) => a.id,
  );
  const tags = ["signature", "vegan", "vegetarian", "catering"].filter(
    (t) => formData.get(`tag_${t}`) === "on",
  );
  const available = formData.get("available") === "on" ? 1 : 0;

  const db = getDb();
  if (id > 0) {
    db.prepare(
      `UPDATE menu_items SET category_id=?, name=?, description=?, price_pence=?, image=?,
        allergens=?, tags=?, available=? WHERE id=?`,
    ).run(
      categoryId,
      name,
      description,
      price,
      image,
      JSON.stringify(allergens),
      JSON.stringify(tags),
      available,
      id,
    );
  } else {
    db.prepare(
      `INSERT INTO menu_items (category_id, name, description, price_pence, image, allergens, tags, available, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 99)`,
    ).run(
      categoryId,
      name,
      description,
      price,
      image,
      JSON.stringify(allergens),
      JSON.stringify(tags),
      available,
    );
  }
  revalidatePath("/", "layout");
  redirect("/admin/menu");
}

export async function deleteMenuItem(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (id > 0) getDb().prepare("DELETE FROM menu_items WHERE id = ?").run(id);
  revalidatePath("/", "layout");
  redirect("/admin/menu");
}

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  const allowed = [
    "received",
    "preparing",
    "ready",
    "out_for_delivery",
    "completed",
    "cancelled",
  ];
  if (id > 0 && allowed.includes(status)) {
    getDb().prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  }
  revalidatePath("/admin");
}

export async function saveEvent(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const title = requireText(formData.get("title"), 80);
  const summary = String(formData.get("summary") ?? "").trim().slice(0, 200);
  const body = String(formData.get("body") ?? "").trim().slice(0, 2000);
  const startsAt = requireText(formData.get("starts_at"), 40);
  const image = String(formData.get("image") ?? "").trim().slice(0, 200) || null;
  if (!title || !startsAt) return;
  const db = getDb();
  if (id > 0) {
    db.prepare(
      "UPDATE events SET title=?, summary=?, body=?, starts_at=?, image=? WHERE id=?",
    ).run(title, summary, body, startsAt, image, id);
  } else {
    db.prepare(
      "INSERT INTO events (title, summary, body, starts_at, image, published) VALUES (?, ?, ?, ?, ?, 1)",
    ).run(title, summary, body, startsAt, image);
  }
  revalidatePath("/events");
  redirect("/admin/events");
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (id > 0) getDb().prepare("DELETE FROM events WHERE id = ?").run(id);
  revalidatePath("/events");
  redirect("/admin/events");
}

export async function changePassword(formData: FormData) {
  const session = await requireAdmin();
  const next = requireText(formData.get("password"), 200);
  if (!next || next.length < 10) return;
  const email = requireEmail(formData.get("email"));
  const db = getDb();
  if (email) {
    db.prepare("UPDATE users SET email = ?, password_hash = ? WHERE id = ?").run(
      email,
      hashPassword(next),
      session.userId,
    );
  } else {
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
      hashPassword(next),
      session.userId,
    );
  }
  redirect("/admin/settings?saved=1");
}

export async function runConnectorSync(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("provider") ?? "");
  await syncConnector(id);
  redirect("/admin/connectors");
}

export async function markMessageRead(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (id > 0) getDb().prepare("UPDATE messages SET read = 1 WHERE id = ?").run(id);
  revalidatePath("/admin");
}
