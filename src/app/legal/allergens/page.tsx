import { PublicShell } from "@/components/PublicShell";
import { UK_ALLERGENS } from "@/lib/allergens";
import { getSetting, listMenu } from "@/lib/db";
import { allergenLabel, parseAllergens } from "@/lib/allergens";

export const metadata = { title: "Allergens" };

export default function AllergensPage() {
  const items = listMenu({ availableOnly: true });
  return (
    <PublicShell>
      <h1>Allergens</h1>
      <p>{getSetting("allergy_note")}</p>
      <p>
        UK law requires we tell you about these 14. Staff can also read the same list from the
        kitchen tickets.
      </p>
      <ul className="columns-2 gap-8 text-sm md:columns-3">
        {UK_ALLERGENS.map((a) => (
          <li key={a.id}>{a.label}</li>
        ))}
      </ul>
      <table className="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-ink text-left">
            <th className="py-2">Dish</th>
            <th>Contains</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-ink/20">
              <td className="py-2 pr-4">{item.name}</td>
              <td>{parseAllergens(item.allergens).map(allergenLabel).join(", ") || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PublicShell>
  );
}
