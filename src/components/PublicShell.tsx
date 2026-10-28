import Image from "next/image";
import Link from "next/link";
import { cartSummary } from "@/lib/cart";
import { getSetting } from "@/lib/db";
import { CookieNotice } from "@/components/CookieNotice";

const NAV = [
  ["/", "Home"],
  ["/menu", "Menu"],
  ["/order", "Order"],
  ["/events", "Events"],
  ["/about", "About"],
  ["/contact", "Contact"],
] as const;

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const { count } = await cartSummary();
  const name = getSetting("business_name", "Kimo's Kitchen");
  const tagline = getSetting("tagline", "Food made with Aloha");
  const phone = getSetting("phone");
  const email = getSetting("email");
  const address = `${getSetting("address_line")}, ${getSetting("city")} ${getSetting("postcode")}`;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:m-3 focus:bg-paper focus:p-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-b-4 border-ink bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <Image src="/images/logo.png" alt="" width={86} height={66} priority />
            <span className="leading-tight">
              <span className="display block text-2xl text-aloha">{name}</span>
              <span className="text-sm text-ink">{tagline}</span>
            </span>
          </Link>
          <nav className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold uppercase tracking-wide">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className="text-aloha-dark no-underline hover:text-cherry">
                {label}
              </Link>
            ))}
            <Link href="/order" className="btn text-sm no-underline">
              Bag {count}
            </Link>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="mt-8 border-t-4 border-ink bg-ink text-star">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
          <div>
            <p className="display text-3xl text-aloha">{name}</p>
            <p className="mt-2 text-sm opacity-90">{tagline}</p>
            <p className="mt-4 text-sm whitespace-pre-line">{getSetting("hours")}</p>
          </div>
          <div>
            <h2 className="display mt-0 text-2xl text-aloha">Find us</h2>
            <p>{address}</p>
            <p>
              <a className="text-star" href={`tel:${phone.replace(/\s/g, "")}`}>
                {phone}
              </a>
            </p>
            <p>
              <a className="text-star" href={`mailto:${email}`}>
                {email}
              </a>
            </p>
          </div>
          <div>
            <h2 className="display mt-0 text-2xl text-aloha">The small print</h2>
            <ul className="space-y-1 text-sm">
              <li>
                <Link className="text-star" href="/legal/allergens">
                  Allergens
                </Link>
              </li>
              <li>
                <Link className="text-star" href="/legal/privacy">
                  Privacy
                </Link>
              </li>
              <li>
                <Link className="text-star" href="/legal/terms">
                  Terms of sale
                </Link>
              </li>
              <li>
                <Link className="text-star" href="/legal/cookies">
                  Cookies
                </Link>
              </li>
              <li>
                <Link className="text-star" href="/admin/login">
                  Kitchen login
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="border-t border-white/20 py-4 text-center text-xs opacity-70">
          Demo kitchen — register with your local authority before trading. Prices include VAT where
          applicable.
        </p>
      </footer>
      <CookieNotice />
    </>
  );
}
