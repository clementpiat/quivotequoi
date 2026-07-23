import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import AdmZip from "adm-zip";

const RAW_DIR = path.resolve(import.meta.dirname, "../data/raw");

const SOURCES = {
  scrutins: {
    url: "https://data.assemblee-nationale.fr/static/openData/repository/17/loi/scrutins/Scrutins.json.zip",
    dir: path.join(RAW_DIR, "scrutins"),
  },
  organes: {
    url: "https://data.assemblee-nationale.fr/static/openData/repository/17/amo/deputes_actifs_mandats_actifs_organes/AMO10_deputes_actifs_mandats_actifs_organes.json.zip",
    dir: path.join(RAW_DIR, "organes"),
  },
  dossiers: {
    url: "https://data.assemblee-nationale.fr/static/openData/repository/17/loi/dossiers_legislatifs/Dossiers_Legislatifs.json.zip",
    dir: path.join(RAW_DIR, "dossiers"),
  },
} as const;

async function downloadAndExtract(name: string, url: string, targetDir: string): Promise<void> {
  if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
    console.log(`[fetch] ${name}: déjà en cache (${targetDir})`);
    return;
  }

  console.log(`[fetch] ${name}: téléchargement depuis ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`[fetch] ${name}: échec du téléchargement (HTTP ${response.status})`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());

  mkdirSync(RAW_DIR, { recursive: true });
  const zipPath = path.join(RAW_DIR, `${name}.zip`);
  writeFileSync(zipPath, buffer);

  console.log(`[fetch] ${name}: extraction vers ${targetDir}`);
  mkdirSync(targetDir, { recursive: true });
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(targetDir, true);
}

export async function fetchAllSources(): Promise<typeof SOURCES> {
  for (const [name, { url, dir }] of Object.entries(SOURCES)) {
    await downloadAndExtract(name, url, dir);
  }
  return SOURCES;
}

export { RAW_DIR, SOURCES };
