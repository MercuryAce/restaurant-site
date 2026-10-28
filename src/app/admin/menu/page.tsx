import { AdminChrome } from "@/components/AdminChrome";
import { deleteMenuItem, saveMenuItem } from "@/app/actions/admin";
import { UK_ALLERGENS, parseAllergens } from "@/lib/allergens";
import { listCategories, listMenu } from "@/lib/db";
import { formatPounds } from "@/lib/money";

export const metadata = { title: "Menu admin" };

export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const items = listMenu();
  const categories = listCategories();
  const editing = items.find((i) => String(i.id) === edit);

  return (
    <AdminChrome>
      <h1 className="mt-0">{editing ? `Edit ${editing.name}` : "Menu & prices"}</h1>
      <ItemForm
        categories={categories}
        defaults={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                description: editing.description,
                category_id: editing.category_id,
                price: (editing.price_pence / 100).toFixed(2),
                image: editing.image ?? "",
                available: Boolean(editing.available),
                allergens: parseAllergens(editing.allergens),
                tags: JSON.parse(editing.tags || "[]"),
              }
            : null
        }
      />
      <table className="mt-10 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-ink text-left">
            <th className="py-2">Dish</th>
            <th>Category</th>
            <th>Price</th>
            <th>On</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-ink/20">
              <td className="py-2">{item.name}</td>
              <td>{item.category_name}</td>
              <td>{formatPounds(item.price_pence)}</td>
              <td>{item.available ? "yes" : "no"}</td>
              <td className="flex gap-2 py-2">
                <a className="btn btn-ghost text-xs no-underline" href={`/admin/menu?edit=${item.id}`}>
                  Edit
                </a>
                <form action={deleteMenuItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="btn text-xs" type="submit">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminChrome>
  );
}

function ItemForm({
  categories,
  defaults,
}: {
  categories: { id: number; name: string }[];
  defaults: {
    id: number;
    name: string;
    description: string;
    category_id: number;
    price: string;
    image: string;
    available: boolean;
    allergens: string[];
    tags: string[];
  } | null;
}) {
  return (
    <form action={saveMenuItem} className="panel grid gap-3 p-5 md:grid-cols-2">
      <input type="hidden" name="id" value={defaults?.id ?? 0} />
      <label className="block text-sm font-bold">
        Name
        <input className="field mt-1" name="name" required defaultValue={defaults?.name} />
      </label>
      <label className="block text-sm font-bold">
        Price £
        <input
          className="field mt-1"
          name="price"
          required
          defaultValue={defaults?.price ?? "10.00"}
        />
      </label>
      <label className="block text-sm font-bold md:col-span-2">
        Description
        <textarea className="field mt-1" name="description" defaultValue={defaults?.description} />
      </label>
      <label className="block text-sm font-bold">
        Category
        <select
          className="field mt-1"
          name="category_id"
          defaultValue={defaults?.category_id}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-bold">
        Image path
        <input
          className="field mt-1"
          name="image"
          placeholder="/images/poke.jpg"
          defaultValue={defaults?.image}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" name="available" defaultChecked={defaults?.available ?? true} />
        Available
      </label>
      <fieldset className="md:col-span-2">
        <legend className="text-sm font-bold">Allergens</legend>
        <div className="mt-2 grid grid-cols-2 gap-1 md:grid-cols-4">
          {UK_ALLERGENS.map((a) => (
            <label key={a.id} className="text-sm">
              <input
                type="checkbox"
                name={`allergen_${a.id}`}
                defaultChecked={defaults?.allergens.includes(a.id)}
              />{" "}
              {a.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="md:col-span-2">
        <legend className="text-sm font-bold">Tags</legend>
        {["signature", "vegan", "vegetarian", "catering"].map((t) => (
          <label key={t} className="mr-4 text-sm">
            <input type="checkbox" name={`tag_${t}`} defaultChecked={defaults?.tags.includes(t)} />{" "}
            {t}
          </label>
        ))}
      </fieldset>
      <button className="btn" type="submit">
        {defaults ? "Save dish" : "Add dish"}
      </button>
    </form>
  );
}
