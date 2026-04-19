import { useState, useEffect } from "react";
import { useTema } from "../context/ThemeContext";
import { gerarMissaoIA } from "../services/ia";
import FooterEduPlay from "../components/FooterEduPlay";

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

const PIN_KEY = "eduplay_parent_pin";
const CONFIG_KEY = "eduplay_config";

export default function RegisterPage({ onRegister, onVoltar }) {
  const { tema, alternarTema } = useTema();

  // Fluxo de Etapas: 'cadastro' -> 'pin' -> 'briefing' (se necessário)
  const [etapa, setEtapa] = useState("cadastro");

  // Dados do Estudante
  const [nome, setNome] = useState("");
  const [avatar, setAvatar] = useState("👦");
  const [categoria, setCategoria] = useState("pessoas");
  const [erro, setErro] = useState("");

  // Dados do Comandante (PIN)
  const [pinDigitado, setPinDigitado] = useState("");
  const [erroPin, setErroPin] = useState("");

  // Briefing Expresso
  const [gerandoInicial, setGerandoInicial] = useState(false);

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
    inputTexto: e ? "#D0E0E8" : "#4A4A4A",
    avatarBg: e ? "#1A2B3C" : "#EDE8DF",
    avatarAtivo: e ? "#1A3A38" : "#D4E5E4",
    avatarBorda: e ? "#00C896" : "#5A8F8C",
    botao: e ? "#00C896" : "#5A8F8C",
    alertaBg: e ? "#2A1010" : "#FDE8E8",
    alertaTexto: e ? "#FF6B6B" : "#C92A2A",
    borda: e ? "#1A2B3C" : "#E0EEF5",
  };

  const handleIrParaPin = () => {
    if (!nome.trim()) return setErro("Digite seu nome!");
    if (nome.trim().length < 2) return setErro("Nome muito curto!");
    setEtapa("pin");
  };

  const digitarPin = async (n) => {
    if (pinDigitado.length >= 4) return;
    const novoPin = pinDigitado + n;
    setPinDigitado(novoPin);
    setErroPin("");

    if (novoPin.length === 4) {
      const pinSalvo = localStorage.getItem(PIN_KEY) || "1234";
      if (novoPin === pinSalvo) {
        const temConfig = localStorage.getItem(CONFIG_KEY);
        if (temConfig) {
          onRegister(nome.trim());
        } else {
          setEtapa("briefing");
        }
      } else {
        setErroPin("PIN incorreto");
        setPinDigitado("");
      }
    }
  };

  const handleFinalizarBriefing = async (serieId) => {
    setGerandoInicial(true);
    try {
      const novaConfig = {
        serie: serieId,
        bimestre: "1bimestre",
        modo: "escola",
      };
      localStorage.setItem(CONFIG_KEY, JSON.stringify(novaConfig));

      const missao = await gerarMissaoIA({
        disciplina: "portugues",
        serie: serieId,
        bimestre: "1bimestre",
        tema: `Missão de Recrutamento para ${nome}`,
      });

      const chave = `eduplay_missoes_ia_portugues`;
      localStorage.setItem(chave, JSON.stringify([missao]));

      onRegister(nome.trim());
    } catch (err) {
      console.error("Erro no briefing:", err);
      onRegister(nome.trim());
    }
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
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
        }}
      >
        <button
          onClick={() =>
            etapa === "cadastro" ? onVoltar() : setEtapa("cadastro")
          }
          style={{
            background: "transparent",
            border: "none",
            color: cor.titulo,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ← {etapa === "cadastro" ? "Voltar" : "Cancelar"}
        </button>
        <button
          onClick={alternarTema}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: `2px solid ${cor.borda}`,
            background: e ? "#1A2B3C" : "#fff",
            cursor: "pointer",
          }}
        >
          {e ? "☀️" : "🌙"}
        </button>
      </div>

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
        <div
          style={{
            background: cor.card,
            borderRadius: 24,
            width: "100%",
            maxWidth: 400,
            boxShadow: cor.cardSombra,
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh",
            overflow: "hidden",
          }}
        >
          {/* ETAPA 1: CADASTRO */}
          {etapa === "cadastro" && (
            <>
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "28px 20px",
                  scrollbarWidth: "thin",
                }}
              >
                <h2
                  style={{
                    textAlign: "center",
                    color: cor.titulo,
                    fontFamily: "'Fredoka', sans-serif",
                    marginBottom: 20,
                  }}
                >
                  Qual o seu codinome?
                </h2>
                <input
                  type="text"
                  value={nome}
                  onChange={(ev) => {
                    setNome(ev.target.value);
                    setErro("");
                  }}
                  onKeyDown={(ev) => ev.key === "Enter" && handleIrParaPin()}
                  placeholder="Ex: Agente Alpha"
                  style={{
                    width: "100%",
                    padding: 14,
                    borderRadius: 16,
                    border: `3px solid ${erro ? cor.alertaTexto : cor.inputBorda}`,
                    background: cor.input,
                    color: cor.inputTexto,
                    outline: "none",
                    marginBottom: 20,
                  }}
                />
                {erro && (
                  <p
                    style={{
                      color: cor.alertaTexto,
                      fontSize: "0.82rem",
                      marginTop: "-12px",
                      marginBottom: "16px",
                      fontWeight: 700,
                    }}
                  >
                    ⚠️ {erro}
                  </p>
                )}

                <p
                  style={{
                    fontWeight: 700,
                    color: cor.label,
                    marginBottom: 10,
                  }}
                >
                  Escolha seu avatar:
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    overflowX: "auto",
                    marginBottom: 12,
                    scrollbarWidth: "none",
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
                        color: categoria === cat.id ? cor.botao : cor.texto,
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 8,
                  }}
                >
                  {catAtual.emojis.map((av) => (
                    <button
                      key={av}
                      onClick={() => setAvatar(av)}
                      style={{
                        aspectRatio: "1",
                        borderRadius: "50%",
                        border: `3px solid ${avatar === av ? cor.botao : "transparent"}`,
                        background: cor.avatarBg,
                        fontSize: "1.6rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "transform 0.2s",
                        transform: avatar === av ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
              <div
                style={{
                  padding: "16px 20px 24px",
                  borderTop: `1px solid ${cor.borda}`,
                  background: cor.card,
                }}
              >
                <button
                  onClick={handleIrParaPin}
                  style={{
                    width: "100%",
                    padding: 15,
                    borderRadius: 16,
                    border: "none",
                    background: cor.botao,
                    color: "#fff",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontSize: "1.05rem",
                    fontFamily: "'Fredoka', sans-serif",
                  }}
                >
                  Próximo Passo →
                </button>
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: cor.botao,
                      background: cor.catBg,
                      padding: "4px 10px",
                      borderRadius: 20,
                    }}
                  >
                    ✨ Credencial Provisória Ativa
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ETAPA 2: PIN (PROTOCOLO DO COMANDANTE) */}
          {etapa === "pin" && (
            <div
              style={{
                flex: 1,
                width: "100%",
                overflowY: "auto",
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                animation: "fadeInUp 0.3s ease",
                scrollbarWidth: "thin",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 80,
                  height: 80,
                  margin: "0 auto 12px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    animation: "girarEstrelas 10s linear infinite",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "-5%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "1.2rem",
                      animation: "piscarEstrela 2s infinite",
                    }}
                  >
                    ⭐
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      bottom: "15%",
                      left: "-10%",
                      fontSize: "0.9rem",
                      animation: "piscarEstrela 2s infinite 0.6s",
                    }}
                  >
                    ⭐
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      bottom: "15%",
                      right: "-10%",
                      fontSize: "0.9rem",
                      animation: "piscarEstrela 2s infinite 1.2s",
                    }}
                  >
                    ⭐
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "3.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  🪖
                </div>
              </div>
              <h2
                style={{
                  color: cor.alertaTexto,
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: "1.3rem",
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                Protocolo do Comandante
              </h2>

              <div
                style={{
                  background: cor.alertaBg,
                  padding: "12px 16px",
                  borderRadius: 12,
                  marginBottom: 20,
                  border: `1px solid ${cor.alertaTexto}40`,
                  width: "100%",
                }}
              >
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: cor.alertaTexto,
                    fontWeight: 800,
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  ⚠️ SEGURANÇA MÁXIMA
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: cor.alertaTexto,
                    margin: "6px 0 0",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  Base do Instituto bloqueada. Aguardando autorização do
                  Comandante-Chefe para liberar o novo Agente.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background:
                        pinDigitado.length > i ? cor.botao : "transparent",
                      border: `2px solid ${cor.borda}`,
                      transition: "all 0.15s",
                    }}
                  />
                ))}
              </div>

              {erroPin && (
                <p
                  style={{
                    color: cor.alertaTexto,
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    marginBottom: 16,
                    textAlign: "center",
                  }}
                >
                  {erroPin}
                </p>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 10,
                  width: "100%",
                  maxWidth: 260,
                  paddingBottom: 10,
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"].map((n, i) =>
                  n !== null ? (
                    <button
                      key={i}
                      onClick={() =>
                        n === "⌫" ? apagarPin() : digitarPin(String(n))
                      }
                      style={{
                        height: "60px",
                        borderRadius: 14,
                        border: `1.5px solid ${cor.borda}`,
                        background: cor.input,
                        color: cor.titulo,
                        fontSize: "1.2rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {n}
                    </button>
                  ) : (
                    <div key={i} />
                  ),
                )}
              </div>
            </div>
          )}

          {/* ETAPA 3: BRIEFING EXPRESSO */}
          {etapa === "briefing" && (
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "32px 20px",
                textAlign: "center",
                scrollbarWidth: "thin",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>📋</div>
              <h2
                style={{
                  color: cor.titulo,
                  fontFamily: "'Fredoka', sans-serif",
                }}
              >
                Briefing de Missão
              </h2>
              <p
                style={{
                  color: cor.texto,
                  fontSize: "0.9rem",
                  marginBottom: 24,
                }}
              >
                Comandante, defina o nível escolar para calibrarmos os desafios
                do Agente <strong>{nome}</strong>:
              </p>

              {gerandoInicial ? (
                <div style={{ padding: 20 }}>
                  <div
                    style={{
                      fontSize: "2rem",
                      animation: "spin 2s linear infinite",
                    }}
                  >
                    ⚙️
                  </div>
                  <p
                    style={{ marginTop: 12, color: cor.botao, fontWeight: 700 }}
                  >
                    Gerando primeira missão...
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  {["6ano", "7ano", "8ano", "9ano"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleFinalizarBriefing(s)}
                      style={{
                        padding: "18px 10px",
                        borderRadius: 16,
                        border: `2px solid ${cor.botao}44`,
                        background: cor.input,
                        color: cor.titulo,
                        fontWeight: 800,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {s.replace("ano", "º Ano")}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <FooterEduPlay />
      <style>{`
        @keyframes girarEstrelas { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes flutuar { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes piscarEstrela { 0%, 100% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.3); filter: drop-shadow(0 0 4px rgba(255,215,0,0.8)); } }
      `}</style>
    </div>
  );
}
