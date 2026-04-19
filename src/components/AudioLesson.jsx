import { useState, useEffect, useRef, useCallback } from "react";

const VELOCIDADES = [
  { label: "🐢 Lento", value: 80 },
  { label: "▶ Normal", value: 45 },
  { label: "🐇 Rápido", value: 25 },
];

export default function AudioLesson({
  disciplinaId,
  moduloId,
  onFechar,
  tema,
  alternarTema,
}) {
  const [roteiro, setRoteiro] = useState(null);
  const [conteudoTexto, setConteudoTexto] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [tocando, setTocando] = useState(false);
  const [comVoz, setComVoz] = useState(true);
  const [idx, setIdx] = useState(-1);
  const [velIdx, setVelIdx] = useState(1);
  const [concluido, setConcluido] = useState(false);

  const timerRef = useRef(null);
  const palavraRef = useRef(null);
  const speechRef = useRef(null);

  // ── 1. BUSCAR A MISSÃO E USAR A TRAVA PEDAGÓGICA ──
  useEffect(() => {
    try {
      const salvas = JSON.parse(
        localStorage.getItem(`eduplay_missoes_ia_${disciplinaId}`) || "[]",
      );
      const missao = salvas[moduloId];

      if (missao) {
        const dadosAudio =
          missao.video || missao.podcast || missao.audio || missao;
        setRoteiro(dadosAudio);

        // EXTRATOR UNIVERSAL DE TEXTO
        let textoEncontrado = "";

        if (typeof dadosAudio === "string") {
          textoEncontrado = dadosAudio;
        } else {
          textoEncontrado =
            dadosAudio.texto ||
            dadosAudio.roteiro ||
            dadosAudio.script ||
            dadosAudio.conteudo ||
            dadosAudio.transcricao ||
            dadosAudio.narracao ||
            dadosAudio.historia ||
            "";

          if (!textoEncontrado || textoEncontrado.trim() === "") {
            const todasAsStrings = Object.values(dadosAudio).filter(
              (v) => typeof v === "string",
            );
            if (todasAsStrings.length > 0) {
              textoEncontrado = todasAsStrings.sort(
                (a, b) => b.length - a.length,
              )[0];
            }
          }
        }

        // 🛡️ TRAVA PEDAGÓGICA: Garante pelo menos 2 estrofes de aprendizado!
        // Se a IA gerou um texto muito curto (ex: só o título), nós sintetizamos um dossiê rico.
        if (!textoEncontrado || textoEncontrado.trim().length < 100) {
          let dossieSintetizado = `Atenção, Agente. O satélite interceptou a seguinte investigação: ${missao.perguntaCentral || "Temos anomalias neste setor"}. \n\n`;

          if (
            missao.atividades &&
            missao.atividades.quiz &&
            missao.atividades.quiz.length > 0
          ) {
            dossieSintetizado +=
              "Nossos especialistas compilaram os seguintes dados cruciais para o seu aprendizado: ";

            // Pega as explicações do quiz para formar um texto denso e educativo
            const explicacoes = missao.atividades.quiz
              .map((q) => q.explicacao)
              .filter(Boolean);
            dossieSintetizado += explicacoes.join(
              " Além disso, é vital compreender que: ",
            );
          } else {
            dossieSintetizado +=
              "Os dados vitais encontram-se bloqueados nas Tarefas de Campo. Prossiga com cautela e decifre os códigos para absorver o conhecimento.";
          }

          textoEncontrado = dossieSintetizado;
        }

        setConteudoTexto(textoEncontrado || "");
      }
    } catch (error) {
      console.error("Erro ao carregar dossiê:", error);
      setConteudoTexto("");
    } finally {
      setCarregando(false);
    }
  }, [disciplinaId, moduloId]);

  const palavras = conteudoTexto ? conteudoTexto.trim().split(/\s+/) : [];
  const total = palavras.length;
  const progresso = total > 0 && idx >= 0 ? Math.round((idx / total) * 100) : 0;
  const vel = VELOCIDADES[velIdx].value;

  // ── 2. SCROLL AUTOMÁTICO ──
  useEffect(() => {
    if (palavraRef.current) {
      palavraRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [idx]);

  // ── 3. LIMPEZA AO DESMONTAR ──
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
      }, vel * 10);
    },
    [total, vel],
  );

  const play = useCallback(() => {
    if (total === 0) return;

    if (concluido) {
      setConcluido(false);
      setIdx(-1);
    }
    setTocando(true);

    if (comVoz && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(conteudoTexto);
      u.lang = "pt-BR";
      u.rate = velIdx === 0 ? 0.85 : velIdx === 2 ? 1.25 : 1;

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
  }, [comVoz, velIdx, idx, iniciarDestaque, concluido, total, conteudoTexto]);

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

  const mudarVelocidade = (i) => {
    setVelIdx(i);
    if (tocando) {
      parar();
      setTimeout(() => play(), 100);
    }
  };

  const e = tema === "escuro";
  const c = {
    bgSolid: e ? "#0A0F14" : "#F4F7F9",
    card: e ? "#121A22" : "#FFFFFF",
    texto: e ? "#00FF41" : "#1A2B3C",
    textoSub: e ? "#4A6A7A" : "#64748B",
    borda: e ? "#1A2B3C" : "#DDE8F0",
    destaqueBg: e ? "#00FF4133" : "#00D4AA33",
    destaqueTxt: e ? "#FFFFFF" : "#005544",
  };

  if (carregando) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: c.bgSolid,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: c.texto }}>
          <div
            style={{ fontSize: "3rem", animation: "spin 2s linear infinite" }}
          >
            ⚙️
          </div>
          <p
            style={{
              fontFamily: "'Fredoka', sans-serif",
              marginTop: "16px",
              fontWeight: 700,
            }}
          >
            Descriptografando Dossiê...
          </p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: c.bgSolid,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        fontFamily: e ? "'Courier New', monospace" : "'Nunito', sans-serif",
      }}
    >
      {/* HEADER CONFIDENCIAL */}
      <div
        style={{
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          borderBottom: `1px solid ${c.borda}`,
          background: e ? "#0A0F14" : "#FFFFFF",
          flexShrink: 0,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <button
          onClick={() => {
            parar();
            onFechar();
          }}
          style={{
            width: "44px",
            height: "44px",
            background: "#FF6B6B15",
            border: "2px solid #FF6B6B44",
            borderRadius: "14px",
            color: "#FF6B6B",
            fontSize: "1.2rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.2s",
          }}
        >
          ✕
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                background: e ? "#00FF41" : "#FF0000",
                borderRadius: "50%",
                animation: "piscar 1.5s infinite",
              }}
            />
            <span
              style={{
                fontSize: "0.7rem",
                color: e ? "#00FF41" : "#FF0000",
                fontWeight: 800,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              ARQUIVO CONFIDENCIAL
            </span>
          </div>
          <div
            style={{
              color: e ? "#FFFFFF" : "#1A2B3C",
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {roteiro?.titulo || "Relatório Tático"}
          </div>
        </div>

        <button
          onClick={() => {
            if (tocando) parar();
            setComVoz((v) => !v);
          }}
          style={{
            padding: "8px 16px",
            background: comVoz
              ? e
                ? "#00FF4122"
                : "#00D4AA22"
              : "transparent",
            border: `2px solid ${comVoz ? (e ? "#00FF41" : "#00D4AA") : c.borda}`,
            borderRadius: "20px",
            color: comVoz ? (e ? "#00FF41" : "#0099FF") : c.textoSub,
            fontSize: "0.8rem",
            fontWeight: 800,
            cursor: "pointer",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s",
          }}
        >
          {comVoz ? (
            <>
              <span style={{ fontSize: "1.1rem" }}>🔊</span> Robô Ativo
            </>
          ) : (
            <>
              <span style={{ fontSize: "1.1rem" }}>🔇</span> Mudo
            </>
          )}
        </button>

        <button
          onClick={alternarTema}
          style={{
            width: "44px",
            height: "44px",
            background: c.card,
            border: `2px solid ${c.borda}`,
            borderRadius: "14px",
            fontSize: "1.2rem",
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

      {/* BARRA DE PROGRESSO */}
      <div style={{ height: "4px", background: c.borda, flexShrink: 0 }}>
        <div
          style={{
            height: "100%",
            width: `${progresso}%`,
            background: e
              ? "#00FF41"
              : "linear-gradient(90deg, #00D4AA, #0099FF)",
            transition: "width 0.2s",
          }}
        />
      </div>

      {/* ÁREA DO TEXTO */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "clamp(24px, 5vw, 40px)",
          maxWidth: "800px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {total === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: c.textoSub,
              marginTop: "40px",
              fontWeight: 700,
            }}
          >
            Nenhum dado decodificado.
          </div>
        ) : (
          <div
            style={{
              lineHeight: "clamp(2, 3.5vw, 2.4)",
              fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
              textAlign: "justify",
              color: c.textoSub,
              whiteSpace: "pre-line", // Respeita as quebras de linha que criamos (\n\n)
            }}
          >
            {palavras.map((palavra, i) => (
              <span
                key={i}
                ref={i === idx ? palavraRef : null}
                style={{
                  color:
                    i === idx ? c.destaqueTxt : i < idx ? c.texto : c.textoSub,
                  background: i === idx ? c.destaqueBg : "transparent",
                  borderRadius: "6px",
                  padding: i === idx ? "2px 6px" : "2px 0",
                  fontWeight: i === idx ? 800 : 500,
                  transition: "all 0.1s",
                  display: "inline",
                  boxShadow:
                    i === idx && e ? `0 0 10px ${c.destaqueBg}` : "none",
                }}
              >
                {palavra}{" "}
              </span>
            ))}
          </div>
        )}

        {/* TELA DE CONCLUSÃO */}
        {concluido && (
          <div
            style={{
              textAlign: "center",
              marginTop: "40px",
              padding: "clamp(20px, 4vw, 32px)",
              background: e ? "#00FF4111" : "#00D4AA18",
              borderRadius: "20px",
              border: `2px solid ${e ? "#00FF4144" : "#00D4AA44"}`,
            }}
          >
            <div
              style={{
                fontSize: "clamp(2.5rem, 6vw, 3.5rem)",
                marginBottom: "12px",
              }}
            >
              ✅
            </div>
            <div
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                color: e ? "#00FF41" : "#00D4AA",
                marginBottom: "8px",
                fontWeight: 700,
              }}
            >
              Leitura do Relatório Concluída
            </div>
            <div
              style={{
                fontSize: "clamp(0.9rem, 2vw, 1rem)",
                color: c.textoSub,
                fontWeight: 600,
              }}
            >
              Você já pode fechar o dossiê e prosseguir para as Tarefas de
              Campo.
            </div>
          </div>
        )}
      </div>

      {/* PAINEL DE CONTROLE INFERIOR */}
      <div
        style={{
          padding: "clamp(16px, 3vw, 24px)",
          background: c.card,
          borderTop: `1px solid ${c.borda}`,
          flexShrink: 0,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(8px, 2vw, 12px)",
            marginBottom: "20px",
          }}
        >
          {VELOCIDADES.map((v, i) => (
            <button
              key={i}
              onClick={() => mudarVelocidade(i)}
              style={{
                padding: "8px 20px",
                borderRadius: "20px",
                background:
                  velIdx === i
                    ? e
                      ? "#00FF4122"
                      : "#00D4AA22"
                    : "transparent",
                border: `2px solid ${velIdx === i ? (e ? "#00FF41" : "#00D4AA") : c.borda}`,
                color: velIdx === i ? (e ? "#00FF41" : "#00D4AA") : c.textoSub,
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(16px, 3vw, 24px)",
            alignItems: "center",
          }}
        >
          <button
            onClick={reiniciar}
            disabled={total === 0}
            title="Reiniciar Dossiê"
            style={{
              width: "56px",
              height: "56px",
              background: c.card,
              border: `2px solid ${c.borda}`,
              borderRadius: "50%",
              color: c.textoSub,
              fontSize: "1.4rem",
              cursor: total === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              opacity: total === 0 ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (total > 0) e.currentTarget.style.borderColor = c.texto;
            }}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = c.borda)}
          >
            🔄
          </button>

          <button
            onClick={tocando ? pausar : idx >= 0 ? retomar : play}
            disabled={total === 0}
            style={{
              width: "80px",
              height: "80px",
              background: e
                ? "#00FF41"
                : "linear-gradient(135deg, #00D4AA, #0099FF)",
              border: "none",
              borderRadius: "50%",
              color: e ? "#000" : "#FFF",
              fontSize: "2rem",
              cursor: total === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: e
                ? "0 4px 20px rgba(0, 255, 65, 0.4)"
                : "0 4px 20px rgba(0,212,170,0.4)",
              transition: "transform 0.1s",
              opacity: total === 0 ? 0.5 : 1,
            }}
            onMouseDown={(e) => {
              if (total > 0) e.currentTarget.style.transform = "scale(0.95)";
            }}
            onMouseUp={(e) => {
              if (total > 0) e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {tocando ? "⏸" : "▶"}
          </button>

          <button
            onClick={parar}
            disabled={total === 0}
            title="Interromper"
            style={{
              width: "56px",
              height: "56px",
              background: "#FF6B6B15",
              border: "2px solid #FF6B6B44",
              borderRadius: "50%",
              color: "#FF6B6B",
              fontSize: "1.4rem",
              cursor: total === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              opacity: total === 0 ? 0.5 : 1,
            }}
          >
            ⏹
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes piscar { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
