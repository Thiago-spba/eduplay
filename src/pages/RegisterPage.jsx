import { useState } from "react";
import { useTema } from "../context/ThemeContext";
import FooterEduPlay from "../components/FooterEduPlay";

/* ═══════════════════════════════════════════════════════════════
   AVATARES — organizados por categoria, todos emojis nativos
   ═══════════════════════════════════════════════════════════════ */
const CATEGORIAS = [
  {
    id: "pessoas",
    label: "Pessoas",
    emojis: [
      "👦",
      "👧",
      "🧒",
      "👶",
      "🧑",
      "👱",
      "🧑‍🦱",
      "👩‍🦰",
      "🧔",
      "👴",
      "👵",
      "🤴",
      "👸",
      "🦸",
      "🦹",
      "🧙",
    ],
  },
  {
    id: "animais",
    label: "Animais",
    emojis: [
      "🦊",
      "🐼",
      "🦁",
      "🐸",
      "🐶",
      "🐱",
      "🐰",
      "🐻",
      "🐨",
      "🐯",
      "🦄",
      "🐲",
      "🦋",
      "🐬",
      "🦈",
      "🐙",
    ],
  },
  {
    id: "espaco",
    label: "Espaço",
    emojis: [
      "👽",
      "🤖",
      "👾",
      "🛸",
      "🚀",
      "🌍",
      "🌙",
      "⭐",
      "☄️",
      "🪐",
      "🌞",
      "🔭",
    ],
  },
  {
    id: "natureza",
    label: "Natureza",
    emojis: [
      "🌿",
      "🌻",
      "🍀",
      "🌸",
      "🌵",
      "🍄",
      "🌈",
      "🔥",
      "💧",
      "❄️",
      "⚡",
      "🌊",
    ],
  },
  {
    id: "comida",
    label: "Comida",
    emojis: [
      "🍕",
      "🍔",
      "🍩",
      "🍦",
      "🎂",
      "🍉",
      "🍓",
      "🥑",
      "🌮",
      "🍿",
      "🧁",
      "🍪",
    ],
  },
  {
    id: "esportes",
    label: "Esportes",
    emojis: [
      "⚽",
      "🏀",
      "🎮",
      "🎯",
      "🏆",
      "🥇",
      "🎸",
      "🎨",
      "🎭",
      "🎪",
      "🛹",
      "🏄",
    ],
  },
];

export default function RegisterPage({ onRegister, onVoltar }) {
  const { tema, alternarTema } = useTema();
  const [nome, setNome] = useState("");
  const [avatar, setAvatar] = useState("👦");
  const [erro, setErro] = useState("");
  const [categoria, setCategoria] = useState("pessoas");

  const e = tema === "escuro";

  const cor = {
    bg: e
      ? "linear-gradient(135deg, #0D1820 0%, #0F1923 100%)"
      : "linear-gradient(135deg, #D4E5E4 0%, #EDE8DF 100%)",
    card: e ? "#141F2A" : "#F7F5F0",
    cardSombra: e
      ? "0 8px 24px rgba(0,0,0,0.3)"
      : "0 8px 24px rgba(90,143,140,0.16)",
    titulo: e ? "#A8D8D0" : "#3D6B6A",
    texto: e ? "#8AAABB" : "#7A7A7A",
    label: e ? "#A8D8D0" : "#3D6B6A",
    input: e ? "#1A2B3C" : "#F7F5F0",
    inputBorda: e ? "#2A4050" : "#A8C5C3",
    inputBordaErro: e ? "#8B4444" : "#D4A5A5",
    inputTexto: e ? "#D0E0E8" : "#4A4A4A",
    avatarBg: e ? "#1A2B3C" : "#EDE8DF",
    avatarAtivo: e ? "#1A3A38" : "#D4E5E4",
    avatarBorda: e ? "#00C896" : "#5A8F8C",
    avatarBordaOff: e ? "#2A3A4A" : "#E5E0D5",
    botao: e ? "#00C896" : "#5A8F8C",
    botaoTexto: e ? "#0A1118" : "#F7F5F0",
    catAtivo: e ? "#00C896" : "#5A8F8C",
    catInativo: e ? "#3A5060" : "#B0BEC5",
    catBg: e ? "#00C89618" : "#5A8F8C15",
    borda: e ? "#1A2B3C" : "#E0EEF5",
    rodapeBg: e ? "#080f16" : "#F8FAFB",
    rodapeLabel: e ? "#4A6A7A" : "#A0B8C8",
    rodapeTexto: e ? "#6B8A9A" : "#7A9AAA",
    rodapeLink: e ? "#6B8A9A" : "#4A6A7A",
  };

  const handleSubmit = () => {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErro("Digite seu nome para continuar!");
      return;
    }
    if (nomeLimpo.length < 2) {
      setErro("Nome muito curto!");
      return;
    }
    onRegister(nomeLimpo);
  };

  const catAtual = CATEGORIAS.find((c) => c.id === categoria);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: cor.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Nunito', sans-serif",
        transition: "background 0.3s",
      }}
    >
      {/* ── Header: voltar + tema ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Botão voltar */}
        {onVoltar ? (
          <button
            onClick={onVoltar}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: cor.titulo,
              fontSize: "0.9rem",
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
              padding: "6px 10px",
              borderRadius: 10,
              transition: "opacity 0.2s",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>←</span>
            Voltar
          </button>
        ) : (
          <div />
        )}

        {/* Botão tema */}
        <button
          onClick={alternarTema}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: `2px solid ${cor.borda}`,
            background: e ? "#1A2B3C" : "#fff",
            fontSize: "1.1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {e ? "\u2600\uFE0F" : "\uD83C\uDF19"}
        </button>
      </div>

      {/* ── Conteúdo central ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 20px 24px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: "3.5rem",
            marginBottom: 12,
            animation: "flutuar 3s ease-in-out infinite",
          }}
        >
          🌿
        </div>
        <h1
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: "1.8rem",
            color: cor.titulo,
            marginBottom: 4,
            margin: 0,
          }}
        >
          EduPlay
        </h1>
        <p
          style={{
            color: cor.texto,
            marginBottom: 24,
            textAlign: "center",
            fontSize: "0.9rem",
          }}
        >
          Exploradores do Saber
        </p>

        {/* Card */}
        <div
          style={{
            background: cor.card,
            borderRadius: 24,
            padding: "28px 20px",
            width: "100%",
            maxWidth: 400,
            boxShadow: cor.cardSombra,
            transition: "background 0.3s, box-shadow 0.3s",
          }}
        >
          <h2
            style={{
              fontFamily: "'Fredoka', sans-serif",
              color: cor.titulo,
              marginBottom: 20,
              textAlign: "center",
              fontSize: "1.2rem",
              margin: "0 0 20px",
            }}
          >
            Qual é o seu nome, explorador?
          </h2>

          {/* Input nome */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontWeight: 700,
                color: cor.label,
                marginBottom: 8,
                fontSize: "0.9rem",
              }}
            >
              Seu nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={(ev) => {
                setNome(ev.target.value);
                setErro("");
              }}
              onKeyDown={(ev) => ev.key === "Enter" && handleSubmit()}
              placeholder="Ex: João, Maria..."
              maxLength={20}
              autoFocus
              style={{
                width: "100%",
                padding: "13px 16px",
                border: `3px solid ${erro ? cor.inputBordaErro : cor.inputBorda}`,
                borderRadius: 16,
                fontSize: "1rem",
                fontFamily: "'Nunito', sans-serif",
                background: cor.input,
                outline: "none",
                color: cor.inputTexto,
                boxSizing: "border-box",
                transition: "border-color 0.2s, background 0.3s",
              }}
            />
            {erro && (
              <p
                style={{
                  color: e ? "#E08080" : "#A65D5D",
                  fontSize: "0.82rem",
                  marginTop: 6,
                }}
              >
                ⚠️ {erro}
              </p>
            )}
          </div>

          {/* Seleção de avatar */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontWeight: 700,
                color: cor.label,
                marginBottom: 10,
                fontSize: "0.9rem",
              }}
            >
              Escolha seu avatar:
            </label>

            {/* Abas de categoria */}
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 12,
                overflowX: "auto",
                paddingBottom: 4,
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoria(cat.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    border: "none",
                    background:
                      categoria === cat.id ? cor.catBg : "transparent",
                    color: categoria === cat.id ? cor.catAtivo : cor.catInativo,
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grid de emojis */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
                maxHeight: 200,
                overflowY: "auto",
                paddingRight: 4,
                scrollbarWidth: "thin",
              }}
            >
              {catAtual.emojis.map((av) => (
                <button
                  key={av}
                  onClick={() => setAvatar(av)}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    background: avatar === av ? cor.avatarAtivo : cor.avatarBg,
                    border: `3px solid ${avatar === av ? cor.avatarBorda : cor.avatarBordaOff}`,
                    borderRadius: "50%",
                    fontSize: "1.6rem",
                    cursor: "pointer",
                    transform: avatar === av ? "scale(1.1)" : "scale(1)",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {nome.trim() && (
            <div
              style={{
                textAlign: "center",
                marginBottom: 16,
                padding: "10px",
                borderRadius: 12,
                background: e ? "#1A2B3C40" : "#E8F4F040",
                border: `1px solid ${cor.borda}`,
              }}
            >
              <span style={{ fontSize: "2rem" }}>{avatar}</span>
              <p
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: cor.titulo,
                  margin: "4px 0 0",
                }}
              >
                {nome.trim()}
              </p>
            </div>
          )}

          {/* Botão */}
          <button
            onClick={handleSubmit}
            style={{
              width: "100%",
              padding: 15,
              background: `linear-gradient(135deg, ${cor.botao}, ${e ? "#00A57A" : "#4A7B78"})`,
              color: cor.botaoTexto,
              border: "none",
              borderRadius: 16,
              fontSize: "1.05rem",
              fontWeight: 700,
              fontFamily: "'Fredoka', sans-serif",
              cursor: "pointer",
              letterSpacing: "0.5px",
              boxShadow: `0 4px 16px ${cor.botao}40`,
              transition: "all 0.2s",
            }}
          >
            Começar Aventura!
          </button>
        </div>
      </div>

      {/* ── Rodapé recolhível justificado ── */}
      <FooterEduPlay />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes flutuar {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Esconde scrollbar dos emojis no webkit */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #88888840; border-radius: 4px; }
      `}</style>
    </div>
  );
}
