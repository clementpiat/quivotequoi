# QuiVoteQuoi — app

App React + Vite consommant les JSON générés par `../pipeline/`. Voir le README à la racine du
dépôt pour la vue d'ensemble du projet.

```bash
npm install
npm run dev      # sync les données depuis ../pipeline/output/ puis lance le serveur de dev
npm run build    # idem puis build de prod dans dist/
```

`public/data/` est généré (gitignoré) par `npm run sync-data` — relance le pipeline
(`../pipeline`, `npm run build`) puis ce script si les données ont changé.

## Portée actuelle

Pages : Accueil, Liste des lois (filtres thème/date), Fiche loi (résumé + vote par groupe),
Questionnaire, Résultats de proximité, Méthodologie, À propos.

Volontairement pas encore fait (voir le plan de la session) : PWA (manifest + service worker),
génération d'image de résultat partageable, Web Share API. `À propos` contient des `TODO` pour le
lien du dépôt, le pseudo/lien GitHub, et le lien Buy Me a Coffee — à compléter.
