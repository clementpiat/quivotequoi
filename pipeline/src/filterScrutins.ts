import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import type { ReportEntry, ScrutinRaw } from "./types.js";

// Un scrutin "sur l'ensemble d'un texte" a un titre qui commence par cette forme.
const ENSEMBLE_REGEX = /^l['’]ensemble (du|de la|des|d['’])/i;

// Les projets de loi de finances (PLF/PLFSS) sont parfois votés par parties plutôt qu'en un
// seul scrutin d'ensemble : ce ne sont pas des votes sur le texte entier.
const PARTIE_REGEX = /\b(première|deuxième|seconde|troisième)\s+partie\b/i;

// Les propositions de résolution (création de commission d'enquête, résolutions européennes,
// article 34-1...) ne sont pas des lois : elles ne créent pas de norme, contrairement aux
// projets/propositions de loi. Hors périmètre même si leur scrutin matche ENSEMBLE_REGEX.
const RESOLUTION_REGEX = /proposition de r[ée]solution/i;

// Suffixe indiquant l'étape de lecture, à retirer pour comparer le texte d'un même dossier à
// travers ses lectures successives (ex. "(première lecture)", "(texte de la commission mixte
// paritaire)"). Nécessaire car `objet.dossierLegislatif` est absent pour une large part des
// scrutins dans les données de l'AN (vérifié : ~70% des scrutins "ensemble" candidats) — sans ce
// fallback, une loi votée en plusieurs lectures serait comptée comme plusieurs lois distinctes,
// ou pire, sa lecture définitive/CMP serait exclue au même titre qu'un doublon non résolu.
const ETAPE_LECTURE_REGEX = /\s*\([^()]*lecture[^()]*\)\.?\s*$|\s*\([^()]*commission mixte paritaire[^()]*\)\.?\s*$/i;

// Marques diacritiques combinantes laissées par normalize("NFD") (ex. "é" -> "e" + U+0301).
const COMBINING_MARKS_REGEX = /[̀-ͯ]/g;

function normalizeTitleKey(libelle: string): string {
  return libelle
    .replace(ETAPE_LECTURE_REGEX, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS_REGEX, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Génère un identifiant de fichier court et stable à partir d'un titre potentiellement très
// long — un hash court suffit à éviter les collisions entre deux titres tronqués identiques.
function makeSyntheticId(libelle: string): string {
  const slug = normalizeTitleKey(libelle).slice(0, 60).replace(/-+$/, "");
  const hash = createHash("sha1").update(libelle).digest("hex").slice(0, 8);
  return `T-${slug}-${hash}`;
}

export interface ScrutinSelectionne {
  scrutin: ScrutinRaw["scrutin"];
  id: string; // dossierRef si disponible, sinon slug généré à partir du titre normalisé
  dossierRef: string | null;
}

export function loadAllScrutins(scrutinsDir: string): ScrutinRaw["scrutin"][] {
  const jsonDir = path.join(scrutinsDir, "json");
  const files = readdirSync(jsonDir).filter((f) => f.endsWith(".json"));
  return files.map((f) => {
    const raw = JSON.parse(readFileSync(path.join(jsonDir, f), "utf-8")) as ScrutinRaw;
    return raw.scrutin;
  });
}

export function selectScrutinsEnsemble(allScrutins: ScrutinRaw["scrutin"][]): {
  selection: ScrutinSelectionne[];
  report: ReportEntry[];
} {
  const ensembleScrutins = allScrutins.filter(
    (s) => ENSEMBLE_REGEX.test(s.titre) && !RESOLUTION_REGEX.test(s.titre),
  );

  const groupes = new Map<string, { dossierRef: string | null; scrutins: ScrutinRaw["scrutin"][] }>();

  for (const scrutin of ensembleScrutins) {
    const dossierRef = scrutin.objet.dossierLegislatif?.dossierRef ?? null;
    const key = dossierRef ?? `titre:${normalizeTitleKey(scrutin.objet.libelle)}`;
    const entry = groupes.get(key) ?? { dossierRef, scrutins: [] };
    entry.scrutins.push(scrutin);
    groupes.set(key, entry);
  }

  const selection: ScrutinSelectionne[] = [];
  const report: ReportEntry[] = [];

  for (const [, { dossierRef, scrutins }] of groupes) {
    const whole = scrutins.filter((s) => !PARTIE_REGEX.test(s.titre));
    const partial = scrutins.filter((s) => PARTIE_REGEX.test(s.titre));

    if (whole.length === 0) {
      // Uniquement des votes par "partie" (ex. PLF/PLFSS) : pas de vote net sur le texte entier,
      // à traiter manuellement.
      report.push({
        raison: "uniquement des scrutins par partie (ex. PLF/PLFSS) — aucun vote d'ensemble net, ignoré",
        dossierRef,
        titreDossier: scrutins[0]?.objet.dossierLegislatif?.libelle ?? null,
        scrutins: partial.map((s) => ({ numero: s.numero, date: s.dateScrutin, titre: s.titre })),
      });
      continue;
    }

    // Plusieurs lectures : ne garder que le dernier vote d'ensemble à l'Assemblée.
    const dernier = [...whole].sort((a, b) => (a.dateScrutin < b.dateScrutin ? 1 : -1))[0]!;
    const id = dossierRef ?? makeSyntheticId(dernier.objet.libelle);
    selection.push({ scrutin: dernier, id, dossierRef });

    if (whole.length > 1) {
      report.push({
        raison: `${whole.length} lectures avec vote d'ensemble regroupées par ${dossierRef ? "dossier législatif" : "titre normalisé (dossier législatif absent des données)"} — seule la plus récente (scrutin n°${dernier.numero}, ${dernier.dateScrutin}) est retenue`,
        dossierRef,
        titreDossier: scrutins[0]?.objet.dossierLegislatif?.libelle ?? dernier.objet.libelle,
        scrutins: whole.map((s) => ({ numero: s.numero, date: s.dateScrutin, titre: s.titre })),
      });
    } else if (!dossierRef) {
      report.push({
        raison: "scrutin 'ensemble' sans dossier législatif rattaché dans les données AN — regroupé par titre normalisé, à vérifier manuellement",
        dossierRef: null,
        titreDossier: dernier.objet.libelle,
        scrutins: [{ numero: dernier.numero, date: dernier.dateScrutin, titre: dernier.titre }],
      });
    }
  }

  return { selection, report };
}
