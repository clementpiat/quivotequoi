/** Nombre de réponses (hors "passer") au-delà duquel la carte de proximité est débloquée. */
export const SEUIL_RESULTATS = 10;

export const REPONSE_MIN = -2;
export const REPONSE_MAX = 2;

export const LABELS_REPONSE: Record<number, string> = {
  [-2]: "Contre (important)",
  [-1]: "Contre",
  [0]: "Neutre",
  [1]: "Pour",
  [2]: "Pour (important)",
};
