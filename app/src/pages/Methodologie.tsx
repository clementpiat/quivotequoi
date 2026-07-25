export function Methodologie() {
  return (
    <div className="contenu-texte">
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

      <h2>Ta position</h2>
      <p>
        Pour chaque loi du questionnaire, tu indiques ta position sur une échelle de −2 à +2 : −2 traduit un
        désaccord fort et important pour toi, −1 un désaccord simple, 0 une position neutre, +1 un accord simple,
        +2 un accord fort et important pour toi. Si tu n'as aucun avis, passe simplement à la question suivante sans
        répondre — la loi ne comptera pas dans le calcul de proximité.
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
        Les député·es <strong>non inscrit·es</strong> ne formant pas un groupe politique cohérent, ils sont exclus des
        résultats.
      </p>

      <h2>Calcul de la proximité</h2>
      <p>
        Ta réponse est d'abord convertie en score : <strong>0,5</strong> si tu es neutre, <strong>1</strong> si tu es
        pour (ou très pour), <strong>0</strong> si tu es contre (ou très contre). Pour chaque loi à laquelle tu
        réponds, on calcule l'écart absolu entre ce score et la position du groupe, pondéré — un avis "très pour" ou
        "très contre" compte deux fois plus qu'un avis simple ou neutre.
      </p>
      <p>
        Ta proximité avec un groupe est <strong>1 moins la moyenne pondérée de ces écarts</strong>, sur toutes les
        lois auxquelles tu as répondu, exprimée en pourcentage. Une réponse neutre compte dans cette moyenne. En
        revanche, une loi <strong>passée</strong> (« aucun avis ») est totalement exclue du calcul.
      </p>
      <p>
        Tu débloques tes premiers résultats après <strong>10 réponses</strong> (les lois passées ne comptent pas dans
        ce seuil). Tu peux ensuite continuer à répondre pour affiner le résultat, qui se recalcule à chaque nouvelle
        réponse.
      </p>

      <h2>Comment lire le résultat</h2>
      <p>
        Chaque groupe est affiché avec son pourcentage de proximité, du plus proche au plus éloigné de tes réponses.
        Ce classement mesure uniquement la proximité avec des votes passés — il ne s'agit pas d'une recommandation de
        vote, et le positionnement politique reste multidimensionnel.
      </p>

      <div className="note">
        La proximité mesurée concerne les <strong>groupes parlementaires de la législature 2024-2027</strong>, pas
        les candidats à une élection à venir. Un vote « pour » ou « contre » ne dit pas tout de la position d'un
        député sur un sujet (discipline de groupe, négociations, amendements rejetés en amont...). Le nombre de lois
        couvertes reste partiel : voir la limite de couverture temporelle ci-dessus.
      </div>
    </div>
  );
}
