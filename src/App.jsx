import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

// ── 1. IMPORTAÇÕES DE SEGURANÇA E ESTADO ──
import { usePlayer } from "./hooks/usePlayer";
import { useTimer } from "./hooks/useTimer";
import { useParentLock } from "./hooks/useParentLock";

// ── 2. IMPORTAÇÕES DAS PÁGINAS ──
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import SubjectPage from "./pages/SubjectPage";
import LandingPage from "./pages/LandingPage";
import PerfilPage from "./pages/PerfilPage";
import PaisPage from "./pages/PaisPage";
import TermosPage from "./pages/TermosPage";
import PrivacidadePage from "./pages/PrivacidadePage";

// IMPORTANDO AS NOVAS PÁGINAS REAIS (FUNDAMENTAL)
import ConquistasPage from "./pages/ConquistasPage";
import MapaPage from "./pages/MapaPage";

// ── 3. COMPONENTES GLOBAIS ──
import LockScreen from "./components/LockScreen";
import FooterEduPlay from "./components/FooterEduPlay";

const ROTAS_PUBLICAS = ["/termos", "/privacidade"];

export default function App() {
  const { playerName, saveName, clearName } = usePlayer();
  const timer = useTimer();
  const lock = useParentLock();
  const location = useLocation();
  const navigate = useNavigate();

  const [viaLanding, setViaLanding] = useState(false);

  const isRotaPublica = ROTAS_PUBLICAS.includes(location.pathname);
  const isRotaPais = location.pathname === "/pais";

  // ── FLUXO PÚBLICO ──
  if (isRotaPublica) {
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

  // ── FLUXO DO RESPONSÁVEL ──
  if (isRotaPais) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 pb-20">
          <Routes>
            <Route path="/pais" element={<PaisPage timer={timer} />} />
          </Routes>
        </div>
        <FooterEduPlay />
      </div>
    );
  }

  // ── FLUXO DE LOGIN/REGISTRO ──
  if (!playerName) {
    if (!viaLanding) {
      return (
        <LandingPage
          onComecar={() => setViaLanding(true)}
          onResponsavel={() => navigate("/pais")}
        />
      );
    }
    return (
      <RegisterPage
        onRegister={saveName}
        onVoltar={() => setViaLanding(false)}
      />
    );
  }

  // ── CONTROLE DE TEMPO ──
  if (timer.bloqueado) {
    return <LockScreen timer={timer} lock={lock} />;
  }

  // ── FLUXO PRINCIPAL DO AGENTE ──
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 pb-20">
        <Routes>
          <Route
            path="/"
            element={<HomePage playerName={playerName} timer={timer} />}
          />

          <Route
            path="/perfil"
            element={
              <PerfilPage playerName={playerName} clearName={clearName} />
            }
          />

          {/* AGORA APONTANDO PARA AS PÁGINAS REAIS */}
          <Route path="/conquistas" element={<ConquistasPage />} />
          <Route path="/mapa" element={<MapaPage />} />

          {/* Rota das Disciplinas */}
          <Route
            path="/:disciplinaId"
            element={<SubjectPage timer={timer} />}
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <FooterEduPlay />
    </div>
  );
}
