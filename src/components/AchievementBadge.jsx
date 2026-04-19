import { useTema } from "../context/ThemeContext";

export default function AchievementBadge({ icone, titulo, desbloqueado }) {
  const { tema } = useTema();
  const e = tema === "escuro";

  const c = {
    card: e ? "#1A2633" : "#FFFFFF",
    cardLocked: e ? "#121A22" : "#F8FAFC",
    texto: e ? "#E2E8F0" : "#1E293B",
    textoSub: e ? "#64748B" : "#94A3B8",
    borda: e ? "#2D3D50" : "#E2E8F0",
    bordaDestaque: "#FFB830", // Dourado para conquistas
    bgIcone: e ? "rgba(255, 184, 48, 0.15)" : "#FFF8E8",
    bgIconeLocked: e ? "#1A2633" : "#E2E8F0",
  };

  return (
    <div
      style={{
        background: desbloqueado ? c.card : c.cardLocked,
        border: `2px solid ${desbloqueado ? c.bordaDestaque + "88" : c.borda}`,
        borderRadius: "16px",
        padding: "16px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: desbloqueado ? 1 : 0.6,
        transition: "all 0.3s ease",
        position: "relative",
        boxShadow: desbloqueado ? `0 4px 12px ${c.bordaDestaque}22` : "none",
      }}
    >
      {/* Ícone principal da Medalha */}
      <div
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          background: desbloqueado ? c.bgIcone : c.bgIconeLocked,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.8rem",
          marginBottom: "8px",
          filter: desbloqueado ? "none" : "grayscale(100%)",
          border: `2px solid ${desbloqueado ? c.bordaDestaque : "transparent"}`,
        }}
      >
        {icone}
      </div>

      {/* Título da Conquista */}
      <div
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: "0.8rem",
          fontWeight: 700,
          color: desbloqueado ? c.texto : c.textoSub,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {titulo}
      </div>

      {/* Badge de Cadeado para os itens bloqueados */}
      {!desbloqueado && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            fontSize: "0.7rem",
            opacity: 0.8,
          }}
        >
          🔒
        </div>
      )}
    </div>
  );
}
