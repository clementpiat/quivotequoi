import { existsSync, readFileSync } from "node:fs";
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

  return lois.map((loi) => {
    const previous = existing.get(loi.id);
    return {
      id: loi.id,
      titre: loi.titre,
      theme: previous?.theme ?? loi.theme,
      resume: previous?.resume ?? TODO,
    } satisfies ResumeEntry;
  });
}
