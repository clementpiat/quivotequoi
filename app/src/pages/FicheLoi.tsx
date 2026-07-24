import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getGroupes, getLoiDetail, getResumes } from "../data/client";
import { GroupVoteBars } from "../components/GroupVoteBars";
import type { Groupe, Loi, ResumeEntry } from "../types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function FicheLoi() {
  const { id } = useParams<{ id: string }>();
  const [loi, setLoi] = useState<Loi | null>(null);
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [resume, setResume] = useState<ResumeEntry | null>(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoi(null);
    setErreur(false);
    Promise.all([getLoiDetail(id), getGroupes(), getResumes()])
      .then(([loiData, groupesData, resumesData]) => {
        setLoi(loiData);
        setGroupes(groupesData);
        setResume(resumesData.get(id) ?? null);
      })
      .catch(() => setErreur(true));
  }, [id]);

  if (erreur) return <p>Loi introuvable.</p>;
  if (!loi) return <p className="muted">Chargement…</p>;

  return (
    <div>
      <p>
        <Link to="/lois" className="muted">
          ← Toutes les lois
        </Link>
      </p>
      <div className="loi-card-top">
        <span className="tag">{loi.theme}</span>
      </div>
      <h1>{loi.titre}</h1>
      <p className="muted">
        Votée le {formatDate(loi.dateVote)}
        {loi.procedure ? ` · ${loi.procedure}` : ""}
      </p>

      {resume && <p>{resume.resume}</p>}

      <p className="muted">
        {loi.chiffres.pour} pour · {loi.chiffres.contre} contre · {loi.chiffres.abstentions} abstentions ·{" "}
        {loi.chiffres.votants} votants
      </p>

      <p>
        {loi.liens.dossierAN && (
          <a href={loi.liens.dossierAN} target="_blank" rel="noreferrer">
            Dossier législatif officiel
          </a>
        )}
        {loi.liens.dossierAN && " · "}
        <a href={loi.liens.scrutinAN} target="_blank" rel="noreferrer">
          Détail du scrutin n°{loi.scrutinNumero}
        </a>
      </p>

      <h2 style={{ marginTop: 28 }}>Vote par groupe</h2>
      <p className="muted">
        Répartition des membres de chaque groupe au moment du scrutin. Voir la{" "}
        <Link to="/methodologie">méthodologie</Link> pour le détail du calcul de position.
      </p>
      <GroupVoteBars positions={loi.positionsParGroupe} groupes={groupes} />
    </div>
  );
}
