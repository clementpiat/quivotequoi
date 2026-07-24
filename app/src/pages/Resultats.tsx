import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuestionnaire } from "../state/QuestionnaireContext";
import { getGroupes, getLoiDetails } from "../data/client";
import { computeProximity, type ProximityComputation } from "../lib/proximity";
import { ProximityRanking } from "../components/ProximityRanking";
import type { Groupe, Loi } from "../types";

export function Resultats() {
  const { answers } = useQuestionnaire();
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [lois, setLois] = useState<Loi[] | null>(null);

  const ids = Object.keys(answers);

  useEffect(() => {
    if (ids.length === 0) {
      setLois([]);
      return;
    }
    Promise.all([getLoiDetails(ids), getGroupes()]).then(([loisData, groupesData]) => {
      setLois(loisData);
      setGroupes(groupesData);
    });
    // ids est dérivé de answers à chaque rendu ; on ne veut relancer que si le contenu change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(ids)]);

  if (lois === null) return <p className="muted">Chargement…</p>;

  if (ids.length === 0) {
    return (
      <div>
        <h1>Résultats</h1>
        <p>Tu n'as pas encore répondu au questionnaire.</p>
        <p>
          <Link to="/questionnaire" className="btn">
            Commencer le questionnaire
          </Link>
        </p>
      </div>
    );
  }

  const computation: ProximityComputation = computeProximity(answers, lois);

  return (
    <div>
      <h1>Tes résultats</h1>
      <p className="muted">
        Basé sur {ids.length} réponse{ids.length > 1 ? "s" : ""}. Proximité avec les{" "}
        <strong>groupes parlementaires de la législature 2024-2027</strong> — pas avec des candidats à une élection à
        venir. Voir la <Link to="/methodologie">méthodologie</Link> pour le détail du calcul.
      </p>

      {!computation.valide ? (
        <p>
          {computation.raison === "aucune-intensite"
            ? "Tes réponses sont toutes neutres : pas assez d'information pour calculer un classement. Réponds à au moins une loi avec une opinion tranchée."
            : "Pas assez de réponses pour calculer un résultat."}
        </p>
      ) : (
        <ProximityRanking
          resultats={computation.resultats}
          groupes={groupes}
          loisParId={new Map(lois.map((l) => [l.id, l]))}
        />
      )}

      <p style={{ marginTop: 24 }}>
        <Link to="/questionnaire" className="btn btn-ghost">
          Répondre à d'autres lois
        </Link>
      </p>
    </div>
  );
}
