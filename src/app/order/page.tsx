import Image from "next/image";
import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { CheckoutForm } from "@/components/Forms";
import { cartSummary } from "@/lib/cart";
import { getSetting } from "@/lib/db";
import { formatPounds } from "@/lib/money";
import { updateCartLine } from "@/app/actions/cart";

export const metadata = { title: "Order" };

export default async function OrderPage() {
  const { items, subtotal, deliveryFee, deliveryMin } = await cartSummary();
  const deliveryEnabled = getSetting("delivery_enabled", "1") === "1";
  const zones = getSetting("delivery_postcodes");

  return (
    <PublicShell>
      <h1 className="text-5xl">Your bag</h1>
      {items.length === 0 ? (
        <p>
          Nothing in it yet. The{" "}
          <Link href="/menu">menu</Link> is this way.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id} className="panel flex gap-4 p-4">
                {item.image ? (
                  <Image src={item.image} alt="" width={96} height={96} className="object-cover" />
                ) : null}
                <div className="flex-1">
                  <p className="display mt-0 text-2xl">{item.name}</p>
                  <p>{formatPounds(item.price_pence)} each</p>
                  <form action={updateCartLine} className="mt-2 flex items-center gap-2">
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      className="field w-16"
                      type="number"
                      name="qty"
                      min={0}
                      max={20}
                      defaultValue={item.qty}
                    />
                    <button className="btn btn-ghost text-sm" type="submit">
                      Update
                    </button>
                  </form>
                </div>
                <strong>{formatPounds(item.lineTotal)}</strong>
              </li>
            ))}
          </ul>
          <CheckoutForm
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            deliveryMin={deliveryMin}
            deliveryEnabled={deliveryEnabled}
            zones={zones}
          />
        </div>
      )}
    </PublicShell>
  );
}
