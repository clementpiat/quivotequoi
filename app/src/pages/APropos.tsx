export function APropos() {
  return (
    <div className="contenu-texte">
      <h1>À propos</h1>
      <p>
        QuiVoteQuoi est un outil civique gratuit, sans publicité et sans tracking. L'objectif : permettre de se
        positionner sur des lois réellement votées à l'Assemblée nationale, et de comparer ses réponses aux votes
        effectifs des groupes parlementaires — pas à leurs programmes ou à leurs déclarations.
      </p>
      <p>
        Tout tourne dans ton navigateur : aucune réponse au questionnaire n'est envoyée ni stockée où que ce soit.
      </p>

      <h2>Code source</h2>
      <p>
        Projet open source —{" "}
        <a href="https://github.com/clementpiat/quivotequoi" target="_blank" rel="noreferrer">
          github.com/clementpiat/quivotequoi
        </a>
        .
      </p>
    </div>
  );
}
