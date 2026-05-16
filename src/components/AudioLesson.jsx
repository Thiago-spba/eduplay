import { useState, useRef, useCallback, useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";

// ── Divide roteiro em blocos por pontuação natural ──
function dividirEmBlocos(texto) {
  if (!texto) return [];
  const frases = texto
    .replace(/([.!?])\s+/g, "$1|")
    .split("|")
    .map((f) => f.trim())
    .filter((f) => f.length > 0);
  const blocos = [];
  let atual = "";
  for (const frase of frases) {
    if (atual.length + frase.length < 160) {
      atual += (atual ? " " : "") + frase;
    } else {
      if (atual) blocos.push(atual);
      atual = frase;
    }
  }
  if (atual) blocos.push(atual);
  return blocos;
}

// ── Divide texto em palavras para modo Ler ──
function dividirEmPalavras(texto) {
  if (!texto) return [];
  return texto.trim().split(/\s+/);
}

const VELOCIDADES_OUVIR = [
  { label: "🐢 Lento", rate: 0.75 },
  { label: "▶ Normal", rate: 1.0 },
  { label: "🐇 Rápido", rate: 1.3 },
];
const VELOCIDADES_LER = [
  { label: "🐢 Devagar", ms: 600 },
  { label: "▶ Normal", ms: 380 },
  { label: "🐇 Rápido", ms: 200 },
];

// ── Animação de ondas sonoras ──
function OndasSonoras() {
  return (
    <div
      style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 20 }}
    >
      {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            background: "linear-gradient(180deg, #3B82F6, #00D4AA)",
            animationName: "onda",
            animationDuration: `${0.8 + i * 0.15}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDirection: "alternate",
            animationDelay: `${i * 0.1}s`,
            height: `${h * 4}px`,
          }}
        />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════
// MODO OUVIR — Google TTS Neural
// ══════════════════════════════════════════════════
function ModoOuvir({ texto, c, velIdx, setVelIdx }) {
  const [tocando, setTocando] = useState(false);
  const [blocoAtual, setBlocoAtual] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const blocoRef = useRef(null);
  const cacheRef = useRef({});

  const blocos = dividirEmBlocos(texto);
  const total = blocos.length;
  const progresso = total > 0 ? Math.round((blocoAtual / total) * 100) : 0;

  useEffect(() => {
    if (!containerRef.current || !blocoRef.current) return;
    const cont = containerRef.current;
    const bloco = blocoRef.current;
    cont.scrollTo({
      top: Math.max(
        0,
        bloco.offsetTop - cont.clientHeight / 2 + bloco.offsetHeight / 2,
      ),
      behavior: "smooth",
    });
  }, [blocoAtual]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const lerBloco = useCallback(
    async (indice) => {
      if (indice >= total) {
        setTocando(false);
        setConcluido(true);
        return;
      }
      setBlocoAtual(indice);
      setCarregando(true);
      setErro("");
      try {
        let base64 = cacheRef.current[indice];
        if (!base64) {
          const fn = httpsCallable(
            getFunctions(undefined, "us-central1"),
            "gerarAudio",
          );
          const r = await fn({ texto: blocos[indice] });
          base64 = r.data.audioBase64;
          cacheRef.current[indice] = base64;
        }
        setCarregando(false);
        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        audio.playbackRate = VELOCIDADES_OUVIR[velIdx].rate;
        audioRef.current = audio;
        audio.onplay = () => setTocando(true);
        audio.onended = () => lerBloco(indice + 1);
        audio.onerror = () => {
          setErro("Erro ao reproduzir. Tente novamente.");
          setTocando(false);
          setCarregando(false);
        };
        await audio.play();
      } catch {
        setErro("Erro ao gerar áudio. Tente novamente.");
        setTocando(false);
        setCarregando(false);
      }
    },
    [blocos, total, velIdx],
  );

  const play = useCallback(() => {
    if (concluido) {
      setConcluido(false);
      setBlocoAtual(0);
      cacheRef.current = {};
      lerBloco(0);
    } else lerBloco(blocoAtual);
  }, [concluido, blocoAtual, lerBloco]);
  const pausar = () => {
    audioRef.current?.pause();
    setTocando(false);
  };
  const retomar = () => {
    audioRef.current?.play();
    setTocando(true);
  };
  const parar = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setTocando(false);
    setCarregando(false);
  };
  const reiniciar = useCallback(() => {
    parar();
    setBlocoAtual(0);
    setConcluido(false);
    cacheRef.current = {};
    setTimeout(() => lerBloco(0), 100);
  }, [lerBloco]);
  const mudarVel = (i) => {
    setVelIdx(i);
    if (audioRef.current)
      audioRef.current.playbackRate = VELOCIDADES_OUVIR[i].rate;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        gap: 8,
      }}
    >
      {/* Progresso */}
      <div
        style={{
          height: 5,
          background: c.borda,
          borderRadius: 3,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progresso}%`,
            background: "linear-gradient(90deg, #00D4AA, #0099FF)",
            borderRadius: 3,
            transition: "width 0.4s",
          }}
        />
      </div>

      {/* Texto com scroll interno */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          background: c.card2,
          borderRadius: 14,
          padding: "10px",
          border: `1.5px solid ${c.borda}`,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          scrollbarWidth: "thin",
        }}
      >
        {blocos.map((bloco, i) => (
          <div
            key={i}
            ref={i === blocoAtual ? blocoRef : null}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background:
                i === blocoAtual
                  ? "linear-gradient(135deg, #00D4AA22, #0099FF18)"
                  : "transparent",
              border: `1.5px solid ${i === blocoAtual ? "#00D4AA55" : "transparent"}`,
              fontSize: "clamp(0.85rem, 2.5vw, 1rem)",
              fontWeight: i === blocoAtual ? 700 : 400,
              color:
                i < blocoAtual
                  ? c.textoSub
                  : i === blocoAtual
                    ? c.texto
                    : c.textoSub,
              lineHeight: 1.6,
              transition: "all 0.3s",
              opacity: i > blocoAtual + 3 ? 0.4 : 1,
            }}
          >
            {i < blocoAtual && (
              <span
                style={{
                  color: "#00D4AA",
                  marginRight: 5,
                  fontSize: "0.75rem",
                }}
              >
                ✓
              </span>
            )}
            {bloco}
          </div>
        ))}
        {concluido && (
          <div
            style={{
              textAlign: "center",
              padding: "14px",
              background: "#00D4AA18",
              borderRadius: 12,
              border: "1.5px solid #00D4AA44",
            }}
          >
            <p
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
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

      {erro && (
        <p
          style={{
            textAlign: "center",
            fontSize: "0.75rem",
            color: "#EF4444",
            fontWeight: 700,
            margin: 0,
            flexShrink: 0,
          }}
        >
          ⚠️ {erro}
        </p>
      )}

      {/* Velocidade */}
      <div
        style={{
          display: "flex",
          gap: 6,
          justifyContent: "center",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        {VELOCIDADES_OUVIR.map((v, i) => (
          <button
            key={i}
            onClick={() => mudarVel(i)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              cursor: "pointer",
              background: velIdx === i ? "#00D4AA22" : "transparent",
              border: `1.5px solid ${velIdx === i ? "#00D4AA" : c.borda}`,
              color: velIdx === i ? "#00D4AA" : c.textoSub,
              fontSize: "clamp(0.7rem, 2vw, 0.78rem)",
              fontWeight: 700,
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
          gap: 16,
          flexShrink: 0,
        }}
      >
        <button
          onClick={reiniciar}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            cursor: "pointer",
            background: "transparent",
            border: `2px solid ${c.borda}`,
            color: c.textoSub,
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          🔄
        </button>
        <button
          onClick={
            carregando
              ? undefined
              : tocando
                ? pausar
                : concluido
                  ? play
                  : blocoAtual > 0
                    ? retomar
                    : play
          }
          style={{
            width: "clamp(56px, 10vw, 68px)",
            height: "clamp(56px, 10vw, 68px)",
            borderRadius: "50%",
            border: "none",
            cursor: carregando ? "wait" : "pointer",
            background: "linear-gradient(135deg, #00D4AA, #0099FF)",
            color: "#fff",
            fontSize: carregando ? "1.1rem" : "1.7rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,212,170,0.4)",
            transition: "all 0.2s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {carregando ? "⏳" : tocando ? "⏸" : "▶"}
        </button>
        <button
          onClick={parar}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            cursor: "pointer",
            background: "#FF6B6B15",
            border: "2px solid #FF6B6B44",
            color: "#FF6B6B",
            fontSize: "1rem",
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
// MODO LER — destaque palavra por palavra
// ══════════════════════════════════════════════════
function ModoLer({ texto, c, velIdx, setVelIdx }) {
  const [tocando, setTocando] = useState(false);
  const [idxPalavra, setIdxPalavra] = useState(-1);
  const [concluido, setConcluido] = useState(false);

  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const palavraRef = useRef(null);

  const palavras = dividirEmPalavras(texto);
  const total = palavras.length;
  const progresso =
    total > 0 && idxPalavra >= 0 ? Math.round((idxPalavra / total) * 100) : 0;

  useEffect(() => {
    if (!containerRef.current || !palavraRef.current) return;
    const cont = containerRef.current;
    const palavra = palavraRef.current;
    cont.scrollTo({
      top: Math.max(
        0,
        palavra.offsetTop - cont.clientHeight / 2 + palavra.offsetHeight / 2,
      ),
      behavior: "smooth",
    });
  }, [idxPalavra]);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const iniciar = useCallback(
    (inicio = 0) => {
      clearInterval(timerRef.current);
      let i = inicio;
      setIdxPalavra(i);
      timerRef.current = setInterval(() => {
        i++;
        if (i >= total) {
          clearInterval(timerRef.current);
          setTocando(false);
          setIdxPalavra(-1);
          setConcluido(true);
        } else setIdxPalavra(i);
      }, VELOCIDADES_LER[velIdx].ms);
    },
    [total, velIdx],
  );

  const play = useCallback(() => {
    if (concluido) {
      setConcluido(false);
      setIdxPalavra(0);
      setTocando(true);
      iniciar(0);
    } else {
      setTocando(true);
      iniciar(idxPalavra >= 0 ? idxPalavra : 0);
    }
  }, [concluido, idxPalavra, iniciar]);
  const pausar = () => {
    clearInterval(timerRef.current);
    setTocando(false);
  };
  const parar = () => {
    clearInterval(timerRef.current);
    setTocando(false);
    setIdxPalavra(-1);
  };
  const reiniciar = () => {
    parar();
    setConcluido(false);
    setTimeout(() => {
      setTocando(true);
      iniciar(0);
    }, 100);
  };
  const mudarVel = (i) => {
    setVelIdx(i);
    if (tocando) {
      pausar();
      setTimeout(() => {
        setTocando(true);
        iniciar(idxPalavra >= 0 ? idxPalavra : 0);
      }, 100);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        gap: 8,
      }}
    >
      {/* Progresso */}
      <div
        style={{
          height: 5,
          background: c.borda,
          borderRadius: 3,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progresso}%`,
            background: "linear-gradient(90deg, #3B82F6, #00D4AA)",
            borderRadius: 3,
            transition: "width 0.2s",
          }}
        />
      </div>

      {/* Texto com scroll interno */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          background: c.card2,
          borderRadius: 14,
          padding: "10px 14px",
          border: `1.5px solid ${c.borda}`,
          fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)",
          lineHeight: 2.2,
          textAlign: "justify",
          color: c.textoSub,
          scrollbarWidth: "thin",
        }}
      >
        {palavras.map((palavra, i) => (
          <span
            key={i}
            ref={i === idxPalavra ? palavraRef : null}
            style={{
              color:
                i === idxPalavra
                  ? "#fff"
                  : i < idxPalavra
                    ? c.texto
                    : c.textoSub,
              background: i === idxPalavra ? "#3B82F6" : "transparent",
              borderRadius: 5,
              padding: i === idxPalavra ? "1px 5px" : "1px 0",
              fontWeight: i === idxPalavra ? 800 : 400,
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
              marginTop: 16,
              padding: "14px",
              background: "#3B82F618",
              borderRadius: 12,
              border: "1.5px solid #3B82F644",
            }}
          >
            <p
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
                color: "#3B82F6",
                margin: 0,
                fontWeight: 700,
              }}
            >
              ✅ Leitura concluída, Agente!
            </p>
          </div>
        )}
      </div>

      {/* Velocidade */}
      <div
        style={{
          display: "flex",
          gap: 6,
          justifyContent: "center",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        {VELOCIDADES_LER.map((v, i) => (
          <button
            key={i}
            onClick={() => mudarVel(i)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              cursor: "pointer",
              background: velIdx === i ? "#3B82F622" : "transparent",
              border: `1.5px solid ${velIdx === i ? "#3B82F6" : c.borda}`,
              color: velIdx === i ? "#3B82F6" : c.textoSub,
              fontSize: "clamp(0.7rem, 2vw, 0.78rem)",
              fontWeight: 700,
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
          gap: 16,
          flexShrink: 0,
        }}
      >
        <button
          onClick={reiniciar}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            cursor: "pointer",
            background: "transparent",
            border: `2px solid ${c.borda}`,
            color: c.textoSub,
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          🔄
        </button>
        <button
          onClick={tocando ? pausar : play}
          style={{
            width: "clamp(56px, 10vw, 68px)",
            height: "clamp(56px, 10vw, 68px)",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg, #3B82F6, #6366F1)",
            color: "#fff",
            fontSize: "1.7rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
            transition: "all 0.2s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {tocando ? "⏸" : "▶"}
        </button>
        <button
          onClick={parar}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            cursor: "pointer",
            background: "#FF6B6B15",
            border: "2px solid #FF6B6B44",
            color: "#FF6B6B",
            fontSize: "1rem",
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
  const [aba, setAba] = useState("resumo");
  const [modo, setModo] = useState("ouvir"); // "ouvir" | "ler"
  const [velIdx, setVelIdx] = useState(1);
  const e = tema === "escuro";

  const resumo = missao?.resumo || "";
  const topicos = missao?.topicos || [];
  const roteiro = missao?.roteiroPodcast || "";
  const tituloMissao = missao?.titulo || "Explicação";
  const tituloPodcast = missao?.video?.titulo || "Ouvir o roteiro";
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
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "12px 16px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: `1.5px solid ${c.borda}`,
          background: e ? "#0D1820" : "#fff",
        }}
      >
        <button
          onClick={() => {
            onFechar();
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            flexShrink: 0,
            background: "#FF6B6B15",
            border: "2px solid #FF6B6B44",
            color: "#FF6B6B",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "clamp(0.62rem, 1.5vw, 0.68rem)",
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
              fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
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
            width: 36,
            height: 36,
            borderRadius: 10,
            flexShrink: 0,
            background: e ? "#1A2B3C" : "#fff",
            border: `2px solid ${c.borda}`,
            fontSize: "0.95rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {e ? "☀️" : "🌙"}
        </button>
      </div>

      {/* ABAS */}
      <div
        style={{
          display: "flex",
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
              padding: "10px 6px",
              background: aba === a.id ? "#00D4AA12" : "transparent",
              border: "none",
              borderBottom: `3px solid ${aba === a.id ? "#00D4AA" : "transparent"}`,
              color: aba === a.id ? "#00D4AA" : c.textoSub,
              fontWeight: aba === a.id ? 800 : 600,
              fontSize: "clamp(0.72rem, 2vw, 0.82rem)",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              transition: "all 0.2s",
            }}
          >
            <span>{a.icone}</span> {a.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          padding: "12px 16px",
          maxWidth: 680,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
          overflowY: aba === "ouvir" ? "hidden" : "auto",
          gap: 12,
        }}
      >
        {/* RESUMO */}
        {aba === "resumo" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #00D4AA18, #0099FF08)",
                borderRadius: 18,
                padding: "18px",
                border: "1.5px solid #00D4AA33",
              }}
            >
              <p
                style={{
                  fontSize: "clamp(0.65rem, 1.8vw, 0.7rem)",
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
                    fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
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
          </div>
        )}

        {/* TÓPICOS */}
        {aba === "topicos" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              animation: "fadeIn 0.3s ease",
            }}
          >
            <p
              style={{
                fontSize: "clamp(0.65rem, 1.8vw, 0.7rem)",
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
                    padding: "12px 14px",
                    border: `1.5px solid ${c.borda}`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "linear-gradient(135deg, #00D4AA, #0099FF)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      fontFamily: "'Fredoka', sans-serif",
                    }}
                  >
                    {i + 1}
                  </div>
                  <p
                    style={{
                      fontSize: "clamp(0.85rem, 2.5vw, 0.92rem)",
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
          </div>
        )}

        {/* OUVIR */}
        {aba === "ouvir" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
              gap: 10,
              animation: "fadeIn 0.3s ease",
            }}
          >
            {/* Seletor de modo */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => setModo("ouvir")}
                style={{
                  flex: 1,
                  padding: "9px 8px",
                  borderRadius: 12,
                  cursor: "pointer",
                  background: modo === "ouvir" ? "#00D4AA15" : "transparent",
                  border: `2px solid ${modo === "ouvir" ? "#00D4AA" : c.borda}`,
                  color: modo === "ouvir" ? "#00D4AA" : c.textoSub,
                  fontWeight: 800,
                  fontSize: "clamp(0.75rem, 2vw, 0.85rem)",
                  fontFamily: "'Nunito', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.2s",
                }}
              >
                🎧 Ouvir
              </button>
              <button
                onClick={() => setModo("ler")}
                style={{
                  flex: 1,
                  padding: "9px 8px",
                  borderRadius: 12,
                  cursor: "pointer",
                  background: modo === "ler" ? "#3B82F615" : "transparent",
                  border: `2px solid ${modo === "ler" ? "#3B82F6" : c.borda}`,
                  color: modo === "ler" ? "#3B82F6" : c.textoSub,
                  fontWeight: 800,
                  fontSize: "clamp(0.75rem, 2vw, 0.85rem)",
                  fontFamily: "'Nunito', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.2s",
                }}
              >
                📖 Ler
              </button>
            </div>

            {/* Info */}
            <div
              style={{
                background: c.card,
                borderRadius: 12,
                padding: "10px 14px",
                border: `1.5px solid ${c.borda}`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>
                {modo === "ouvir" ? "🎙️" : "📖"}
              </span>
              <div>
                <p
                  style={{
                    fontFamily: "'Fredoka', sans-serif",
                    fontSize: "clamp(0.85rem, 2vw, 0.92rem)",
                    color: c.texto,
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  {tituloPodcast}
                </p>
                <p
                  style={{
                    fontSize: "clamp(0.65rem, 1.8vw, 0.7rem)",
                    color: c.textoSub,
                    margin: 0,
                  }}
                >
                  {modo === "ouvir"
                    ? "Voz neural brasileira · Toque ▶ para ouvir"
                    : "Acompanhe palavra por palavra · Toque ▶ para iniciar"}
                </p>
              </div>
            </div>

            {/* Player */}
            {roteiro ? (
              modo === "ouvir" ? (
                <ModoOuvir
                  texto={roteiro}
                  c={c}
                  velIdx={velIdx}
                  setVelIdx={setVelIdx}
                />
              ) : (
                <ModoLer
                  texto={roteiro}
                  c={c}
                  velIdx={velIdx}
                  setVelIdx={setVelIdx}
                />
              )
            ) : (
              <div
                style={{
                  background: c.card,
                  borderRadius: 14,
                  padding: "24px",
                  textAlign: "center",
                  border: `1.5px dashed ${c.borda}`,
                  flex: 1,
                }}
              >
                <p
                  style={{ color: c.textoSub, fontSize: "0.88rem", margin: 0 }}
                >
                  Gere uma nova missão para ouvir o roteiro aqui.
                </p>
              </div>
            )}

            {/* Card Em Breve com animação */}
            <div
              style={{
                background: e
                  ? "rgba(59,130,246,0.08)"
                  : "rgba(59,130,246,0.06)",
                borderRadius: 14,
                padding: "12px 16px",
                border: "1.5px solid rgba(59,130,246,0.25)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "1.2rem" }}>🎧</span>
                  <div>
                    <p
                      style={{
                        fontSize: "clamp(0.62rem, 1.5vw, 0.68rem)",
                        fontWeight: 800,
                        color: "#3B82F6",
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Em breve
                    </p>
                    <p
                      style={{
                        fontFamily: "'Fredoka', sans-serif",
                        fontSize: "clamp(0.82rem, 2vw, 0.9rem)",
                        color: c.texto,
                        margin: 0,
                        fontWeight: 700,
                      }}
                    >
                      Podcast com Especialistas
                    </p>
                  </div>
                </div>
                <OndasSonoras />
              </div>
              <p
                style={{
                  fontSize: "clamp(0.72rem, 2vw, 0.8rem)",
                  color: c.textoSub,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Professores especialistas e pedagogos explicando cada tema de um
                jeito que você nunca vai esquecer.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes onda { from{transform:scaleY(0.3)} to{transform:scaleY(1)} }
      `}</style>
    </div>
  );
}
