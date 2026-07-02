import { useState, useRef, useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";

// ── Estrelinhas animadas ao redor da planta ──
function Estrelinhas() {
  const pos = [
    { top: -8, left: 14, delay: "0s", size: "0.55rem" },
    { top: 2, left: -6, delay: "0.4s", size: "0.45rem" },
    { top: -6, left: 32, delay: "0.8s", size: "0.5rem" },
    { top: 10, left: 38, delay: "0.2s", size: "0.4rem" },
    { top: -10, left: 22, delay: "1s", size: "0.42rem" },
  ];
  return (
    <>
      {pos.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: p.top,
            left: p.left,
            fontSize: p.size,
            animationName: "piscar",
            animationDuration: "1.6s",
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDirection: "alternate",
            animationDelay: p.delay,
            pointerEvents: "none",
          }}
        >
          ✦
        </span>
      ))}
    </>
  );
}

export default function OlloAssistant({ missao, c, tema }) {
  const [aberto, setAberto] = useState(false);
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [ouvindo, setOuvindo] = useState(false);
  const [tocandoAudio, setTocandoAudio] = useState(false);
  const [carregandoAudio, setCarregandoAudio] = useState(false);
  const [iniciandoMic, setIniciandoMic] = useState(false);
  const [posicao, setPosicao] = useState({ bottom: 80, right: 16 });
  const [arrastando, setArrastando] = useState(false);

  const audioRef = useRef(null);
  const reconhRef = useRef(null);
  const inputRef = useRef(null);
  const arrastarRef = useRef(null);
  const e = tema === "escuro";

  const cor = "#00D4AA";

  // ── Foca no input ao abrir ──
  useEffect(() => {
    if (aberto && inputRef.current)
      setTimeout(() => inputRef.current?.focus(), 300);
  }, [aberto]);

  // ── Limpa áudio ao fechar ──
  useEffect(() => {
    if (!aberto) {
      audioRef.current?.pause();
      setTocandoAudio(false);
    }
  }, [aberto]);

  // ── Arrastar o botão flutuante ──
  const iniciarArrastar = (ev) => {
    if (aberto) return;
    const startX = ev.clientX ?? ev.touches?.[0]?.clientX;
    const startY = ev.clientY ?? ev.touches?.[0]?.clientY;
    const startB = posicao.bottom;
    const startR = posicao.right;
    setArrastando(true);

    const mover = (e2) => {
      const cx = e2.clientX ?? e2.touches?.[0]?.clientX;
      const cy = e2.clientY ?? e2.touches?.[0]?.clientY;
      const dX = startX - cx;
      const dY = startY - cy;
      setPosicao({
        bottom: Math.max(16, startB + dY),
        right: Math.max(16, startR + dX),
      });
    };
    const soltar = () => {
      setArrastando(false);
      window.removeEventListener("mousemove", mover);
      window.removeEventListener("mouseup", soltar);
      window.removeEventListener("touchmove", mover);
      window.removeEventListener("touchend", soltar);
    };
    window.addEventListener("mousemove", mover);
    window.addEventListener("mouseup", soltar);
    window.addEventListener("touchmove", mover, { passive: true });
    window.addEventListener("touchend", soltar);
  };

  // ── Enviar pergunta ──
  const enviarTexto = async (textoExterno) => {
    const texto = (textoExterno || pergunta).trim();
    if (!texto || carregando) return;
    setPergunta("");
    setCarregando(true);
    setResposta("");
    try {
      const fn = httpsCallable(
        getFunctions(undefined, "us-central1"),
        "perguntarAssistente",
      );
      const result = await fn({
        pergunta: texto,
        tema: missao?.titulo || "",
        disciplina: missao?.disciplina || "",
        resumo: missao?.resumo || missao?.roteiroPodcast || "",
      });
      setResposta(result.data.resposta);
    } catch {
      setResposta("Ops! Não consegui responder agora. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const enviar = () => enviarTexto(pergunta);

  // ── Microfone (Web Speech API) ──
  const toggleMicrofone = async () => {
    // Parar se já está ouvindo ou ainda conectando
    if (ouvindo || iniciandoMic) {
      reconhRef.current?.stop();
      setOuvindo(false);
      setIniciandoMic(false);
      return;
    }

    setIniciandoMic(true); // feedback visual imediato — "conectando microfone..."

    // Verificar suporte
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setIniciandoMic(false);
      alert("Reconhecimento de voz não suportado. Use o Chrome.");
      return;
    }

    // Forçar pedido de permissão de microfone antes de iniciar
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop()); // libera imediatamente
    } catch (err) {
      setIniciandoMic(false);
      if (err.name === "NotAllowedError") {
        alert("Permissão de microfone negada. Clique no cadeado na barra de endereço e permita o microfone.");
      } else if (err.name === "NotFoundError") {
        alert("Nenhum microfone encontrado neste dispositivo.");
      } else {
        alert("Erro ao acessar microfone: " + err.message);
      }
      return;
    }

    // Iniciar reconhecimento
    const r = new SR();
    r.lang = "pt-BR";
    r.interimResults = false;
    r.continuous = false;

    r.onstart = () => {
      setIniciandoMic(false);
      setOuvindo(true);
    };

    r.onresult = (ev) => {
      const texto = ev.results[0][0].transcript;
      setPergunta(texto);
      setOuvindo(false);
      setTimeout(() => enviarTexto(texto), 3000);
    };

    r.onerror = (ev) => {
      setOuvindo(false);
      setIniciandoMic(false);
      if (ev.error === "not-allowed") {
        alert("Permissão de microfone bloqueada. Verifique as configurações do navegador.");
      } else if (ev.error === "network") {
        alert("Erro de rede no reconhecimento de voz. Verifique sua conexão.");
      } else if (ev.error !== "aborted") {
        console.error("[Microfone] Erro:", ev.error);
      }
    };

    r.onend = () => {
      setOuvindo(false);
      setIniciandoMic(false);
    };

    reconhRef.current = r;
    try {
      r.start();
    } catch (err) {
      setOuvindo(false);
      setIniciandoMic(false);
      console.error("[Microfone] Falha ao iniciar:", err);
    }
  };

  // ── Ouvir resposta via TTS ──
  const ouvirResposta = async () => {
    if (tocandoAudio) {
      audioRef.current?.pause();
      setTocandoAudio(false);
      return;
    }
    if (carregandoAudio) return; // trava cliques repetidos enquanto carrega
    if (!resposta) return;
    setCarregandoAudio(true);
    try {
      const fn = httpsCallable(
        getFunctions(undefined, "us-central1"),
        "gerarAudioAssistente",
      );
      const r = await fn({ texto: resposta.slice(0, 500) });
      const audio = new Audio(`data:audio/mp3;base64,${r.data.audioBase64}`);
      audioRef.current = audio;
      audio.onended = () => setTocandoAudio(false);
      audio.play();
      setTocandoAudio(true);
    } catch {
      /* silencia */
    } finally {
      setCarregandoAudio(false);
    }
  };

  const cardBg = e ? "#0D1820" : "#FFFFFF";
  const cardBorda = e ? "#1A3347" : "#E2E8F0";
  const textoColor = e ? "#E8F4F8" : "#1A2B3C";
  const subColor = e ? "#6B8A9A" : "#7A9AAA";
  const inputBg = e ? "#1A2B3C" : "#F8FBFF";

  return (
    <>
      {/* ── Card expandido ── */}
      {aberto && (
        <div
          style={{
            position: "fixed",
            bottom: posicao.bottom + 64,
            right: posicao.right,
            width: "clamp(280px, 88vw, 360px)",
            background: cardBg,
            borderRadius: 20,
            border: `2px solid ${cor}44`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            zIndex: 998,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "subirCard 0.25s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${cor}22, ${cor}08)`,
              padding: "12px 14px",
              borderBottom: `1.5px solid ${cor}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1.4rem" }}>🌱</span>
              <div>
                <p
                  style={{
                    fontFamily: "'Fredoka', sans-serif",
                    fontSize: "0.95rem",
                    color: textoColor,
                    margin: 0,
                    fontWeight: 700,
                  }}
                >
                  Ficou com dúvida?
                </p>
                <p
                  style={{
                    fontSize: "0.68rem",
                    color: cor,
                    margin: 0,
                    fontWeight: 700,
                    fontStyle: "italic",
                  }}
                >
                  Me pergunte!
                </p>
              </div>
            </div>
            <button
              onClick={() => setAberto(false)}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "none",
                background: "#FF6B6B15",
                color: "#FF6B6B",
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          {/* Área de resposta */}
          {(resposta || carregando) && (
            <div
              style={{
                padding: "12px 14px",
                borderBottom: `1px solid ${cardBorda}`,
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {carregando ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: "1rem",
                      animation: "girarLento 1.5s linear infinite",
                      display: "inline-block",
                    }}
                  >
                    🌱
                  </span>
                  <p
                    style={{ fontSize: "0.82rem", color: subColor, margin: 0 }}
                  >
                    Pensando na resposta...
                  </p>
                </div>
              ) : (
                <>
                  <button
                    onClick={ouvirResposta}
                    disabled={carregandoAudio}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 14px",
                      borderRadius: 20,
                      border: `1.5px solid ${cor}44`,
                      background: tocandoAudio ? `${cor}22` : "transparent",
                      color: cor,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: carregandoAudio ? "wait" : "pointer",
                      opacity: carregandoAudio ? 0.7 : 1,
                      fontFamily: "'Nunito', sans-serif",
                      marginBottom: 8,
                    }}
                  >
                    {carregandoAudio ? (
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          border: `2px solid ${cor}44`,
                          borderTopColor: cor,
                          animation: "girarLento 0.7s linear infinite",
                        }}
                      />
                    ) : tocandoAudio ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          gap: 2,
                          height: 14,
                        }}
                      >
                        {[3, 5, 4, 5, 3].map((h, i) => (
                          <span
                            key={i}
                            style={{
                              display: "inline-block",
                              width: 3,
                              borderRadius: 2,
                              background: cor,
                              animationName: "ondaBtn",
                              animationDuration: `${0.7 + i * 0.15}s`,
                              animationTimingFunction: "ease-in-out",
                              animationIterationCount: "infinite",
                              animationDirection: "alternate",
                              animationDelay: `${i * 0.1}s`,
                              height: h,
                            }}
                          />
                        ))}
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.85rem" }}>🔊</span>
                    )}
                    {carregandoAudio ? "Carregando..." : tocandoAudio ? "Pausar" : "Ouvir resposta"}
                  </button>
                  <p
                    style={{
                      fontSize: "0.88rem",
                      color: textoColor,
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {resposta}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Input */}
          <div
            style={{
              padding: "10px 12px",
              display: "flex",
              gap: 6,
              alignItems: "flex-end",
            }}
          >
            <textarea
              ref={inputRef}
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviar();
                }
              }}
              placeholder="Digite sua dúvida aqui..."
              rows={2}
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: 12,
                border: `1.5px solid ${cardBorda}`,
                background: inputBg,
                color: textoColor,
                fontSize: "0.85rem",
                fontFamily: "'Nunito', sans-serif",
                resize: "none",
                outline: "none",
                lineHeight: 1.5,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <button
                onClick={toggleMicrofone}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: `1.5px solid ${ouvindo ? "#EF4444" : iniciandoMic ? "#F59E0B" : cardBorda}`,
                  background: ouvindo ? "#EF444415" : iniciandoMic ? "#F59E0B15" : "transparent",
                  color: ouvindo ? "#EF4444" : iniciandoMic ? "#F59E0B" : subColor,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: iniciandoMic ? "piscar 0.8s ease-in-out infinite" : "none",
                }}
              >
                {ouvindo ? "⏹" : iniciandoMic ? "🎙️" : "🎤"}
              </button>
              <button
                onClick={enviar}
                disabled={!pergunta.trim() || carregando}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "none",
                  background: pergunta.trim() && !carregando ? cor : `${cor}44`,
                  color: "#fff",
                  fontSize: "0.95rem",
                  cursor:
                    pergunta.trim() && !carregando ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                ➤
              </button>
            </div>
          </div>

          {/* Aviso de escopo */}
          {missao?.titulo && (
            <div style={{ padding: "6px 14px 10px", textAlign: "center" }}>
              <p style={{ fontSize: "0.62rem", color: subColor, margin: 0 }}>
                🔒 Respondendo sobre:{" "}
                <strong style={{ color: cor }}>{missao.titulo}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Botão flutuante com planta ── */}
      <div
        ref={arrastarRef}
        onMouseDown={iniciarArrastar}
        onTouchStart={iniciarArrastar}
        onClick={() => {
          if (!arrastando) setAberto((a) => !a);
        }}
        style={{
          position: "fixed",
          bottom: posicao.bottom,
          right: posicao.right,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${cor}, #0099FF)`,
          boxShadow: aberto
            ? `0 0 0 4px ${cor}44, 0 8px 24px ${cor}66`
            : `0 4px 20px ${cor}66`,
          cursor: arrastando ? "grabbing" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          transition: arrastando ? "none" : "box-shadow 0.2s",
          userSelect: "none",
          touchAction: "none",
        }}
      >
        <div
          style={{ position: "relative", fontSize: "1.6rem", lineHeight: 1 }}
        >
          🌱
          <Estrelinhas />
        </div>

        {/* Balãozinho de chamada — só quando fechado */}
        {!aberto && (
          <div
            style={{
              position: "absolute",
              bottom: "110%",
              right: 0,
              background: cardBg,
              border: `1.5px solid ${cor}44`,
              borderRadius: "12px 12px 2px 12px",
              padding: "5px 10px",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              animation: "piscar 2.5s ease-in-out infinite",
            }}
          >
            <p
              style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                color: cor,
                margin: 0,
              }}
            >
              Ficou com dúvida?
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes subirCard  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ondaBtn    { from{transform:scaleY(0.3)} to{transform:scaleY(1)} }
        @keyframes piscar     { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes girarLento { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </>
  );
}


