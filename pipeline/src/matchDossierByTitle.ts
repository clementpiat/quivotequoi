import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { cleanFallbackTitle } from "./buildTitle.js";
import type { DossierRaw } from "./types.js";

// Marques diacritiques combinantes laissées par normalize("NFD") (ex. "é" -> "e" + U+0301).
const COMBINING_MARKS_REGEX = /[̀-ͯ]/g;

// L'export "dossiers législatifs" de l'AN contient aussi des documents qui ne sont pas des textes
// de loi (rapports d'information, résolutions, missions d'information, commissions d'enquête…).
// Leur titre peut coïncider textuellement avec celui d'un vrai projet/proposition de loi sur le
// même sujet (ex. un rapport d'information "La définition pénale du viol" à côté de la
// proposition de loi qui en découle) : les exclure de l'index évite de rattacher un scrutin au
// mauvais document du seul fait d'une ressemblance de titre.
const PROCEDURES_HORS_PERIMETRE = new Set([
  "Allocution du Président de l'Assemblée nationale",
  "Résolution Article 34-1",
  "Mission d'information",
  "Résolution",
  "Responsabilité pénale du président de la République",
  "Rapport d'information sans mission",
  "Engagement de la responsabilité gouvernementale",
  "Commission d'enquête",
  "Pétitions",
]);

function normalizeForMatch(titre: string): string {
  return titre
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS_REGEX, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export type DossierTitleMatch =
  | { status: "matched"; dossierRef: string }
  | { status: "ambiguous"; candidates: string[] }
  | { status: "none" };

export interface DossierTitleIndex {
  /** `libelle` : le libellé brut du scrutin (ex. `scrutin.objet.libelle`), pas encore nettoyé. */
  match(libelle: string): DossierTitleMatch;
}

/**
 * Index par titre normalisé de tous les dossiers législatifs de la 17e législature, pour relier
 * un scrutin sans `dossierRef` (voir filterScrutins.ts) à son dossier officiel quand le titre du
 * scrutin, une fois nettoyé de son préfixe procédural, correspond au titre officiel du dossier —
 * exactement ou par inclusion (les titres officiels gardent parfois le préfixe "Projet de loi…"
 * que `cleanFallbackTitle` retire côté scrutin).
 *
 * Complète `dossierRef`, absent des scrutins antérieurs au 26/03/2026 (voir README.md) : ce
 * n'est qu'un rattrapage par similarité textuelle, pas une source aussi fiable que la référence
 * native. Une correspondance ambiguë (plusieurs dossiers candidats) n'est jamais retenue
 * automatiquement — elle est signalée pour revue humaine, comme les cas déjà gérés dans
 * `filterScrutins.ts`.
 */
export function buildDossierTitleIndex(dossiersDir: string): DossierTitleIndex {
  const dir = path.join(dossiersDir, "json", "dossierParlementaire");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

  const entries: Array<{ dossierRef: string; key: string }> = [];
  for (const file of files) {
    const raw = JSON.parse(readFileSync(path.join(dir, file), "utf-8")) as DossierRaw;
    const dossier = raw.dossierParlementaire;
    if (dossier.legislature !== "17") continue;
    const procedure = dossier.procedureParlementaire?.libelle ?? null;
    if (procedure === null || PROCEDURES_HORS_PERIMETRE.has(procedure)) continue;
    entries.push({ dossierRef: dossier.uid, key: normalizeForMatch(dossier.titreDossier.titre) });
  }

  return {
    match(libelle: string): DossierTitleMatch {
      const key = normalizeForMatch(cleanFallbackTitle(libelle));

      const exact = entries.filter((e) => e.key === key);
      if (exact.length === 1) return { status: "matched", dossierRef: exact[0]!.dossierRef };
      if (exact.length > 1) return { status: "ambiguous", candidates: exact.map((e) => e.dossierRef) };

      // Un titre court peut apparaître, par hasard, comme fragment d'un titre plus long et sans
      // rapport (ex. "La souveraineté alimentaire et agricole" est un sous-groupe de mots de
      // "Orientation pour la souveraineté alimentaire et agricole et le renouvellement des
      // générations en agriculture", un tout autre texte) : on n'accepte l'inclusion que si les
      // deux titres sont de longueur comparable, sous peine de faux positifs. Seuil choisi
      // empiriquement : les inclusions légitimes observées sur ce jeu de données ont toutes un
      // ratio ≥ 0.5 (préfixe/suffixe institutionnel en plus ou en moins), le seul faux positif
      // observé était à 0.36.
      const RATIO_MIN_INCLUSION = 0.45;
      const substring = entries.filter((e) => {
        if (!(e.key.includes(key) || key.includes(e.key))) return false;
        const ratio = Math.min(e.key.length, key.length) / Math.max(e.key.length, key.length);
        return ratio >= RATIO_MIN_INCLUSION;
      });
      if (substring.length === 1) return { status: "matched", dossierRef: substring[0]!.dossierRef };
      if (substring.length > 1) return { status: "ambiguous", candidates: substring.map((e) => e.dossierRef) };

      return { status: "none" };
    },
  };
}
