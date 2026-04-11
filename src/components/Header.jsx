import { useNavigate } from "react-router-dom";
import { useTema } from "../context/ThemeContext";

export default function Header({ timer, nivelAtual, fragmentos }) {
  const { tema, alternarTema } = useTema();
  const navigate = useNavigate();

  const c = {
    bg: tema === "escuro" ? "#0D1820" : "#FFFFFF",
    texto: tema === "escuro" ? "#E8F4F8" : "#1A2B3C",
    sub: tema === "escuro" ? "#8BAFC0" : "#5A7A8A",
    borda: tema === "escuro" ? "#2A3F52" : "#E0EEF5",
    card2: tema === "escuro" ? "#1E3347" : "#F8FBFF",
    accent: "#00D4AA",
  };

  return (
    <header
      style={{
        background: c.bg,
        borderBottom: `1px solid ${c.borda}`,
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      {/* Logo */}
      <button
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            background: "linear-gradient(135deg, #00D4AA, #0099FF)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            boxShadow: "0 2px 8px rgba(0,212,170,0.4)",
          }}
        >
          🔬
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              color: c.texto,
              lineHeight: 1,
            }}
          >
            Instituto do Saber
          </div>
          {nivelAtual && (
            <div
              style={{
                fontSize: "0.6rem",
                color: c.accent,
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {nivelAtual.titulo}
            </div>
          )}
        </div>
      </button>

      {/* Ações */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {/* Fragmentos */}
        {fragmentos !== undefined && (
          <div
            style={{
              background: `${c.accent}22`,
              color: c.accent,
              padding: "5px 10px",
              borderRadius: "16px",
              fontSize: "0.78rem",
              fontWeight: 700,
              border: `2px solid ${c.accent}44`,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            🧩 {fragmentos}
          </div>
        )}

        {/* Timer */}
        {timer && (
          <div
            style={{
              background: timer.alertaProximo ? "#FF6B6B22" : `${c.accent}22`,
              color: timer.alertaProximo ? "#FF6B6B" : c.accent,
              padding: "5px 10px",
              borderRadius: "16px",
              fontSize: "0.78rem",
              fontWeight: 700,
              border: `2px solid ${timer.alertaProximo ? "#FF6B6B" : c.accent + "44"}`,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {timer.alertaProximo ? "⚠️" : "⏱️"} {timer.tempoFormatado}
          </div>
        )}

        {/* Botão tema */}
        <button
          onClick={alternarTema}
          style={{
            width: "34px",
            height: "34px",
            background: c.card2,
            border: `2px solid ${c.borda}`,
            borderRadius: "10px",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          {tema === "escuro" ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}
