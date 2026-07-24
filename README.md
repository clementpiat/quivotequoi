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
- `lois.json` — liste des lois retenues (titre, date, résultat, thème suggéré, chiffres globaux).
- `lois/<id>.json` — détail par loi : positions calculées par groupe, liens officiels.
- `resumes.json` — **fichier éditable à la main** : un résumé neutre par loi (2-4 phrases) à
  rédiger à partir de l'exposé des motifs, et le thème (suggéré automatiquement, à corriger si
  besoin). Les résumés déjà rédigés sont préservés d'une exécution du pipeline à l'autre.
- `report.json` — cas signalés pour revue humaine (dossiers avec plusieurs lectures, scrutins de
  parties de loi de finances exclus faute de vote net sur le texte entier, etc.).

Le pipeline met en cache les archives brutes de l'AN dans `pipeline/data/raw/` (gitignoré,
~300 Mo) pour ne pas les re-télécharger à chaque exécution.

### Limite connue : couverture temporelle

Dans les données de l'AN, `objet.dossierLegislatif.dossierRef` (la référence qui relie un
scrutin à sa fiche officielle — titre court, thème, texte déposé) **est absent pour tout scrutin
antérieur au 26/03/2026** (bascule nette, probablement un changement côté AN, pas une donnée
manquante ponctuelle). Le pipeline exclut délibérément toute loi dont aucune lecture n'a de
`dossierRef` — décision prise pour garder une source fiable pour le titre et le futur résumé,
plutôt que de générer des titres approximatifs pour ~65 % des lois.

Conséquence : les lois retenues ne couvrent actuellement que **le 26/03/2026 au 21/07/2026**
(60 lois), pas l'ensemble de la législature depuis juillet 2024. `pipeline/output/report.json`
liste les ~120 lois exclues pour cette raison. À rouvrir si une source alternative de titres
officiels est trouvée pour la période antérieure.

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
