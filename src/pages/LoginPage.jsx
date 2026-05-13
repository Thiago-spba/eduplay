import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTema } from "../context/ThemeContext";
import { loginComGoogle } from "../services/auth";

function PlantaLogin() {
  const rastro = Array.from({ length: 8 });
  return (
    <div
      style={{
        position: "relative",
        width: 140,
        height: 180,
        animation: "plantaFlutuar 4s ease-in-out infinite",
        flexShrink: 0,
        margin: "0 auto",
      }}
    >
      <svg
        width="140"
        height="180"
        viewBox="0 0 240 300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="vb_lp" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#E28765" />
            <stop offset="50%" stopColor="#A85732" />
            <stop offset="100%" stopColor="#5C2C16" />
          </radialGradient>
          <linearGradient id="vt_lp" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F4A27A" />
            <stop offset="100%" stopColor="#8A4222" />
          </linearGradient>
          <linearGradient id="fl_lp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#81C784" />
            <stop offset="100%" stopColor="#2E7D32" />
          </linearGradient>
          <linearGradient id="fs_lp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
          <linearGradient id="ca_lp" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#795548" />
            <stop offset="100%" stopColor="#2D1C15" />
          </linearGradient>
        </defs>
        <ellipse cx="120" cy="292" rx="40" ry="7" fill="#000" opacity="0.1" />
        <g transform="translate(0,10)">
          <path
            d="M 85 270 Q 75 215 120 215 Q 165 215 155 270 Q 145 288 120 288 Q 95 288 85 270 Z"
            fill="url(#vb_lp)"
          />
          <ellipse cx="120" cy="215" rx="38" ry="7" fill="#3E2723" />
          <ellipse
            cx="120"
            cy="215"
            rx="43"
            ry="11"
            fill="url(#vt_lp)"
            stroke="#5C2C16"
            strokeWidth="1.5"
          />
        </g>
        <g transform="translate(120, 225)">
          <path
            d="M 0 0 Q -5 -55 0 -140"
            stroke="url(#ca_lp)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <g transform="translate(0,-28)">
            <path
              d="M 0 0 Q -28 -9 -65 -18 C -55 -38 -28 -18 0 0"
              fill="url(#fs_lp)"
            />
            <path
              d="M 0 0 Q 28 -9 65 -18 C 55 -38 28 -18 0 0"
              fill="url(#fs_lp)"
            />
          </g>
          <g transform="translate(-2,-58)">
            <path
              d="M 0 0 Q -22 -18 -50 -28 C -42 -46 -14 -28 0 0"
              fill="url(#fl_lp)"
            />
            <path
              d="M 0 0 Q 22 -18 50 -28 C 42 -46 14 -28 0 0"
              fill="url(#fl_lp)"
            />
          </g>
          <g transform="translate(2,-90)">
            <path
              d="M 0 0 Q -18 -18 -36 -32 C -28 -48 -9 -28 0 0"
              fill="url(#fs_lp)"
            />
            <path
              d="M 0 0 Q 18 -18 36 -32 C 28 -48 9 -28 0 0"
              fill="url(#fs_lp)"
            />
          </g>
          <g transform="translate(0,-122)">
            <path
              d="M 0 0 Q -9 -18 -18 -36 C -9 -46 0 -28 0 0"
              fill="url(#fl_lp)"
            />
            <path
              d="M 0 0 Q 9 -18 18 -36 C 9 -46 0 -28 0 0"
              fill="url(#fl_lp)"
            />
          </g>
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          animation: "subirDescer_lp 6s ease-in-out infinite",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transformStyle: "preserve-3d",
            animation: "girar_lp 3s linear infinite",
          }}
        >
          <div
            style={{
              position: "absolute",
              marginTop: -9,
              marginLeft: -9,
              filter:
                "drop-shadow(0 0 6px #3B82F6) drop-shadow(0 0 12px #00C896)",
              animation: "pulsa_lp 1.5s ease-in-out infinite alternate",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 22 22">
              <polygon
                points="11,1 13.9,7.6 21,8.5 15.8,13.5 17.2,21 11,17.3 4.8,21 6.2,13.5 1,8.5 8.1,7.6"
                fill="white"
              />
            </svg>
          </div>
          {rastro.map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                borderRadius: "50%",
                marginTop: -3,
                marginLeft: -3,
                background: "#fff",
                width: `${6 - i * 0.5}px`,
                height: `${6 - i * 0.5}px`,
                opacity: 1 - i * 0.11,
                boxShadow:
                  i % 2 === 0 ? "0 0 6px 2px #3B82F6" : "0 0 6px 2px #00C896",
                animationDelay: `-${i * 0.1}s`,
                animation: "girar_lp 3s linear infinite",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { tema, alternarTema } = useTema();
  const navigate = useNavigate();
  const e = tema === "escuro";
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const c = {
    bg: e
      ? "radial-gradient(circle at 50% 20%, #0D1820 0%, #0F1923 60%, #0A1628 100%)"
      : "radial-gradient(circle at 50% 20%, #F0FFF8 0%, #E8F4F0 50%, #D4E5E4 100%)",
    card: e ? "rgba(26,43,60,0.85)" : "rgba(255,255,255,0.92)",
    texto: e ? "#E8F4F8" : "#1A2B3C",
    textoSub: e ? "#8BAFC0" : "#5A7A8A",
    borda: e ? "#2A3F52" : "#E0EEF5",
  };

  const handleGoogle = async () => {
    setErro("");
    setCarregando(true);
    try {
      await loginComGoogle();
      navigate("/pais");
    } catch {
      setErro("Erro ao entrar com Google. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Nunito', sans-serif",
        background: c.bg,
        padding: "24px 20px",
        position: "relative",
        transition: "background 0.3s",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(circle at 85% 15%, #3B82F615 0%, transparent 40%),
                     radial-gradient(circle at 15% 85%, #00C89615 0%, transparent 40%)`,
        }}
      />

      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
        <button
          onClick={alternarTema}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border: `2px solid ${c.borda}`,
            background: e ? "#1A2B3C" : "#fff",
            fontSize: "1.1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {e ? "☀️" : "🌙"}
        </button>
      </div>

      <div style={{ position: "absolute", top: 20, left: 16, zIndex: 10 }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            color: c.textoSub,
            fontSize: "0.9rem",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          ← Voltar
        </button>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          animation: "fadeInUp_lp 0.5s ease",
          zIndex: 1,
        }}
      >
        <PlantaLogin />

        <div style={{ textAlign: "center", margin: "8px 0 24px" }}>
          <h1
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#3B82F6",
              margin: "0 0 4px",
            }}
          >
            Área do Responsável
          </h1>
          <p
            style={{
              fontSize: "0.85rem",
              color: c.textoSub,
              margin: 0,
              fontWeight: 600,
            }}
          >
            Gerencie a jornada do seu filho
          </p>
        </div>

        <div
          style={{
            width: "100%",
            background: c.card,
            backdropFilter: "blur(16px)",
            borderRadius: 24,
            padding: "28px 24px",
            border: `2px solid ${c.borda}`,
            boxShadow: e
              ? "0 24px 48px rgba(0,0,0,0.4)"
              : "0 24px 48px rgba(59,130,246,0.08)",
          }}
        >
          {/* Botão Google */}
          <button
            onClick={handleGoogle}
            disabled={carregando}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              border: `2px solid ${c.borda}`,
              background: e ? "#1A2B3C" : "#fff",
              color: c.texto,
              fontWeight: 800,
              fontSize: "0.95rem",
              cursor: carregando ? "not-allowed" : "pointer",
              fontFamily: "'Nunito', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "all 0.2s",
              opacity: carregando ? 0.6 : 1,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {carregando ? "Entrando..." : "Entrar com Google"}
          </button>

          {erro && (
            <div
              style={{
                background: "#EF444415",
                border: "1.5px solid #EF444440",
                borderRadius: 10,
                padding: "10px 14px",
                marginTop: 14,
                fontSize: "0.82rem",
                color: "#EF4444",
                fontWeight: 700,
              }}
            >
              ⚠️ {erro}
            </div>
          )}

          {/* Por que Google? */}
          <div
            style={{
              marginTop: 20,
              padding: "14px 16px",
              background: e ? "rgba(59,130,246,0.08)" : "#EFF6FF",
              borderRadius: 12,
              border: `1.5px solid #3B82F622`,
            }}
          >
            <p
              style={{
                fontSize: "0.78rem",
                color: e ? "#93C5FD" : "#1D4ED8",
                fontWeight: 700,
                margin: "0 0 6px",
              }}
            >
              🔒 Por que apenas Google?
            </p>
            <p
              style={{
                fontSize: "0.74rem",
                color: c.textoSub,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              O login com Google garante máxima segurança para os dados do seu
              filho, sem precisar criar e lembrar mais uma senha. Em
              conformidade com o ECA Digital (Lei 14.155/2021).
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes plantaFlutuar { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes subirDescer_lp { 0% { transform: translateY(80px); } 50% { transform: translateY(-80px); } 100% { transform: translateY(80px); } }
        @keyframes girar_lp { 0% { transform: rotateY(0deg) translateZ(70px); } 100% { transform: rotateY(360deg) translateZ(70px); } }
        @keyframes pulsa_lp { 0% { transform: scale(0.85) rotate(0deg); } 100% { transform: scale(1.2) rotate(15deg); } }
        @keyframes fadeInUp_lp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
