import { AdminChrome } from "@/components/AdminChrome";
import { changePassword, saveSettings } from "@/app/actions/admin";
import { getSettings } from "@/lib/db";

export const metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const s = getSettings();
  return (
    <AdminChrome>
      <h1 className="mt-0">Kitchen settings</h1>
      {saved ? <p className="text-teal">Saved.</p> : null}
      <form action={saveSettings} className="panel grid gap-3 p-5 md:grid-cols-2">
        {(
          [
            ["business_name", "Business name"],
            ["tagline", "Tagline"],
            ["address_line", "Street"],
            ["city", "City"],
            ["postcode", "Postcode"],
            ["phone", "Phone"],
            ["email", "Public email"],
            ["delivery_postcodes", "Delivery outward codes"],
            ["justeat_storefront_url", "Just Eat store URL"],
            ["deliveroo_storefront_url", "Deliveroo store URL"],
            ["ubereats_storefront_url", "Uber Eats store URL"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm font-bold">
            {label}
            <input className="field mt-1" name={key} defaultValue={s[key] ?? ""} />
          </label>
        ))}
        <label className="block text-sm font-bold">
          Delivery fee £
          <input
            className="field mt-1"
            name="delivery_fee"
            defaultValue={((Number(s.delivery_fee_pence) || 0) / 100).toFixed(2)}
          />
        </label>
        <label className="block text-sm font-bold">
          Delivery minimum £
          <input
            className="field mt-1"
            name="delivery_min"
            defaultValue={((Number(s.delivery_min_pence) || 0) / 100).toFixed(2)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-bold md:col-span-2">
          <input type="checkbox" name="delivery_enabled" defaultChecked={s.delivery_enabled === "1"} />
          Delivery on
        </label>
        <label className="block text-sm font-bold md:col-span-2">
          Intro
          <textarea className="field mt-1 min-h-24" name="intro" defaultValue={s.intro} />
        </label>
        <label className="block text-sm font-bold">
          Hours
          <textarea className="field mt-1 min-h-24" name="hours" defaultValue={s.hours} />
        </label>
        <label className="block text-sm font-bold">
          Allergen note
          <textarea className="field mt-1 min-h-24" name="allergy_note" defaultValue={s.allergy_note} />
        </label>
        <button className="btn" type="submit">
          Save settings
        </button>
      </form>

      <h2>Admin login</h2>
      <form action={changePassword} className="panel max-w-md space-y-3 p-5">
        <label className="block text-sm font-bold">
          Email
          <input className="field mt-1" type="email" name="email" />
        </label>
        <label className="block text-sm font-bold">
          New password (10+ characters)
          <input className="field mt-1" type="password" name="password" minLength={10} required />
        </label>
        <button className="btn" type="submit">
          Change login
        </button>
      </form>
    </AdminChrome>
  );
}
