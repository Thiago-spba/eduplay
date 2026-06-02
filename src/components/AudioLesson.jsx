import { useState, useRef, useCallback, useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

function dividirEmPalavras(texto) {
  return texto?.trim().split(/\s+/) || [];
}

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
    if (atual.length + frase.length < 200) {
      atual += (atual ? " " : "") + frase;
    } else {
      if (atual) blocos.push(atual);
      atual = frase;
    }
  }
  if (atual) blocos.push(atual);
  return blocos;
}

const VEL_OUVIR = [
  { label: "🐢 Lento", rate: 0.75 },
  { label: "▶ Normal", rate: 1.0 },
  { label: "🐇 Rápido", rate: 1.3 },
];
const VEL_LER = [
  { label: "🐢 Devagar", ms: 600 },
  { label: "▶ Normal", ms: 380 },
  { label: "🐇 Rápido", ms: 200 },
];

const FRASES = [
  "🎧 Ouça e acompanhe cada palavra",
  "🧠 Conhecimento que entra pelos ouvidos",
  "🚀 Aprender nunca foi tão interessante",
  "✨ Cada palavra foi pensada para você",
  "🔍 Descubra o que está por trás do tema",
];

function FraseAnimada({ c }) {
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const iv = setInterval(() => {
      setVis(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % FRASES.length);
        setVis(true);
      }, 400);
    }, 3000);
    return () => clearInterval(iv);
  }, []);
  return (
    <p
      style={{
        fontSize: "clamp(0.68rem, 2vw, 0.76rem)",
        color: "#00D4AA",
        margin: 0,
        fontWeight: 700,
        fontStyle: "italic",
        opacity: vis ? 1 : 0,
        transition: "opacity 0.4s ease",
        minHeight: "1.1em",
      }}
    >
      {FRASES[idx]}
    </p>
  );
}

function OndasSonoras() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 3,
        height: 18,
        flexShrink: 0,
      }}
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
            height: `${h * 3}px`,
          }}
        />
      ))}
    </div>
  );
}

// ── Controles compactos reutilizáveis ──
function Controles({
  tocando,
  carregando,
  play,
  pausar,
  parar,
  reiniciar,
  velIdx,
  setVelIdx,
  mudarVel,
  velocidades,
  cor,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={reiniciar}
        title="Reiniciar"
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          cursor: "pointer",
          background: "transparent",
          border: "1.5px solid rgba(128,128,128,0.3)",
          color: "rgba(128,128,128,0.7)",
          fontSize: "0.82rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        🔄
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 50,
          border: "1.5px solid rgba(128,128,128,0.2)",
          overflow: "hidden",
          background: "rgba(128,128,128,0.06)",
        }}
      >
        {velocidades.map((v, i) => (
          <button
            key={i}
            onClick={() => mudarVel(i)}
            style={{
              padding: "7px 12px",
              background: velIdx === i ? cor : "transparent",
              border: "none",
              color: velIdx === i ? "#fff" : "rgba(128,128,128,0.7)",
              fontSize: "clamp(0.63rem, 1.8vw, 0.7rem)",
              fontWeight: velIdx === i ? 800 : 500,
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      <button
        onClick={carregando ? undefined : tocando ? pausar : play}
        style={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          border: "none",
          cursor: carregando ? "wait" : "pointer",
          background: `linear-gradient(135deg, ${cor}, ${cor}99)`,
          color: "#fff",
          fontSize: carregando ? "0.95rem" : "1.4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 16px ${cor}44`,
          transition: "all 0.2s",
          flexShrink: 0,
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {carregando ? "⏳" : tocando ? "⏸" : "▶"}
      </button>

      <button
        onClick={parar}
        title="Parar"
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          cursor: "pointer",
          background: "rgba(239,68,68,0.08)",
          border: "1.5px solid rgba(239,68,68,0.25)",
          color: "#EF4444",
          fontSize: "0.82rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ⏹
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════
// PLAYER PODCAST REAL
// ══════════════════════════════════════════════════
function PlayerPodcast({ podcast, c, audioAtivo, setAudioAtivo }) {
  const [tocando, setTocando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [tempo, setTempo] = useState("0:00");
  const [duracao, setDuracao] = useState("--:--");
  const audioRef = useRef(null);

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${Math.floor(s % 60)
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    const audio = new Audio(podcast.url);
    audioRef.current = audio;
    audio.onloadedmetadata = () => setDuracao(fmt(audio.duration));
    audio.ontimeupdate = () => {
      setProgresso(
        audio.duration ? (audio.currentTime / audio.duration) * 100 : 0,
      );
      setTempo(fmt(audio.currentTime));
    };
    audio.onended = () => {
      setTocando(false);
      setProgresso(0);
      setTempo("0:00");
    };
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [podcast.url]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (tocando) {
      audioRef.current.pause();
      setTocando(false);
      setAudioAtivo("podcast-pausado");
    } else {
      if (audioAtivo === "tts-tocando") return;
      setAudioAtivo("podcast-tocando");
      audioRef.current.play();
      setTocando(true);
    }
  };
  const seek = (ev) => {
    if (!audioRef.current?.duration) return;
    const r = ev.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime =
      ((ev.clientX - r.left) / r.width) * audioRef.current.duration;
  };
  const skip = (s) => {
    if (audioRef.current)
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(
          audioRef.current.duration || 0,
          audioRef.current.currentTime + s,
        ),
      );
  };

  return (
    <div
      style={{
        background: c.card,
        borderRadius: 14,
        padding: "14px",
        border: `1.5px solid ${c.borda}`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div>
        <p
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: "clamp(0.88rem, 2vw, 1rem)",
            color: c.texto,
            margin: "0 0 2px",
            fontWeight: 700,
          }}
        >
          {podcast.titulo}
        </p>
        <p
          style={{
            fontSize: "clamp(0.68rem, 1.8vw, 0.75rem)",
            color: c.textoSub,
            margin: 0,
          }}
        >
          {podcast.descricao}
        </p>
      </div>
      <div
        onClick={seek}
        style={{
          height: 6,
          background: c.borda,
          borderRadius: 3,
          overflow: "hidden",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progresso}%`,
            background: "linear-gradient(90deg, #00D4AA, #0099FF)",
            borderRadius: 3,
            transition: "width 0.2s",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.7rem", color: c.textoSub }}>{tempo}</span>
        <span style={{ fontSize: "0.7rem", color: c.textoSub }}>{duracao}</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          onClick={() => skip(-10)}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            cursor: "pointer",
            background: "transparent",
            border: `1.5px solid ${c.borda}`,
            color: c.textoSub,
            fontSize: "0.68rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          -10s
        </button>
        <button
          onClick={toggle}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg, #00D4AA, #0099FF)",
            color: "#fff",
            fontSize: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,212,170,0.4)",
            transition: "all 0.2s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {tocando ? "⏸" : "▶"}
        </button>
        <button
          onClick={() => skip(10)}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            cursor: "pointer",
            background: "transparent",
            border: `1.5px solid ${c.borda}`,
            color: c.textoSub,
            fontSize: "0.68rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          +10s
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// MODO OUVIR — TTS sincronizado por palavra
// ══════════════════════════════════════════════════
function ModoOuvir({ texto, c, velIdx, setVelIdx, audioAtivo, setAudioAtivo }) {
  const [tocando, setTocando] = useState(false);
  const [idxPalavra, setIdxPalavra] = useState(-1);
  const [concluido, setConcluido] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [progresso, setProgresso] = useState(0);

  const audioRef = useRef(null);
  const pausadoRef = useRef(false);
  const blocoIdxRef = useRef(0);
  const cacheRef = useRef({});
  const containerRef = useRef(null);
  const palavraRef = useRef(null);

  const palavras = dividirEmPalavras(texto);
  const blocos = dividirEmBlocos(texto);
  const totalPalavras = palavras.length;

  // Mapa bloco → índice inicial de palavra
  const blocoMapRef = useRef([]);
  useEffect(() => {
    let idx = 0;
    blocoMapRef.current = blocos.map((b) => {
      const s = idx;
      idx += dividirEmPalavras(b).length;
      return s;
    });
  }, [blocos.length]);

  useEffect(() => {
    if (!containerRef.current || !palavraRef.current) return;
    const cont = containerRef.current;
    const p = palavraRef.current;
    cont.scrollTo({
      top: Math.max(
        0,
        p.offsetTop - cont.clientHeight / 2 + p.offsetHeight / 2,
      ),
      behavior: "smooth",
    });
  }, [idxPalavra]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const lerBloco = useCallback(
    async (idx) => {
      if (idx >= blocos.length) {
        setTocando(false);
        setConcluido(true);
        setIdxPalavra(totalPalavras - 1);
        return;
      }
      blocoIdxRef.current = idx;
      setCarregando(true);
      setErro("");
      const palavraInicial = blocoMapRef.current[idx] || 0;
      const palavrasBloco = dividirEmPalavras(blocos[idx]);
      try {
        let base64 = cacheRef.current[idx];
        if (!base64) {
          const r = await httpsCallable(
            getFunctions(undefined, "us-central1"),
            "gerarAudio",
          )({ texto: blocos[idx] });
          base64 = r.data.audioBase64;
          cacheRef.current[idx] = base64;
        }
        setCarregando(false);
        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        audio.playbackRate = VEL_OUVIR[velIdx].rate;
        audioRef.current = audio;
        pausadoRef.current = false;
        // Calcula ms por palavra baseado na duração real do áudio
        audio.onloadedmetadata = () => {
          if (!audio.duration || palavrasBloco.length === 0) return;
          const msPorPalavra = (audio.duration * 1000) / palavrasBloco.length;
          let idxLocal = 0;
          const timer = setInterval(() => {
            if (idxLocal >= palavrasBloco.length) {
              clearInterval(timer);
              return;
            }
            const global = palavraInicial + idxLocal;
            setIdxPalavra(global);
            setProgresso(Math.round((global / totalPalavras) * 100));
            idxLocal++;
          }, msPorPalavra);
          audio._syncTimer = timer;
        };
        audio.ontimeupdate = () => {};
        audio.onplay = () => {
          setTocando(true);
          setIdxPalavra(palavraInicial);
        };
        audio.onended = () => lerBloco(idx + 1);
        audio.onerror = () => {
          setErro("Erro ao reproduzir.");
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
    [blocos, totalPalavras, velIdx],
  );

  const play = useCallback(() => {
    if (audioAtivo === "podcast-tocando") return; // bloqueia só se podcast TOCANDO
    setAudioAtivo("tts-tocando");
    if (concluido) {
      setConcluido(false);
      setIdxPalavra(-1);
      setProgresso(0);
      cacheRef.current = {};
      blocoIdxRef.current = 0;
      lerBloco(0);
    } else if (pausadoRef.current && audioRef.current) {
      pausadoRef.current = false;
      audioRef.current.play();
      setTocando(true);
    } else lerBloco(blocoIdxRef.current);
  }, [concluido, lerBloco, audioAtivo]);

  const pausar = () => {
    if (audioRef.current?._syncTimer)
      clearInterval(audioRef.current._syncTimer);
    audioRef.current?.pause();
    pausadoRef.current = true;
    setTocando(false);
    setAudioAtivo("tts-pausado");
  };
  const parar = () => {
    if (audioRef.current?._syncTimer)
      clearInterval(audioRef.current._syncTimer);
    audioRef.current?.pause();
    audioRef.current = null;
    pausadoRef.current = false;
    setTocando(false);
    setCarregando(false);
    setIdxPalavra(-1);
    setProgresso(0);
    blocoIdxRef.current = 0;
    setAudioAtivo(null);
  };
  const reiniciar = useCallback(() => {
    parar();
    setConcluido(false);
    cacheRef.current = {};
    setTimeout(() => lerBloco(0), 100);
  }, [lerBloco]);
  const mudarVel = (i) => {
    setVelIdx(i);
    if (audioRef.current) audioRef.current.playbackRate = VEL_OUVIR[i].rate;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          height: 4,
          background: "rgba(128,128,128,0.15)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progresso}%`,
            background: "linear-gradient(90deg, #00D4AA, #0099FF)",
            borderRadius: 2,
            transition: "width 0.3s",
          }}
        />
      </div>

      <div
        style={{
          height: "clamp(160px, 30vh, 240px)",
          overflowY: "auto",
          overflowX: "hidden",
          background: c.card2,
          borderRadius: 14,
          padding: "12px 14px",
          border: `1.5px solid ${c.borda}`,
          fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)",
          lineHeight: 1.8,
          color: c.texto,
          scrollbarWidth: "thin",
        }}
      >
        <p style={{ margin: 0, whiteSpace: "pre-line" }}>{texto}</p>
        {concluido && (
          <div
            style={{
              textAlign: "center",
              marginTop: 14,
              padding: "10px",
              background: "#00D4AA18",
              borderRadius: 10,
              border: "1.5px solid #00D4AA44",
            }}
          >
            <p
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "clamp(0.88rem, 2vw, 1rem)",
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
            fontSize: "0.72rem",
            color: "#EF4444",
            fontWeight: 700,
            margin: 0,
          }}
        >
          ⚠️ {erro}
        </p>
      )}

      <Controles
        tocando={tocando}
        carregando={carregando}
        play={play}
        pausar={pausar}
        parar={parar}
        reiniciar={reiniciar}
        velIdx={velIdx}
        setVelIdx={setVelIdx}
        mudarVel={mudarVel}
        velocidades={VEL_OUVIR}
        cor="#00D4AA"
      />
    </div>
  );
}

// ══════════════════════════════════════════════════
// MODO LER — destaque palavra por palavra
// ══════════════════════════════════════════════════
function ModoLer({ texto, c, velIdx, setVelIdx, audioAtivo, setAudioAtivo }) {
  const [tocando, setTocando] = useState(false);
  const [idxPalavra, setIdxPalavra] = useState(0);
  const [concluido, setConcluido] = useState(false);

  const timerRef = useRef(null);
  const idxRef = useRef(0);
  const containerRef = useRef(null);
  const palavraRef = useRef(null);

  const palavras = dividirEmPalavras(texto);
  const total = palavras.length;
  const progresso = total > 0 ? Math.round((idxPalavra / total) * 100) : 0;

  useEffect(() => {
    if (!containerRef.current || !palavraRef.current) return;
    const cont = containerRef.current;
    const p = palavraRef.current;
    cont.scrollTo({
      top: Math.max(
        0,
        p.offsetTop - cont.clientHeight / 2 + p.offsetHeight / 2,
      ),
      behavior: "smooth",
    });
  }, [idxPalavra]);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const iniciarTimer = useCallback(
    (inicio) => {
      clearInterval(timerRef.current);
      idxRef.current = inicio;
      timerRef.current = setInterval(() => {
        idxRef.current++;
        if (idxRef.current >= total) {
          clearInterval(timerRef.current);
          setTocando(false);
          setIdxPalavra(total - 1);
          setConcluido(true);
        } else setIdxPalavra(idxRef.current);
      }, VEL_LER[velIdx].ms);
    },
    [total, velIdx],
  );

  const play = useCallback(() => {
    if (audioAtivo === "podcast-tocando") return;
    setAudioAtivo("tts-tocando");
    if (concluido) {
      setConcluido(false);
      setIdxPalavra(0);
      idxRef.current = 0;
      setTocando(true);
      iniciarTimer(0);
    } else {
      setTocando(true);
      iniciarTimer(idxRef.current);
    }
  }, [concluido, iniciarTimer, audioAtivo]);
  const pausar = () => {
    clearInterval(timerRef.current);
    setTocando(false);
  };
  const parar = () => {
    clearInterval(timerRef.current);
    setTocando(false);
    setIdxPalavra(0);
    idxRef.current = 0;
    setAudioAtivo(null);
  };
  const reiniciar = useCallback(() => {
    parar();
    setConcluido(false);
    setTimeout(() => {
      setTocando(true);
      iniciarTimer(0);
    }, 100);
  }, [iniciarTimer]);
  const mudarVel = (i) => {
    setVelIdx(i);
    if (tocando) {
      clearInterval(timerRef.current);
      setTimeout(() => iniciarTimer(idxRef.current), 50);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          height: 4,
          background: "rgba(128,128,128,0.15)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progresso}%`,
            background: "linear-gradient(90deg, #3B82F6, #00D4AA)",
            borderRadius: 2,
            transition: "width 0.15s",
          }}
        />
      </div>

      <div
        ref={containerRef}
        style={{
          height: "clamp(160px, 30vh, 240px)",
          overflowY: "auto",
          overflowX: "hidden",
          background: c.card2,
          borderRadius: 14,
          padding: "12px 14px",
          border: `1.5px solid ${c.borda}`,
          fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)",
          lineHeight: 2.2,
          textAlign: "justify",
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
              borderRadius: 4,
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
              marginTop: 12,
              padding: "10px",
              background: "#3B82F618",
              borderRadius: 10,
              border: "1.5px solid #3B82F644",
            }}
          >
            <p
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "clamp(0.88rem, 2vw, 1rem)",
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

      <Controles
        tocando={tocando}
        carregando={false}
        play={play}
        pausar={pausar}
        parar={parar}
        reiniciar={reiniciar}
        velIdx={velIdx}
        setVelIdx={setVelIdx}
        mudarVel={mudarVel}
        velocidades={VEL_LER}
        cor="#3B82F6"
      />
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
  const [modo, setModo] = useState("ouvir");
  const [velIdx, setVelIdx] = useState(1);
  const [audioAtivo, setAudioAtivo] = useState(null); // "tts" | "podcast" | null
  const [podcast, setPodcast] = useState(null);
  const [buscando, setBuscando] = useState(true);
  const e = tema === "escuro";

  const resumo = missao?.resumo || "";
  const topicos = missao?.topicos || [];
  const roteiro = missao?.roteiroPodcast || "";
  const tituloMissao = missao?.titulo || "Explicação";
  const textoResumo = resumo || roteiro;

  useEffect(() => {
    const buscar = async () => {
      if (!missao?.disciplina) {
        setBuscando(false);
        return;
      }
      try {
        const serie =
          missao.serie || localStorage.getItem("eduplay_serie") || "6ano";
        const bimestre = missao.bimestre || "1bimestre";
        const q = query(
          collection(db, "podcasts"),
          where("disciplina", "==", missao.disciplina),
          where("serie", "==", serie),
          where("bimestre", "==", bimestre),
        );
        const snap = await getDocs(q);
        if (!snap.empty)
          setPodcast({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } catch (err) {
        console.error("Erro ao buscar podcast:", err);
      } finally {
        setBuscando(false);
      }
    };
    buscar();
  }, [missao]);

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
          padding: "10px 14px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: `1.5px solid ${c.borda}`,
          background: e ? "#0D1820" : "#fff",
        }}
      >
        <button
          onClick={onFechar}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
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
              fontSize: "clamp(0.6rem, 1.5vw, 0.68rem)",
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
              fontSize: "clamp(0.88rem, 2vw, 1rem)",
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
            width: 34,
            height: 34,
            borderRadius: 9,
            flexShrink: 0,
            background: e ? "#1A2B3C" : "#fff",
            border: `2px solid ${c.borda}`,
            fontSize: "0.9rem",
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
              padding: "9px 6px",
              background: aba === a.id ? "#00D4AA12" : "transparent",
              border: "none",
              borderBottom: `3px solid ${aba === a.id ? "#00D4AA" : "transparent"}`,
              color: aba === a.id ? "#00D4AA" : c.textoSub,
              fontWeight: aba === a.id ? 800 : 600,
              fontSize: "clamp(0.7rem, 2vw, 0.82rem)",
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
          overflowY: "auto",
          padding: "12px 16px",
          maxWidth: 640,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* RESUMO */}
        {aba === "resumo" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #00D4AA18, #0099FF08)",
                borderRadius: 16,
                padding: "16px",
                border: "1.5px solid #00D4AA33",
              }}
            >
              <p
                style={{
                  fontSize: "clamp(0.62rem, 1.8vw, 0.7rem)",
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
                    fontSize: "clamp(0.88rem, 2.5vw, 1rem)",
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
                    fontSize: "0.88rem",
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
                fontSize: "clamp(0.62rem, 1.8vw, 0.7rem)",
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
                    borderRadius: 12,
                    padding: "12px 14px",
                    border: `1.5px solid ${c.borda}`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "linear-gradient(135deg, #00D4AA, #0099FF)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "0.72rem",
                      fontFamily: "'Fredoka', sans-serif",
                    }}
                  >
                    {i + 1}
                  </div>
                  <p
                    style={{
                      fontSize: "clamp(0.84rem, 2.5vw, 0.92rem)",
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
                  borderRadius: 12,
                  padding: "20px",
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
              gap: 10,
              animation: "fadeIn 0.3s ease",
            }}
          >
            {/* Seletor Ouvir / Ler */}
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { id: "ouvir", label: "🎧 Ouvir", cor: "#00D4AA" },
                { id: "ler", label: "📖 Ler", cor: "#3B82F6" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModo(m.id)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: modo === m.id ? `${m.cor}15` : "transparent",
                    border: `2px solid ${modo === m.id ? m.cor : c.borda}`,
                    color: modo === m.id ? m.cor : c.textoSub,
                    fontWeight: 800,
                    fontSize: "clamp(0.75rem, 2vw, 0.85rem)",
                    fontFamily: "'Nunito', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    transition: "all 0.2s",
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Info com frase animada */}
            <div
              style={{
                background: c.card,
                borderRadius: 10,
                padding: "10px 14px",
                border: `1.5px solid ${c.borda}`,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>
                {modo === "ouvir" ? "🎙️" : "📖"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "'Fredoka', sans-serif",
                    fontSize: "clamp(0.82rem, 2vw, 0.92rem)",
                    color: c.texto,
                    margin: "0 0 2px",
                    fontWeight: 600,
                  }}
                >
                  {modo === "ouvir" ? "Explicação em áudio" : "Leitura guiada"}
                </p>
                <FraseAnimada c={c} />
              </div>
            </div>

            {/* Player TTS ou Leitura — aparece imediatamente, sem esperar podcast */}
            {roteiro ? (
              modo === "ouvir" ? (
                <ModoOuvir
                  texto={roteiro}
                  c={c}
                  velIdx={velIdx}
                  setVelIdx={setVelIdx}
                  audioAtivo={audioAtivo}
                  setAudioAtivo={setAudioAtivo}
                />
              ) : (
                <ModoLer
                  texto={roteiro}
                  c={c}
                  velIdx={velIdx}
                  setVelIdx={setVelIdx}
                  audioAtivo={audioAtivo}
                  setAudioAtivo={setAudioAtivo}
                />
              )
            ) : (
              <div
                style={{
                  background: c.card,
                  borderRadius: 12,
                  padding: "20px",
                  textAlign: "center",
                  border: `1.5px dashed ${c.borda}`,
                }}
              >
                <p
                  style={{ color: c.textoSub, fontSize: "0.88rem", margin: 0 }}
                >
                  Gere uma nova missão para ouvir aqui.
                </p>
              </div>
            )}

            {/* Podcast real — ABAIXO do texto */}
            {!buscando && podcast && (
              <div>
                <p
                  style={{
                    fontSize: "clamp(0.62rem, 1.5vw, 0.7rem)",
                    fontWeight: 800,
                    color: "#3B82F6",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    margin: "4px 0 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  🎧 Podcast do Especialista
                </p>
                <PlayerPodcast
                  podcast={podcast}
                  c={c}
                  audioAtivo={audioAtivo}
                  setAudioAtivo={setAudioAtivo}
                />
              </div>
            )}

            {/* Card Em Breve */}
            {!buscando && !podcast && (
              <div
                style={{
                  background: e
                    ? "rgba(59,130,246,0.08)"
                    : "rgba(59,130,246,0.06)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  border: "1.5px solid rgba(59,130,246,0.25)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>🎧</span>
                    <div>
                      <p
                        style={{
                          fontSize: "clamp(0.6rem, 1.5vw, 0.68rem)",
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
                          fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
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
                    fontSize: "clamp(0.7rem, 2vw, 0.78rem)",
                    color: c.textoSub,
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Professores especialistas e pedagogos explicando cada tema de
                  um jeito que você nunca vai esquecer.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes onda   { from{transform:scaleY(0.3)} to{transform:scaleY(1)} }
      `}</style>
    </div>
  );
}
