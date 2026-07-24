import { Link } from "react-router-dom";

export function Accueil() {
  return (
    <div>
      <h1>Qui vote quoi ?</h1>
      <p>
        Découvre ta proximité avec les groupes de l'Assemblée nationale — pas sur leurs programmes ou leurs
        déclarations, mais sur <strong>leurs votes réels</strong> depuis juillet 2024.
      </p>
      <p className="muted">
        Réponds à quelques questions sur des lois qui ont vraiment été votées, et compare tes positions à celles des
        groupes parlementaires de la législature 2024-2027.
      </p>
      <p style={{ marginTop: 24 }}>
        <Link to="/questionnaire" className="btn">
          Commencer le questionnaire
        </Link>
      </p>
      <p className="muted" style={{ marginTop: 8 }}>
        <Link to="/lois">ou parcourir la liste des lois</Link>
      </p>
    </div>
  );
}
