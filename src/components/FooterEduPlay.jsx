import { useState } from "react";
import { Link } from "react-router-dom";
import { useTema } from "../context/ThemeContext";

export default function FooterEduPlay() {
  const [aberto, setAberto] = useState(false);
  const { tema } = useTema();
  const escuro = tema === "escuro";
  const Y = new Date().getFullYear();

  return (
    <footer
      style={{
        width: "100%",
        background: escuro ? "#0D1820" : "#FFFFFF",
        borderTop: escuro ? "1px solid #1A2B3C" : "1px solid #EEF5FF",
        paddingBottom: "0px",
        marginBottom: "80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px" }}>
        {aberto && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "24px",
              padding: "24px 0",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  color: escuro ? "#4A6A7A" : "#A0B8C8",
                  marginBottom: "12px",
                }}
              >
                Instituto do Saber
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: escuro ? "#4A6A7A" : "#7A9AAA",
                  lineHeight: "1.6",
                }}
              >
                Plataforma educacional gamificada para o Ensino Fundamental II.
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  color: escuro ? "#4A6A7A" : "#A0B8C8",
                  marginBottom: "12px",
                }}
              >
                Navegação
              </p>
              <Link
                to="/"
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: escuro ? "#6B8A9A" : "#7A9AAA",
                  textDecoration: "none",
                  marginBottom: "8px",
                }}
              >
                Início
              </Link>
              <Link
                to="/privacidade"
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: escuro ? "#6B8A9A" : "#7A9AAA",
                  textDecoration: "none",
                  marginBottom: "8px",
                }}
              >
                Privacidade & ECA Digital
              </Link>
              <Link
                to="/termos"
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: escuro ? "#6B8A9A" : "#7A9AAA",
                  textDecoration: "none",
                }}
              >
                Termos de Uso
              </Link>
            </div>
            <div>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  color: escuro ? "#4A6A7A" : "#A0B8C8",
                  marginBottom: "12px",
                }}
              >
                Conformidade
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: escuro ? "#4A6A7A" : "#7A9AAA",
                  marginBottom: "6px",
                }}
              >
                ✅ ECA Digital
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: escuro ? "#4A6A7A" : "#7A9AAA",
                  marginBottom: "6px",
                }}
              >
                🔒 LGPD
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: escuro ? "#4A6A7A" : "#7A9AAA",
                }}
              >
                📚 Currículo Paulista
              </p>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => setAberto(!aberto)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: "16px auto",
              padding: "8px 20px",
              background: escuro ? "#1A2B3C" : "#F0F9FF",
              border: escuro ? "1px solid #1A3347" : "1px solid #EEF5FF",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 700,
              color: escuro ? "#4A6A7A" : "#A0B8C8",
              cursor: "pointer",
            }}
          >
            {aberto ? "Ocultar detalhes ▲" : "Conhecer mais sobre o EduPlay ▼"}
          </button>
        </div>

        <div
          style={{
            borderTop: escuro ? "1px solid #1A2B3C" : "1px solid #EEF5FF",
            padding: "16px 0",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
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
              ECA Digital
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

          <p
            style={{
              fontSize: "12px",
              color: escuro ? "#4A6A7A" : "#A0B8C8",
              fontWeight: 500,
            }}
          >
            © {Y} EduPlay — Instituto do Saber
          </p>

          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/privacidade"
              style={{
                padding: "8px 16px",
                background: escuro ? "#1A2B3C" : "#F0F9FF",
                border: escuro ? "1px solid #1A3347" : "1px solid #EEF5FF",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                color: escuro ? "#6B8A9A" : "#4A6A7A",
                textDecoration: "none",
              }}
            >
              Privacidade
            </Link>
            <Link
              to="/termos"
              style={{
                padding: "8px 16px",
                background: escuro ? "#1A2B3C" : "#F0F9FF",
                border: escuro ? "1px solid #1A3347" : "1px solid #EEF5FF",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                color: escuro ? "#6B8A9A" : "#4A6A7A",
                textDecoration: "none",
              }}
            >
              Termos de Uso
            </Link>
            <a
              href="mailto:contato@olloapp.com.br"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#00D4AA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                textDecoration: "none",
              }}
            >
              @
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
