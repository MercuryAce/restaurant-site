import Image from "next/image";
import { PublicShell } from "@/components/PublicShell";
import { getSetting } from "@/lib/db";

export const metadata = { title: "About" };

export default function AboutPage() {
  const name = getSetting("business_name");
  return (
    <PublicShell>
      <div className="grid items-start gap-8 md:grid-cols-2">
        <div>
          <h1 className="text-5xl">About {name}</h1>
          <p>
            This kitchen grew out of a 2017 Brixton site that mixed Hawaiian plates, vintage tea and
            rock&apos;n&apos;roll nights. The original chef is on holiday. Meanwhile, we present
            the voice: aloha with floral china and cartoon hats, and food that does not take itself too
            seriously.
          </p>
          <p>
            We cook a London reading of Hawaiian food — poke, huli huli, pineapple on a burger if
            you ask nicely — plus the old catering tricks: canapés, cakes, tea for two.
          </p>
        </div>
        <div className="panel overflow-hidden p-0">
          <Image
            src="/images/chef.jpg"
            alt="Cartoon mascot chef in a red Hawaiian shirt"
            width={800}
            height={800}
          />
        </div>
      </div>
    </PublicShell>
  );
}
