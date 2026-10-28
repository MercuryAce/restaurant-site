"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { clearAdminSession, setAdminSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { requireEmail, requireText } from "@/lib/validation";

export type AuthState = { error?: string };

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limited = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return { error: "Too many attempts. Wait 15 minutes and try again." };
  }

  const email = requireEmail(formData.get("email"));
  const password = requireText(formData.get("password"), 200);
  if (!email || !password) return { error: "Enter a valid email and password." };

  const user = getDb()
    .prepare("SELECT id, email, password_hash FROM users WHERE email = ?")
    .get(email) as { id: number; email: string; password_hash: string } | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "Those details do not match an admin account." };
  }

  await setAdminSession({ userId: user.id, email: user.email });
  formData.delete("email");
  formData.delete("password");
  redirect("/admin");
}

export async function logout() {
  await clearAdminSession();
  redirect("/admin/login");
}
