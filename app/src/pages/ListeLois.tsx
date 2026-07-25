import { useEffect, useState } from "react";
import { getLoisIndex, getResumes } from "../data/client";
import { useQuestionnaire } from "../state/QuestionnaireContext";
import { LoiCard } from "../components/LoiCard";
import type { LoiIndexEntry, ResumeEntry } from "../types";
import "./ListeLois.css";

export function ListeLois() {
  const { answers, voter } = useQuestionnaire();
  const [lois, setLois] = useState<LoiIndexEntry[] | null>(null);
  const [resumes, setResumes] = useState<Map<string, ResumeEntry>>(new Map());

  useEffect(() => {
    getLoisIndex().then(setLois);
    getResumes().then(setResumes);
  }, []);

  return (
    <div className="liste-lois-page">
      <h1>Les lois du questionnaire</h1>
      <p className="liste-lois-sous-titre">
        {lois ? `Voici les ${lois.length} propositions sur lesquelles tu peux te positionner.` : "Chargement…"}
      </p>
      <div className="liste-lois">
        {[...(lois ?? [])]
          .sort((a, b) => b.comprehensibilite - a.comprehensibilite)
          .map((loi) => (
            <LoiCard
              key={loi.id}
              loi={loi}
              resume={resumes.get(loi.id)}
              reponse={answers[loi.id]}
              onVoter={(valeur) => voter(loi.id, valeur)}
            />
          ))}
      </div>
    </div>
  );
}
