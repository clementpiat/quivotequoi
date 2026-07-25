import type { GroupProximityResult } from "../lib/proximity";
import type { Groupe } from "../types";
import "./ProximityBars.css";

export function ProximityBars({ resultats, groupes }: { resultats: GroupProximityResult[]; groupes: Groupe[] }) {
  const groupeParId = new Map(groupes.map((g) => [g.id, g]));
  const classement = resultats
    .filter((r) => groupeParId.has(r.groupeId))
    .sort((a, b) => b.proximite - a.proximite);

  return (
    <div className="proximity-bars">
      {classement.map((r) => {
        const groupe = groupeParId.get(r.groupeId);
        const couleur = groupe?.couleur ?? "var(--navy)";
        const pct = Math.round(Math.max(0, Math.min(100, r.proximite)));
        return (
          <div className="proximity-bars-row" key={r.groupeId}>
            <div className="proximity-bars-header">
              <span className="proximity-bars-dot" style={{ background: couleur }} />
              <span className="proximity-bars-nom">{groupe?.nom ?? r.groupeId}</span>
              <span className="proximity-bars-pct">{pct}%</span>
            </div>
            <div
              className="proximity-bars-track"
              role="img"
              aria-label={`${groupe?.nom ?? r.groupeId} : ${pct} % de proximité`}
            >
              <div className="proximity-bars-fill" style={{ width: `${pct}%`, background: couleur }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
