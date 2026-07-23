# Handoff — QuiVoteQuoi

## Le projet en une phrase

Une web app statique, tout côté client, qui permet à un citoyen de se positionner sur les lois réellement votées à l'Assemblée nationale (législature 2024-2027) et de mesurer sa proximité avec chaque groupe politique sur la base des votes réels — pas des programmes. Objectif : en ligne avant les élections de 2027.

## Source de données

- Open data officiel de l'Assemblée nationale : https://data.assemblee-nationale.fr
  - Exports JSON des **scrutins publics** de la 17e législature (vote nominatif de chaque député + groupe d'appartenance).
  - Exports des **dossiers législatifs** (titre, exposé des motifs, étapes de la procédure).
  - Référentiel des **groupes politiques** et des **acteurs** (députés).
- Pages web de référence pour vérification ponctuelle : https://www.assemblee-nationale.fr/dyn/17/scrutins/{numéro}
- Périmètre : **uniquement la 17e législature** (juillet 2024 → aujourd'hui).

## Sélection des scrutins

- Retenir **uniquement les scrutins portant sur l'ensemble d'un texte** (projets et propositions de loi) : repérables via le libellé du scrutin ("sur l'ensemble de…") / le type d'objet dans les données.
- **Exclure** : amendements, articles, motions de procédure, sous-amendements.
- Si un même texte a plusieurs scrutins d'ensemble (plusieurs lectures), ne garder que le **dernier vote à l'Assemblée** (lecture définitive ou texte de CMP en priorité).
- Ambition : **le plus de lois possible** après ce filtre (probablement quelques dizaines à ~100+).

## Méthodologie de position des groupes (décidée, ne pas complexifier)

Pour chaque scrutin et chaque groupe :

- Pour = **+1**
- Contre = **−1**
- Abstention = **0**
- Non-votant = **0**
- Absent (membre du groupe n'ayant pas pris part au scrutin) = **0**

Position du groupe = **moyenne sur l'ensemble des membres du groupe** (effectif du groupe à la date du scrutin, tel que fourni par les données). Résultat : un score continu entre −1 et +1 par groupe et par loi.

Cette méthodologie doit être expliquée telle quelle sur une page « Méthodologie » de l'app.

## Fonctionnalités

### 1. Liste des lois
- Liste de toutes les lois retenues, avec titre court lisible, date du vote, résultat (adopté/rejeté), chiffres pour/contre/abstention.
- Filtre/tri par thème (santé, numérique, sécurité, budget, société, etc. — thème à déduire du dossier législatif) et par date.

### 2. Fiche loi
- Résumé bref (2-4 phrases), neutre, de ce que fait la loi. Les résumés sont générés à partir des exposés des motifs puis **stockés dans un fichier éditable** (JSON/MD) pour relecture humaine — pas générés à la volée.
- Lien vers le dossier législatif officiel et vers la page du scrutin sur assemblee-nationale.fr.
- **Visualisation simple de la répartition par groupe** : barres pour/contre/abstention+absents par groupe (comme les tableaux d'analyse de scrutin de l'AN, en visuel).

### 3. Questionnaire « Voterais-tu cette loi ? »
- Pour chaque loi (l'utilisateur choisit un paquet : par thème, ou aléatoire, ou tout), question : « Voterais-tu pour ou contre cette loi ? » sur une échelle **−3 à +3** (0 = neutre/sans avis, possibilité de "passer").
- L'intensité (|réponse|) sert de **pondération** : une loi notée ±3 pèse trois fois plus qu'une loi notée ±1 dans le calcul de proximité.

### 4. Résultat de proximité
- Score de proximité utilisateur ↔ chaque groupe parlementaire : similarité entre le vecteur de réponses (normalisé sur [−1, +1]) et le vecteur de positions des groupes, pondérée par l'intensité des réponses. Proposer une formule simple et explicable (ex. 1 − distance moyenne pondérée), affichée en pourcentage de proximité.
- Classement des groupes + détail dépliable **loi par loi** (ma réponse vs position du groupe) pour une transparence totale du calcul.
- Bien indiquer que la proximité mesurée concerne les **groupes parlementaires de la législature 2024-2027** (pas les candidats à la présidentielle).

## Contraintes techniques

- **Web app 100 % statique, tout côté client.** Aucun backend, aucune base de données, aucun stockage des réponses utilisateur (RGPD : les réponses sont des données d'opinion politique — elles ne quittent jamais le navigateur, le dire explicitement dans l'app).
- Stack suggérée : React + Vite, données pré-traitées embarquées en JSON statique. Visualisations légères (SVG maison ou lib légère type Recharts).
- **Pipeline de données séparé** (scripts Node ou Python, exécutés en local/CI) : télécharge l'open data AN → filtre les scrutins d'ensemble → calcule les positions par groupe → génère les JSON statiques consommés par l'app + un squelette de résumés à relire. Le pipeline doit être relançable pour intégrer les nouveaux scrutins jusqu'en 2027.
- Site responsive, mobile d'abord (usage grand public).
- **PWA installable** : manifest + service worker (cache des assets et des JSON de données pour un fonctionnement hors ligne après première visite). Coût minimal, pas d'app store.
- **Optimisé pour le partage** : balises Open Graph / Twitter Cards soignées (titre, description, image) pour que les liens s'affichent bien sur les réseaux sociaux et dans les messageries ; sur la page de résultats, **génération côté client d'une image de résultat partageable** (canvas → PNG : classement de proximité de l'utilisateur, sans aucune donnée envoyée au serveur) + boutons de partage natifs (Web Share API avec repli copier le lien).
- Langue : français.

## Pages de l'app

1. Accueil (pitch + CTA vers le questionnaire)
2. Liste des lois (+ filtres)
3. Fiche loi (résumé + visualisation par groupe)
4. Questionnaire
5. Résultats de proximité
6. Méthodologie (sélection des scrutins, règle de scoring, formule de proximité, sources, limites)
7. À propos (pourquoi cet outil existe ; signature via **pseudo/lien GitHub uniquement** — pas de nom complet ni de réseaux sociaux personnels ; lien vers le dépôt open source ; **lien Buy Me a Coffee très discret**, uniquement sur cette page, formulation sobre type « soutenir les frais d'hébergement ». **Aucune publicité nulle part** — outil civique, gratuit, sans tracking.)

## Ordre de développement suggéré

1. Pipeline de données (le cœur du risque) : parsing open data, filtre des scrutins d'ensemble, calcul des positions par groupe, export JSON. Valider sur deux cas connus : scrutin n°8280 (aide à mourir, 15/07/2026) et n°8431 (réseaux sociaux <15 ans, 21/07/2026).
2. Liste des lois + fiche loi + visualisation.
3. Questionnaire + calcul de proximité + page résultats.
4. Génération des squelettes de résumés + page méthodologie.