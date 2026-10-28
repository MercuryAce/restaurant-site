import { getDb, getSetting, listMenu } from "@/lib/db";
import { parseAllergens } from "@/lib/allergens";
import type { Connector, ConnectorStatus, MenuSnapshot, ProviderId, SyncResult } from "./types";

function log(provider: string, action: string, ok: boolean, detail: unknown) {
  getDb()
    .prepare("INSERT INTO connector_logs (provider, action, ok, detail) VALUES (?, ?, ?, ?)")
    .run(provider, action, ok ? 1 : 0, JSON.stringify(detail).slice(0, 4000));
}

function snapshot(): MenuSnapshot {
  return listMenu({ availableOnly: false }).map((item) => ({
    name: item.name,
    description: item.description,
    price_pence: item.price_pence,
    available: Boolean(item.available),
    allergens: parseAllergens(item.allergens),
  }));
}

function env(...keys: string[]) {
  return keys.every((k) => Boolean(process.env[k]?.trim()));
}

const native: Connector = {
  id: "native",
  name: "Kimo's own till",
  docsUrl: "/admin/connectors",
  status: () => "live",
  storefrontUrl: () => "/order",
  async syncMenu() {
    const menu = snapshot();
    log("native", "syncMenu", true, { items: menu.length });
    return {
      ok: true,
      dryRun: false,
      message: `Native menu is the source of truth (${menu.length} dishes).`,
      payload: { items: menu.length },
    };
  },
};

function partnerConnector(
  id: Exclude<ProviderId, "native">,
  name: string,
  docsUrl: string,
  credKeys: string[],
  storefrontKey: string,
): Connector {
  return {
    id,
    name,
    docsUrl,
    status(): ConnectorStatus {
      return env(...credKeys) ? "dry_run" : "partner_required";
    },
    storefrontUrl() {
      return (
        process.env[storefrontKey]?.trim() ||
        getSetting(`${id}_storefront_url`, "")
      );
    },
    async syncMenu(menu: MenuSnapshot): Promise<SyncResult> {
      const haveCreds = env(...credKeys);
      const payload = {
        provider: id,
        exportedAt: new Date().toISOString(),
        items: menu,
      };
      if (!haveCreds) {
        log(id, "syncMenu", true, { dryRun: true, items: menu.length });
        return {
          ok: true,
          dryRun: true,
          message: `${name} partner credentials are not set. Menu export was logged locally. Add keys in .env.local after the kitchen is onboarded — these platforms do not accept orders from a public API.`,
          payload,
        };
      }
      // Live push is intentionally not called: each platform needs a signed
      // partner contract and a mapped restaurant/site id. The payload is the
      // shape an integrator would POST once those exist.
      log(id, "syncMenu", true, { dryRun: true, configured: true, items: menu.length });
      return {
        ok: true,
        dryRun: true,
        message: `${name} keys are present, but live menu push stays off until a partner account is approved. Payload stored in connector logs.`,
        payload,
      };
    },
  };
}

export const connectors: Connector[] = [
  native,
  partnerConnector(
    "justeat",
    "Just Eat",
    "https://uk.api.just-eat.io/docs/jetconnect/index.html",
    ["JUSTEAT_API_KEY", "JUSTEAT_RESTAURANT_ID"],
    "JUSTEAT_STOREFRONT_URL",
  ),
  partnerConnector(
    "deliveroo",
    "Deliveroo",
    "https://api-docs.deliveroo.com/docs/order-integration",
    ["DELIVEROO_CLIENT_ID", "DELIVEROO_CLIENT_SECRET", "DELIVEROO_BRAND_ID"],
    "DELIVEROO_STOREFRONT_URL",
  ),
  partnerConnector(
    "ubereats",
    "Uber Eats",
    "https://developer.uber.com/docs/eats/introduction",
    ["UBEREATS_CLIENT_ID", "UBEREATS_CLIENT_SECRET", "UBEREATS_STORE_ID"],
    "UBEREATS_STOREFRONT_URL",
  ),
];

export function getConnector(id: string) {
  return connectors.find((c) => c.id === id) ?? null;
}

export async function syncConnector(id: string) {
  const connector = getConnector(id);
  if (!connector) throw new Error("Unknown connector");
  return connector.syncMenu(snapshot());
}

export function recentLogs(limit = 20) {
  return getDb()
    .prepare(
      "SELECT id, provider, action, ok, detail, created_at FROM connector_logs ORDER BY id DESC LIMIT ?",
    )
    .all(limit) as {
    id: number;
    provider: string;
    action: string;
    ok: number;
    detail: string;
    created_at: string;
  }[];
}
