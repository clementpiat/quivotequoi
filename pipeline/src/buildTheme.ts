// Heuristique de thème par mots-clés — suggestion de départ à corriger à la main dans
// resumes.json (voir description_initial.md : "thème à déduire du dossier législatif").
const THEME_KEYWORDS: Array<[theme: string, keywords: RegExp]> = [
  ["Santé", /sant[ée]|m[ée]dic|h[oô]pital|soin|handicap|fin de vie|aide à mourir|s[ée]curit[ée] sociale/i],
  ["Numérique", /num[ée]rique|intelligence artificielle|donn[ée]es personnelles|r[ée]seaux sociaux|cybers[ée]curit[ée]|internet/i],
  ["Sécurité", /s[ée]curit[ée]|police|gendarmerie|d[ée]linquance|terroris|immigration|[ée]trangers|asile/i],
  ["Justice", /justice|p[ée]nal|peine|magistrat|prison|proc[ée]dure judiciaire/i],
  ["Budget / Finances", /finances|budget|fiscal|imp[oô]t|d[ée]ficit|dette publique/i],
  ["Travail / Économie", /travail|emploi|ch[oô]mage|entreprise|[ée]conomi|pouvoir d'achat|retraite/i],
  ["Environnement", /environnement|climat|[ée]nergie|nucl[ée]aire|biodiversit[ée]|agricult|eau\b/i],
  ["Éducation", /[ée]ducation|[ée]cole|universit[ée]|enseignement|[ée]tudiant/i],
  ["Logement", /logement|urbanisme|habitat/i],
  ["Institutions", /constitution|[ée]lection|r[ée]f[ée]rendum|collectivit[ée]s territoriales|d[ée]centralisation/i],
  ["International", /international|europ[ée]en|diplomat|trait[ée]|accord bilat[ée]ral/i],
  ["Société", /famille|[ée]galit[ée]|discrimination|violence|enfance|m[ée]dia|audiovisuel|culture|sport/i],
];

export function guessTheme(...texts: Array<string | null | undefined>): string {
  const haystack = texts.filter(Boolean).join(" ");
  for (const [theme, regex] of THEME_KEYWORDS) {
    if (regex.test(haystack)) return theme;
  }
  return "Autre";
}
