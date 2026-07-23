import { asArray, toInt } from "./utils.js";
import type { PositionGroupe, ScrutinRaw } from "./types.js";

/**
 * Méthodologie (voir description_initial.md) :
 *  pour = +1, contre = -1, abstention = 0, non-votant = 0, absent = 0.
 * Position du groupe = moyenne sur l'effectif du groupe à la date du scrutin.
 * Comme abstention/non-votant/absent valent tous 0, la moyenne se réduit à
 * (pour - contre) / effectif — mais on garde le détail des décomptes pour l'affichage
 * (barres pour/contre/abstention+absents) côté app.
 */
export function computeGroupPositions(scrutin: ScrutinRaw["scrutin"]): PositionGroupe[] {
  const groupes = asArray(scrutin.ventilationVotes.organe.groupes.groupe);

  return groupes.map((g) => {
    const effectif = toInt(g.nombreMembresGroupe);
    const pour = toInt(g.vote.decompteVoix.pour);
    const contre = toInt(g.vote.decompteVoix.contre);
    const abstentions = toInt(g.vote.decompteVoix.abstentions);
    // Au niveau groupe, `nonVotantsVolontaires` duplique systématiquement `abstentions` dans
    // les données de l'AN (vérifié sur un échantillon de 3600 décomptes groupe/scrutin) — seul
    // le total global (syntheseVote) distingue vraiment les deux catégories. On ne l'additionne
    // donc pas ici pour éviter de compter deux fois les mêmes députés.
    const nonVotants = toInt(g.vote.decompteVoix.nonVotants);
    const absents = Math.max(0, effectif - pour - contre - abstentions - nonVotants);
    const position = effectif > 0 ? (pour - contre) / effectif : 0;

    return {
      groupeId: g.organeRef,
      effectif,
      pour,
      contre,
      abstentions,
      nonVotants,
      absents,
      position,
    };
  });
}
