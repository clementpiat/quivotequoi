import { cpSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.resolve(appDir, "../pipeline/output");
const target = path.resolve(appDir, "public/data");

if (!existsSync(source)) {
  console.error(`[sync-data] introuvable : ${source} — lance d'abord "npm run build" dans pipeline/`);
  process.exit(1);
}

cpSync(source, target, { recursive: true });
console.log(`[sync-data] ${source} -> ${target}`);
