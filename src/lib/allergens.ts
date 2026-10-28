export const UK_ALLERGENS = [
  { id: "celery", label: "Celery" },
  { id: "gluten", label: "Cereals containing gluten" },
  { id: "crustaceans", label: "Crustaceans" },
  { id: "eggs", label: "Eggs" },
  { id: "fish", label: "Fish" },
  { id: "lupin", label: "Lupin" },
  { id: "milk", label: "Milk" },
  { id: "molluscs", label: "Molluscs" },
  { id: "mustard", label: "Mustard" },
  { id: "peanuts", label: "Peanuts" },
  { id: "sesame", label: "Sesame" },
  { id: "soy", label: "Soya" },
  { id: "sulphur", label: "Sulphur dioxide / sulphites" },
  { id: "nuts", label: "Tree nuts" },
] as const;

export type AllergenId = (typeof UK_ALLERGENS)[number]["id"];

export function allergenLabel(id: string) {
  return UK_ALLERGENS.find((a) => a.id === id)?.label ?? id;
}

export function parseAllergens(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
