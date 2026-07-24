// Formes (partielles) des exports JSON de data.assemblee-nationale.fr, 17e législature.
// Seuls les champs utilisés par le pipeline sont typés.

export interface DecompteVoix {
  nonVotants: string;
  pour: string;
  contre: string;
  abstentions: string;
  nonVotantsVolontaires: string;
}

export interface GroupeVote {
  organeRef: string;
  nombreMembresGroupe: string;
  vote: {
    positionMajoritaire: string;
    decompteVoix: DecompteVoix;
  };
}

export interface ScrutinRaw {
  scrutin: {
    uid: string;
    numero: string;
    legislature: string;
    dateScrutin: string;
    typeVote: {
      codeTypeVote: string;
      libelleTypeVote: string;
    };
    sort: {
      code: string;
      libelle: string;
    };
    titre: string;
    objet: {
      libelle: string;
      dossierLegislatif: {
        libelle: string;
        dossierRef: string;
      } | null;
    };
    syntheseVote: {
      nombreVotants: string;
      suffragesExprimes: string;
      nbrSuffragesRequis: string;
      annonce: string;
      decompte: DecompteVoix;
    };
    ventilationVotes: {
      organe: {
        organeRef: string;
        groupes: {
          groupe: GroupeVote | GroupeVote[];
        };
      };
    };
  };
}

export interface OrganeRaw {
  organe: {
    uid: string;
    codeType: string;
    libelle: string;
    libelleAbrege: string;
    viMoDe: {
      dateDebut: string | null;
      dateFin: string | null;
    };
    couleurAssociee: string | null;
  };
}

export interface ActeLegislatifRaw {
  "@xsi:type"?: string;
  uid: string;
  codeActe: string;
  libelleActe: {
    nomCanonique: string;
    libelleCourt: string;
  };
  organeRef: string | null;
  dateActe: string | null;
  actesLegislatifs?: {
    acteLegislatif: ActeLegislatifRaw | ActeLegislatifRaw[];
  } | null;
}

export interface DossierRaw {
  dossierParlementaire: {
    uid: string;
    legislature: string;
    titreDossier: {
      titre: string;
      titreChemin: string;
    };
    procedureParlementaire: {
      code: string;
      libelle: string;
    } | null;
    actesLegislatifs: {
      acteLegislatif: ActeLegislatifRaw | ActeLegislatifRaw[];
    } | null;
  };
}

// --- Types de sortie du pipeline (consommés par l'app) ---

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

export interface Loi {
  id: string; // dossierRef
  titre: string;
  dateVote: string;
  resultat: "adopté" | "rejeté" | string;
  scrutinNumero: string;
  procedure: string | null;
  theme: string;
  chiffres: {
    votants: number;
    exprimes: number;
    pour: number;
    contre: number;
    abstentions: number;
  };
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

export interface ReportEntry {
  raison: string;
  dossierRef: string | null;
  titreDossier: string | null;
  scrutins: Array<{ numero: string; date: string; titre: string }>;
}
