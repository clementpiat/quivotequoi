// Miroir des types de sortie du pipeline (pipeline/src/types.ts). Dupliqué volontairement : le
// pipeline n'est pas publié comme lib partagée, seuls ses JSON dans public/data/ sont consommés.

export interface Groupe {
  id: string; // organeRef, ex. "PO845401"
  nom: string;
  sigle: string;
  couleur: string | null;
  dateDebut: string | null;
  dateFin: string | null;
}

export interface PositionGroupe {
  groupeId: string;
  effectif: number;
  pour: number;
  contre: number;
  abstentions: number;
  nonVotants: number;
  absents: number;
  position: number; // (pour - contre) / effectif, dans [-1, 1]
}

export interface LoiIndexEntry {
  id: string;
  titre: string;
  dateVote: string;
  resultat: string;
  theme: string;
  chiffres: {
    votants: number;
    exprimes: number;
    pour: number;
    contre: number;
    abstentions: number;
  };
}

export interface Loi extends LoiIndexEntry {
  scrutinNumero: string;
  procedure: string | null;
  liens: {
    dossierAN: string | null;
    scrutinAN: string;
  };
  positionsParGroupe: PositionGroupe[];
}

export interface ResumeEntry {
  id: string;
  titre: string;
  theme: string;
  resume: string;
}
