import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { getDb, getSetting } from "@/lib/db";
import { formatPounds } from "@/lib/money";

export default async function ThanksPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const order = getDb()
    .prepare("SELECT * FROM orders WHERE reference = ?")
    .get(reference) as
    | {
        reference: string;
        fulfilment: string;
        total_pence: number;
        customer_name: string;
      }
    | undefined;
  if (!order) notFound();

  const minutes =
    order.fulfilment === "delivery"
      ? getSetting("delivery_minutes", "45")
      : getSetting("collection_minutes", "25");

  return (
    <PublicShell>
      <div className="panel mx-auto max-w-xl p-8 text-center">
        <p className="rock text-cherry">Order in</p>
        <h1 className="text-5xl">Mahalo, {order.customer_name.split(" ")[0]}</h1>
        <p>
          Reference <strong>{order.reference}</strong>
        </p>
        <p>
          {order.fulfilment === "delivery" ? "Out on a bike" : "Ready for collection"} in about{" "}
          {minutes} minutes. {formatPounds(order.total_pence)} due on fulfilment.
        </p>
        <Link href="/menu" className="btn mt-6 inline-flex no-underline">
          Back to the board
        </Link>
      </div>
    </PublicShell>
  );
}
