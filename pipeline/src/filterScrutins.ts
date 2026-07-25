import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { buildDossierTitleIndex } from "./matchDossierByTitle.js";
import { buildScrutinToDossierIndex } from "./matchDossierByVoteRef.js";
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
// paritaire)"). Nécessaire car `objet.dossierLegislatif` est absent pour tous les scrutins
// antérieurs au 26/03/2026 (bascule nette dans les données de l'AN, vérifiée empiriquement) —
// sans ce fallback, une loi votée en plusieurs lectures de part et d'autre de cette date serait
// scindée en plusieurs entrées au lieu d'une (voir `clusterByDossier` pour la fusion).
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

class DisjointSet {
  private parent: number[];
  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
  }
  find(i: number): number {
    while (this.parent[i] !== i) {
      this.parent[i] = this.parent[this.parent[i]!]!;
      i = this.parent[i]!;
    }
    return i;
  }
  union(a: number, b: number): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent[ra] = rb;
  }
}

/**
 * Regroupe les scrutins "ensemble" représentant le même texte de loi à travers ses lectures
 * successives. Deux scrutins sont regroupés s'ils partagent le même `dossierRef` (fiable quand
 * disponible), OU le même titre normalisé (nécessaire car `dossierRef` est absent avant le
 * 26/03/2026). Un même dossier peut ainsi avoir une lecture ancienne sans `dossierRef` et une
 * lecture définitive récente avec `dossierRef` — la fusion par titre est ce qui les relie.
 *
 * Garde-fou : si un même titre normalisé apparaît sous deux `dossierRef` distincts (collision de
 * titre entre deux dossiers réellement différents), on NE fusionne PAS — chaque dossierRef reste
 * autorité sur son propre groupe, et le cas est signalé dans le rapport.
 */
function clusterByDossier(scrutins: ScrutinRaw["scrutin"][]): {
  clusters: ScrutinRaw["scrutin"][][];
  conflicts: Array<{ titleKey: string; dossierRefs: string[] }>;
} {
  const dsu = new DisjointSet(scrutins.length);
  const dossierRefOf = scrutins.map((s) => s.objet.dossierLegislatif?.dossierRef ?? null);
  const titleKeyOf = scrutins.map((s) => normalizeTitleKey(s.objet.libelle));

  // Passe 1 : fusion par dossierRef (source fiable).
  const byDossierRef = new Map<string, number[]>();
  dossierRefOf.forEach((ref, i) => {
    if (!ref) return;
    const list = byDossierRef.get(ref) ?? [];
    list.push(i);
    byDossierRef.set(ref, list);
  });
  for (const indices of byDossierRef.values()) {
    for (let k = 1; k < indices.length; k++) dsu.union(indices[0]!, indices[k]!);
  }

  // Passe 2 : fusion par titre normalisé, seulement si ça ne rapproche pas deux dossierRef
  // distincts déjà constitués en passe 1.
  const byTitleKey = new Map<string, number[]>();
  titleKeyOf.forEach((key, i) => {
    const list = byTitleKey.get(key) ?? [];
    list.push(i);
    byTitleKey.set(key, list);
  });

  const conflicts: Array<{ titleKey: string; dossierRefs: string[] }> = [];
  for (const [titleKey, indices] of byTitleKey) {
    const distinctRoots = new Set(indices.map((i) => dsu.find(i)));
    const distinctDossierRefs = new Set(indices.map((i) => dossierRefOf[i]).filter((r): r is string => r != null));
    if (distinctRoots.size <= 1) continue; // déjà dans le même cluster (ou un seul scrutin)
    if (distinctDossierRefs.size >= 2) {
      conflicts.push({ titleKey, dossierRefs: [...distinctDossierRefs] });
      continue;
    }
    for (let k = 1; k < indices.length; k++) dsu.union(indices[0]!, indices[k]!);
  }

  const clusterByRoot = new Map<number, ScrutinRaw["scrutin"][]>();
  scrutins.forEach((s, i) => {
    const root = dsu.find(i);
    const list = clusterByRoot.get(root) ?? [];
    list.push(s);
    clusterByRoot.set(root, list);
  });

  return { clusters: [...clusterByRoot.values()], conflicts };
}

export interface ScrutinSelectionne {
  scrutin: ScrutinRaw["scrutin"];
  id: string; // == dossierRef
  dossierRef: string;
}

export function loadAllScrutins(scrutinsDir: string): ScrutinRaw["scrutin"][] {
  const jsonDir = path.join(scrutinsDir, "json");
  const files = readdirSync(jsonDir).filter((f) => f.endsWith(".json"));
  return files.map((f) => {
    const raw = JSON.parse(readFileSync(path.join(jsonDir, f), "utf-8")) as ScrutinRaw;
    return raw.scrutin;
  });
}

export function selectScrutinsEnsemble(
  allScrutins: ScrutinRaw["scrutin"][],
  dossiersDir: string,
): {
  selection: ScrutinSelectionne[];
  report: ReportEntry[];
} {
  const dossierTitleIndex = buildDossierTitleIndex(dossiersDir);
  const scrutinToDossier = buildScrutinToDossierIndex(dossiersDir);

  const ensembleScrutins = allScrutins.filter(
    (s) => ENSEMBLE_REGEX.test(s.titre) && !RESOLUTION_REGEX.test(s.titre),
  );

  const { clusters, conflicts } = clusterByDossier(ensembleScrutins);

  const selection: ScrutinSelectionne[] = [];
  const report: ReportEntry[] = [];

  for (const conflict of conflicts) {
    report.push({
      raison: `titre normalisé "${conflict.titleKey}" partagé par ${conflict.dossierRefs.length} dossiers législatifs distincts (${conflict.dossierRefs.join(", ")}) — non fusionnés automatiquement, à vérifier manuellement`,
      dossierRef: null,
      titreDossier: null,
      scrutins: [],
    });
  }

  for (const scrutins of clusters) {
    const dossierRefs = new Set(
      scrutins.map((s) => s.objet.dossierLegislatif?.dossierRef ?? null).filter((r): r is string => r != null),
    );
    let dossierRef = dossierRefs.size === 1 ? [...dossierRefs][0]! : null;

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

    if (!dossierRef) {
      // Aucun dossierRef trouvé nativement, même après fusion par titre entre lectures : le
      // scrutin est antérieur au 26/03/2026, date à partir de laquelle l'AN inclut cette
      // référence dans l'export des scrutins (voir README.md). Le dossier existe malgré tout
      // dans l'export des dossiers législatifs (téléchargé en entier, pas seulement les dossiers
      // référencés par un scrutin récent) : on tente de le retrouver, d'abord via la référence de
      // vote posée par l'AN elle-même sur le dossier (fiable, voir matchDossierByVoteRef.ts), puis
      // par similarité de titre (rattrapage plus incertain) avant d'exclure.
      const parVoteRef = scrutinToDossier.get(dernier.numero) ?? [];
      const candidatsVoteRef = [...new Set(parVoteRef)];

      if (candidatsVoteRef.length === 1) {
        dossierRef = candidatsVoteRef[0]!;
        report.push({
          raison: "dossier législatif retrouvé via la référence de vote du dossier (dossierRef absent du scrutin, scrutin antérieur au 26/03/2026)",
          dossierRef,
          titreDossier: dernier.objet.libelle,
          scrutins: whole.map((s) => ({ numero: s.numero, date: s.dateScrutin, titre: s.titre })),
        });
      } else if (candidatsVoteRef.length > 1) {
        report.push({
          raison: `exclu : le scrutin n°${dernier.numero} est référencé par la référence de vote de ${candidatsVoteRef.length} dossiers législatifs distincts (${candidatsVoteRef.join(", ")}) — non résolu automatiquement, à vérifier manuellement`,
          dossierRef: null,
          titreDossier: dernier.objet.libelle,
          scrutins: whole.map((s) => ({ numero: s.numero, date: s.dateScrutin, titre: s.titre })),
        });
        continue;
      } else {
        const titleMatch = dossierTitleIndex.match(dernier.objet.libelle);

        if (titleMatch.status === "matched") {
          dossierRef = titleMatch.dossierRef;
          report.push({
            raison: "dossier législatif retrouvé par correspondance de titre (dossierRef absent du scrutin, scrutin antérieur au 26/03/2026) — à vérifier",
            dossierRef,
            titreDossier: dernier.objet.libelle,
            scrutins: whole.map((s) => ({ numero: s.numero, date: s.dateScrutin, titre: s.titre })),
          });
        } else {
          const raison =
            titleMatch.status === "ambiguous"
              ? `exclu : titre du scrutin correspond à ${titleMatch.candidates.length} dossiers législatifs distincts par similarité (${titleMatch.candidates.join(", ")}) — non résolu automatiquement, à vérifier manuellement`
              : "exclu : aucun dossier législatif référencé ni retrouvé (ni via référence de vote, ni par similarité de titre) pour ce texte (ni directement, ni via une lecture ultérieure du même texte)";
          report.push({
            raison,
            dossierRef: null,
            titreDossier: dernier.objet.libelle,
            scrutins: whole.map((s) => ({ numero: s.numero, date: s.dateScrutin, titre: s.titre })),
          });
          continue;
        }
      }
    }

    selection.push({ scrutin: dernier, id: dossierRef, dossierRef });

    if (whole.length > 1) {
      report.push({
        raison: `${whole.length} lectures avec vote d'ensemble regroupées pour ce dossier — seule la plus récente (scrutin n°${dernier.numero}, ${dernier.dateScrutin}) est retenue`,
        dossierRef,
        titreDossier: scrutins[0]?.objet.dossierLegislatif?.libelle ?? dernier.objet.libelle,
        scrutins: whole.map((s) => ({ numero: s.numero, date: s.dateScrutin, titre: s.titre })),
      });
    }
  }

  // Le rattrapage par titre (voir matchDossierByTitle.ts) peut faire converger deux clusters
  // distincts vers le même dossierRef : `clusterByDossier` ne les avait pas fusionnés car leurs
  // titres de scrutin ne sont pas strictement identiques une fois nettoyés (ex. "(première
  // lecture)" vs "(lecture définitive)" avec un texte remanié entre les deux, comme un projet de
  // loi de finances rejeté en première lecture puis adopté en lecture définitive) — mais une fois
  // résolus au même dossier officiel, ce sont bien les mêmes lois et il ne doit en rester qu'une.
  const parDossierRef = new Map<string, ScrutinSelectionne[]>();
  for (const s of selection) {
    const list = parDossierRef.get(s.dossierRef) ?? [];
    list.push(s);
    parDossierRef.set(s.dossierRef, list);
  }

  const dedupliquee: ScrutinSelectionne[] = [];
  for (const entries of parDossierRef.values()) {
    if (entries.length === 1) {
      dedupliquee.push(entries[0]!);
      continue;
    }
    const dernier = [...entries].sort((a, b) =>
      a.scrutin.dateScrutin < b.scrutin.dateScrutin ? 1 : -1,
    )[0]!;
    dedupliquee.push(dernier);
    report.push({
      raison: `${entries.length} scrutins résolus vers le même dossier législatif via la correspondance par titre (non regroupés par la fusion par titre exact) — seul le plus récent (scrutin n°${dernier.scrutin.numero}, ${dernier.scrutin.dateScrutin}) est retenu`,
      dossierRef: dernier.dossierRef,
      titreDossier: dernier.scrutin.objet.libelle,
      scrutins: entries.map((e) => ({ numero: e.scrutin.numero, date: e.scrutin.dateScrutin, titre: e.scrutin.titre })),
    });
  }

  return { selection: dedupliquee, report };
}
