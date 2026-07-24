import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Answers } from "../lib/proximity";

const STORAGE_KEY = "quivotequoi.questionnaire";

interface StoredState {
  paquetIds: string[];
  answers: Answers;
  currentIndex: number;
}

function loadInitialState(): StoredState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredState;
  } catch {
    // sessionStorage indisponible ou JSON corrompu : on repart d'un état vide, tant pis pour la
    // persistance — ce n'est qu'un confort de refresh, pas une source de vérité.
  }
  return { paquetIds: [], answers: {}, currentIndex: 0 };
}

interface QuestionnaireContextValue {
  paquetIds: string[];
  answers: Answers;
  currentIndex: number;
  demarrerPaquet: (ids: string[]) => void;
  repondre: (id: string, valeur: number) => void;
  passer: (id: string) => void;
  reculer: () => void;
  reinitialiser: () => void;
}

const QuestionnaireContext = createContext<QuestionnaireContextValue | null>(null);

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(loadInitialState);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<QuestionnaireContextValue>(
    () => ({
      paquetIds: state.paquetIds,
      answers: state.answers,
      currentIndex: state.currentIndex,
      demarrerPaquet: (ids) => setState({ paquetIds: ids, answers: {}, currentIndex: 0 }),
      repondre: (id, valeur) =>
        setState((s) => ({
          ...s,
          answers: { ...s.answers, [id]: valeur },
          currentIndex: Math.min(s.currentIndex + 1, s.paquetIds.length),
        })),
      passer: (id) =>
        setState((s) => {
          const { [id]: _removed, ...rest } = s.answers;
          return { ...s, answers: rest, currentIndex: Math.min(s.currentIndex + 1, s.paquetIds.length) };
        }),
      reculer: () => setState((s) => ({ ...s, currentIndex: Math.max(s.currentIndex - 1, 0) })),
      reinitialiser: () => setState({ paquetIds: [], answers: {}, currentIndex: 0 }),
    }),
    [state],
  );

  return <QuestionnaireContext.Provider value={value}>{children}</QuestionnaireContext.Provider>;
}

export function useQuestionnaire(): QuestionnaireContextValue {
  const ctx = useContext(QuestionnaireContext);
  if (!ctx) throw new Error("useQuestionnaire doit être utilisé sous QuestionnaireProvider");
  return ctx;
}
