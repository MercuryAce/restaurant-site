export type ProviderId = "native" | "justeat" | "deliveroo" | "ubereats";

export type ConnectorStatus = "live" | "dry_run" | "partner_required";

export type MenuSnapshot = {
  name: string;
  description: string;
  price_pence: number;
  available: boolean;
  allergens: string[];
}[];

export type SyncResult = {
  ok: boolean;
  dryRun: boolean;
  message: string;
  payload?: unknown;
};

export interface Connector {
  id: ProviderId;
  name: string;
  docsUrl: string;
  status(): ConnectorStatus;
  storefrontUrl(): string;
  syncMenu(menu: MenuSnapshot): Promise<SyncResult>;
}
