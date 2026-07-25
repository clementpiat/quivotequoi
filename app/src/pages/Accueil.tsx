import { Link } from "react-router-dom";
import { Hemicycle } from "../components/Hemicycle";
import "./Accueil.css";

export function Accueil() {
  return (
    <div className="accueil">
      <Hemicycle />
      <h1 className="accueil-titre">Ta proximité avec les groupes de l'Assemblée nationale</h1>

      <div className="accueil-cta">
        <Link to="/questionnaire" className="btn">
          Commencer
        </Link>
      </div>
    </div>
  );
}
