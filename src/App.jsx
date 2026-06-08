import { useState, useEffect, lazy, Suspense } from "react";
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

// ── Estáticos — carregam sempre no boot ──
import CodigoPage from "./pages/CodigoPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import LockScreen from "./components/LockScreen";
import FooterEduPlay from "./components/FooterEduPlay";

// ── Lazy — carregam só quando a rota é acessada ──
const HomePage = lazy(() => import("./pages/HomePage"));
const SubjectPage = lazy(() => import("./pages/SubjectPage"));
const AgentePage = lazy(() => import("./pages/AgentePage"));
const PaisPage = lazy(() => import("./pages/PaisPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const TermosPage = lazy(() => import("./pages/TermosPage"));
const PrivacidadePage = lazy(() => import("./pages/PrivacidadePage"));
const ConquistasPage = lazy(() => import("./pages/ConquistasPage"));
const MapaPage = lazy(() => import("./pages/MapaPage"));
const DemoPage = lazy(() => import("./pages/DemoPage"));

const ADMIN_EMAIL = "thiago.rpba@gmail.com";
const ROTAS_PUBLICAS = ["/termos", "/privacidade"];

// ── Fallback visual durante carregamento lazy ──
const PageLoader = (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#0F1923",
      color: "#00D4AA",
      fontSize: "1.2rem",
      fontFamily: "sans-serif",
    }}
  >
    Carregando...
  </div>
);

export default function App() {
  const { playerName, saveName, clearName } = usePlayer();
  const timer = useTimer();
  const lock = useParentLock();
  const location = useLocation();
  const navigate = useNavigate();

  const [viaLanding, setViaLanding] = useState(false);
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
  const isRotaAdmin = pathname === "/admin";
  const isRotaAgente = pathname.startsWith("/agente/");

  // ── 1. Páginas legais ──
  if (isRotaPublica) {
    return (
      <Suspense fallback={PageLoader}>
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
      </Suspense>
    );
  }

  // ── 2. Login ──
  if (isRotaLogin) {
    if (authChecked && paisUser) return <Navigate to="/pais" replace />;
    return <LoginPage />;
  }

  // ── 3. Demo ──
  if (isRotaDemo) {
    return (
      <Suspense fallback={PageLoader}>
        <DemoPage />
      </Suspense>
    );
  }

  // ── 4. Agente (criança pelo link) ──
  if (isRotaAgente) {
    return (
      <Suspense fallback={PageLoader}>
        <Routes>
          <Route path="/agente/:codigo" element={<AgentePage />} />
        </Routes>
      </Suspense>
    );
  }

  // ── 5. Painel do responsável ──
  if (isRotaPais) {
    if (!authChecked) return null;
    if (!paisUser) return <Navigate to="/login" replace />;
    return (
      <Suspense fallback={PageLoader}>
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
      </Suspense>
    );
  }

  // ── 6. Painel admin (só thiago.rpba@gmail.com) ──
  if (isRotaAdmin) {
    if (!authChecked) return null;
    if (!paisUser) return <Navigate to="/login" replace />;
    if (paisUser.email !== ADMIN_EMAIL) return <Navigate to="/" replace />;
    return (
      <Suspense fallback={PageLoader}>
        <AdminPage userPai={paisUser} />
      </Suspense>
    );
  }

  // ── 6.5. Responsável logado acessando "/" → manda direto pro painel ──
  if (authChecked && paisUser && !playerName) {
    return <Navigate to="/pais" replace />;
  }

  // ── 7. Onboarding da criança ──
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
      <CodigoPage onRegister={saveName} onVoltar={() => setViaLanding(false)} />
    );
  }

  // ── 8. Controle de tempo ──
  if (timer.bloqueado && !timer.semLimite)
    return <LockScreen timer={timer} lock={lock} />;

  // ── 9. App da criança ──
  return (
    <Suspense fallback={PageLoader}>
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
    </Suspense>
  );
}
