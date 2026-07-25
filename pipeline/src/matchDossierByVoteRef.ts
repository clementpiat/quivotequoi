import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { asArray } from "./utils.js";
import type { ActeLegislatifRaw, DossierRaw } from "./types.js";

// Format observé dans les données AN pour les références de vote : "VTANR5L17V{numéro du scrutin}".
const VOTE_REF_REGEX = /^VT[A-Z0-9]+V(\d+)$/;

function collectVoteRefNumeros(
  acte: ActeLegislatifRaw | ActeLegislatifRaw[] | null | undefined,
  numeros: Set<string>,
): void {
  for (const a of asArray(acte)) {
    for (const ref of asArray(a.voteRefs?.voteRef)) {
      const match = VOTE_REF_REGEX.exec(ref);
      if (match) numeros.add(match[1]!);
    }
    collectVoteRefNumeros(a.actesLegislatifs?.acteLegislatif, numeros);
  }
}

/**
 * Index numéro de scrutin -> dossier(s) législatif(s) l'ayant conclu, construit à partir des
 * `voteRefs` présents sur les actes de décision du parcours législatif de chaque dossier (17e
 * législature). Contrairement à `matchDossierByTitle.ts` (rattrapage par ressemblance de titre,
 * imparfait), c'est une référence explicite et fiable posée par l'AN elle-même — indépendante de
 * la bascule du 26/03/2026 qui prive `objet.dossierLegislatif.dossierRef` des scrutins antérieurs
 * (voir README.md et filterScrutins.ts) : cet index est donc la source à essayer en premier.
 *
 * Un même numéro peut renvoyer plusieurs dossiers distincts (observé pour des motions de censure
 * liées à un 49.3, hors du champ des scrutins "sur l'ensemble d'un texte" traités par ce
 * pipeline) : dans ce cas, l'appelant doit traiter le cas comme ambigu plutôt que de choisir au
 * hasard.
 */
export function buildScrutinToDossierIndex(dossiersDir: string): Map<string, string[]> {
  const dir = path.join(dossiersDir, "json", "dossierParlementaire");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

  const index = new Map<string, string[]>();
  for (const file of files) {
    const raw = JSON.parse(readFileSync(path.join(dir, file), "utf-8")) as DossierRaw;
    const dossier = raw.dossierParlementaire;
    if (dossier.legislature !== "17") continue;

    const numeros = new Set<string>();
    collectVoteRefNumeros(dossier.actesLegislatifs?.acteLegislatif, numeros);
    for (const numero of numeros) {
      const list = index.get(numero) ?? [];
      list.push(dossier.uid);
      index.set(numero, list);
    }
  }

  return index;
}
