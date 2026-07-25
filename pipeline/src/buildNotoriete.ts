import type { Loi } from "./types.js";

/**
 * Score heuristique de notoriété pour le grand public (1 = sujet confidentiel, 5 = sujet
 * largement connu/médiatisé) — suggestion de départ à corriger à la main dans resumes.json, au
 * même titre que le thème (voir buildTheme.ts). À distinguer de `comprehensibilite`
 * (buildComprehensibilite.ts) : une loi peut être très connue sans être facile à comprendre
 * (ex. un budget médiatisé reste technique), ou l'inverse (un sujet de niche peut être limpide
 * une fois expliqué).
 *
 * Approximé par le rang, en quintile, du nombre de votants au scrutin : les lois qui font débat
 * ou qui marquent l'actualité (fin de vie, réseaux sociaux des mineurs, urgences nationales…)
 * mobilisent largement l'hémicycle, tandis que les textes techniques n'intéressent qu'une
 * poignée de spécialistes qui se déplacent pour voter. Imparfait — un sujet consensuel peut être
 * connu sans être mobilisateur — mais un signal disponible pour toutes les lois sans travail
 * humain, à corriger au cas par cas plutôt qu'à généraliser.
 */
export function computeNotorieteHeuristic(lois: Loi[]): Map<string, number> {
  const parVotantsCroissant = [...lois].sort((a, b) => a.chiffres.votants - b.chiffres.votants);
  const notoriete = new Map<string, number>();
  parVotantsCroissant.forEach((loi, index) => {
    const quintile = Math.floor((index / parVotantsCroissant.length) * 5); // 0..4
    notoriete.set(loi.id, quintile + 1); // 1 (niche) .. 5 (très connu)
  });
  return notoriete;
}
