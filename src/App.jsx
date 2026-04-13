import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { usePlayer } from "./hooks/usePlayer";
import { useTimer } from "./hooks/useTimer";
import { useParentLock } from "./hooks/useParentLock";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import SubjectPage from "./pages/SubjectPage";
import LandingPage from "./pages/LandingPage";
import LockScreen from "./components/LockScreen";
import FooterEduPlay from "./components/FooterEduPlay";
import PerfilPage from "./pages/PerfilPage";
import TermosPage from "./pages/TermosPage";
import PrivacidadePage from "./pages/PrivacidadePage";

function EmConstrucao({ titulo }) {
  return (
    <div
      style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚧</div>
      <h2>{titulo}</h2>
      <p style={{ color: "#7A7A7A", marginBottom: "2rem" }}>Em construção...</p>
      <a href="/" style={{ color: "#00D4AA", fontWeight: 700 }}>
        &larr; Voltar ao Início
      </a>
    </div>
  );
}

/* ── Rotas públicas: acessíveis SEM login ── */
const ROTAS_PUBLICAS = ["/termos", "/privacidade"];

export default function App() {
  const { playerName, saveName, clearName } = usePlayer();
  const timer = useTimer();
  const lock = useParentLock();
  const location = useLocation();

  /* Estado que controla se o usuário já passou pela Landing */
  const [viaLanding, setViaLanding] = useState(false);

  /* ── Se a URL é uma rota pública, renderiza direto (sem guard) ── */
  if (ROTAS_PUBLICAS.includes(location.pathname)) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
        }}
      >
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/termos" element={<TermosPage />} />
            <Route path="/privacidade" element={<PrivacidadePage />} />
          </Routes>
        </div>
        <FooterEduPlay />
      </div>
    );
  }

  /* ── Fluxo de onboarding ── */

  /* 1. Sem nome E não veio da landing → mostra LandingPage */
  if (!playerName && !viaLanding) {
    return <LandingPage onComecar={() => setViaLanding(true)} />;
  }

  /* 2. Sem nome MAS já passou pela landing → mostra RegisterPage */
  if (!playerName && viaLanding) {
    return (
      <RegisterPage
        onRegister={saveName}
        onVoltar={() => setViaLanding(false)}
      />
    );
  }

  /* 3. Timer bloqueou → LockScreen */
  if (timer.bloqueado) {
    return <LockScreen timer={timer} lock={lock} />;
  }

  /* 4. Logado → app normal com rotas + footer */
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 pb-20">
        <Routes>
          <Route
            path="/"
            element={<HomePage playerName={playerName} timer={timer} />}
          />
          <Route
            path="/:disciplinaId"
            element={<SubjectPage timer={timer} />}
          />
          <Route
            path="/perfil"
            element={
              <PerfilPage playerName={playerName} clearName={clearName} />
            }
          />
          <Route
            path="/pais"
            element={<EmConstrucao titulo="Painel dos Responsáveis" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <FooterEduPlay />
    </div>
  );
}
