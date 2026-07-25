import type { Loi } from "../types";

/** loiId -> réponse entre -2 (contre) et +2 (pour). Une loi absente de l'objet = "passée". */
export type Answers = Record<string, number>;

export interface LoiDetailResult {
  loiId: string;
  reponse: number;
  positionGroupe: number;
  ecart: number;
  poids: number;
}

export interface GroupProximityResult {
  groupeId: string;
  proximite: number; // 0..100
  details: LoiDetailResult[];
}

export type ProximityComputation =
  | { valide: true; resultats: GroupProximityResult[] }
  | { valide: false; raison: "aucune-reponse" };

/**
 * Score utilisateur et poids associés à une réponse, cf. methode_de_calcul.md :
 * neutre = 0.5, pour/très pour = 1, contre/très contre = 0 ; poids doublé (2) sur les réponses
 * "très" (±2), poids 1 sinon (y compris neutre).
 */
function scoreEtPoids(reponse: number): { score: number; poids: number } {
  if (reponse === 0) return { score: 0.5, poids: 1 };
  const score = reponse > 0 ? 1 : 0;
  const poids = Math.abs(reponse) === 2 ? 2 : 1;
  return { score, poids };
}

/**
 * Méthode de calcul (voir methode_de_calcul.md) :
 * - score_parti_loi = (pour − contre) / effectif du groupe (déjà fourni par le pipeline, dans [−1,1])
 * - pour chaque loi répondue, écart absolu entre le score utilisateur et score_parti_loi, pondéré
 * - proximité = 1 − (moyenne pondérée des écarts) sur toutes les lois répondues, exprimée en %
 * Les lois passées sont exclues du calcul.
 */
export function computeProximity(answers: Answers, loisRepondues: Loi[]): ProximityComputation {
  const answered = loisRepondues.filter((l) => l.id in answers);
  if (answered.length === 0) return { valide: false, raison: "aucune-reponse" };

  const groupeIds = new Set<string>();
  for (const l of answered) for (const p of l.positionsParGroupe) groupeIds.add(p.groupeId);

  const resultats: GroupProximityResult[] = [...groupeIds].map((groupeId) => {
    const details: LoiDetailResult[] = [];
    let sommeEcartsPonderes = 0;
    let sommePoids = 0;

    for (const l of answered) {
      const position = l.positionsParGroupe.find((p) => p.groupeId === groupeId);
      if (!position) continue;
      const reponse = answers[l.id]!;
      const { score, poids } = scoreEtPoids(reponse);
      const ecart = Math.abs(score - position.position);
      details.push({ loiId: l.id, reponse, positionGroupe: position.position, ecart, poids });
      sommeEcartsPonderes += ecart * poids;
      sommePoids += poids;
    }

    const moyennePonderee = sommePoids > 0 ? sommeEcartsPonderes / sommePoids : 0;
    const proximite = (1 - moyennePonderee) * 100;
    return { groupeId, proximite, details };
  });

  return { valide: true, resultats };
}
