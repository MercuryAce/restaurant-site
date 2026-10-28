import Image from "next/image";
import { PublicShell } from "@/components/PublicShell";
import { addToCart } from "@/app/actions/cart";
import { listCategories, listMenu, getSetting } from "@/lib/db";
import { formatPounds } from "@/lib/money";
import { allergenLabel, parseAllergens } from "@/lib/allergens";

export const metadata = { title: "Menu" };

export default function MenuPage() {
  const categories = listCategories();
  const items = listMenu({ availableOnly: true });
  const note = getSetting("allergy_note");

  return (
    <PublicShell>
      <h1 className="text-5xl">The board</h1>
      <p className="max-w-2xl">{note}</p>
      <p className="text-sm">
        Full allergen list lives on{" "}
        <a href="/legal/allergens">the allergen page</a>. Ask if you are not sure.
      </p>
      {categories.map((cat) => {
        const group = items.filter((i) => i.category_id === cat.id);
        if (!group.length) return null;
        return (
          <section key={cat.id} className="mt-10">
            <h2 className="text-4xl">{cat.name}</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {group.map((item) => {
                const allergens = parseAllergens(item.allergens);
                let tags: string[] = [];
                try {
                  tags = JSON.parse(item.tags);
                } catch {
                  tags = [];
                }
                return (
                  <article key={item.id} className="panel flex gap-4 p-4">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        width={140}
                        height={140}
                        className="h-28 w-28 shrink-0 object-cover"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="display mt-0 text-2xl text-aloha">{item.name}</h3>
                        <strong>{formatPounds(item.price_pence)}</strong>
                      </div>
                      <p className="text-sm">{item.description}</p>
                      {tags.length ? (
                        <p className="text-xs uppercase tracking-wide text-aloha-dark">
                          {tags.join(" · ")}
                        </p>
                      ) : null}
                      {allergens.length ? (
                        <p className="text-xs">
                          Contains: {allergens.map(allergenLabel).join(", ")}
                        </p>
                      ) : (
                        <p className="text-xs">No of the 14 major allergens declared.</p>
                      )}
                      <form action={addToCart} className="mt-3 flex items-center gap-2">
                        <input type="hidden" name="id" value={item.id} />
                        <input
                          className="field w-16"
                          type="number"
                          name="qty"
                          min={1}
                          max={20}
                          defaultValue={1}
                          aria-label="Quantity"
                        />
                        <button className="btn text-sm" type="submit">
                          Add
                        </button>
                      </form>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </PublicShell>
  );
}
