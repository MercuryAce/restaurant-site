import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { hashPassword } from "@/lib/password";

const dbPath = join(process.cwd(), "data", "kimos.db");

let db: DatabaseSync | null = null;

function schema(database: DatabaseSync) {
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price_pence INTEGER NOT NULL,
      image TEXT,
      allergens TEXT NOT NULL DEFAULT '[]',
      tags TEXT NOT NULL DEFAULT '[]',
      available INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      starts_at TEXT NOT NULL,
      image TEXT,
      published INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL DEFAULT 'native',
      status TEXT NOT NULL DEFAULT 'received',
      fulfilment TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      address_json TEXT,
      notes TEXT NOT NULL DEFAULT '',
      subtotal_pence INTEGER NOT NULL,
      delivery_pence INTEGER NOT NULL DEFAULT 0,
      total_pence INTEGER NOT NULL,
      payment TEXT NOT NULL DEFAULT 'pay_on_fulfilment',
      external_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id INTEGER,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_pence INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      read INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS connector_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      action TEXT NOT NULL,
      ok INTEGER NOT NULL,
      detail TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function seed(database: DatabaseSync) {
  const count = database.prepare("SELECT COUNT(*) AS n FROM menu_items").get() as {
    n: number;
  };
  if (count.n > 0) return;

  const email = process.env.ADMIN_EMAIL || "admin@kimoskitchen.local";
  const password = process.env.ADMIN_PASSWORD || "AlohaKitchen-ChangeMe!";
  database
    .prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)")
    .run(email.toLowerCase(), hashPassword(password), "Kitchen admin");

  const defaults: Record<string, string> = {
    business_name: "Kimo's Kitchen",
    tagline: "Food made with Aloha",
    intro:
      "A Hawaiian-inspired kitchen in London: poke, huli huli, vintage tea, and Friday dance nights. Change every word of this in Admin before you open the doors.",
    address_line: "12 Kalakaua Walk",
    city: "London",
    postcode: "SW2 1AL",
    phone: "020 0000 0000",
    email: "aloha@kimoskitchen.local",
    hours:
      "Tue–Thu 12:00–21:00\nFri–Sat 12:00–22:00\nSun 12:00–16:00 (roast & tea)\nClosed Mondays",
    delivery_enabled: "1",
    delivery_fee_pence: "350",
    delivery_min_pence: "2000",
    delivery_postcodes: "SW2,SW4,SW9,SE5,SE24",
    collection_minutes: "25",
    delivery_minutes: "45",
    allergy_note:
      "We handle the 14 major allergens in this kitchen. Tell us about allergies when you order. Cross-contamination is possible.",
    justeat_storefront_url: "",
    deliveroo_storefront_url: "",
    ubereats_storefront_url: "",
  };
  const set = database.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
  for (const [key, value] of Object.entries(defaults)) set.run(key, value);

  const cat = database.prepare(
    "INSERT INTO categories (slug, name, sort_order) VALUES (?, ?, ?)",
  );
  cat.run("bowls", "Bowls & plates", 1);
  cat.run("burgers", "Burgers & buns", 2);
  cat.run("brunch", "All-day brunch", 3);
  cat.run("tea", "Afternoon tea", 4);
  cat.run("catering", "Catering & parties", 5);
  cat.run("sweet", "Cakes & sweet", 6);

  const idFor = (slug: string) =>
    (
      database.prepare("SELECT id FROM categories WHERE slug = ?").get(slug) as {
        id: number;
      }
    ).id;

  const item = database.prepare(
    `INSERT INTO menu_items
      (category_id, name, description, price_pence, image, allergens, tags, available, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
  );

  item.run(
    idFor("bowls"),
    "Hawaiian tuna poke",
    "Cubed tuna, sushi rice, avocado, pineapple, sesame and pickled ginger.",
    1450,
    "/images/poke.jpg",
    JSON.stringify(["fish", "sesame", "soy"]),
    JSON.stringify(["signature"]),
    1,
  );
  item.run(
    idFor("bowls"),
    "Huli huli chicken",
    "Glazed grilled chicken, grilled pineapple, rice and hibiscus.",
    1350,
    "/images/huli.jpg",
    JSON.stringify(["soy", "sesame", "gluten"]),
    JSON.stringify(["signature"]),
    2,
  );
  item.run(
    idFor("bowls"),
    "Thai green chicken curry",
    "Coconut curry, jasmine rice. May contain traces of nuts and shellfish.",
    1250,
    "/images/huli.jpg",
    JSON.stringify(["crustaceans", "nuts"]),
    JSON.stringify([]),
    3,
  );
  item.run(
    idFor("bowls"),
    "Buddha bowl",
    "Roasted squash, beets, quinoa, avocado and sesame crunch. Vegan.",
    1150,
    "/images/poke.jpg",
    JSON.stringify(["sesame"]),
    JSON.stringify(["vegan"]),
    4,
  );
  item.run(
    idFor("burgers"),
    "Big Kahuna burger",
    "Beef, pineapple, chilli, onions, cheese and bacon. Onion rings and fries.",
    1450,
    "/images/burger.jpg",
    JSON.stringify(["gluten", "milk", "eggs", "mustard"]),
    JSON.stringify(["signature"]),
    1,
  );
  item.run(
    idFor("burgers"),
    "Buttermilk chicken slider pair",
    "Jalapeño, cheese and sriracha. Two sliders with fries.",
    1300,
    "/images/burger.jpg",
    JSON.stringify(["gluten", "milk", "eggs", "mustard"]),
    JSON.stringify([]),
    2,
  );
  item.run(
    idFor("burgers"),
    "Falafel bun",
    "Avocado, salsa, yoghurt and mint. Onion rings and fries.",
    1250,
    "/images/burger.jpg",
    JSON.stringify(["gluten", "milk", "sesame"]),
    JSON.stringify(["vegetarian"]),
    3,
  );
  item.run(
    idFor("brunch"),
    "Full English",
    "Eggs any style, Cumberland sausage, bacon, black pudding, beans or tomato, mushrooms, toast.",
    1250,
    "/images/tea.jpg",
    JSON.stringify(["eggs", "gluten", "sulphur"]),
    JSON.stringify([]),
    1,
  );
  item.run(
    idFor("brunch"),
    "Eggs on toast",
    "Poached or scrambled. Add smoked salmon in the notes.",
    650,
    "/images/tea.jpg",
    JSON.stringify(["eggs", "gluten"]),
    JSON.stringify(["vegetarian"]),
    2,
  );
  item.run(
    idFor("tea"),
    "Vintage afternoon tea",
    "Sandwiches, cakes, scone with jam and clotted cream, tea or coffee. Served in floral china.",
    1450,
    "/images/tea.jpg",
    JSON.stringify(["gluten", "eggs", "milk", "mustard"]),
    JSON.stringify(["vegetarian"]),
    1,
  );
  item.run(
    idFor("catering"),
    "Canapé selection — 5 pieces",
    "A mix of meat, fish and vegan bites. Minimum 8 people. Price per person.",
    850,
    "/images/poke.jpg",
    JSON.stringify(["gluten", "eggs", "fish", "crustaceans", "milk", "mustard"]),
    JSON.stringify(["catering"]),
    1,
  );
  item.run(
    idFor("catering"),
    "Finger food menu — 5 pieces",
    "Huli huli ribs, koftas, fish cakes, veg skewers. Minimum 8 people. Price per person.",
    1150,
    "/images/huli.jpg",
    JSON.stringify(["gluten", "eggs", "fish", "milk", "mustard", "sesame"]),
    JSON.stringify(["catering"]),
    2,
  );
  item.run(
    idFor("sweet"),
    "Two-tier celebration cake",
    "Vanilla sponge, hibiscus buttercream. Order 72 hours ahead. Serves 12–16.",
    4500,
    "/images/cake.jpg",
    JSON.stringify(["gluten", "eggs", "milk"]),
    JSON.stringify(["vegetarian"]),
    1,
  );
  item.run(
    idFor("sweet"),
    "Passion fruit cheesecake slice",
    "Baked cheesecake, tropical fruit.",
    550,
    "/images/cake.jpg",
    JSON.stringify(["gluten", "eggs", "milk"]),
    JSON.stringify(["vegetarian"]),
    2,
  );

  database
    .prepare(
      "INSERT INTO events (title, summary, body, starts_at, image, published) VALUES (?, ?, ?, ?, ?, 1)",
    )
    .run(
      "Vintage dance night",
      "Rock'n'roll, Hawaiian shirts optional, kitchen open late.",
      "A monthly knees-up: swing records, floral china for those who want tea, and the Big Kahuna on the grill. Bring dancing shoes. Food from 5pm, music from 7pm.",
      "2026-11-14T19:00:00",
      "/images/dance.jpg",
    );
  database
    .prepare(
      "INSERT INTO events (title, summary, body, starts_at, image, published) VALUES (?, ?, ?, ?, ?, 1)",
    )
    .run(
      "Friday afternoon tea",
      "China, cakes, and a playlist that never left 1958.",
      "Book a two-person tea from 3pm. Vintage cups, scones, and a slice of whatever came out of the oven that morning.",
      "2026-10-24T15:00:00",
      "/images/tea.jpg",
    );
}

export function getDb() {
  if (db) return db;
  mkdirSync(dirname(dbPath), { recursive: true });
  db = new DatabaseSync(dbPath);
  schema(db);
  seed(db);
  return db;
}

export function getSetting(key: string, fallback = "") {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? fallback;
}

export function getSettings(): Record<string, string> {
  const rows = getDb().prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export function setSetting(key: string, value: string) {
  getDb()
    .prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .run(key, value);
}

export type MenuItem = {
  id: number;
  category_id: number;
  category_name: string;
  category_slug: string;
  name: string;
  description: string;
  price_pence: number;
  image: string | null;
  allergens: string;
  tags: string;
  available: number;
  sort_order: number;
};

export function listMenu(opts?: { availableOnly?: boolean }): MenuItem[] {
  const sql = `
    SELECT m.*, c.name AS category_name, c.slug AS category_slug
    FROM menu_items m
    JOIN categories c ON c.id = m.category_id
    ${opts?.availableOnly ? "WHERE m.available = 1" : ""}
    ORDER BY c.sort_order, m.sort_order, m.name
  `;
  return getDb().prepare(sql).all() as MenuItem[];
}

export function listCategories() {
  return getDb()
    .prepare("SELECT id, slug, name, sort_order FROM categories ORDER BY sort_order")
    .all() as { id: number; slug: string; name: string; sort_order: number }[];
}

export function getMenuItem(id: number) {
  return (
    (getDb()
      .prepare(
        `SELECT m.*, c.name AS category_name, c.slug AS category_slug
         FROM menu_items m JOIN categories c ON c.id = m.category_id
         WHERE m.id = ?`,
      )
      .get(id) as MenuItem | undefined) ?? null
  );
}
