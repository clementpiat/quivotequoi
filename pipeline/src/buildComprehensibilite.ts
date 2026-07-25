import type { Loi } from "./types.js";

// Marqueurs de jargon administratif/juridique/budgétaire qui rendent un texte plus difficile à
// suivre pour un lecteur sans connaissances préalables — un citoyen qui ne les connaît pas doit
// s'arrêter pour les décoder, contrairement à un texte qui se comprend d'un seul tenant.
const MARQUEURS_JARGON = [
  /\balin[ée]a\b/i,
  /\barticle\s+[lr]\.?\s*\d/i, // référence de code (ex. "article L. 1112-10")
  /\bcode g[ée]n[ée]ral\b/i,
  /\bordonnance n°/i,
  /\bloi organique\b/i,
  /\bdossier l[ée]gislatif\b/i,
  /\b(plf|plfss|ondam|dlolf|ddadu|cmp|tva|irpp)\b/i, // acronymes budgétaires/administratifs
  /\bfin de gestion\b/i,
  /\bhabilitation\b/i,
  /\bcollectivit[ée] territoriale\b/i,
  /\b[ée]tablissement public\b/i,
  /\bdispositif\b/i,
  /\bexercice budg[ée]taire\b/i,
];

function normalise(texte: string): string {
  return texte.toLowerCase();
}

/**
 * Score heuristique de compréhensibilité pour un citoyen non spécialiste (1 = très technique,
 * 5 = clair pour n'importe qui) — suggestion de départ à corriger à la main dans resumes.json, au
 * même titre que le thème et la notoriété. Contrairement à `notoriete` (proxy objectif : le
 * nombre de votants), il n'existe pas de signal fiable dans les données du pipeline pour ce qui
 * est, par nature, un jugement de lecture — cette heuristique n'est qu'un repère grossier
 * (densité de jargon administratif/juridique dans le titre et le résumé), destiné à être
 * largement corrigé après une relecture humaine du résumé réel de chaque loi.
 */
export function computeComprehensibiliteHeuristic(lois: Loi[], resumeParId: Map<string, string>): Map<string, number> {
  const comprehensibilite = new Map<string, number>();

  for (const loi of lois) {
    const resume = resumeParId.get(loi.id) ?? "";
    const texte = normalise(`${loi.titre} ${resume}`);
    const nbMarqueurs = MARQUEURS_JARGON.reduce((n, regex) => n + (regex.test(texte) ? 1 : 0), 0);
    const score = Math.max(1, Math.min(5, 5 - nbMarqueurs));
    comprehensibilite.set(loi.id, score);
  }

  return comprehensibilite;
}
