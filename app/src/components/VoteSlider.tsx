import { PAS_AVIS, REPONSE_MAX, REPONSE_MIN, type ReponseValeur } from "../lib/constants";
import "./VoteSlider.css";

const VALEURS = Array.from({ length: REPONSE_MAX - REPONSE_MIN + 1 }, (_, i) => REPONSE_MIN + i);

function classePourValeur(v: number, selectionnee: boolean): string {
  let classe: string;
  if (v === REPONSE_MIN) classe = "vote-slider-btn solide-contre";
  else if (v < 0) classe = "vote-slider-btn outline-contre";
  else if (v === 0) classe = "vote-slider-btn outline-neutre";
  else if (v === REPONSE_MAX) classe = "vote-slider-btn solide-pour";
  else classe = "vote-slider-btn outline-pour";
  return selectionnee ? `${classe} selectionnee` : classe;
}

function labelPrincipal(v: number): string {
  return v < 0 ? "Contre" : v > 0 ? "Pour" : "Neutre";
}

export function VoteSlider({
  valeur,
  onChoisir,
}: {
  valeur?: ReponseValeur;
  onChoisir: (valeur: ReponseValeur) => void;
}) {
  return (
    <div className="vote-slider">
      <div className="vote-slider-titre">Ta position</div>
      <div className="vote-slider-scale" role="group" aria-label="Ta position, de contre à pour">
        {VALEURS.map((v) => (
          <button
            key={v}
            type="button"
            className={classePourValeur(v, v === valeur)}
            onClick={() => onChoisir(v)}
          >
            <span className="vote-slider-label">{labelPrincipal(v)}</span>
            {Math.abs(v) === REPONSE_MAX && <span className="vote-slider-sous-label">très important</span>}
          </button>
        ))}
      </div>
      <div className="vote-slider-echelle">
        {VALEURS.map((v) => (
          <span key={v}>{v > 0 ? `+${v}` : v}</span>
        ))}
      </div>
      <button
        type="button"
        className={`vote-slider-pas-avis${valeur === PAS_AVIS ? " selectionnee" : ""}`}
        onClick={() => onChoisir(PAS_AVIS)}
      >
        Pas d'avis (différent de neutre : cette loi ne comptera pas dans le calcul de proximité)
      </button>
    </div>
  );
}
