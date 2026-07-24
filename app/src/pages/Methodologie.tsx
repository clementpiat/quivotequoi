export function Methodologie() {
  return (
    <div>
      <h1>Méthodologie</h1>

      <h2>Sources</h2>
      <p>
        Toutes les données viennent de l'open data officiel de l'Assemblée nationale (
        <a href="https://data.assemblee-nationale.fr" target="_blank" rel="noreferrer">
          data.assemblee-nationale.fr
        </a>
        ) : exports des scrutins publics, des dossiers législatifs et du référentiel des groupes politiques de la
        17e législature.
      </p>

      <h2>Sélection des lois</h2>
      <p>
        Seuls les scrutins portant sur <strong>l'ensemble d'un texte</strong> (projet ou proposition de loi) sont
        retenus — pas les amendements, les articles isolés ni les motions de procédure. Quand un texte a fait
        l'objet de plusieurs lectures, seul le <strong>dernier vote à l'Assemblée</strong> est gardé (lecture
        définitive ou texte de commission mixte paritaire en priorité).
      </p>
      <p>
        Les propositions de résolution (création de commission d'enquête, résolutions européennes...) sont exclues :
        elles ne créent pas de norme, contrairement aux projets et propositions de loi.
      </p>
      <p>
        <strong>Limite connue :</strong> dans les données de l'Assemblée nationale, le champ qui relie un scrutin à
        sa fiche de dossier législatif est absent pour tous les scrutins antérieurs au 26 mars 2026 (bascule nette,
        probablement un changement côté Assemblée nationale). Faute de titre et de thème fiables pour cette période,
        les lois retenues ici ne couvrent actuellement que le <strong>26 mars 2026 au 21 juillet 2026</strong>, pas
        l'ensemble de la législature depuis juillet 2024.
      </p>

      <h2>Position des groupes</h2>
      <p>Pour chaque scrutin et chaque groupe, chaque député compte pour :</p>
      <ul>
        <li>Pour = +1</li>
        <li>Contre = −1</li>
        <li>Abstention = 0</li>
        <li>Non-votant = 0</li>
        <li>Absent (membre du groupe n'ayant pas pris part au scrutin) = 0</li>
      </ul>
      <p>
        La position du groupe est la <strong>moyenne sur l'ensemble de ses membres</strong> (effectif du groupe à la
        date du scrutin, tel que fourni par les données) : un score continu entre −1 et +1 par groupe et par loi.
      </p>

      <h2>Calcul de la proximité</h2>
      <p>
        Pour chaque loi à laquelle tu réponds, ta réponse (de −3 à +3) est normalisée sur la même échelle que la
        position des groupes (−1 à +1). L'écart entre ta réponse et la position d'un groupe donne une distance ; la
        proximité affichée est <strong>1 moins la distance moyenne pondérée</strong> par l'intensité de tes réponses
        (une réponse à ±3 pèse trois fois plus qu'une réponse à ±1), exprimée en pourcentage. Une réponse neutre (0)
        ou une loi passée ne compte pas dans le calcul.
      </p>
      <p>La page de résultats détaille ce calcul loi par loi, pour chaque groupe, en toute transparence.</p>

      <h2>Limites</h2>
      <ul>
        <li>
          La proximité mesurée concerne les <strong>groupes parlementaires de la législature 2024-2027</strong>, pas
          les candidats à une élection à venir.
        </li>
        <li>
          Un vote "pour" ou "contre" ne dit pas tout de la position d'un député sur un sujet (discipline de groupe,
          négociations, amendements rejetés en amont...).
        </li>
        <li>Le nombre de lois couvertes reste partiel : voir la limite de couverture temporelle ci-dessus.</li>
      </ul>
    </div>
  );
}
