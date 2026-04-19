import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTema } from "../context/ThemeContext";
import FooterEduPlay from "../components/FooterEduPlay";

const FRASES = {
  estudante: [
    "Sua missão começa aqui.",
    "Aprenda como um detetive.",
    "Cada desafio vale fragmentos.",
    "Desvende História. Conquiste Geografia.",
    "O conhecimento é sua maior arma.",
    "Seja o agente que o mundo precisa.",
  ],
  responsavel: [
    "Seu filho aprende sem perceber.",
    "Currículo Paulista. Em casa.",
    "Acompanhe cada passo em tempo real.",
    "Diversão que virou aprendizado.",
    "5 dias grátis. Resultado garantido.",
    "A escola continua em casa.",
  ],
};

/* ── Typewriter ── */
function TypewriterCreativo({ frases, cor, tema }) {
  const [texto, setTexto] = useState("");
  const [indice, setIndice] = useState(0);
  const [digitando, setDigitando] = useState(true);
  const [cursor, setCursor] = useState(true);
  const timeout = useRef(null);

  useEffect(() => {
    const iv = setInterval(() => setCursor((v) => !v), 500);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    setTexto("");
    setIndice(0);
    setDigitando(true);
  }, [frases]);

  const fraseAtual = frases[indice] || "";

  useEffect(() => {
    if (digitando) {
      if (texto.length < fraseAtual.length) {
        timeout.current = setTimeout(
          () => setTexto(fraseAtual.slice(0, texto.length + 1)),
          52,
        );
      } else {
        timeout.current = setTimeout(() => setDigitando(false), 2000);
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
  }, [texto, digitando, fraseAtual, frases.length, indice]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 18,
        padding: "16px 20px",
        minHeight: 68,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          tema === "escuro"
            ? `linear-gradient(135deg, #1A2B3C, ${cor}15)`
            : `linear-gradient(135deg, #fff, ${cor}10)`,
        border: `2px solid ${cor}44`,
        boxShadow: `0 4px 24px ${cor}20`,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 12,
          fontSize: 13,
          opacity: 0.4,
          animation: "piscar 2s ease-in-out infinite",
        }}
      >
        ✦
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: 12,
          fontSize: 9,
          opacity: 0.3,
          animation: "piscar 3s ease-in-out infinite 1s",
        }}
      >
        ✦
      </div>
      <span
        style={{
          fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
          fontWeight: 800,
          color: tema === "escuro" ? "#E8F4F8" : "#1A2B3C",
          fontFamily: "'Nunito', sans-serif",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {texto}
        <span
          style={{
            display: "inline-block",
            width: 2.5,
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

/* ── Planta mascote ── */
function PlantaMini() {
  const rastro = Array.from({ length: 8 });
  return (
    <div
      style={{
        position: "relative",
        width: 180,
        height: 230,
        animation: "plantaFlutuar 4s ease-in-out infinite",
        flexShrink: 0,
      }}
    >
      <svg
        width="180"
        height="230"
        viewBox="0 0 240 300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="vb2" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#E28765" />
            <stop offset="50%" stopColor="#A85732" />
            <stop offset="100%" stopColor="#5C2C16" />
          </radialGradient>
          <linearGradient id="vt2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F4A27A" />
            <stop offset="100%" stopColor="#8A4222" />
          </linearGradient>
          <linearGradient id="fl2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#81C784" />
            <stop offset="100%" stopColor="#2E7D32" />
          </linearGradient>
          <linearGradient id="fs2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
          <linearGradient id="ca2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#795548" />
            <stop offset="100%" stopColor="#2D1C15" />
          </linearGradient>
        </defs>
        <ellipse cx="120" cy="292" rx="40" ry="7" fill="#000" opacity="0.1" />
        <g transform="translate(0,10)">
          <path
            d="M 85 270 Q 75 215 120 215 Q 165 215 155 270 Q 145 288 120 288 Q 95 288 85 270 Z"
            fill="url(#vb2)"
          />
          <ellipse cx="120" cy="215" rx="38" ry="7" fill="#3E2723" />
          <ellipse
            cx="120"
            cy="215"
            rx="43"
            ry="11"
            fill="url(#vt2)"
            stroke="#5C2C16"
            strokeWidth="1.5"
          />
        </g>
        <g transform="translate(120, 225)">
          <path
            d="M 0 0 Q -5 -55 0 -140"
            stroke="url(#ca2)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <g transform="translate(0,-28)">
            <path
              d="M 0 0 Q -28 -9 -65 -18 C -55 -38 -28 -18 0 0"
              fill="url(#fs2)"
            />
            <path
              d="M 0 0 Q 28 -9 65 -18 C 55 -38 28 -18 0 0"
              fill="url(#fs2)"
            />
          </g>
          <g transform="translate(-2,-58)">
            <path
              d="M 0 0 Q -22 -18 -50 -28 C -42 -46 -14 -28 0 0"
              fill="url(#fl2)"
            />
            <path
              d="M 0 0 Q 22 -18 50 -28 C 42 -46 14 -28 0 0"
              fill="url(#fl2)"
            />
          </g>
          <g transform="translate(2,-90)">
            <path
              d="M 0 0 Q -18 -18 -36 -32 C -28 -48 -9 -28 0 0"
              fill="url(#fs2)"
            />
            <path
              d="M 0 0 Q 18 -18 36 -32 C 28 -48 9 -28 0 0"
              fill="url(#fs2)"
            />
          </g>
          <g transform="translate(0,-122)">
            <path
              d="M 0 0 Q -9 -18 -18 -36 C -9 -46 0 -28 0 0"
              fill="url(#fl2)"
            />
            <path d="M 0 0 Q 9 -18 18 -36 C 9 -46 0 -28 0 0" fill="url(#fl2)" />
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
          animation: "subirDescer2 6s ease-in-out infinite",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transformStyle: "preserve-3d",
            animation: "girar2 3s linear infinite",
          }}
        >
          <div
            style={{
              position: "absolute",
              marginTop: -9,
              marginLeft: -9,
              filter:
                "drop-shadow(0 0 6px #00C896) drop-shadow(0 0 12px #3B82F6)",
              animation: "pulsaE2 1.5s ease-in-out infinite alternate",
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
                animation: "girar2 3s linear infinite",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE (Blindada com useNavigate direto)
   ═══════════════════════════════════════════════════════════════ */
export default function LandingPage({ onComecar, onResponsavel }) {
  const { tema, alternarTema } = useTema();
  const navigate = useNavigate(); // <-- Injeção de segurança para rotas
  const [publico, setPublico] = useState("estudante");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const cor = publico === "estudante" ? "#00C896" : "#3B82F6";

  const c = {
    bg:
      tema === "escuro"
        ? "radial-gradient(circle at 50% 20%, #0D1820 0%, #0F1923 60%, #0A1628 100%)"
        : "radial-gradient(circle at 50% 20%, #F0FFF8 0%, #E8F4F0 50%, #D4E5E4 100%)",
    textoSub: tema === "escuro" ? "#8BAFC0" : "#5A7A8A",
    rodape: tema === "escuro" ? "#4A6A7A" : "#8A9BAA",
    borda: tema === "escuro" ? "#1A2B3C" : "#E0EEF5",
  };

  // Funções de clique blindadas
  const handleAcaoBotao = () => {
    if (publico === "estudante") {
      // Tenta usar a prop, se falhar ou estiver errada, força a rota
      if (typeof onComecar === "function") onComecar();
      else navigate("/register");
    } else {
      // Tenta usar a prop, se falhar ou estiver errada, força a rota do Painel
      if (typeof onResponsavel === "function") onResponsavel();
      else navigate("/pais");
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Nunito', sans-serif",
        background: c.bg,
        position: "relative",
        boxSizing: "border-box",
        transition: "background 0.3s",
        overflow: "hidden",
      }}
    >
      {/* Decoração fundo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(circle at 85% 15%, ${cor}15 0%, transparent 40%),
            radial-gradient(circle at 15% 85%, #3B82F620 0%, transparent 40%)
          `,
        }}
      />

      {/* Botão tema */}
      <div style={{ position: "absolute", top: 12, right: 16, zIndex: 10 }}>
        <button
          onClick={alternarTema}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: `2px solid ${c.borda}`,
            background: tema === "escuro" ? "#1A2B3C" : "#fff",
            fontSize: "1.1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {tema === "escuro" ? "\u2600\uFE0F" : "\uD83C\uDF19"}
        </button>
      </div>

      {/* Layout principal */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: isMobile ? 16 : 48,
          padding: isMobile ? "48px 20px 24px" : "40px 60px",
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Planta */}
        <div
          style={{ display: "flex", justifyContent: "center", flexShrink: 0 }}
        >
          <PlantaMini />
        </div>

        {/* Conteúdo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            width: "100%",
            maxWidth: isMobile ? 400 : 440,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: isMobile ? "center" : "flex-start",
              gap: 4,
            }}
          >
            <h1
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "clamp(2rem, 5vw, 3rem)",
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
                fontSize: "clamp(0.75rem, 1.8vw, 0.9rem)",
                color: c.textoSub,
                margin: 0,
                fontWeight: 600,
                textAlign: isMobile ? "center" : "left",
              }}
            >
              Semeando o conhecimento, cultivando o futuro.
            </p>
          </div>

          {/* Botões público */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setPublico("estudante")}
              style={{
                flex: 1,
                padding: "10px 8px",
                borderRadius: 50,
                border: "2px solid #00C896",
                background: publico === "estudante" ? "#00C896" : "transparent",
                color: publico === "estudante" ? "#fff" : "#00C896",
                fontWeight: 800,
                fontSize: "clamp(0.78rem, 1.5vw, 0.9rem)",
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
                transition: "all 0.2s",
              }}
            >
              Sou estudante
            </button>
            <button
              onClick={() => setPublico("responsavel")}
              style={{
                flex: 1,
                padding: "10px 8px",
                borderRadius: 50,
                border: "2px solid #3B82F6",
                background:
                  publico === "responsavel" ? "#3B82F6" : "transparent",
                color: publico === "responsavel" ? "#fff" : "#3B82F6",
                fontWeight: 800,
                fontSize: "clamp(0.78rem, 1.5vw, 0.9rem)",
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
                transition: "all 0.2s",
              }}
            >
              Sou responsável
            </button>
          </div>

          <TypewriterCreativo frases={FRASES[publico]} cor={cor} tema={tema} />

          <button
            onClick={handleAcaoBotao}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: 50,
              border: "none",
              background: `linear-gradient(135deg, ${cor}, ${publico === "estudante" ? "#00A57A" : "#1D4ED8"})`,
              color: "#fff",
              fontWeight: 900,
              fontSize: "clamp(1rem, 2vw, 1.1rem)",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
              boxShadow: `0 6px 24px ${cor}40`,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {publico === "estudante" ? (
              "Começar minha aventura →"
            ) : (
              <>
                <span style={{ fontSize: "1.1rem" }}>🔒</span> Acessar Painel
                dos Pais →
              </>
            )}
          </button>

          <p
            style={{
              fontSize: "clamp(0.7rem, 1.5vw, 0.78rem)",
              color: c.rodape,
              margin: 0,
              textAlign: "center",
            }}
          >
            5 dias grátis · Sem compromisso · Cancele quando quiser
          </p>
        </div>
      </div>

      {/* Rodapé recolhível */}
      <FooterEduPlay />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes plantaFlutuar {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes subirDescer2 {
          0%   { transform: translateY(100px); }
          50%  { transform: translateY(-100px); }
          100% { transform: translateY(100px); }
        }
        @keyframes girar2 {
          0%   { transform: rotateY(0deg) translateZ(80px); }
          100% { transform: rotateY(360deg) translateZ(80px); }
        }
        @keyframes pulsaE2 {
          0%   { transform: scale(0.85) rotate(0deg); }
          100% { transform: scale(1.2) rotate(15deg); }
        }
        @keyframes piscar {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
