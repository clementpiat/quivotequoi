/** Seed aléatoire associée à l'utilisateur, utilisée pour mélanger l'ordre des lois. */
export function genererSeed(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

function hashString(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(a: number): () => number {
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mélange déterministe : même seed + mêmes items -> toujours le même ordre. */
export function melangerAvecSeed<T>(items: T[], seed: string): T[] {
  const rng = mulberry32(hashString(seed));
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

/**
 * Ordonne les lois pour le questionnaire en commençant par les plus accessibles à un non-
 * spécialiste (compréhensibilité décroissante, voir pipeline/src/buildComprehensibilite.ts), pour
 * ne pas ouvrir le questionnaire sur un texte technique qui ferait fuir l'utilisateur — critère
 * principal, une loi trop jargonneuse dissuade même si elle est par ailleurs connue. La notoriété
 * (buildNotoriete.ts) départage ensuite les lois à compréhensibilité égale (les sujets connus
 * d'abord). À l'intérieur d'un même palier compréhensibilité+notoriété, l'ordre reste mélangé (et
 * varie d'une session à l'autre via la seed), pour garder un parcours varié plutôt qu'une liste
 * figée identique pour tout le monde.
 */
export function ordonnerParAccessibiliteAvecSeed<T extends { notoriete: number; comprehensibilite: number }>(
  items: T[],
  seed: string,
): T[] {
  const parPalier = new Map<string, T[]>();
  for (const item of items) {
    const cle = `${item.comprehensibilite}-${item.notoriete}`;
    const liste = parPalier.get(cle) ?? [];
    liste.push(item);
    parPalier.set(cle, liste);
  }

  const paliersTries = [...parPalier.keys()].sort((a, b) => {
    const [comprehensibiliteA, notorieteA] = a.split("-").map(Number) as [number, number];
    const [comprehensibiliteB, notorieteB] = b.split("-").map(Number) as [number, number];
    return comprehensibiliteB - comprehensibiliteA || notorieteB - notorieteA;
  });

  return paliersTries.flatMap((palier) => melangerAvecSeed(parPalier.get(palier)!, `${seed}-${palier}`));
}
