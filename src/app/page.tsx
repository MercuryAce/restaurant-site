import Image from "next/image";
import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { getSetting, listMenu } from "@/lib/db";
import { formatPounds } from "@/lib/money";
import { connectors } from "@/lib/connectors";

export default function HomePage() {
  const name = getSetting("business_name", "Kimo's Kitchen");
  const tagline = getSetting("tagline");
  const intro = getSetting("intro");
  const signatures = listMenu({ availableOnly: true }).filter((i) =>
    i.tags.includes("signature"),
  );
  const storefronts = connectors.filter((c) => c.id !== "native" && c.storefrontUrl());

  return (
    <PublicShell>
      <section className="panel overflow-hidden p-0">
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-72">
            <Image
              src="/images/hero.jpg"
              alt="Cartoon storefront of Kimo's Kitchen at dusk"
              fill
              className="object-cover"
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div className="p-8">
            <p className="rock text-cherry">London · Hawaiian kitchen</p>
            <h1 className="mt-2 text-5xl">{tagline}</h1>
            <p className="text-lg">{intro}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/menu" className="btn no-underline">
                See the menu
              </Link>
              <Link href="/order" className="btn btn-blue no-underline">
                Order now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-4xl">Tonight&apos;s signatures</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {signatures.map((item) => (
            <article key={item.id} className="panel overflow-hidden p-0">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={600}
                  height={400}
                  className="h-48 w-full object-cover"
                />
              ) : null}
              <div className="p-4">
                <h3 className="display mt-0 text-2xl">{item.name}</h3>
                <p className="text-sm">{item.description}</p>
                <p className="font-bold">{formatPounds(item.price_pence)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <article className="panel flex gap-4 p-5">
          <Image src="/images/chef.jpg" alt="Kimo the cartoon chef" width={160} height={160} />
          <div>
            <h2 className="mt-0 text-3xl">Meet Kimo</h2>
            <p>
              The hat is taller than the stories. {name} is a mascot kitchen — Hawaiian plates,
              vintage tea, and a Friday that still believes in dancing. Put your own name on it in
              Admin when you take the keys.
            </p>
            <Link href="/about">The longer version</Link>
          </div>
        </article>
        <article className="panel p-5">
          <h2 className="mt-0 text-3xl">Order how you like</h2>
          <p>
            First-party ordering is live on this site: collection or our own delivery radius. Pay
            when the food arrives.
          </p>
          {storefronts.length > 0 ? (
            <ul className="mt-3 list-disc pl-5">
              {storefronts.map((c) => (
                <li key={c.id}>
                  <a href={c.storefrontUrl()} rel="noreferrer" target="_blank">
                    Also on {c.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">
              Just Eat, Deliveroo and Uber Eats connectors sit in Admin. They need a real restaurant
              partnership before they carry live orders — the till here does not wait.
            </p>
          )}
        </article>
      </section>
    </PublicShell>
  );
}
