import { useEffect, useMemo, useState } from "react";
import { getLoisIndex } from "../data/client";
import { LoiCard } from "../components/LoiCard";
import type { LoiIndexEntry } from "../types";
import "./ListeLois.css";

type Tri = "recent" | "ancien";

export function ListeLois() {
  const [lois, setLois] = useState<LoiIndexEntry[] | null>(null);
  const [theme, setTheme] = useState<string>("Tous");
  const [tri, setTri] = useState<Tri>("recent");

  useEffect(() => {
    getLoisIndex().then(setLois);
  }, []);

  const themes = useMemo(() => {
    if (!lois) return [];
    return ["Tous", ...new Set(lois.map((l) => l.theme))].sort((a, b) => (a === "Tous" ? -1 : a.localeCompare(b, "fr")));
  }, [lois]);

  const loisAffichees = useMemo(() => {
    if (!lois) return [];
    const filtrees = theme === "Tous" ? lois : lois.filter((l) => l.theme === theme);
    return [...filtrees].sort((a, b) =>
      tri === "recent" ? b.dateVote.localeCompare(a.dateVote) : a.dateVote.localeCompare(b.dateVote),
    );
  }, [lois, theme, tri]);

  return (
    <div>
      <h1>Les lois</h1>
      <p className="muted">
        {lois ? `${lois.length} lois retenues` : "Chargement…"} — uniquement les votes sur l'ensemble d'un texte,
        voir la <a href="/methodologie">méthodologie</a>.
      </p>

      <div className="filtres">
        <label>
          Thème
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            {themes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tri
          <select value={tri} onChange={(e) => setTri(e.target.value as Tri)}>
            <option value="recent">Plus récentes</option>
            <option value="ancien">Plus anciennes</option>
          </select>
        </label>
      </div>

      <div className="liste-lois">
        {loisAffichees.map((loi) => (
          <LoiCard key={loi.id} loi={loi} />
        ))}
      </div>
    </div>
  );
}
