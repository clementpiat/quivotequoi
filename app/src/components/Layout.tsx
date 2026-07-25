import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./Layout.css";

const NAV_LINKS = [
  { to: "/questionnaire", label: "Questionnaire" },
  { to: "/resultats", label: "Résultats" },
  { to: "/lois", label: "Les lois" },
  { to: "/methodologie", label: "Méthodologie" },
  { to: "/a-propos", label: "À propos" },
];

export function Layout() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOuvert(false), [location.pathname]);

  return (
    <div className="app-shell">
      <div className="tricolor-stripe">
        <span />
        <span />
        <span />
      </div>
      <div className="app-body">
        <div className="container app-column">
          <header className="header">
            <NavLink to="/" className="brand" onClick={() => setMenuOuvert(false)}>
              QuiVoteQuoi
            </NavLink>
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={menuOuvert}
              aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setMenuOuvert((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
            <nav className={menuOuvert ? "nav nav-ouverte" : "nav"}>
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => (isActive ? "active" : undefined)}
                  onClick={() => setMenuOuvert(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </header>
          <main className="main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
