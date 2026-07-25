import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLoiDetail, getLoisIndex, getResumes } from "../data/client";
import { useQuestionnaire } from "../state/QuestionnaireContext";
import { VoteSlider } from "../components/VoteSlider";
import { ordonnerParNotorieteAvecSeed } from "../lib/seed";
import type { Loi, LoiIndexEntry, ResumeEntry } from "../types";
import "./Questionnaire.css";

export function Questionnaire() {
  const { seed, answers, currentIndex, repondre, avancer, reculer } = useQuestionnaire();
  const [loisIndex, setLoisIndex] = useState<LoiIndexEntry[] | null>(null);
  const [loi, setLoi] = useState<Loi | null>(null);
  const [resume, setResume] = useState<ResumeEntry | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getLoisIndex().then(setLoisIndex);
  }, []);

  const ordre = useMemo(
    () => (loisIndex ? ordonnerParNotorieteAvecSeed(loisIndex, seed).map((l) => l.id) : []),
    [loisIndex, seed],
  );

  const loiId = currentIndex < ordre.length ? ordre[currentIndex] : undefined;

  useEffect(() => {
    if (!loiId) return;
    setLoi(null);
    Promise.all([getLoiDetail(loiId), getResumes()]).then(([loiData, resumes]) => {
      setLoi(loiData);
      setResume(resumes.get(loiId) ?? null);
    });
  }, [loiId]);

  // Une fois toutes les lois répondues ou passées, on file directement aux résultats.
  useEffect(() => {
    if (loisIndex && currentIndex >= ordre.length) navigate("/resultats", { replace: true });
  }, [loisIndex, currentIndex, ordre.length, navigate]);

  if (!loisIndex || !loiId) return <p className="muted">Chargement…</p>;

  return (
    <div className="questionnaire">
      {!loi ? (
        <p className="muted">Chargement…</p>
      ) : (
        <>
          <div className="questionnaire-categorie">{loi.theme}</div>
          <h2 className="questionnaire-titre">{loi.titre}</h2>
          {resume && <p className="questionnaire-resume">{resume.resume}</p>}
          <div className="questionnaire-lien">
            <a href={loi.liens.dossierAN ?? loi.liens.scrutinAN} target="_blank" rel="noopener noreferrer">
              Consulter le dossier législatif complet ↗
            </a>
          </div>
        </>
      )}

      <VoteSlider valeur={answers[loiId]} onChoisir={(v) => repondre(loiId, v)} />

      <div className="questionnaire-nav">
        {currentIndex > 0 && (
          <button type="button" className="questionnaire-nav-btn" onClick={reculer}>
            ← Question précédente
          </button>
        )}
        <button type="button" className="questionnaire-nav-btn questionnaire-nav-suivante" onClick={avancer}>
          Question suivante →
        </button>
      </div>
    </div>
  );
}
