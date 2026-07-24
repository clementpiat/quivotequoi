import type { Loi } from "../types";

/** loiId -> réponse entre -3 (contre) et +3 (pour). Une loi absente de l'objet = "passée". */
export type Answers = Record<string, number>;

export interface LoiDetailResult {
  loiId: string;
  reponse: number;
  positionGroupe: number;
  poids: number;
  distance: number;
}

export interface GroupProximityResult {
  groupeId: string;
  proximite: number; // 0..100
  poidsTotal: number;
  details: LoiDetailResult[];
}

export type ProximityComputation =
  | { valide: true; resultats: GroupProximityResult[] }
  | { valide: false; raison: "aucune-reponse" | "aucune-intensite" };

/**
 * Formule du cahier des charges : "1 − distance moyenne pondérée".
 * - réponse normalisée sur [-1,1], position de groupe déjà sur [-1,1] (fournie par le pipeline)
 * - distance par loi = |réponse − position| / 2, dans [0,1]
 * - poids par loi = |réponse normalisée| (intensité) — une réponse neutre (0) pèse 0, ce qui
 *   revient au même que de l'exclure, donc aucun cas particulier à coder pour elle.
 */
export function computeProximity(answers: Answers, loisRepondues: Loi[]): ProximityComputation {
  const answered = loisRepondues.filter((l) => l.id in answers);
  if (answered.length === 0) return { valide: false, raison: "aucune-reponse" };

  const totalWeight = answered.reduce((sum, l) => sum + Math.abs(answers[l.id]! / 3), 0);
  if (totalWeight === 0) return { valide: false, raison: "aucune-intensite" };

  const groupeIds = new Set<string>();
  for (const l of answered) for (const p of l.positionsParGroupe) groupeIds.add(p.groupeId);

  const resultats: GroupProximityResult[] = [...groupeIds].map((groupeId) => {
    const details: LoiDetailResult[] = [];
    let weightedDistanceSum = 0;
    let poidsTotal = 0;

    for (const l of answered) {
      const position = l.positionsParGroupe.find((p) => p.groupeId === groupeId);
      if (!position) continue;
      const reponse = answers[l.id]! / 3;
      const poids = Math.abs(reponse);
      const distance = Math.abs(reponse - position.position) / 2;
      details.push({ loiId: l.id, reponse, positionGroupe: position.position, poids, distance });
      weightedDistanceSum += poids * distance;
      poidsTotal += poids;
    }

    const distancePonderee = poidsTotal > 0 ? weightedDistanceSum / poidsTotal : 0;
    return { groupeId, poidsTotal, proximite: (1 - distancePonderee) * 100, details };
  });

  resultats.sort((a, b) => b.proximite - a.proximite);
  return { valide: true, resultats };
}
