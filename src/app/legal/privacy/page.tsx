import { PublicShell } from "@/components/PublicShell";
import { getSetting } from "@/lib/db";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  const email = getSetting("email");
  const name = getSetting("business_name");
  return (
    <PublicShell>
      <h1>Privacy</h1>
      <p>
        {name} is the controller for personal data collected through this site. We keep it in the
        United Kingdom on this server.
      </p>
      <h2>What we collect</h2>
      <ul className="list-disc pl-6">
        <li>Orders: name, email, phone, address if you choose delivery, notes, what you bought.</li>
        <li>Contact form: name, email, optional phone, message.</li>
        <li>Kitchen login: email address only, with a hashed password.</li>
      </ul>
      <h2>Why</h2>
      <p>
        To fulfil your order (contract) and to answer messages (legitimate interests). We do not
        sell data or run advertising cookies.
      </p>
      <h2>How long</h2>
      <p>
        Orders: 24 months (accounting and complaints). Messages: 12 months. Login sessions: 12
        hours.
      </p>
      <h2>Your rights</h2>
      <p>
        You can ask for a copy, a correction, or deletion. Write to {email}. You can complain to
        the ICO at ico.org.uk.
      </p>
    </PublicShell>
  );
}
