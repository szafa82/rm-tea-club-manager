import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  const buildTime = "2026-07-05 23:10 UK";
  return (
    <main className="page">
      <section className="hero">
        <div className="badge">DEPLOY TEST</div>
        <h1>🚀 RM Tea Club v4 HARD TEST</h1>
        <p className="subtitle">Jeśli widzisz ten ekran, Firebase naprawdę wgrał nową wersję.</p>
        <div className="cards">
          <div className="card"><span>Version</span><strong>v4.0.1</strong></div>
          <div className="card"><span>Build</span><strong>{buildTime}</strong></div>
          <div className="card"><span>Spreadsheet reload</span><strong>OFF</strong></div>
        </div>
        <div className="warning">
          Ten ekran celowo wygląda zupełnie inaczej. Jeśli dalej widzisz starą aplikację, problem jest w uploadzie/commicie/rolloucie, nie w wyglądzie aplikacji.
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
