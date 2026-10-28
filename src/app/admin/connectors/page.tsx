import { AdminChrome } from "@/components/AdminChrome";
import { runConnectorSync } from "@/app/actions/admin";
import { connectors, recentLogs } from "@/lib/connectors";

export const metadata = { title: "Connectors" };

const STATUS: Record<string, string> = {
  live: "Live on this site",
  dry_run: "Keys present — live push still off until a partner account is approved",
  partner_required: "Needs a restaurant partnership. Store URL can still be shown to guests.",
};

export default function ConnectorsPage() {
  const logs = recentLogs();
  return (
    <AdminChrome>
      <h1 className="mt-0">Delivery connectors</h1>
      <p>
        Just Eat (JET Connect), Deliveroo Partner Platform and Uber Eats Marketplace APIs all exist
        — and all require a signed merchant/integrator contract. They send orders <em>to</em> you
        via webhooks; they are not a public “post a delivery” button.
      </p>
      <p>
        This kitchen takes first-party orders now. The adapters below export the menu, keep
        storefront links, and accept inbound webhooks at{" "}
        <code>/api/webhooks/justeat</code>, <code>/deliveroo</code>, <code>/ubereats</code> once you
        put a matching <code>*_WEBHOOK_SECRET</code> in <code>.env.local</code>.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {connectors.map((c) => (
          <article key={c.id} className="panel p-5">
            <h2 className="mt-0 text-2xl">{c.name}</h2>
            <p className="text-sm">{STATUS[c.status()]}</p>
            {c.storefrontUrl() ? (
              <p className="text-sm">
                Storefront:{" "}
                <a href={c.storefrontUrl()} target="_blank" rel="noreferrer">
                  {c.storefrontUrl()}
                </a>
              </p>
            ) : (
              <p className="text-sm">No storefront URL set.</p>
            )}
            {c.id !== "native" ? (
              <p className="text-xs">
                Docs: <a href={c.docsUrl}>{c.docsUrl}</a>
              </p>
            ) : null}
            <form action={runConnectorSync} className="mt-3">
              <input type="hidden" name="provider" value={c.id} />
              <button className="btn text-sm" type="submit">
                {c.id === "native" ? "Confirm native menu" : "Dry-run menu export"}
              </button>
            </form>
          </article>
        ))}
      </div>
      <h2 className="mt-10">Connector log</h2>
      <ul className="space-y-2 text-sm">
        {logs.map((log) => (
          <li key={log.id} className="border-b border-ink/20 py-2">
            <strong>{log.provider}</strong> {log.action} · {log.created_at}
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs">{log.detail}</pre>
          </li>
        ))}
      </ul>
    </AdminChrome>
  );
}
