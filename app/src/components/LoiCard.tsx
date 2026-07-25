import { useState } from "react";
import { getGroupes, getLoiDetail } from "../data/client";
import { LABELS_REPONSE } from "../lib/constants";
import type { Groupe, Loi, LoiIndexEntry, PositionGroupe, ResumeEntry } from "../types";
import "./LoiCard.css";

function repartition(p: PositionGroupe) {
  return { pour: p.pour, contre: p.contre, abstention: p.abstentions, absent: p.absents + p.nonVotants };
}

function GroupeBreakdown({ position, groupe }: { position: PositionGroupe; groupe: Groupe | undefined }) {
  const { pour, contre, abstention, absent } = repartition(position);
  const effectif = position.effectif || 1;

  return (
    <div className="loi-card-groupe">
      <div className="loi-card-groupe-header">
        <span className="loi-card-dot" style={{ background: groupe?.couleur ?? "var(--outline)" }} />
        <span className="loi-card-groupe-nom">{groupe?.nom ?? position.groupeId}</span>
      </div>
      <div className="loi-card-bar">
        <div style={{ width: `${(pour / effectif) * 100}%`, background: "var(--navy)" }} />
        <div style={{ width: `${(contre / effectif) * 100}%`, background: "var(--red)" }} />
        <div style={{ width: `${(abstention / effectif) * 100}%`, background: "var(--outline)" }} />
        <div style={{ width: `${(absent / effectif) * 100}%`, background: "var(--track)" }} />
      </div>
      <p className="loi-card-breakdown-texte">
        {pour} voix pour · {contre} voix contre · {abstention} abstention{abstention > 1 ? "s" : ""} · {absent} absent
        {absent > 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function LoiCard({
  loi,
  resume,
  reponse,
}: {
  loi: LoiIndexEntry;
  resume: ResumeEntry | undefined;
  reponse: number | undefined;
}) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<Loi | null>(null);
  const [groupes, setGroupes] = useState<Groupe[]>([]);

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    if (next && !detail) {
      Promise.all([getLoiDetail(loi.id), getGroupes()]).then(([d, g]) => {
        setDetail(d);
        setGroupes(g);
      });
    }
  }

  const groupeById = new Map(groupes.map((g) => [g.id, g]));
  const url = detail ? (detail.liens.dossierAN ?? detail.liens.scrutinAN) : null;

  const adoptee = loi.resultat === "adopté";

  return (
    <div className="card loi-card">
      <div className="loi-card-top">
        <span className="tag">{loi.theme}</span>
        <span className={`tag ${adoptee ? "tag-adopte" : "tag-rejete"}`}>{loi.resultat}</span>
      </div>
      <h3 className="loi-card-titre">{loi.titre}</h3>
      {resume && <p className="loi-card-resume">{resume.resume}</p>}
      <div className="loi-card-footer">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            Voir le dossier législatif complet ↗
          </a>
        ) : (
          <span />
        )}
        {reponse !== undefined && <span className="loi-card-badge">Ton vote : {LABELS_REPONSE[reponse]}</span>}
      </div>

      <button type="button" className="loi-card-toggle" onClick={toggle}>
        <span className="loi-card-chevron" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▾
        </span>
        <span>Répartition des votes par groupe</span>
      </button>

      {expanded && (
        <div className="loi-card-breakdown">
          {!detail ? (
            <p className="muted">Chargement…</p>
          ) : (
            detail.positionsParGroupe.map((p) => (
              <GroupeBreakdown key={p.groupeId} position={p} groupe={groupeById.get(p.groupeId)} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
