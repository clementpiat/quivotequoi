const CENTRE_X = 200;
const CENTRE_Y = 195;
const NB_RANGEES = 8;

function genererSieges(): { cx: number; cy: number }[] {
  const sieges: { cx: number; cy: number }[] = [];
  for (let rangee = 0; rangee < NB_RANGEES; rangee++) {
    const rayon = 30 + rangee * 21;
    const nbSieges = 9 + rangee * 3;
    for (let i = 0; i < nbSieges; i++) {
      const t = i / (nbSieges - 1);
      const angle = Math.PI * (1 - t);
      sieges.push({
        cx: CENTRE_X + rayon * Math.cos(angle),
        cy: CENTRE_Y - rayon * Math.sin(angle),
      });
    }
  }
  return sieges;
}

const SIEGES = genererSieges();

/** Plan minimaliste de l'hémicycle (vu du dessus), purement décoratif. */
export function Hemicycle() {
  return (
    <svg className="hemicycle" viewBox="0 0 400 220" aria-hidden="true" focusable="false">
      {SIEGES.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={2.6} fill="currentColor" />
      ))}
    </svg>
  );
}
