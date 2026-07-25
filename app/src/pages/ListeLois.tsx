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
  const [themeFiltre, setThemeFiltre] = useState<string | null>(null);

  useEffect(() => {
    getLoisIndex().then(setLois);
    getResumes().then(setResumes);
  }, []);

  const themes = [...new Set((lois ?? []).map((l) => l.theme))].sort((a, b) => a.localeCompare(b, "fr"));
  const loisFiltrees = (lois ?? []).filter((l) => themeFiltre === null || l.theme === themeFiltre);

  return (
    <div className="liste-lois-page">
      <h1>Les lois du questionnaire</h1>
      <p className="liste-lois-sous-titre">
        {lois
          ? `Voici ${loisFiltrees.length === lois.length ? `les ${lois.length} propositions` : `${loisFiltrees.length} des ${lois.length} propositions`} sur lesquelles tu peux te positionner.`
          : "Chargement…"}
      </p>

      {lois && (
        <div className="liste-lois-filtres" role="group" aria-label="Filtrer par thème">
          <button
            type="button"
            className={`liste-lois-filtre${themeFiltre === null ? " actif" : ""}`}
            onClick={() => setThemeFiltre(null)}
          >
            Tous ({lois.length})
          </button>
          {themes.map((theme) => (
            <button
              key={theme}
              type="button"
              className={`liste-lois-filtre${themeFiltre === theme ? " actif" : ""}`}
              onClick={() => setThemeFiltre(theme)}
            >
              {theme} ({lois.filter((l) => l.theme === theme).length})
            </button>
          ))}
        </div>
      )}

      <div className="liste-lois">
        {[...loisFiltrees]
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
