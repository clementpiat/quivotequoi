import { readFileSync } from "node:fs";
import path from "node:path";
import { computeGroupPositions } from "./computeGroupPositions.js";
import { guessTheme } from "./buildTheme.js";
import { cleanFallbackTitle } from "./buildTitle.js";
import { toInt } from "./utils.js";
import type { DossierRaw, Loi } from "./types.js";
import type { ScrutinSelectionne } from "./filterScrutins.js";

function loadDossier(dossiersDir: string, dossierRef: string): DossierRaw["dossierParlementaire"] | null {
  try {
    const raw = JSON.parse(
      readFileSync(path.join(dossiersDir, "json", "dossierParlementaire", `${dossierRef}.json`), "utf-8"),
    ) as DossierRaw;
    return raw.dossierParlementaire;
  } catch {
    return null;
  }
}

export function buildLois(selection: ScrutinSelectionne[], dossiersDir: string): Loi[] {
  return selection.map(({ scrutin, id, dossierRef }) => {
    const dossier = dossierRef ? loadDossier(dossiersDir, dossierRef) : null;
    const titre = dossier?.titreDossier.titre ?? cleanFallbackTitle(scrutin.objet.libelle);
    const titreChemin = dossier?.titreDossier.titreChemin ?? null;

    return {
      id,
      titre,
      dateVote: scrutin.dateScrutin,
      resultat: scrutin.sort.code,
      scrutinNumero: scrutin.numero,
      procedure: dossier?.procedureParlementaire?.libelle ?? null,
      themeSuggere: guessTheme(titre, scrutin.titre),
      chiffres: {
        votants: toInt(scrutin.syntheseVote.nombreVotants),
        exprimes: toInt(scrutin.syntheseVote.suffragesExprimes),
        pour: toInt(scrutin.syntheseVote.decompte.pour),
        contre: toInt(scrutin.syntheseVote.decompte.contre),
        abstentions: toInt(scrutin.syntheseVote.decompte.abstentions),
      },
      liens: {
        dossierAN: titreChemin ? `https://www.assemblee-nationale.fr/dyn/17/dossiers/${titreChemin}` : null,
        scrutinAN: `https://www.assemblee-nationale.fr/dyn/17/scrutins/${scrutin.numero}`,
      },
      positionsParGroupe: computeGroupPositions(scrutin),
    } satisfies Loi;
  });
}
