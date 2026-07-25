# QuiVoteQuoi

Web app statique qui permet de comparer ses positions aux votes réels des groupes
parlementaires de la 17e législature (2024-2027). Voir `description_initial.md` pour la
spécification complète du projet.

## État actuel

Le **pipeline de données** (`pipeline/`) est fonctionnel : il télécharge l'open data de
l'Assemblée nationale, sélectionne les scrutins portant sur l'ensemble d'un texte de loi,
calcule les positions des groupes politiques selon la méthodologie décrite dans
`description_initial.md`, et exporte des JSON statiques dans `pipeline/output/`.

L'**app React/Vite** (`app/`) couvre le parcours complet : accueil, liste des lois filtrable,
fiche loi (résumé + vote par groupe), questionnaire, résultats de proximité, méthodologie, à
propos. PWA, image de résultat partageable et Web Share API sont volontairement différés (voir
`app/README.md`).

## Pipeline de données

Prérequis : Node.js ≥ 22.12 (voir `.nvmrc`). Si tu utilises nvm, lance `nvm use` à la racine du
dépôt avant toute commande npm ci-dessous — sinon `npm run dev`/`build` échouent avec une erreur
`SyntaxError` peu explicite si ton shell utilise une version de Node plus ancienne par défaut.

```bash
cd pipeline
npm install
npm run build      # télécharge les données AN (mises en cache), génère pipeline/output/
npm run validate   # vérifie les positions calculées sur deux scrutins connus (n°8280, n°8431)
```

Sorties dans `pipeline/output/` :

- `groupes.json` — référentiel des groupes politiques (nom, sigle, couleur officielle).
- `lois.json` — liste des lois retenues (titre, date, résultat, thème et notoriété suggérés,
  chiffres globaux).
- `lois/<id>.json` — détail par loi : positions calculées par groupe, liens officiels.
- `resumes.json` — **fichier éditable à la main** : un résumé neutre par loi (2-4 phrases) à
  rédiger à partir de l'exposé des motifs, le thème et un score de notoriété (1 = sujet niche, 5 =
  très connu du grand public — voir `buildNotoriete.ts`, utilisé pour ordonner le questionnaire)
  suggérés automatiquement, à corriger si besoin. Les valeurs déjà rédigées/corrigées sont
  préservées d'une exécution du pipeline à l'autre.
- `report.json` — cas signalés pour revue humaine (dossiers avec plusieurs lectures, scrutins de
  parties de loi de finances exclus faute de vote net sur le texte entier, etc.).

Le pipeline met en cache les archives brutes de l'AN dans `pipeline/data/raw/` (gitignoré,
~300 Mo) pour ne pas les re-télécharger à chaque exécution.

### Limite connue : couverture temporelle et rattrapage par titre

Dans les données de l'AN, `objet.dossierLegislatif.dossierRef` (la référence qui relie un
scrutin à sa fiche officielle — titre court, thème, texte déposé) **est absent pour tout scrutin
antérieur au 26/03/2026** (bascule nette, probablement un changement côté AN, pas une donnée
manquante ponctuelle). Sans rattrapage, ça exclurait toute loi dont aucune lecture n'a de
`dossierRef`, avec un effet de bord trompeur : comme aucun vote d'ensemble n'a été rejeté depuis
le 26/03/2026, ne garder que les scrutins avec `dossierRef` natif donnait un jeu de données 100 %
adopté — pas parce que les lois rejetées manquent de dossier officiel, mais par pur hasard de
calendrier.

Le pipeline tente donc de retrouver le dossier officiel par deux méthodes, dans cet ordre :

1. **Référence de vote** (`matchDossierByVoteRef.ts`, fiable) : chaque dossier législatif liste
   dans son propre historique de procédure la référence du scrutin qui l'a conclu
   (`voteRefs`, ex. `VTANR5L17V3061`) — une donnée posée par l'AN elle-même, indépendante de la
   bascule du 26/03/2026 puisqu'elle est du côté du dossier, pas du scrutin. C'est la source
   utilisée en priorité.
2. **Similarité de titre** (`matchDossierByTitle.ts`, rattrapage plus incertain) : si aucune
   référence de vote n'existe, on compare le libellé du scrutin (nettoyé de son préfixe
   procédural) aux titres des dossiers législatifs de la 17e législature déjà téléchargés en
   intégralité. Une correspondance n'est retenue que si elle est unique (exacte, ou par inclusion
   d'un titre dans l'autre à longueur comparable — un titre court peut sinon apparaître comme un
   fragment fortuit d'un titre long et sans rapport).

Dans les deux cas, une correspondance ambiguë (plusieurs dossiers candidats) n'est jamais retenue
automatiquement ; le scrutin reste exclu et le cas est signalé dans `report.json` pour revue
manuelle. Les dossiers qui ne sont pas des textes de loi (rapports d'information, résolutions,
missions d'information…) sont exclus de la recherche par titre, leur titre pouvant coïncider par
hasard avec celui d'un vrai projet/proposition de loi sur le même sujet.

Résultat : **144 lois** couvrant juillet 2024 → aujourd'hui (dont 2 rejetées), contre 60 lois
(toutes adoptées, 26/03/2026 → 21/07/2026) avant ce rattrapage. `pipeline/output/report.json`
liste les cas encore exclus (~24, aucune correspondance trouvée) et ambigus (1, plusieurs
dossiers candidats) à traiter manuellement si on veut pousser la couverture plus loin.

## App React

Prérequis : Node.js ≥ 22.12 (voir `.nvmrc`). Si tu utilises nvm, lance `nvm use` à la racine du
dépôt avant toute commande npm ci-dessous — sinon `npm run dev`/`build` échouent avec une erreur
`SyntaxError` peu explicite si ton shell utilise une version de Node plus ancienne par défaut.

```bash
cd app
npm install
npm run dev      # sync les données depuis pipeline/output/ puis lance le serveur de dev
```

Voir `app/README.md` pour le détail.

## Prochaines étapes

PWA (manifest + service worker), génération d'image de résultat partageable (canvas) + Web Share
API, et finaliser les `TODO` de la page À propos (lien dépôt, pseudo/GitHub, Buy Me a Coffee).
