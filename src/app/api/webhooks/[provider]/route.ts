import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/db";

const PROVIDERS = ["justeat", "deliveroo", "ubereats"] as const;
type Provider = (typeof PROVIDERS)[number];

function secretFor(provider: Provider) {
  const map = {
    justeat: process.env.JUSTEAT_WEBHOOK_SECRET,
    deliveroo: process.env.DELIVEROO_WEBHOOK_SECRET,
    ubereats: process.env.UBEREATS_WEBHOOK_SECRET,
  };
  return map[provider]?.trim() || "";
}

function checkHmac(raw: string, header: string | null, secret: string) {
  if (!secret) return false;
  if (!header) return false;
  const digest = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(header.replace(/^sha256=/i, ""));
  const b = Buffer.from(digest);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  if (!PROVIDERS.includes(provider as Provider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }
  const typed = provider as Provider;
  const secret = secretFor(typed);
  const raw = await request.text();

  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret is not configured for this provider." },
      { status: 503 },
    );
  }

  const signature =
    request.headers.get("x-webhook-signature") ||
    request.headers.get("x-deliveroo-signature") ||
    request.headers.get("x-uber-signature");

  if (!checkHmac(raw, signature, secret) && request.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const customer =
    body.Customer && typeof body.Customer === "object"
      ? (body.Customer as Record<string, unknown>)
      : {};
  const reference = String(
    body.OrderReference || body.order_id || body.id || `${typed}-${Date.now()}`,
  ).slice(0, 64);
  const name = String(body.customer_name || customer.Name || "Marketplace guest").slice(0, 80);
  const phone = String(body.phone || customer.PhoneNumber || "").slice(0, 24);
  const total = Math.round(Number(body.TotalPrice || body.total || 0) * (Number(body.TotalPrice) < 500 ? 100 : 1));

  const db = getDb();
  const existing = db.prepare("SELECT id FROM orders WHERE reference = ?").get(reference);
  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  db.prepare(
    `INSERT INTO orders
      (reference, source, status, fulfilment, customer_name, customer_email, customer_phone,
       notes, subtotal_pence, delivery_pence, total_pence, payment, external_id)
     VALUES (?, ?, 'received', 'delivery', ?, ?, ?, ?, ?, 0, ?, 'marketplace', ?)`,
  ).run(
    reference,
    typed,
    name,
    "marketplace@kimoskitchen.local",
    phone || "n/a",
    JSON.stringify(body).slice(0, 2000),
    Number.isFinite(total) ? total : 0,
    Number.isFinite(total) ? total : 0,
    String(body.id || ""),
  );

  db.prepare(
    "INSERT INTO connector_logs (provider, action, ok, detail) VALUES (?, 'webhook', 1, ?)",
  ).run(typed, `Accepted ${reference}`);

  return NextResponse.json({ ok: true, reference }, { status: 201 });
}
