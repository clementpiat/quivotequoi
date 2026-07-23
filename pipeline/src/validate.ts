import { readFileSync } from "node:fs";
import path from "node:path";
import { fetchAllSources, SOURCES } from "./fetch.js";
import { computeGroupPositions } from "./computeGroupPositions.js";
import { toInt } from "./utils.js";
import type { ScrutinRaw } from "./types.js";

await fetchAllSources();

// Chiffres publics de référence relevés sur assemblee-nationale.fr/dyn/17/scrutins/{numero},
// utilisés comme cas connus pour valider le pipeline (voir description_initial.md).
const CAS_CONNUS = [
  {
    numero: "8280",
    label: "aide à mourir (lecture définitive, 2026-07-15)",
    synthese: { votants: 561, exprimes: 532, pour: 291, contre: 241, abstentions: 29 },
    groupe: { organeRef: "PO845401", sigle: "RN", effectif: 122, pour: 12, contre: 106, positionAttendue: (12 - 106) / 122 },
  },
  {
    numero: "8431",
    label: "protection des mineurs sur les réseaux sociaux (CMP, 2026-07-21)",
    synthese: { votants: 426, exprimes: 360, pour: 279, contre: 81, abstentions: 66 },
    groupe: { organeRef: "PO845401", sigle: "RN", effectif: 122, pour: 0, contre: 2, positionAttendue: (0 - 2) / 122 },
  },
];

const EPSILON = 1e-9;

function loadScrutin(numero: string): ScrutinRaw["scrutin"] {
  const filePath = path.join(SOURCES.scrutins.dir, "json", `VTANR5L17V${numero}.json`);
  const raw = JSON.parse(readFileSync(filePath, "utf-8")) as ScrutinRaw;
  return raw.scrutin;
}

let failures = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = typeof actual === "number" && typeof expected === "number"
    ? Math.abs(actual - expected) < EPSILON
    : actual === expected;
  console.log(`  ${ok ? "OK " : "FAIL"} ${label}: attendu=${expected} obtenu=${actual}`);
  if (!ok) failures++;
}

for (const cas of CAS_CONNUS) {
  console.log(`\n[validate] scrutin n°${cas.numero} — ${cas.label}`);
  const scrutin = loadScrutin(cas.numero);

  check("votants", toInt(scrutin.syntheseVote.nombreVotants), cas.synthese.votants);
  check("exprimes", toInt(scrutin.syntheseVote.suffragesExprimes), cas.synthese.exprimes);
  check("pour (global)", toInt(scrutin.syntheseVote.decompte.pour), cas.synthese.pour);
  check("contre (global)", toInt(scrutin.syntheseVote.decompte.contre), cas.synthese.contre);
  check("abstentions (global)", toInt(scrutin.syntheseVote.decompte.abstentions), cas.synthese.abstentions);

  const positions = computeGroupPositions(scrutin);
  const groupe = positions.find((p) => p.groupeId === cas.groupe.organeRef);
  check(`effectif ${cas.groupe.sigle}`, groupe?.effectif, cas.groupe.effectif);
  check(`pour ${cas.groupe.sigle}`, groupe?.pour, cas.groupe.pour);
  check(`contre ${cas.groupe.sigle}`, groupe?.contre, cas.groupe.contre);
  check(`position ${cas.groupe.sigle}`, groupe?.position, cas.groupe.positionAttendue);
}

console.log(failures === 0 ? "\n[validate] tous les cas connus sont cohérents." : `\n[validate] ${failures} vérification(s) en échec.`);
process.exit(failures === 0 ? 0 : 1);
