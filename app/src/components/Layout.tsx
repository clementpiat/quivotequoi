import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

const NAV_LINKS = [
  { to: "/lois", label: "Les lois" },
  { to: "/questionnaire", label: "Questionnaire" },
  { to: "/methodologie", label: "Méthodologie" },
  { to: "/a-propos", label: "À propos" },
];

export function Layout() {
  return (
    <>
      <header className="header">
        <div className="header-inner">
          <NavLink to="/" className="brand">
            QuiVoteQuoi
          </NavLink>
          <nav className="nav">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? "active" : undefined)}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <span>
            Outil civique gratuit et sans tracking. Vos réponses au questionnaire ne quittent jamais votre
            navigateur.
          </span>
          <span className="footer-links">
            <NavLink to="/methodologie">Méthodologie</NavLink>
            <NavLink to="/a-propos">À propos</NavLink>
          </span>
        </div>
      </footer>
    </>
  );
}
