"use server";

import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { cleanMessage, requireEmail, requireText } from "@/lib/validation";
import { headers } from "next/headers";

export type ContactState = { error?: string; ok?: boolean };

export async function sendMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`contact:${ip}`, 8, 60 * 60 * 1000).ok) {
    return { error: "That is enough messages for now. Email us instead." };
  }

  const name = requireText(formData.get("name"), 80);
  const email = requireEmail(formData.get("email"));
  const phone = requireText(formData.get("phone"), 24) || "";
  const body = cleanMessage(formData.get("message"), 2000);
  if (!name || !email || body.length < 10) {
    return { error: "Name, email and a short message are required." };
  }

  getDb()
    .prepare("INSERT INTO messages (name, email, phone, body) VALUES (?, ?, ?, ?)")
    .run(name, email, phone, body);

  return { ok: true };
}
