import { AdminChrome } from "@/components/AdminChrome";
import { getDb } from "@/lib/db";
import { formatPounds } from "@/lib/money";
import { markMessageRead, setOrderStatus } from "@/app/actions/admin";

const STATUSES = [
  "received",
  "preparing",
  "ready",
  "out_for_delivery",
  "completed",
  "cancelled",
];

export const metadata = { title: "Orders" };

export default function AdminHome() {
  const orders = getDb()
    .prepare(
      `SELECT o.*, group_concat(i.quantity || '× ' || i.name, ', ') AS lines
       FROM orders o
       LEFT JOIN order_items i ON i.order_id = o.id
       GROUP BY o.id
       ORDER BY o.id DESC
       LIMIT 50`,
    )
    .all() as {
    id: number;
    reference: string;
    source: string;
    status: string;
    fulfilment: string;
    customer_name: string;
    customer_phone: string;
    total_pence: number;
    created_at: string;
    lines: string;
  }[];

  const messages = getDb()
    .prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 20")
    .all() as {
    id: number;
    name: string;
    email: string;
    phone: string;
    body: string;
    created_at: string;
    read: number;
  }[];

  const open = orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length;

  return (
    <AdminChrome>
      <h1 className="mt-0">Tonight&apos;s tickets</h1>
      <p>{open} open · {messages.filter((m) => !m.read).length} unread notes</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-ink text-left">
              <th className="py-2">Ref</th>
              <th>When</th>
              <th>Who</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-ink/20 align-top">
                <td className="py-2 pr-3">
                  <strong>{order.reference}</strong>
                  <div className="text-xs">
                    {order.source} · {order.fulfilment}
                  </div>
                </td>
                <td className="pr-3">{order.created_at}</td>
                <td className="pr-3">
                  {order.customer_name}
                  <div className="text-xs">{order.customer_phone}</div>
                </td>
                <td className="pr-3">{order.lines}</td>
                <td className="pr-3">{formatPounds(order.total_pence)}</td>
                <td>
                  <form action={setOrderStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={order.id} />
                    <select className="field" name="status" defaultValue={order.status}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                    <button className="btn btn-ghost text-xs" type="submit">
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10">Inbox</h2>
      <ul className="space-y-3">
        {messages.map((m) => (
          <li key={m.id} className={`panel p-4 ${m.read ? "opacity-60" : ""}`}>
            <p className="font-bold">
              {m.name} · {m.email} · {m.created_at}
            </p>
            <p>{m.body}</p>
            {!m.read ? (
              <form action={markMessageRead}>
                <input type="hidden" name="id" value={m.id} />
                <button className="btn btn-ghost text-sm" type="submit">
                  Mark read
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </AdminChrome>
  );
}
