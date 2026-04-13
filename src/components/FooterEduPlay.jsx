import { useState } from "react";
import { useTema } from "../context/ThemeContext";

export default function FooterEduPlay() {
  const [aberto, setAberto] = useState(false);
  const { tema } = useTema();
  const e = tema === "escuro";
  const Y = new Date().getFullYear();

  const cor = {
    bg: e ? "#080f16" : "#F8FAFB",
    borda: e ? "#1A2B3C" : "#E0EEF5",
    label: e ? "#4A6A7A" : "#A0B8C8",
    texto: e ? "#6B8A9A" : "#7A9AAA",
    link: e ? "#6B8A9A" : "#4A6A7A",
  };

  return (
    <footer
      style={{
        width: "100%",
        background: cor.bg,
        borderTop: `1px solid ${cor.borda}`,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
        {/* ── Toggle ── */}
        <button
          onClick={() => setAberto(!aberto)}
          aria-expanded={aberto}
          aria-label={aberto ? "Recolher" : "Expandir"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            padding: "10px 0",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: cor.label,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          <span style={{ flex: 1, height: 1, background: cor.borda }} />
          <span
            style={{
              whiteSpace: "nowrap",
              padding: "0 10px",
              transition: "transform 0.3s",
              transform: aberto ? "rotate(180deg)" : "rotate(0)",
              display: "inline-block",
            }}
          >
            ▼
          </span>
          <span style={{ flex: 1, height: 1, background: cor.borda }} />
        </button>

        {/* ── Conteúdo expandido — justificado ── */}
        {aberto && (
          <div
            style={{
              padding: "12px 0 16px",
              borderTop: `1px solid ${cor.borda}`,
              animation: "fadeInUp 0.3s ease",
            }}
          >
            {/* Linha 1: Logo à esquerda, links à direita */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img
                  src="/icons/icon-192.png"
                  alt="EduPlay"
                  width={22}
                  height={22}
                  style={{ objectFit: "contain", borderRadius: 5 }}
                  onError={(ev) => {
                    ev.target.style.display = "none";
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Fredoka', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "#00C896",
                  }}
                >
                  EduPlay
                </span>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <a
                  href="/termos"
                  style={{
                    fontSize: 12,
                    color: cor.link,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Termos de Uso
                </a>
                <span style={{ color: cor.borda }}>·</span>
                <a
                  href="/privacidade"
                  style={{
                    fontSize: 12,
                    color: cor.link,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Privacidade
                </a>
                <span style={{ color: cor.borda }}>·</span>
                <a
                  href="mailto:contato@olloapp.com.br"
                  style={{
                    fontSize: 12,
                    color: "#00C896",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  contato@olloapp.com.br
                </a>
              </div>
            </div>

            {/* Linha 2: Selos à esquerda, copyright à direita */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { texto: "ECA 8.069/1990", cor: "#00D4AA" },
                  { texto: "LGPD", cor: "#4A90E2" },
                  { texto: "Currículo Paulista", cor: "#F59E0B" },
                ].map((b) => (
                  <span
                    key={b.texto}
                    style={{
                      padding: "3px 9px",
                      border: `1px solid ${b.cor}60`,
                      borderRadius: 99,
                      fontSize: 10,
                      fontWeight: 700,
                      color: b.cor,
                    }}
                  >
                    {b.texto}
                  </span>
                ))}
              </div>

              <p
                style={{
                  fontSize: 11,
                  color: cor.label,
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                © {Y} EduPlay — Instituto do Saber
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </footer>
  );
}
