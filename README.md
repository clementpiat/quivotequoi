# QuiVoteQuoi

Web app statique qui permet de comparer ses positions aux votes réels des groupes
parlementaires de la 17e législature (2024-2027). Voir `description_initial.md` pour la
spécification complète du projet.

## État actuel

Le **pipeline de données** (`pipeline/`) est fonctionnel : il télécharge l'open data de
l'Assemblée nationale, sélectionne les scrutins portant sur l'ensemble d'un texte de loi,
calcule les positions des groupes politiques selon la méthodologie décrite dans
`description_initial.md`, et exporte des JSON statiques dans `pipeline/output/`.

L'app React/Vite consommant ces données n'est pas encore développée.

## Pipeline de données

Prérequis : Node.js 22 (voir `.nvmrc`).

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

## Prochaines étapes

Voir l'ordre de développement suggéré dans `description_initial.md` : app React (liste des lois,
fiche loi, questionnaire, calcul de proximité), PWA, partage.
