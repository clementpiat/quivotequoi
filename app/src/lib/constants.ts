/** Nombre de réponses (hors "passer" et "pas d'avis") au-delà duquel la carte de proximité est débloquée. */
export const SEUIL_RESULTATS = 10;

export const REPONSE_MIN = -2;
export const REPONSE_MAX = 2;

/**
 * "Pas d'avis" est distinct de "Neutre" (0) : Neutre est une position sur l'échelle (compte dans
 * le calcul de proximité avec un score de 0.5), alors que "pas d'avis" exclut la loi du calcul —
 * exactement comme une loi passée sans réponse. Voir computeProximity dans lib/proximity.ts.
 */
export const PAS_AVIS = "pas-avis" as const;
export type ReponseValeur = number | typeof PAS_AVIS;

export const LABELS_REPONSE: Record<string, string> = {
  [-2]: "Contre (important)",
  [-1]: "Contre",
  [0]: "Neutre",
  [1]: "Pour",
  [2]: "Pour (important)",
  [PAS_AVIS]: "Pas d'avis",
};
