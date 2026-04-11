import { useNavigate, useLocation } from "react-router-dom";
import { useTema } from "../context/ThemeContext";

const ITENS_NAV = [
  { icon: "🏠", label: "Início", path: "/" },
  { icon: "📜", label: "Missões", path: "/historia" },
  { icon: "🗺️", label: "Mapa", path: "/geografia" },
  { icon: "🧪", label: "Agente", path: "/perfil" },
  { icon: "🔒", label: "Base", path: "/pais" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tema } = useTema();

  const c = {
    bg: tema === "escuro" ? "#0D1820" : "#FFFFFF",
    borda: tema === "escuro" ? "#1A2B3C" : "#EEF5FF",
    texto: tema === "escuro" ? "#4A6A7A" : "#A0B8C8",
    ativo: tema === "escuro" ? "#E8F4F8" : "#1A2B3C",
    pill: tema === "escuro" ? "#1A3347" : "#F0F9FF",
    accent: "#00D4AA",
  };

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        background: c.bg,
        borderTop: `2px solid ${c.borda}`,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "8px 8px 14px",
        zIndex: 100,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.12)",
      }}
    >
      {ITENS_NAV.map((item) => {
        const ativo = location.pathname === item.path;

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              padding: "8px 16px",
              minWidth: "56px",
              minHeight: "56px",
              background: ativo ? c.pill : "none",
              border: ativo
                ? `2px solid ${c.accent}33`
                : "2px solid transparent",
              borderRadius: "16px",
              cursor: "pointer",
              transition: "all 0.25s",
              fontFamily: "'Nunito', sans-serif",
              position: "relative",
            }}
          >
            {/* Ícone */}
            <span
              style={{
                fontSize: "1.5rem",
                lineHeight: 1,
                transform: ativo ? "scale(1.2)" : "scale(1)",
                transition: "transform 0.25s",
                filter: ativo ? "none" : "grayscale(40%)",
              }}
            >
              {item.icon}
            </span>

            {/* Label */}
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: ativo ? 800 : 600,
                color: ativo ? c.accent : c.texto,
                letterSpacing: ativo ? "0.3px" : "0",
                transition: "all 0.25s",
                lineHeight: 1,
              }}
            >
              {item.label}
            </span>

            {/* Bolinha indicadora */}
            {ativo && (
              <div
                style={{
                  position: "absolute",
                  bottom: "4px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "5px",
                  height: "5px",
                  background: c.accent,
                  borderRadius: "50%",
                  boxShadow: `0 0 6px ${c.accent}`,
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
