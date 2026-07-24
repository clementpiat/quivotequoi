import type { GroupProximityResult } from "../lib/proximity";
import type { Groupe, Loi } from "../types";
import "./ProximityRanking.css";

function formatPct(v: number): string {
  return `${Math.round(v)}%`;
}

function labelReponse(r: number): string {
  const surTrois = Math.round(r * 3);
  if (surTrois === 0) return "neutre";
  return surTrois > 0 ? `+${surTrois} (pour)` : `${surTrois} (contre)`;
}

export function ProximityRanking({
  resultats,
  groupes,
  loisParId,
}: {
  resultats: GroupProximityResult[];
  groupes: Groupe[];
  loisParId: Map<string, Loi>;
}) {
  const groupeById = new Map(groupes.map((g) => [g.id, g]));

  return (
    <div className="proximity-ranking">
      {resultats.map((r, i) => {
        const groupe = groupeById.get(r.groupeId);
        const couleur = groupe?.couleur ?? "var(--accent)";
        return (
          <div className="proximity-row" key={r.groupeId}>
            <div className="proximity-row-header">
              <span className="proximity-rang">{i + 1}</span>
              <span className="proximity-sigle" style={{ color: couleur }}>
                {groupe?.sigle ?? r.groupeId}
              </span>
              <span className="muted proximity-nom">{groupe?.nom}</span>
              <span className="proximity-valeur">{formatPct(r.proximite)}</span>
            </div>
            <div
              className="proximity-track"
              role="img"
              aria-label={`${groupe?.nom ?? r.groupeId} : ${formatPct(r.proximite)} de proximité`}
            >
              <div
                className="proximity-fill"
                style={{ width: `${Math.max(0, Math.min(100, r.proximite))}%`, background: couleur }}
              />
            </div>

            <details className="proximity-detail">
              <summary>Détail loi par loi ({r.details.length})</summary>
              <table>
                <thead>
                  <tr>
                    <th>Loi</th>
                    <th>Ta réponse</th>
                    <th>Position du groupe</th>
                  </tr>
                </thead>
                <tbody>
                  {r.details.map((d) => (
                    <tr key={d.loiId}>
                      <td>{loisParId.get(d.loiId)?.titre ?? d.loiId}</td>
                      <td>{labelReponse(d.reponse)}</td>
                      <td>{Math.round(d.positionGroupe * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </div>
        );
      })}
    </div>
  );
}
