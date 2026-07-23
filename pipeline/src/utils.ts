/**
 * L'export JSON de l'AN est une conversion mécanique du XML : une collection avec un seul
 * élément est sérialisée comme un objet plutôt que comme un tableau à un élément. Cette
 * fonction normalise les deux cas.
 */
export function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function toInt(value: string | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? 0 : n;
}
