import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { QuestionnaireProvider } from "./state/QuestionnaireContext";
import { Accueil } from "./pages/Accueil";
import { ListeLois } from "./pages/ListeLois";
import { FicheLoi } from "./pages/FicheLoi";
import { Questionnaire } from "./pages/Questionnaire";
import { Resultats } from "./pages/Resultats";
import { Methodologie } from "./pages/Methodologie";
import { APropos } from "./pages/APropos";

export default function App() {
  return (
    <QuestionnaireProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Accueil />} />
            <Route path="lois" element={<ListeLois />} />
            <Route path="lois/:id" element={<FicheLoi />} />
            <Route path="questionnaire" element={<Questionnaire />} />
            <Route path="resultats" element={<Resultats />} />
            <Route path="methodologie" element={<Methodologie />} />
            <Route path="a-propos" element={<APropos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QuestionnaireProvider>
  );
}
