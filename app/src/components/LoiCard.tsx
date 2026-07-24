import { Link } from "react-router-dom";
import type { LoiIndexEntry } from "../types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function LoiCard({ loi }: { loi: LoiIndexEntry }) {
  return (
    <Link to={`/lois/${loi.id}`} className="card loi-card">
      <div className="loi-card-top">
        <span className="tag">{loi.theme}</span>
      </div>
      <h3>{loi.titre}</h3>
      <p className="muted">{formatDate(loi.dateVote)}</p>
      <p className="loi-card-chiffres muted">
        {loi.chiffres.pour} pour · {loi.chiffres.contre} contre · {loi.chiffres.abstentions} abstention
        {loi.chiffres.abstentions > 1 ? "s" : ""}
      </p>
    </Link>
  );
}
