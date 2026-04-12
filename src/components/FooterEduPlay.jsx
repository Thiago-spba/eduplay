import { useState } from "react";
import { Link } from "react-router-dom";
import { useTema } from "../context/ThemeContext";

export default function FooterEduPlay() {
  const [aberto, setAberto] = useState(false);
  const { tema } = useTema();
  const escuro = tema === "escuro";
  const Y = new Date().getFullYear();

  const cor = {
    bg: escuro ? "#0D1820" : "#FFFFFF",
    borda: escuro ? "#1A2B3C" : "#EEF5FF",
    label: escuro ? "#4A6A7A" : "#A0B8C8",
    texto: escuro ? "#6B8A9A" : "#7A9AAA",
    cardBg: escuro ? "#1A2B3C" : "#F0F9FF",
    cardBorda: escuro ? "#1A3347" : "#EEF5FF",
    link: escuro ? "#6B8A9A" : "#4A6A7A",
  };

  return (
    <footer
      style={{
        width: "100%",
        background: cor.bg,
        borderTop: `1px solid ${cor.borda}`,
        marginBottom: "80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px" }}>
        {/* ── LINHA DE TOGGLE ── */}
        <button
          onClick={() => setAberto(!aberto)}
          aria-expanded={aberto}
          aria-label={aberto ? "Recolher rodapé" : "Expandir rodapé"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            width: "100%",
            padding: "10px 0",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: cor.label,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "1px",
            transition: "color 0.2s",
          }}
        >
          <span
            style={{
              flex: 1,
              height: "1px",
              background: cor.borda,
            }}
          />
          <span style={{ whiteSpace: "nowrap", padding: "0 10px" }}>
            {aberto ? "▲" : "▼"}
          </span>
          <span
            style={{
              flex: 1,
              height: "1px",
              background: cor.borda,
            }}
          />
        </button>

        {/* ── CONTEÚDO EXPANDIDO ── */}
        {aberto && (
          <>
            {/* Grid de seções */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "24px",
                padding: "20px 0",
                borderTop: `1px solid ${cor.borda}`,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    color: cor.label,
                    marginBottom: "10px",
                  }}
                >
                  Instituto do Saber
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: cor.texto,
                    lineHeight: "1.6",
                  }}
                >
                  Plataforma educacional gamificada para o Ensino Fundamental
                  II, com equipe pedagógica especializada em TEA e letramento.
                </p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    color: cor.label,
                    marginBottom: "10px",
                  }}
                >
                  Navegação
                </p>
                {[
                  { to: "/", label: "Início" },
                  {
                    to: "/privacidade",
                    label: "Privacidade e Proteção Infantil",
                  },
                  { to: "/termos", label: "Termos de Uso" },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    style={{
                      display: "block",
                      fontSize: "13px",
                      color: cor.texto,
                      textDecoration: "none",
                      marginBottom: "8px",
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </div>

              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    color: cor.label,
                    marginBottom: "10px",
                  }}
                >
                  Conformidade
                </p>
                {[
                  "✅ ECA (Lei 8.069/1990)",
                  "🔒 LGPD (Lei 13.709/2018)",
                  "📚 Currículo Paulista",
                ].map((item) => (
                  <p
                    key={item}
                    style={{
                      fontSize: "13px",
                      color: cor.texto,
                      marginBottom: "6px",
                    }}
                  >
                    {item}
                  </p>
                ))}
              </div>

              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    color: cor.label,
                    marginBottom: "10px",
                  }}
                >
                  Contato
                </p>
                <a
                  href="mailto:contato@olloapp.com.br"
                  style={{
                    fontSize: "13px",
                    color: "#00D4AA",
                    textDecoration: "none",
                  }}
                >
                  contato@olloapp.com.br
                </a>
              </div>
            </div>

            {/* Barra inferior com badges + copyright + links */}
            <div
              style={{
                borderTop: `1px solid ${cor.borda}`,
                padding: "14px 0",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              {/* Badges */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span
                  style={{
                    padding: "4px 12px",
                    background: escuro ? "#0A2A1F" : "#F0FFF8",
                    border: "1px solid #00D4AA",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#00D4AA",
                  }}
                >
                  ECA 8.069/1990
                </span>
                <span
                  style={{
                    padding: "4px 12px",
                    background: escuro ? "#0A1A2F" : "#F0F4FF",
                    border: "1px solid #4A90E2",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#4A90E2",
                  }}
                >
                  LGPD
                </span>
              </div>

              {/* Copyright */}
              <p
                style={{ fontSize: "12px", color: cor.label, fontWeight: 500 }}
              >
                © {Y} EduPlay — Instituto do Saber
              </p>

              {/* Links legais (sem botão @) */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { to: "/privacidade", label: "Privacidade" },
                  { to: "/termos", label: "Termos de Uso" },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    style={{
                      padding: "8px 16px",
                      background: cor.cardBg,
                      border: `1px solid ${cor.cardBorda}`,
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: cor.link,
                      textDecoration: "none",
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </footer>
  );
}
