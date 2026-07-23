import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import type { Groupe, OrganeRaw } from "./types.js";

export function buildGroupes(organesDir: string): Groupe[] {
  const jsonDir = path.join(organesDir, "json", "organe");
  const files = readdirSync(jsonDir).filter((f) => f.endsWith(".json"));

  const groupes: Groupe[] = [];
  for (const f of files) {
    const raw = JSON.parse(readFileSync(path.join(jsonDir, f), "utf-8")) as OrganeRaw;
    const o = raw.organe;
    if (o.codeType !== "GP") continue; // GP = groupe politique
    groupes.push({
      id: o.uid,
      nom: o.libelle,
      sigle: o.libelleAbrege,
      couleur: o.couleurAssociee,
      dateDebut: o.viMoDe.dateDebut,
      dateFin: o.viMoDe.dateFin,
    });
  }

  return groupes.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}
