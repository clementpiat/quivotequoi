import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Answers } from "../lib/proximity";
import { genererSeed } from "../lib/seed";

const STORAGE_KEY = "quivotequoi.questionnaire";

interface StoredState {
  seed: string;
  answers: Answers;
  currentIndex: number;
}

function loadInitialState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredState;
  } catch {
    // localStorage indisponible ou JSON corrompu : on repart d'un état vide, tant pis pour la
    // persistance — ce n'est qu'un confort, pas une source de vérité.
  }
  return { seed: genererSeed(), answers: {}, currentIndex: 0 };
}

interface QuestionnaireContextValue {
  seed: string;
  answers: Answers;
  currentIndex: number;
  repondre: (id: string, valeur: number) => void;
  avancer: () => void;
  reculer: () => void;
  reinitialiser: () => void;
}

const QuestionnaireContext = createContext<QuestionnaireContextValue | null>(null);

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(loadInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<QuestionnaireContextValue>(
    () => ({
      seed: state.seed,
      answers: state.answers,
      currentIndex: state.currentIndex,
      repondre: (id, valeur) =>
        setState((s) => ({
          ...s,
          answers: { ...s.answers, [id]: valeur },
          currentIndex: s.currentIndex + 1,
        })),
      // Avance sans toucher aux réponses : une loi non répondue reste "passée" (absente de
      // answers), sans effacer un vote déjà donné si l'utilisateur était revenu en arrière.
      avancer: () => setState((s) => ({ ...s, currentIndex: s.currentIndex + 1 })),
      reculer: () => setState((s) => ({ ...s, currentIndex: Math.max(s.currentIndex - 1, 0) })),
      reinitialiser: () => setState({ seed: genererSeed(), answers: {}, currentIndex: 0 }),
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
