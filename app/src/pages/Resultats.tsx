import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuestionnaire } from "../state/QuestionnaireContext";
import { getGroupes, getLoiDetails, getLoisIndex } from "../data/client";
import { computeProximity, type ProximityComputation } from "../lib/proximity";
import { ProximityBars } from "../components/ProximityBars";
import { SEUIL_RESULTATS } from "../lib/constants";
import type { Groupe, Loi } from "../types";
import "./Resultats.css";

export function Resultats() {
  const { answers, reinitialiser } = useQuestionnaire();
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [lois, setLois] = useState<Loi[] | null>(null);
  const [totalLois, setTotalLois] = useState<number | null>(null);
  const [shareCopie, setShareCopie] = useState(false);
  const navigate = useNavigate();

  // "Pas d'avis" est exclu des réponses comptées, comme une loi passée (voir lib/proximity.ts).
  const ids = Object.entries(answers)
    .filter(([, valeur]) => typeof valeur === "number")
    .map(([id]) => id);
  const answeredCount = ids.length;
  const isComplete = answeredCount >= SEUIL_RESULTATS;

  useEffect(() => {
    getLoisIndex().then((index) => setTotalLois(index.length));
    // Les non-inscrits ne forment pas un groupe politique cohérent : on les exclut des résultats.
    getGroupes().then((tousLesGroupes) => setGroupes(tousLesGroupes.filter((g) => g.sigle !== "NI")));
  }, []);

  useEffect(() => {
    if (ids.length === 0) {
      setLois([]);
      return;
    }
    getLoiDetails(ids).then(setLois);
    // ids est dérivé de answers à chaque rendu ; on ne veut relancer que si le contenu change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(ids)]);

  function handleReinitialiser() {
    if (confirm("Effacer toutes tes réponses et repartir de zéro ?")) {
      reinitialiser();
      navigate("/");
    }
  }

  async function handleShare(computation: ProximityComputation) {
    if (!computation.valide) return;
    const parGroupe = new Map(groupes.map((g) => [g.id, g]));
    const texte = computation.resultats
      .filter((r) => parGroupe.has(r.groupeId))
      .map((r) => {
        const pct = Math.round(Math.max(0, Math.min(100, r.proximite)));
        return `${parGroupe.get(r.groupeId)!.sigle} ${pct}%`;
      })
      .join(" · ");
    try {
      await navigator.clipboard.writeText(
        `Ma proximité avec les groupes de l'Assemblée nationale : ${texte} (via QuiVoteQuoi)`,
      );
      setShareCopie(true);
      setTimeout(() => setShareCopie(false), 1800);
    } catch {
      // API presse-papiers indisponible (permissions, contexte non sécurisé...) : on ignore silencieusement.
    }
  }

  if (lois === null || totalLois === null) return <p className="muted">Chargement…</p>;

  if (!isComplete) {
    return (
      <div className="resultats-verrouilles">
        <h1>Tes résultats</h1>
        <p>
          Réponds à au moins {SEUIL_RESULTATS} questions pour découvrir ta proximité avec les groupes de l'Assemblée
          nationale.
        </p>
        <p className="resultats-progression">
          <strong>
            {answeredCount}/{SEUIL_RESULTATS} questions répondues
          </strong>{" "}
        </p>
        <div>
          <Link to="/questionnaire" className="btn">
            {answeredCount > 0 ? "Continuer le questionnaire" : "Commencer le questionnaire"}
          </Link>
        </div>
      </div>
    );
  }

  const computation: ProximityComputation = computeProximity(answers, lois);
  const isFullyDone = answeredCount >= totalLois;

  return (
    <div className="resultats">
      <div>
        <h1>Ta proximité avec les groupes</h1>
        <p className="resultats-rationale">
          Le pourcentage indique à quel point tes réponses se rapprochent du vote réel de chaque groupe à l'Assemblée
          nationale.
        </p>
      </div>

      {computation.valide && <ProximityBars resultats={computation.resultats} groupes={groupes} />}

      {!isFullyDone && (
        <div className="resultats-refine">
          <span>
            Basé sur {answeredCount}/{totalLois} réponses. Continue le questionnaire pour affiner ton résultat.
          </span>
          <Link to="/questionnaire" className="resultats-refine-link">
            Continuer
          </Link>
        </div>
      )}

      <div className="resultats-actions">
        <button type="button" className="btn btn-outline" onClick={() => handleShare(computation)}>
          {shareCopie ? "Copié !" : "Partager mes résultats"}
        </button>
        <button type="button" className="btn-ghost" onClick={handleReinitialiser}>
          Recommencer le test
        </button>
      </div>
    </div>
  );
}
