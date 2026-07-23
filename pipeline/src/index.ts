import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fetchAllSources } from "./fetch.js";
import { loadAllScrutins, selectScrutinsEnsemble } from "./filterScrutins.js";
import { buildGroupes } from "./buildGroupes.js";
import { buildLois } from "./buildLois.js";
import { buildSummarySkeleton } from "./buildSummarySkeleton.js";

const OUTPUT_DIR = path.resolve(import.meta.dirname, "../output");

async function main() {
  const sources = await fetchAllSources();

  console.log("[index] chargement des scrutins…");
  const allScrutins = loadAllScrutins(sources.scrutins.dir);
  console.log(`[index] ${allScrutins.length} scrutins chargés (17e législature)`);

  const { selection, report } = selectScrutinsEnsemble(allScrutins);
  console.log(`[index] ${selection.length} lois retenues (scrutins d'ensemble, un par dossier)`);
  if (report.length > 0) {
    console.log(`[index] ${report.length} cas signalés dans report.json pour revue humaine`);
  }

  const groupes = buildGroupes(sources.organes.dir);
  console.log(`[index] ${groupes.length} groupes politiques référencés`);

  const lois = buildLois(selection, sources.dossiers.dir);

  // resumes.json est la source de vérité pour le thème une fois relu/corrigé à la main (ou par le
  // premier passage de rédaction) : on applique ses thèmes aux lois avant d'écrire lois.json et
  // lois/<id>.json, pour qu'une relance du pipeline ne réécrase pas une correction avec
  // l'heuristique de départ.
  const resumesPath = path.join(OUTPUT_DIR, "resumes.json");
  const resumes = buildSummarySkeleton(lois, resumesPath);
  const themeParId = new Map(resumes.map((r) => [r.id, r.theme]));
  for (const loi of lois) {
    loi.themeSuggere = themeParId.get(loi.id) ?? loi.themeSuggere;
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  // Repartir d'un dossier vide pour éviter les fichiers orphelins d'une précédente exécution
  // (ex. lois dont l'id a changé de schéma). resumes.json n'est pas touché ici : il est fusionné
  // avec la version existante par buildSummarySkeleton.
  rmSync(path.join(OUTPUT_DIR, "lois"), { recursive: true, force: true });
  mkdirSync(path.join(OUTPUT_DIR, "lois"), { recursive: true });

  writeFileSync(path.join(OUTPUT_DIR, "groupes.json"), JSON.stringify(groupes, null, 2));

  const loisIndex = lois.map(({ id, titre, dateVote, resultat, themeSuggere, chiffres }) => ({
    id,
    titre,
    dateVote,
    resultat,
    theme: themeSuggere,
    chiffres,
  }));
  writeFileSync(path.join(OUTPUT_DIR, "lois.json"), JSON.stringify(loisIndex, null, 2));

  for (const loi of lois) {
    writeFileSync(path.join(OUTPUT_DIR, "lois", `${loi.id}.json`), JSON.stringify(loi, null, 2));
  }

  writeFileSync(resumesPath, JSON.stringify(resumes, null, 2));

  writeFileSync(path.join(OUTPUT_DIR, "report.json"), JSON.stringify(report, null, 2));

  const todoCount = resumes.filter((r) => r.resume.startsWith("TODO")).length;
  console.log(`[index] terminé. ${lois.length} lois exportées, ${todoCount} résumés restant à rédiger.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
