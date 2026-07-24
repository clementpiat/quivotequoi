import { LABELS_REPONSE, REPONSE_MAX, REPONSE_MIN } from "../lib/constants";
import "./VoteSlider.css";

const VALEURS = Array.from({ length: REPONSE_MAX - REPONSE_MIN + 1 }, (_, i) => REPONSE_MIN + i);

export function VoteSlider({
  valeur,
  onChoisir,
  onPasser,
}: {
  valeur: number | undefined;
  onChoisir: (valeur: number) => void;
  onPasser: () => void;
}) {
  return (
    <div className="vote-slider">
      <div className="vote-slider-scale" role="radiogroup" aria-label="Ta position, de contre à pour">
        {VALEURS.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={valeur === v}
            className={`vote-slider-btn ${valeur === v ? "selected" : ""} ${v < 0 ? "cote-contre" : v > 0 ? "cote-pour" : "cote-neutre"}`}
            onClick={() => onChoisir(v)}
          >
            {v > 0 ? `+${v}` : v}
          </button>
        ))}
      </div>
      <div className="vote-slider-labels muted">
        <span>Contre</span>
        <span>Pour</span>
      </div>
      {valeur !== undefined && <p className="vote-slider-label-actuel">{LABELS_REPONSE[valeur]}</p>}
      <button type="button" className="btn btn-ghost vote-slider-passer" onClick={onPasser}>
        Passer cette loi
      </button>
    </div>
  );
}
