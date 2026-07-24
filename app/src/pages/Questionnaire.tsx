import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getLoiDetail, getLoisIndex, getResumes } from "../data/client";
import { useQuestionnaire } from "../state/QuestionnaireContext";
import { VoteSlider } from "../components/VoteSlider";
import { TAILLE_PAQUET_ALEATOIRE } from "../lib/constants";
import type { Loi, LoiIndexEntry, ResumeEntry } from "../types";
import "./Questionnaire.css";

function tirerAleatoire<T>(items: T[], n: number): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie.slice(0, n);
}

function ChoixPaquet({ lois, onDemarrer }: { lois: LoiIndexEntry[]; onDemarrer: (ids: string[]) => void }) {
  const themes = useMemo(() => [...new Set(lois.map((l) => l.theme))].sort((a, b) => a.localeCompare(b, "fr")), [lois]);
  const [theme, setTheme] = useState(themes[0] ?? "");

  return (
    <div>
      <h1>Questionnaire</h1>
      <p>
        Pour chaque loi, indique si tu aurais voté pour ou contre, sur une échelle de −3 (fermement contre) à +3
        (fermement pour). 0 = neutre. Tu peux aussi passer une loi si tu n'as pas d'avis.
      </p>

      <div className="paquet-choix">
        <div className="card paquet-option">
          <h3>Toutes les lois</h3>
          <p className="muted">Les {lois.length} lois disponibles, dans l'ordre chronologique.</p>
          <button className="btn" onClick={() => onDemarrer(lois.map((l) => l.id))}>
            Commencer ({lois.length} lois)
          </button>
        </div>

        <div className="card paquet-option">
          <h3>Aléatoire</h3>
          <p className="muted">Un échantillon de {Math.min(TAILLE_PAQUET_ALEATOIRE, lois.length)} lois au hasard.</p>
          <button
            className="btn"
            onClick={() => onDemarrer(tirerAleatoire(lois, TAILLE_PAQUET_ALEATOIRE).map((l) => l.id))}
          >
            Commencer
          </button>
        </div>

        <div className="card paquet-option">
          <h3>Par thème</h3>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            {themes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            className="btn"
            style={{ marginTop: 10 }}
            onClick={() => onDemarrer(lois.filter((l) => l.theme === theme).map((l) => l.id))}
          >
            Commencer
          </button>
        </div>
      </div>
    </div>
  );
}

function Question({
  loiId,
  numero,
  total,
  valeur,
  onChoisir,
  onPasser,
  onReculer,
}: {
  loiId: string;
  numero: number;
  total: number;
  valeur: number | undefined;
  onChoisir: (v: number) => void;
  onPasser: () => void;
  onReculer: () => void;
}) {
  const [loi, setLoi] = useState<Loi | null>(null);
  const [resume, setResume] = useState<ResumeEntry | null>(null);

  useEffect(() => {
    setLoi(null);
    Promise.all([getLoiDetail(loiId), getResumes()]).then(([loiData, resumes]) => {
      setLoi(loiData);
      setResume(resumes.get(loiId) ?? null);
    });
  }, [loiId]);

  return (
    <div>
      <p className="muted">
        Loi {numero} / {total}
      </p>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${((numero - 1) / total) * 100}%` }} />
      </div>

      {!loi ? (
        <p className="muted">Chargement…</p>
      ) : (
        <>
          <h2 style={{ marginTop: 20 }}>{loi.titre}</h2>
          {resume && <p>{resume.resume}</p>}
          <p className="muted">
            Votée le {new Date(loi.dateVote).toLocaleDateString("fr-FR")} · {loi.resultat}
          </p>

          <p style={{ textAlign: "center", fontWeight: 600, marginTop: 24 }}>Voterais-tu pour ou contre cette loi ?</p>
          <VoteSlider valeur={valeur} onChoisir={onChoisir} onPasser={onPasser} />
        </>
      )}

      {numero > 1 && (
        <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={onReculer}>
          ← Loi précédente
        </button>
      )}
    </div>
  );
}

export function Questionnaire() {
  const { paquetIds, answers, currentIndex, demarrerPaquet, repondre, passer, reculer, reinitialiser } =
    useQuestionnaire();
  const [loisIndex, setLoisIndex] = useState<LoiIndexEntry[] | null>(null);

  useEffect(() => {
    getLoisIndex().then(setLoisIndex);
  }, []);

  if (!loisIndex) return <p className="muted">Chargement…</p>;

  if (paquetIds.length === 0) {
    return <ChoixPaquet lois={loisIndex} onDemarrer={demarrerPaquet} />;
  }

  if (currentIndex >= paquetIds.length) {
    const repondues = Object.keys(answers).filter((id) => paquetIds.includes(id)).length;
    return (
      <div>
        <h1>Questionnaire terminé</h1>
        <p>
          Tu as répondu à {repondues} loi{repondues > 1 ? "s" : ""} sur {paquetIds.length}.
        </p>
        <p>
          <Link to="/resultats" className="btn">
            Voir mes résultats de proximité
          </Link>
        </p>
        <p style={{ marginTop: 12 }}>
          <button className="btn btn-ghost" onClick={reinitialiser}>
            Recommencer avec un autre paquet
          </button>
        </p>
      </div>
    );
  }

  const loiId = paquetIds[currentIndex]!;
  return (
    <Question
      loiId={loiId}
      numero={currentIndex + 1}
      total={paquetIds.length}
      valeur={answers[loiId]}
      onChoisir={(v) => repondre(loiId, v)}
      onPasser={() => passer(loiId)}
      onReculer={reculer}
    />
  );
}
