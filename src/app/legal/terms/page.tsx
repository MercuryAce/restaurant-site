import { PublicShell } from "@/components/PublicShell";
import { getSetting } from "@/lib/db";
import { formatPounds } from "@/lib/money";

export const metadata = { title: "Terms of sale" };

export default function TermsPage() {
  const min = Number(getSetting("delivery_min_pence", "2000"));
  return (
    <PublicShell>
      <h1>Terms of sale</h1>
      <p>These terms apply to first-party orders placed on this website. English law applies.</p>
      <h2>Orders</h2>
      <p>
        An order is an offer. We may decline it (kitchen closed, sold out, outside the delivery
        zone). You pay on collection or delivery. Prices include VAT where it applies.
      </p>
      <h2>Delivery</h2>
      <p>
        We only deliver to postcode districts listed in Admin. Minimum order {formatPounds(min)}.
        Times are estimates.
      </p>
      <h2>Allergies</h2>
      <p>
        You must tell us about allergies. See the allergen page. We handle the 14 major allergens
        on site, so we cannot promise a free-from kitchen.
      </p>
      <h2>Cancellations</h2>
      <p>
        Food prepared to order is perishable. Contact us immediately if you need to cancel; once
        cooking has started we may still charge.
      </p>
      <h2>Consumer rights</h2>
      <p>
        If food is not as described or unfit, we will refund or replace it. This does not affect
        your statutory rights.
      </p>
    </PublicShell>
  );
}
