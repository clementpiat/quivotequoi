import { existsSync, readFileSync } from "node:fs";
import { computeNotorieteHeuristic } from "./buildNotoriete.js";
import { computeComprehensibiliteHeuristic } from "./buildComprehensibilite.js";
import type { Loi, ResumeEntry } from "./types.js";

const TODO = "TODO — résumé à rédiger à la main à partir de l'exposé des motifs";

/**
 * Génère resumes.json à partir des lois retenues, en conservant les résumés déjà rédigés
 * à la main lors des relances précédentes du pipeline (le fichier est destiné à être édité et
 * relu par un humain, pas régénéré à la volée — voir description_initial.md).
 */
export function buildSummarySkeleton(lois: Loi[], existingPath: string): ResumeEntry[] {
  const existing = new Map<string, ResumeEntry>();
  if (existsSync(existingPath)) {
    const previous = JSON.parse(readFileSync(existingPath, "utf-8")) as ResumeEntry[];
    for (const entry of previous) existing.set(entry.id, entry);
  }

  const notorieteHeuristique = computeNotorieteHeuristic(lois);

  // La compréhensibilité se juge sur le résumé réel (une fois rédigé), pas sur le TODO qui le
  // précède : on résout d'abord le résumé de chaque loi avant de calculer l'heuristique.
  const resumeParId = new Map(lois.map((loi) => [loi.id, existing.get(loi.id)?.resume ?? TODO]));
  const comprehensibiliteHeuristique = computeComprehensibiliteHeuristic(lois, resumeParId);

  return lois.map((loi) => {
    const previous = existing.get(loi.id);
    return {
      id: loi.id,
      titre: loi.titre,
      theme: previous?.theme ?? loi.theme,
      notoriete: previous?.notoriete ?? notorieteHeuristique.get(loi.id)!,
      comprehensibilite: previous?.comprehensibilite ?? comprehensibiliteHeuristique.get(loi.id)!,
      resume: previous?.resume ?? TODO,
    } satisfies ResumeEntry;
  });
}
