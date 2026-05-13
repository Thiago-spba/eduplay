import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { usePlayer } from "./hooks/usePlayer";
import { useTimer } from "./hooks/useTimer";
import { useParentLock } from "./hooks/useParentLock";
import { onAuthChange } from "./services/auth";

import CodigoPage from "./pages/CodigoPage";
import HomePage from "./pages/HomePage";
import SubjectPage from "./pages/SubjectPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AgentePage from "./pages/AgentePage";
import PaisPage from "./pages/PaisPage";
import TermosPage from "./pages/TermosPage";
import PrivacidadePage from "./pages/PrivacidadePage";
import ConquistasPage from "./pages/ConquistasPage";
import MapaPage from "./pages/MapaPage";
import DemoPage from "./pages/DemoPage";

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

  // Firebase Auth — guarda o user object completo para passar ao PaisPage
  const [paisUser, setPaisUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      setPaisUser(user ?? null);
      setAuthChecked(true);
    });
    return unsub;
  }, []);

  const { pathname } = location;
  const isRotaPublica = ROTAS_PUBLICAS.includes(pathname);
  const isRotaLogin = pathname === "/login";
  const isRotaDemo = pathname === "/demo";
  const isRotaPais = pathname === "/pais";
  const isRotaAgente = pathname.startsWith("/agente/");

  // ── 1. Páginas legais ──────────────────────────────────────────────────────
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

  // ── 2. Login do responsável ────────────────────────────────────────────────
  if (isRotaLogin) {
    if (authChecked && paisUser) return <Navigate to="/pais" replace />;
    return <LoginPage />;
  }

  // ── 3. Demo pública ────────────────────────────────────────────────────────
  if (isRotaDemo) {
    return <DemoPage />;
  }

  // ── 4. Entrada da criança pelo link do agente ─────────────────────────────
  if (isRotaAgente) {
    return (
      <Routes>
        <Route path="/agente/:codigo" element={<AgentePage />} />
      </Routes>
    );
  }

  // ── 5. Área do responsável — protegida por Firebase Auth ──────────────────
  if (isRotaPais) {
    if (!authChecked) return null;
    if (!paisUser) return <Navigate to="/login" replace />;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
        }}
      >
        <div style={{ flex: 1, paddingBottom: 80 }}>
          <Routes>
            <Route
              path="/pais"
              element={<PaisPage userPai={paisUser} timer={timer} />}
            />
          </Routes>
        </div>
        <FooterEduPlay />
      </div>
    );
  }

  // ── 6. Onboarding da criança ───────────────────────────────────────────────
  if (!playerName) {
    if (!viaLanding) {
      return (
        <LandingPage
          onComecar={() => setViaLanding(true)}
          onResponsavel={() => navigate("/login")}
        />
      );
    }
    return (
      <CodigoPage
        onRegister={saveName}
        onVoltar={() => setViaLanding(false)}
      />
    );
  }

  // ── 7. Controle de tempo ───────────────────────────────────────────────────
  if (timer.bloqueado && !timer.semLimite) {
    return <LockScreen timer={timer} lock={lock} />;
  }

  // ── 8. App principal da criança ───────────────────────────────────────────
  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage playerName={playerName} timer={timer} />}
      />

      <Route path="/conquistas" element={<ConquistasPage />} />
      <Route path="/mapa" element={<MapaPage />} />
      <Route path="/:disciplinaId" element={<SubjectPage timer={timer} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

