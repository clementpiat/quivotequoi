import type { Groupe, PositionGroupe } from "../types";
import "./GroupVoteBars.css";

function pct(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0;
}

export function GroupVoteBars({
  positions,
  groupes,
}: {
  positions: PositionGroupe[];
  groupes: Groupe[];
}) {
  const groupeById = new Map(groupes.map((g) => [g.id, g]));
  const trie = [...positions].sort((a, b) => b.position - a.position);

  return (
    <div className="vote-bars">
      <div className="vote-bars-legend">
        <span>
          <i className="swatch" style={{ background: "var(--pour)" }} /> Pour
        </span>
        <span>
          <i className="swatch" style={{ background: "var(--contre)" }} /> Contre
        </span>
        <span>
          <i className="swatch" style={{ background: "var(--neutre)" }} /> Abstention / absent
        </span>
      </div>

      {trie.map((p) => {
        const groupe = groupeById.get(p.groupeId);
        const abstentionEtAbsents = p.abstentions + p.nonVotants + p.absents;
        const pourPct = pct(p.pour, p.effectif);
        const contrePct = pct(p.contre, p.effectif);
        const abstPct = pct(abstentionEtAbsents, p.effectif);

        return (
          <div className="vote-bars-row" key={p.groupeId}>
            <div className="vote-bars-row-label">
              <span className="vote-bars-sigle" style={{ color: groupe?.couleur ?? undefined }}>
                {groupe?.sigle ?? p.groupeId}
              </span>
              <span className="muted">{groupe?.nom}</span>
            </div>
            <div className="vote-bars-track" role="img" aria-label={`${groupe?.nom ?? p.groupeId} : ${p.pour} pour, ${p.contre} contre, ${abstentionEtAbsents} abstention ou absent, sur ${p.effectif} membres`}>
              {pourPct > 0 && (
                <div
                  className="vote-bars-segment"
                  style={{ width: `${pourPct}%`, background: "var(--pour)" }}
                  title={`Pour : ${p.pour} / ${p.effectif}`}
                />
              )}
              {contrePct > 0 && (
                <div
                  className="vote-bars-segment"
                  style={{ width: `${contrePct}%`, background: "var(--contre)" }}
                  title={`Contre : ${p.contre} / ${p.effectif}`}
                />
              )}
              {abstPct > 0 && (
                <div
                  className="vote-bars-segment"
                  style={{ width: `${abstPct}%`, background: "var(--neutre)" }}
                  title={`Abstention / absent : ${abstentionEtAbsents} / ${p.effectif}`}
                />
              )}
            </div>
            <div className="vote-bars-chiffres muted">
              {p.pour} / {p.contre} / {abstentionEtAbsents}
            </div>
          </div>
        );
      })}
    </div>
  );
}
