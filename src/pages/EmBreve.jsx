import { useState, useEffect, useRef } from "react";
import { useTema } from "../context/ThemeContext";

const FRASES = [
  "Em breve uma nova missão chega para você.",
  "Semeando o conhecimento, cultivando o futuro.",
  "O Instituto do Saber está se preparando.",
  "Sua aventura começa em breve, Agente.",
];

function Typewriter({ frases, cor }) {
  const [texto, setTexto] = useState("");
  const [indice, setIndice] = useState(0);
  const [digitando, setDigitando] = useState(true);
  const [cursor, setCursor] = useState(true);
  const timeout = useRef(null);

  useEffect(() => {
    const iv = setInterval(() => setCursor((v) => !v), 500);
    return () => clearInterval(iv);
  }, []);

  const fraseAtual = frases[indice] || "";

  useEffect(() => {
    if (digitando) {
      if (texto.length < fraseAtual.length) {
        timeout.current = setTimeout(
          () => setTexto(fraseAtual.slice(0, texto.length + 1)),
          52,
        );
      } else {
        timeout.current = setTimeout(() => setDigitando(false), 2200);
      }
    } else {
      if (texto.length > 0) {
        timeout.current = setTimeout(() => setTexto((t) => t.slice(0, -1)), 28);
      } else {
        setIndice((i) => (i + 1) % frases.length);
        setDigitando(true);
      }
    }
    return () => clearTimeout(timeout.current);
  }, [texto, digitando, fraseAtual, frases.length]);

  return (
    <div
      style={{
        minHeight: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)",
          fontWeight: 700,
          fontFamily: "'Nunito', sans-serif",
          color: cor,
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        {texto}
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            background: cor,
            marginLeft: 3,
            verticalAlign: "text-bottom",
            borderRadius: 2,
            opacity: cursor ? 1 : 0,
            transition: "opacity 0.1s",
            boxShadow: `0 0 8px ${cor}`,
          }}
        />
      </span>
    </div>
  );
}

function PlantaMascote() {
  const rastro = Array.from({ length: 8 });
  return (
    <div
      style={{
        position: "relative",
        width: 200,
        height: 250,
        animation: "plantaFlutuar 4s ease-in-out infinite",
        flexShrink: 0,
      }}
    >
      <svg
        width="200"
        height="250"
        viewBox="0 0 240 300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="vb_eb" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#E28765" />
            <stop offset="50%" stopColor="#A85732" />
            <stop offset="100%" stopColor="#5C2C16" />
          </radialGradient>
          <linearGradient id="vt_eb" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F4A27A" />
            <stop offset="100%" stopColor="#8A4222" />
          </linearGradient>
          <linearGradient id="fl_eb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#81C784" />
            <stop offset="100%" stopColor="#2E7D32" />
          </linearGradient>
          <linearGradient id="fs_eb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
          <linearGradient id="ca_eb" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#795548" />
            <stop offset="100%" stopColor="#2D1C15" />
          </linearGradient>
        </defs>
        <ellipse cx="120" cy="292" rx="40" ry="7" fill="#000" opacity="0.1" />
        <g transform="translate(0,10)">
          <path
            d="M 85 270 Q 75 215 120 215 Q 165 215 155 270 Q 145 288 120 288 Q 95 288 85 270 Z"
            fill="url(#vb_eb)"
          />
          <ellipse cx="120" cy="215" rx="38" ry="7" fill="#3E2723" />
          <ellipse
            cx="120"
            cy="215"
            rx="43"
            ry="11"
            fill="url(#vt_eb)"
            stroke="#5C2C16"
            strokeWidth="1.5"
          />
        </g>
        <g transform="translate(120, 225)">
          <path
            d="M 0 0 Q -5 -55 0 -140"
            stroke="url(#ca_eb)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <g transform="translate(0,-28)">
            <path
              d="M 0 0 Q -28 -9 -65 -18 C -55 -38 -28 -18 0 0"
              fill="url(#fs_eb)"
            />
            <path
              d="M 0 0 Q 28 -9 65 -18 C 55 -38 28 -18 0 0"
              fill="url(#fs_eb)"
            />
          </g>
          <g transform="translate(-2,-58)">
            <path
              d="M 0 0 Q -22 -18 -50 -28 C -42 -46 -14 -28 0 0"
              fill="url(#fl_eb)"
            />
            <path
              d="M 0 0 Q 22 -18 50 -28 C 42 -46 14 -28 0 0"
              fill="url(#fl_eb)"
            />
          </g>
          <g transform="translate(2,-90)">
            <path
              d="M 0 0 Q -18 -18 -36 -32 C -28 -48 -9 -28 0 0"
              fill="url(#fs_eb)"
            />
            <path
              d="M 0 0 Q 18 -18 36 -32 C 28 -48 9 -28 0 0"
              fill="url(#fs_eb)"
            />
          </g>
          <g transform="translate(0,-122)">
            <path
              d="M 0 0 Q -9 -18 -18 -36 C -9 -46 0 -28 0 0"
              fill="url(#fl_eb)"
            />
            <path
              d="M 0 0 Q 9 -18 18 -36 C 9 -46 0 -28 0 0"
              fill="url(#fl_eb)"
            />
          </g>
        </g>
      </svg>

      {/* Estrelas orbitando */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          animation: "subirDescer_eb 6s ease-in-out infinite",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transformStyle: "preserve-3d",
            animation: "girar_eb 3s linear infinite",
          }}
        >
          <div
            style={{
              position: "absolute",
              marginTop: -9,
              marginLeft: -9,
              filter:
                "drop-shadow(0 0 6px #00C896) drop-shadow(0 0 12px #3B82F6)",
              animation: "pulsa_eb 1.5s ease-in-out infinite alternate",
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
                  i % 2 === 0 ? "0 0 6px 2px #00C896" : "0 0 6px 2px #3B82F6",
                animationDelay: `-${i * 0.1}s`,
                animation: "girar_eb 3s linear infinite",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EmBreve() {
  const { tema, alternarTema } = useTema();
  const e = tema === "escuro";

  const c = {
    bg: e
      ? "radial-gradient(circle at 50% 20%, #0D1820 0%, #0F1923 60%, #0A1628 100%)"
      : "radial-gradient(circle at 50% 20%, #F0FFF8 0%, #E8F4F0 50%, #D4E5E4 100%)",
    texto: e ? "#E8F4F8" : "#1A2B3C",
    textoSub: e ? "#8BAFC0" : "#5A7A8A",
    borda: e ? "#1A2B3C" : "#E0EEF5",
    card: e ? "rgba(26,43,60,0.7)" : "rgba(255,255,255,0.7)",
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
        position: "relative",
        overflow: "hidden",
        transition: "background 0.3s",
      }}
    >
      {/* Decoração de fundo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(circle at 85% 15%, #00C89615 0%, transparent 40%),
            radial-gradient(circle at 15% 85%, #3B82F620 0%, transparent 40%)
          `,
        }}
      />

      {/* Toggle dark/light */}
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
            transition: "all 0.2s",
          }}
        >
          {e ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Conteúdo central */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          padding: "40px 24px",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          animation: "fadeInUp_eb 0.6s ease",
        }}
      >
        <PlantaMascote />

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "clamp(2.2rem, 6vw, 3rem)",
              fontWeight: 700,
              color: "#00C896",
              margin: 0,
              letterSpacing: "-0.5px",
              lineHeight: 1,
            }}
          >
            EduPlay
          </h1>
          <p
            style={{
              fontSize: "clamp(0.8rem, 2vw, 0.95rem)",
              color: c.textoSub,
              margin: 0,
              fontWeight: 600,
            }}
          >
            Semeando o conhecimento, cultivando o futuro.
          </p>
        </div>

        {/* Card typewriter */}
        <div
          style={{
            width: "100%",
            background: c.card,
            backdropFilter: "blur(12px)",
            borderRadius: 18,
            padding: "20px 24px",
            border: `2px solid #00C89633`,
            boxShadow: "0 4px 24px #00C89620",
          }}
        >
          <Typewriter frases={FRASES} cor="#00C896" />
        </div>

        {/* Badge em breve */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#00C89615",
            border: "1.5px solid #00C89644",
            borderRadius: 50,
            padding: "8px 20px",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: "#00C896",
              fontWeight: 800,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            🌱 Em breve
          </span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes plantaFlutuar {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes subirDescer_eb {
          0% { transform: translateY(100px); }
          50% { transform: translateY(-100px); }
          100% { transform: translateY(100px); }
        }
        @keyframes girar_eb {
          0% { transform: rotateY(0deg) translateZ(80px); }
          100% { transform: rotateY(360deg) translateZ(80px); }
        }
        @keyframes pulsa_eb {
          0% { transform: scale(0.85) rotate(0deg); }
          100% { transform: scale(1.2) rotate(15deg); }
        }
        @keyframes fadeInUp_eb {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
