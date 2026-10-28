import { PublicShell } from "@/components/PublicShell";
import { ContactForm } from "@/components/Forms";
import { getSetting } from "@/lib/db";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  const address = `${getSetting("address_line")}, ${getSetting("city")} ${getSetting("postcode")}`;
  return (
    <PublicShell>
      <h1 className="text-5xl">Get in touch</h1>
      <p>
        Bookings, cakes, and &ldquo;can you do a Friday for twelve&rdquo;. The form writes to the
        kitchen inbox. You can also call {getSetting("phone")} or email {getSetting("email")}.
      </p>
      <p className="text-sm">{address}</p>
      <div className="mt-6 max-w-xl">
        <ContactForm />
      </div>
    </PublicShell>
  );
}
