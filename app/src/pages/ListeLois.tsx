import { useEffect, useState } from "react";
import { getLoisIndex, getResumes } from "../data/client";
import { useQuestionnaire } from "../state/QuestionnaireContext";
import { LoiCard } from "../components/LoiCard";
import type { LoiIndexEntry, ResumeEntry } from "../types";
import "./ListeLois.css";

type StatutFiltre = "tous" | "votees" | "non-votees";

export function ListeLois() {
  const { answers, voter } = useQuestionnaire();
  const [lois, setLois] = useState<LoiIndexEntry[] | null>(null);
  const [resumes, setResumes] = useState<Map<string, ResumeEntry>>(new Map());
  const [themeFiltre, setThemeFiltre] = useState<string | null>(null);
  const [statutFiltre, setStatutFiltre] = useState<StatutFiltre>("tous");

  useEffect(() => {
    getLoisIndex().then(setLois);
    getResumes().then(setResumes);
  }, []);

  // "Pas d'avis" compte comme voté : seule une loi jamais touchée (absente de answers) est non votée.
  function correspondAuStatut(loi: LoiIndexEntry, statut: StatutFiltre): boolean {
    const votee = loi.id in answers;
    if (statut === "votees") return votee;
    if (statut === "non-votees") return !votee;
    return true;
  }

  const themes = [...new Set((lois ?? []).map((l) => l.theme))].sort((a, b) => a.localeCompare(b, "fr"));
  // Le compte de chaque filtre reflète les autres filtres déjà actifs, pour que les chiffres
  // affichés restent cohérents avec ce que l'autre sélection va effectivement montrer.
  const loisApresTheme = (lois ?? []).filter((l) => themeFiltre === null || l.theme === themeFiltre);
  const loisApresStatut = (lois ?? []).filter((l) => correspondAuStatut(l, statutFiltre));
  const loisFiltrees = loisApresTheme.filter((l) => correspondAuStatut(l, statutFiltre));

  return (
    <div className="liste-lois-page">
      <h1>Les lois du questionnaire</h1>
      <p className="liste-lois-sous-titre">
        {lois
          ? `Voici ${loisFiltrees.length === lois.length ? `les ${lois.length} propositions` : `${loisFiltrees.length} des ${lois.length} propositions`} sur lesquelles tu peux te positionner.`
          : "Chargement…"}
      </p>

      {lois && (
        <>
          <div className="liste-lois-filtres" role="group" aria-label="Filtrer par statut de vote">
            <button
              type="button"
              className={`liste-lois-filtre${statutFiltre === "tous" ? " actif" : ""}`}
              onClick={() => setStatutFiltre("tous")}
            >
              Toutes ({loisApresTheme.length})
            </button>
            <button
              type="button"
              className={`liste-lois-filtre${statutFiltre === "votees" ? " actif" : ""}`}
              onClick={() => setStatutFiltre("votees")}
            >
              Votées ({loisApresTheme.filter((l) => correspondAuStatut(l, "votees")).length})
            </button>
            <button
              type="button"
              className={`liste-lois-filtre${statutFiltre === "non-votees" ? " actif" : ""}`}
              onClick={() => setStatutFiltre("non-votees")}
            >
              Non votées ({loisApresTheme.filter((l) => correspondAuStatut(l, "non-votees")).length})
            </button>
          </div>

          <div className="liste-lois-filtres" role="group" aria-label="Filtrer par thème">
            <button
              type="button"
              className={`liste-lois-filtre${themeFiltre === null ? " actif" : ""}`}
              onClick={() => setThemeFiltre(null)}
            >
              Tous ({loisApresStatut.length})
            </button>
            {themes.map((theme) => (
              <button
                key={theme}
                type="button"
                className={`liste-lois-filtre${themeFiltre === theme ? " actif" : ""}`}
                onClick={() => setThemeFiltre(theme)}
              >
                {theme} ({loisApresStatut.filter((l) => l.theme === theme).length})
              </button>
            ))}
          </div>
        </>
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
