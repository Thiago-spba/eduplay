import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTema } from "../context/ThemeContext";
import { getCrianca } from "../services/db";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../services/firebase";

function PlantaCodigo() {
  const rastro = Array.from({ length: 2 });
  return (
    <div
      style={{
        position: "relative",
        width: 130,
        height: 170,
        animation: "plantaFlutuar 4s ease-in-out infinite",
        margin: "0 auto",
        flexShrink: 0,
      }}
    >
      <svg
        width="130"
        height="170"
        viewBox="0 0 240 300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="vb_c" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#E28765" />
            <stop offset="50%" stopColor="#A85732" />
            <stop offset="100%" stopColor="#5C2C16" />
          </radialGradient>
          <linearGradient id="vt_c" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F4A27A" />
            <stop offset="100%" stopColor="#8A4222" />
          </linearGradient>
          <linearGradient id="fl_c" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#81C784" />
            <stop offset="100%" stopColor="#2E7D32" />
          </linearGradient>
          <linearGradient id="fs_c" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
          <linearGradient id="ca_c" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#795548" />
            <stop offset="100%" stopColor="#2D1C15" />
          </linearGradient>
        </defs>
        <ellipse cx="120" cy="292" rx="40" ry="7" fill="#000" opacity="0.1" />
        <g transform="translate(0,10)">
          <path
            d="M 85 270 Q 75 215 120 215 Q 165 215 155 270 Q 145 288 120 288 Q 95 288 85 270 Z"
            fill="url(#vb_c)"
          />
          <ellipse cx="120" cy="215" rx="38" ry="7" fill="#3E2723" />
          <ellipse
            cx="120"
            cy="215"
            rx="43"
            ry="11"
            fill="url(#vt_c)"
            stroke="#5C2C16"
            strokeWidth="1.5"
          />
        </g>
        <g transform="translate(120, 225)">
          <path
            d="M 0 0 Q -5 -55 0 -140"
            stroke="url(#ca_c)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <g transform="translate(0,-28)">
            <path
              d="M 0 0 Q -28 -9 -65 -18 C -55 -38 -28 -18 0 0"
              fill="url(#fs_c)"
            />
            <path
              d="M 0 0 Q 28 -9 65 -18 C 55 -38 28 -18 0 0"
              fill="url(#fs_c)"
            />
          </g>
          <g transform="translate(-2,-58)">
            <path
              d="M 0 0 Q -22 -18 -50 -28 C -42 -46 -14 -28 0 0"
              fill="url(#fl_c)"
            />
            <path
              d="M 0 0 Q 22 -18 50 -28 C 42 -46 14 -28 0 0"
              fill="url(#fl_c)"
            />
          </g>
          <g transform="translate(2,-90)">
            <path
              d="M 0 0 Q -18 -18 -36 -32 C -28 -48 -9 -28 0 0"
              fill="url(#fs_c)"
            />
            <path
              d="M 0 0 Q 18 -18 36 -32 C 28 -48 9 -28 0 0"
              fill="url(#fs_c)"
            />
          </g>
          <g transform="translate(0,-122)">
            <path
              d="M 0 0 Q -9 -18 -18 -36 C -9 -46 0 -28 0 0"
              fill="url(#fl_c)"
            />
            <path
              d="M 0 0 Q 9 -18 18 -36 C 9 -46 0 -28 0 0"
              fill="url(#fl_c)"
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
          animation: "subirDescer_c 6s ease-in-out infinite",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transformStyle: "preserve-3d",
            animation: "girar_c 3s linear infinite",
          }}
        >
          <div
            style={{
              position: "absolute",
              marginTop: -9,
              marginLeft: -9,
              filter:
                "drop-shadow(0 0 6px #00C896) drop-shadow(0 0 12px #00C896)",
              animation: "pulsa_c 1.5s ease-in-out infinite alternate",
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
                animation: "girar_c 3s linear infinite",
                animationDelay: `-${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CodigoPage() {
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();
  const e = tema === "escuro";

  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const c = {
    bg: e
      ? "radial-gradient(circle at 50% 20%, #0D1820 0%, #0F1923 60%, #0A1628 100%)"
      : "radial-gradient(circle at 50% 20%, #F0FFF8 0%, #E8F5F0 50%, #D4EDE4 100%)",
    card: e ? "rgba(26,43,60,0.85)" : "rgba(255,255,255,0.92)",
    texto: e ? "#E8F4F8" : "#1A2B3C",
    textoSub: e ? "#8BAFC0" : "#5A7A8A",
    borda: e ? "#2A3F52" : "#E0EEF5",
    verde: "#00C896",
  };

  const entrar = async () => {
    const cod = codigo.trim().toLowerCase().slice(-6);
    if (cod.length < 6) {
      setErro("Digite o código de 6 letras que seu responsável enviou.");
      return;
    }
    setErro("");
    setCarregando(true);
    try {
      // Autentica anonimamente para satisfazer as regras do Firestore
      await signInAnonymously(auth).catch(() => {});

      const crianca = await getCrianca(cod);
      if (!crianca) {
        setErro("Código não encontrado. Verifique com seu responsável.");
        return;
      }
      localStorage.setItem("eduplay_codigo_acesso", cod);
      localStorage.setItem("eduplay_player_name", crianca.nome || "Agente");
      navigate("/");
    } catch {
      setErro("Erro ao buscar o código. Tente novamente.");
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
        justifyContent: "flex-start",
        overflowY: "auto",
        paddingTop: "60px",
        fontFamily: "'Nunito', sans-serif",
        background: c.bg,
        padding: "24px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
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
          onClick={() => navigate(-1)}
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
          maxWidth: 380,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          animation: "fadeIn_c 0.5s ease",
          zIndex: 1,
          gap: 20,
        }}
      >
        <PlantaCodigo />

        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.6rem",
              color: c.verde,
              margin: "0 0 6px",
            }}
          >
            Olá, Agente! 👋
          </h1>
          <p
            style={{
              fontSize: "0.85rem",
              color: c.textoSub,
              margin: 0,
              fontWeight: 600,
            }}
          >
            Digite o código que seu responsável enviou
          </p>
        </div>

        <div
          style={{
            width: "100%",
            background: c.card,
            backdropFilter: "blur(16px)",
            borderRadius: 24,
            padding: "24px",
            border: `2px solid ${c.borda}`,
            boxShadow: e
              ? "0 24px 48px rgba(0,0,0,0.4)"
              : "0 24px 48px rgba(0,200,150,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <input
            type="text"
            placeholder="Ex: abc123"
            value={codigo}
            onChange={(ev) => {
              setCodigo(ev.target.value.toLowerCase());
              setErro("");
            }}
            onKeyDown={(ev) => ev.key === "Enter" && entrar()}
            maxLength={30}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 14,
              border: `2px solid ${erro ? "#EF4444" : c.borda}`,
              background: e ? "#0D1820" : "#F8FFFE",
              color: c.texto,
              fontSize: "1.1rem",
              fontFamily: "'Nunito', sans-serif",
              outline: "none",
              boxSizing: "border-box",
              letterSpacing: "0.1em",
              textAlign: "center",
              fontWeight: 700,
            }}
          />
          {erro && (
            <div
              style={{
                background: "#EF444415",
                border: "1.5px solid #EF444440",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: "0.82rem",
                color: "#EF4444",
                fontWeight: 700,
              }}
            >
              ⚠️ {erro}
            </div>
          )}
          <button
            onClick={entrar}
            disabled={carregando}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              border: "none",
              background: carregando
                ? c.borda
                : `linear-gradient(135deg, ${c.verde}, #00A57A)`,
              color: "#fff",
              fontWeight: 800,
              fontSize: "1rem",
              cursor: carregando ? "not-allowed" : "pointer",
              fontFamily: "'Fredoka', sans-serif",
              boxShadow: carregando ? "none" : "0 4px 16px rgba(0,200,150,0.3)",
              transition: "all 0.2s",
            }}
          >
            {carregando ? "Verificando..." : "Entrar na minha conta →"}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
          }}
        >
          <div style={{ flex: 1, height: 1, background: c.borda }} />
          <span
            style={{ fontSize: "0.78rem", color: c.textoSub, fontWeight: 600 }}
          >
            ou
          </span>
          <div style={{ flex: 1, height: 1, background: c.borda }} />
        </div>

        <div
          style={{
            width: "100%",
            background: c.card,
            borderRadius: 20,
            padding: "20px 22px",
            border: `2px solid ${c.borda}`,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>🎮</div>
          <h3
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.05rem",
              color: c.texto,
              margin: "0 0 6px",
            }}
          >
            Ainda não tem código?
          </h3>
          <p
            style={{
              fontSize: "0.78rem",
              color: c.textoSub,
              margin: "0 0 14px",
              lineHeight: 1.5,
            }}
          >
            Experimente grátis! Jogue 1 missão de cada disciplina e veja como o
            EduPlay funciona. 🌱
          </p>
          <button
            onClick={() => navigate("/demo")}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              border: `2px solid ${c.verde}44`,
              background: `${c.verde}12`,
              color: c.verde,
              fontWeight: 800,
              fontSize: "0.9rem",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Experimentar grátis ✨
          </button>
          <p
            style={{
              fontSize: "0.7rem",
              color: c.textoSub,
              margin: "10px 0 0",
              lineHeight: 1.4,
            }}
          >
            Sem cadastro · Sem cartão · Sem compromisso
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes plantaFlutuar { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes subirDescer_c { 0%{transform:translateY(80px)} 50%{transform:translateY(-80px)} 100%{transform:translateY(80px)} }
        @keyframes girar_c { 0%{transform:rotateY(0deg) translateZ(70px)} 100%{transform:rotateY(360deg) translateZ(70px)} }
        @keyframes pulsa_c { 0%{transform:scale(0.85) rotate(0deg)} 100%{transform:scale(1.2) rotate(15deg)} }
        @keyframes fadeIn_c { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
