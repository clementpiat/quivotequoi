// Quand le dossier législatif n'est pas rattaché au scrutin (voir filterScrutins.ts), il faut
// dériver un titre court lisible à partir du libellé brut du scrutin, du type :
// "l'ensemble de la proposition de loi visant à renforcer la stabilité économique et la
// compétitivité du secteur agroalimentaire (texte de la commission mixte paritaire)."
// -> "Renforcer la stabilité économique et la compétitivité du secteur agroalimentaire"
const PREFIX_REGEX =
  /^l['’]ensemble (du|de la|des|d['’])\s*(projet de loi|proposition de loi organique|proposition de loi)\s*(constitutionnelle)?\s*(visant à|(?:relatif|relative|relatifs|relatives) (?:à|au|aux)|portant|tendant à|autorisant|pour|sur|concernant|d['’])?\s*/i;

const SUFFIX_REGEX = /\s*\([^()]*\)\.?\s*$/;

export function cleanFallbackTitle(libelle: string): string {
  const sansPrefixe = libelle.replace(PREFIX_REGEX, "");
  const sansSuffixe = sansPrefixe.replace(SUFFIX_REGEX, "").replace(/\.\s*$/, "").trim();
  if (sansSuffixe.length === 0) return libelle;
  return sansSuffixe.charAt(0).toUpperCase() + sansSuffixe.slice(1);
}
