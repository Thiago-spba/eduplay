import { useState, useEffect, useRef, useCallback } from "react";

const VELOCIDADES = [
  { label: "🐢 Lento", value: 0.85 },
  { label: "▶ Normal", value: 1.0 },
  { label: "🐇 Rápido", value: 1.25 },
];

// ── Player TTS com karaokê ──
function PlayerKaraoke({ texto, tema, c }) {
  const [tocando, setTocando] = useState(false);
  const [idx, setIdx] = useState(-1);
  const [velIdx, setVelIdx] = useState(1);
  const [concluido, setConcluido] = useState(false);
  const timerRef = useRef(null);
  const speechRef = useRef(null);
  const palavraRef = useRef(null);

  const palavras = texto ? texto.trim().split(/\s+/) : [];
  const total = palavras.length;
  const progresso = total > 0 && idx >= 0 ? Math.round((idx / total) * 100) : 0;

  useEffect(() => {
    if (palavraRef.current) {
      palavraRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [idx]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const parar = useCallback(() => {
    clearInterval(timerRef.current);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setTocando(false);
  }, []);

  const iniciarDestaque = useCallback(
    (inicio = 0) => {
      clearInterval(timerRef.current);
      if (total === 0) return;
      let i = inicio;
      setIdx(i);
      const msPerPalavra =
        VELOCIDADES[velIdx].value === 0.85
          ? 520
          : VELOCIDADES[velIdx].value === 1.25
            ? 280
            : 380;
      timerRef.current = setInterval(() => {
        i++;
        if (i >= total) {
          clearInterval(timerRef.current);
          setTocando(false);
          setIdx(-1);
          setConcluido(true);
        } else {
          setIdx(i);
        }
      }, msPerPalavra);
    },
    [total, velIdx],
  );

  const play = useCallback(() => {
    if (total === 0) return;
    if (concluido) {
      setConcluido(false);
      setIdx(-1);
    }
    setTocando(true);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "pt-BR";
      u.rate = VELOCIDADES[velIdx].value;
      const vozes = window.speechSynthesis.getVoices();
      const voz =
        vozes.find(
          (v) => v.lang?.startsWith("pt") && v.name.includes("Google"),
        ) || vozes.find((v) => v.lang?.startsWith("pt"));
      if (voz) u.voice = voz;
      u.onend = () => {
        setTocando(false);
        setIdx(-1);
        setConcluido(true);
      };
      speechRef.current = u;
      window.speechSynthesis.speak(u);
    }
    iniciarDestaque(idx >= 0 ? idx : 0);
  }, [velIdx, idx, iniciarDestaque, concluido, total, texto]);

  const pausar = useCallback(() => {
    clearInterval(timerRef.current);
    if (window.speechSynthesis) window.speechSynthesis.pause();
    setTocando(false);
  }, []);

  const retomar = useCallback(() => {
    setTocando(true);
    if (window.speechSynthesis) window.speechSynthesis.resume();
    iniciarDestaque(idx);
  }, [idx, iniciarDestaque]);

  const reiniciar = useCallback(() => {
    parar();
    setIdx(-1);
    setConcluido(false);
    setTimeout(() => play(), 100);
  }, [parar, play]);

  const mudarVel = (i) => {
    setVelIdx(i);
    if (tocando) {
      parar();
      setTimeout(() => play(), 100);
    }
  };

  const e = tema === "escuro";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Barra de progresso */}
      <div
        style={{
          height: 6,
          background: c.borda,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progresso}%`,
            background: "linear-gradient(90deg, #00D4AA, #0099FF)",
            borderRadius: 3,
            transition: "width 0.3s",
          }}
        />
      </div>

      {/* Texto com karaokê */}
      <div
        style={{
          background: c.card2,
          borderRadius: 16,
          padding: "20px",
          maxHeight: 260,
          overflowY: "auto",
          border: `1.5px solid ${c.borda}`,
          lineHeight: 2,
          fontSize: "0.95rem",
          textAlign: "justify",
        }}
      >
        {palavras.map((palavra, i) => (
          <span
            key={i}
            ref={i === idx ? palavraRef : null}
            style={{
              color: i === idx ? "#fff" : i < idx ? c.texto : c.textoSub,
              background: i === idx ? "#00D4AA" : "transparent",
              borderRadius: 4,
              padding: i === idx ? "1px 5px" : "1px 0",
              fontWeight: i === idx ? 800 : 500,
              transition: "all 0.1s",
            }}
          >
            {palavra}{" "}
          </span>
        ))}

        {concluido && (
          <div
            style={{
              textAlign: "center",
              marginTop: 20,
              padding: "14px",
              background: "#00D4AA18",
              borderRadius: 12,
              border: "1.5px solid #00D4AA44",
            }}
          >
            <p
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "1rem",
                color: "#00D4AA",
                margin: 0,
                fontWeight: 700,
              }}
            >
              ✅ Missão registrada, Agente!
            </p>
          </div>
        )}
      </div>

      {/* Velocidade */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
        {VELOCIDADES.map((v, i) => (
          <button
            key={i}
            onClick={() => mudarVel(i)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              background: velIdx === i ? "#00D4AA22" : "transparent",
              border: `1.5px solid ${velIdx === i ? "#00D4AA" : c.borda}`,
              color: velIdx === i ? "#00D4AA" : c.textoSub,
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Controles */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
        }}
      >
        <button
          onClick={reiniciar}
          disabled={total === 0}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "transparent",
            border: `2px solid ${c.borda}`,
            color: c.textoSub,
            fontSize: "1.2rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          🔄
        </button>

        <button
          onClick={tocando ? pausar : idx >= 0 ? retomar : play}
          disabled={total === 0}
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg, #00D4AA, #0099FF)",
            color: "#fff",
            fontSize: "1.8rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,212,170,0.4)",
          }}
        >
          {tocando ? "⏸" : "▶"}
        </button>

        <button
          onClick={parar}
          disabled={total === 0}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#FF6B6B15",
            border: "2px solid #FF6B6B44",
            color: "#FF6B6B",
            fontSize: "1.2rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ⏹
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════
export default function AudioLesson({
  missao,
  onFechar,
  tema,
  alternarTema,
  c,
}) {
  const [aba, setAba] = useState("resumo"); // resumo | topicos | ouvir

  const e = tema === "escuro";

  // Extrai os dados da missão
  const resumo = missao?.resumo || "";
  const topicos = missao?.topicos || [];
  const roteiro = missao?.roteiroPodcast || "";
  const tituloMissao = missao?.titulo || "Explicação";
  const tituloPodcast = missao?.video?.titulo || "Ouvir o roteiro";

  // Fallback: se não tem resumo ainda (missões antigas), usa o roteiroPodcast
  const textoResumo = resumo || roteiro;

  const ABAS = [
    { id: "resumo", icone: "📖", label: "Resumo" },
    { id: "topicos", icone: "🔍", label: "Tópicos" },
    { id: "ouvir", icone: "🎙️", label: "Ouvir" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: e ? "#0A0F14" : "#F4F7F9",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: `1.5px solid ${c.borda}`,
          background: e ? "#0D1820" : "#fff",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onFechar}
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "#FF6B6B15",
            border: "2px solid #FF6B6B44",
            color: "#FF6B6B",
            fontSize: "1.1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ✕
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.68rem",
              color: "#00D4AA",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            🎙️ Explicação
          </div>
          <div
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1rem",
              color: c.texto,
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {tituloMissao}
          </div>
        </div>

        <button
          onClick={alternarTema}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: e ? "#1A2B3C" : "#fff",
            border: `2px solid ${c.borda}`,
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {e ? "☀️" : "🌙"}
        </button>
      </div>

      {/* ── ABAS ── */}
      <div
        style={{
          display: "flex",
          gap: 0,
          flexShrink: 0,
          borderBottom: `1.5px solid ${c.borda}`,
          background: e ? "#0D1820" : "#fff",
        }}
      >
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            style={{
              flex: 1,
              padding: "12px 8px",
              background: aba === a.id ? "#00D4AA12" : "transparent",
              border: "none",
              borderBottom: `3px solid ${aba === a.id ? "#00D4AA" : "transparent"}`,
              color: aba === a.id ? "#00D4AA" : c.textoSub,
              fontWeight: aba === a.id ? 800 : 600,
              fontSize: "0.82rem",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              transition: "all 0.2s",
            }}
          >
            <span>{a.icone}</span> {a.label}
          </button>
        ))}
      </div>

      {/* ── CONTEÚDO ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          maxWidth: 640,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* ABA RESUMO */}
        {aba === "resumo" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div
              style={{
                background: `linear-gradient(135deg, #00D4AA18, #0099FF08)`,
                borderRadius: 18,
                padding: "20px",
                border: "1.5px solid #00D4AA33",
              }}
            >
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: "#00D4AA",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  margin: "0 0 10px",
                }}
              >
                📖 Entenda o assunto
              </p>
              {textoResumo ? (
                <p
                  style={{
                    fontSize: "1rem",
                    color: c.texto,
                    lineHeight: 1.8,
                    margin: 0,
                    whiteSpace: "pre-line",
                  }}
                >
                  {textoResumo}
                </p>
              ) : (
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: c.textoSub,
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  Gere uma nova missão para ver o resumo aqui.
                </p>
              )}
            </div>

            <div
              style={{
                background: c.card,
                borderRadius: 14,
                padding: "14px 16px",
                border: `1.5px solid ${c.borda}`,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "0.78rem",
                  color: c.textoSub,
                  margin: "0 0 10px",
                }}
              >
                Quer ouvir a explicação completa?
              </p>
              <button
                onClick={() => setAba("ouvir")}
                style={{
                  padding: "10px 24px",
                  borderRadius: 20,
                  border: "none",
                  background: "linear-gradient(135deg, #00D4AA, #0099FF)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                🎙️ Ouvir agora
              </button>
            </div>
          </div>
        )}

        {/* ABA TÓPICOS */}
        {aba === "topicos" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              animation: "fadeIn 0.3s ease",
            }}
          >
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 800,
                color: c.textoSub,
                textTransform: "uppercase",
                letterSpacing: 1,
                margin: 0,
              }}
            >
              🔍 O que você vai descobrir
            </p>
            {topicos.length > 0 ? (
              topicos.map((topico, i) => (
                <div
                  key={i}
                  style={{
                    background: c.card,
                    borderRadius: 14,
                    padding: "14px 16px",
                    border: `1.5px solid ${c.borda}`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    animation: `fadeIn 0.${3 + i}s ease`,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "linear-gradient(135deg, #00D4AA, #0099FF)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "0.78rem",
                      fontFamily: "'Fredoka', sans-serif",
                    }}
                  >
                    {i + 1}
                  </div>
                  <p
                    style={{
                      fontSize: "0.92rem",
                      color: c.texto,
                      margin: 0,
                      lineHeight: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    {topico}
                  </p>
                </div>
              ))
            ) : (
              <div
                style={{
                  background: c.card,
                  borderRadius: 14,
                  padding: "24px",
                  textAlign: "center",
                  border: `1.5px dashed ${c.borda}`,
                }}
              >
                <p
                  style={{ color: c.textoSub, fontSize: "0.88rem", margin: 0 }}
                >
                  Gere uma nova missão para ver os tópicos aqui.
                </p>
              </div>
            )}

            <div
              style={{
                background: c.card,
                borderRadius: 14,
                padding: "14px 16px",
                border: `1.5px solid ${c.borda}`,
                textAlign: "center",
                marginTop: 4,
              }}
            >
              <p
                style={{
                  fontSize: "0.78rem",
                  color: c.textoSub,
                  margin: "0 0 10px",
                }}
              >
                Quer ouvir sobre cada um desses tópicos?
              </p>
              <button
                onClick={() => setAba("ouvir")}
                style={{
                  padding: "10px 24px",
                  borderRadius: 20,
                  border: "none",
                  background: "linear-gradient(135deg, #00D4AA, #0099FF)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                🎙️ Ouvir o roteiro completo
              </button>
            </div>
          </div>
        )}

        {/* ABA OUVIR */}
        {aba === "ouvir" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div
              style={{
                background: c.card,
                borderRadius: 14,
                padding: "12px 16px",
                border: `1.5px solid ${c.borda}`,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: "1.4rem" }}>🎙️</span>
              <div>
                <p
                  style={{
                    fontFamily: "'Fredoka', sans-serif",
                    fontSize: "0.95rem",
                    color: c.texto,
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  {tituloPodcast}
                </p>
                <p
                  style={{ fontSize: "0.72rem", color: c.textoSub, margin: 0 }}
                >
                  Narrado pela IA · Leitura acompanhada palavra por palavra
                </p>
              </div>
            </div>

            {roteiro ? (
              <PlayerKaraoke texto={roteiro} tema={tema} c={c} />
            ) : (
              <div
                style={{
                  background: c.card,
                  borderRadius: 14,
                  padding: "24px",
                  textAlign: "center",
                  border: `1.5px dashed ${c.borda}`,
                }}
              >
                <p
                  style={{ color: c.textoSub, fontSize: "0.88rem", margin: 0 }}
                >
                  Gere uma nova missão para ouvir o roteiro aqui.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
