import { Routes, Route, Navigate } from "react-router-dom";
import { usePlayer } from "./hooks/usePlayer";
import { useTimer } from "./hooks/useTimer";
import { useParentLock } from "./hooks/useParentLock";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import SubjectPage from "./pages/SubjectPage";
import LockScreen from "./components/LockScreen";

function EmConstrucao({ titulo }) {
  return (
    <div
      style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚧</div>
      <h2>{titulo}</h2>
      <p style={{ color: "#7A7A7A", marginBottom: "2rem" }}>Em construção...</p>
      <a href="/" style={{ color: "#00D4AA", fontWeight: 700 }}>
        ← Voltar ao Início
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
    <Routes>
      <Route
        path="/"
        element={<HomePage playerName={playerName} timer={timer} />}
      />
      <Route path="/:disciplinaId" element={<SubjectPage timer={timer} />} />
      <Route
        path="/perfil"
        element={<EmConstrucao titulo="Perfil do Agente" />}
      />
      <Route
        path="/pais"
        element={<EmConstrucao titulo="Painel dos Responsáveis" />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
