import { PublicShell } from "@/components/PublicShell";

export const metadata = { title: "Cookies" };

export default function CookiesPage() {
  return (
    <PublicShell>
      <h1>Cookies</h1>
      <p>Only essentials:</p>
      <ul className="list-disc pl-6">
        <li>
          <code>kk_cart</code> — signed list of dishes in your bag. Lasts 7 days.
        </li>
        <li>
          <code>kk_admin</code> — httpOnly login for kitchen staff. Lasts 12 hours. Secure flag in
          production.
        </li>
      </ul>
      <p>No analytics, no advertising, no third-party pixels.</p>
    </PublicShell>
  );
}
