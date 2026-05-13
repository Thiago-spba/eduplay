import { useNavigate, useLocation } from "react-router-dom";
import { useTema } from "../context/ThemeContext";
import { HomeIcon, MapIcon, TrophyIcon } from "@heroicons/react/24/outline";

const ITENS_NAV = [
  { Icon: HomeIcon, label: "Início", path: "/" },
  { Icon: MapIcon, label: "Missões", path: "/mapa" },
  { Icon: TrophyIcon, label: "Conquistas", path: "/conquistas" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tema } = useTema();
  const e = tema === "escuro";

  const c = {
    bg: e ? "#0D1820" : "#FFFFFF",
    borda: e ? "#1A2B3C" : "#E8F4EE",
    texto: e ? "#4A6A7A" : "#94A3B8",
    ativo: e ? "#9FE1CB" : "#0F6E56",
    pill: e ? "rgba(15,110,86,0.18)" : "#E1F5EE",
  };

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: c.bg,
        borderTop: `1px solid ${c.borda}`,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "8px 8px 18px",
        zIndex: 100,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {ITENS_NAV.map(({ Icon, label, path }) => {
        const ativo = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "8px 22px",
              background: ativo ? c.pill : "transparent",
              border: "none",
              borderRadius: 14,
              cursor: "pointer",
              transition: "all 0.2s",
              minWidth: 72,
            }}
          >
            <Icon
              style={{
                width: 22,
                height: 22,
                color: ativo ? c.ativo : c.texto,
                strokeWidth: ativo ? 2.2 : 1.5,
                transition: "all 0.2s",
              }}
            />
            <span
              style={{
                fontSize: "0.7rem",
                color: ativo ? c.ativo : c.texto,
                fontWeight: ativo ? 800 : 500,
                transition: "all 0.2s",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
