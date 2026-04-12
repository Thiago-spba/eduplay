import { Routes, Route, Navigate } from "react-router-dom";
import { usePlayer } from "./hooks/usePlayer";
import { useTimer } from "./hooks/useTimer";
import { useParentLock } from "./hooks/useParentLock";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import SubjectPage from "./pages/SubjectPage";
import PrivacidadePage from "./pages/PrivacidadePage";
import TermosPage from "./pages/TermosPage";
import LockScreen from "./components/LockScreen";
import FooterEduPlay from "./components/FooterEduPlay";

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

export default function App() {
  const { playerName, saveName } = usePlayer();
  const timer = useTimer();
  const lock = useParentLock();

  if (!playerName) return <RegisterPage onRegister={saveName} />;
  if (timer.bloqueado) return <LockScreen timer={timer} lock={lock} />;

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
            element={<EmConstrucao titulo="Perfil do Agente" />}
          />
          <Route
            path="/pais"
            element={<EmConstrucao titulo="Painel dos Responsáveis" />}
          />
          <Route path="/privacidade" element={<PrivacidadePage />} />
          <Route path="/termos" element={<TermosPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <FooterEduPlay />
    </div>
  );
}
