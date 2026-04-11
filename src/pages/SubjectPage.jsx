import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTema } from "../context/ThemeContext";
import { disciplinas } from "../utils/content";
import BottomNav from "../components/BottomNav";
import AudioLesson from "../components/AudioLesson";

function useCores(tema) {
  return {
    bg: tema === "escuro" ? "#0F1923" : "#F5F9FF",
    card: tema === "escuro" ? "#1A2B3C" : "#FFFFFF",
    card2: tema === "escuro" ? "#1E3347" : "#F0F7FF",
    texto: tema === "escuro" ? "#E8F4F8" : "#1A2B3C",
    textoSub: tema === "escuro" ? "#7A9BB0" : "#5A7A8A",
    borda: tema === "escuro" ? "#2A3F52" : "#DDE8F0",
    header: tema === "escuro" ? "#0D1820" : "#FFFFFF",
    accent: "#00D4AA",
  };
}

function PageHeader({
  titulo,
  subtitulo,
  cor,
  onVoltar,
  tema,
  c,
  alternarTema,
}) {
  return (
    <header
      style={{
        background: c.header,
        borderBottom: `2px solid ${c.borda}`,
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${cor}22, ${cor}08)`,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          onClick={onVoltar}
          style={{
            width: "40px",
            height: "40px",
            flexShrink: 0,
            background: c.card2,
            border: `2px solid ${c.borda}`,
            borderRadius: "12px",
            fontSize: "1.1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: c.texto,
          }}
        >
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              color: c.texto,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {titulo}
          </div>
          {subtitulo && (
            <div
              style={{
                fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)",
                color: cor,
                fontWeight: 700,
              }}
            >
              {subtitulo}
            </div>
          )}
        </div>
        <button
          onClick={alternarTema}
          style={{
            width: "40px",
            height: "40px",
            flexShrink: 0,
            background: c.card2,
            border: `2px solid ${c.borda}`,
            borderRadius: "12px",
            fontSize: "1.1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {tema === "escuro" ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}

function Quiz({ perguntas, onConcluir, cor, c }) {
  const [indice, setIndice] = useState(0);
  const [sel, setSel] = useState(null);
  const [acertos, setAcertos] = useState(0);
  const [resp, setResp] = useState(false);
  const q = perguntas[indice];

  const responder = (i) => {
    if (resp) return;
    setSel(i);
    setResp(true);
    if (i === q.correta) setAcertos((a) => a + 1);
  };

  const proxima = () => {
    const total = acertos + (sel === q.correta ? 1 : 0);
    if (indice + 1 >= perguntas.length) {
      onConcluir(total, perguntas.length);
    } else {
      setIndice((i) => i + 1);
      setSel(null);
      setResp(false);
    }
  };

  return (
    <div
      style={{
        padding: "clamp(12px, 3vw, 24px)",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <span
          style={{
            fontSize: "clamp(0.78rem, 1.8vw, 0.88rem)",
            color: c.textoSub,
            fontWeight: 600,
          }}
        >
          Pergunta {indice + 1} de {perguntas.length}
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          {perguntas.map((_, i) => (
            <div
              key={i}
              style={{
                width: "clamp(8px, 2vw, 12px)",
                height: "clamp(8px, 2vw, 12px)",
                borderRadius: "50%",
                background:
                  i < indice ? cor : i === indice ? "#00D4AA" : c.borda,
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          background: c.card2,
          borderRadius: "18px",
          padding: "clamp(16px, 3vw, 24px)",
          marginBottom: "16px",
          border: `2px solid ${c.borda}`,
          fontFamily: "'Fredoka', sans-serif",
          fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
          color: c.texto,
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        ❓ {q.pergunta}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        {q.opcoes.map((op, i) => {
          let bg = c.card,
            brd = c.borda,
            clr = c.texto,
            fw = 500;
          if (resp) {
            if (i === q.correta) {
              bg = "#00D4AA18";
              brd = "#00D4AA";
              clr = "#00D4AA";
              fw = 700;
            } else if (i === sel) {
              bg = "#FF6B6B18";
              brd = "#FF6B6B";
              clr = "#FF6B6B";
            }
          }
          return (
            <button
              key={i}
              onClick={() => responder(i)}
              style={{
                background: bg,
                border: `2px solid ${brd}`,
                borderRadius: "14px",
                padding: "clamp(12px, 2.5vw, 16px) clamp(14px, 3vw, 20px)",
                color: clr,
                fontSize: "clamp(0.9rem, 2vw, 1rem)",
                fontWeight: fw,
                cursor: resp ? "default" : "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                fontFamily: "'Nunito', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>
                {resp && i === q.correta
                  ? "✅"
                  : resp && i === sel && i !== q.correta
                    ? "❌"
                    : "○"}
              </span>
              {op}
            </button>
          );
        })}
      </div>

      {resp && (
        <div
          style={{
            background: sel === q.correta ? "#00D4AA11" : "#FF6B6B11",
            border: `2px solid ${sel === q.correta ? "#00D4AA44" : "#FF6B6B44"}`,
            borderRadius: "14px",
            padding: "clamp(12px, 2.5vw, 16px)",
            color: c.texto,
            fontSize: "clamp(0.85rem, 1.8vw, 0.95rem)",
            marginBottom: "16px",
            lineHeight: 1.6,
          }}
        >
          <strong>
            {sel === q.correta ? "🎉 Correto! " : "📚 Saiba mais: "}
          </strong>
          {q.explicacao}
        </div>
      )}

      {resp && (
        <button
          onClick={proxima}
          style={{
            width: "100%",
            padding: "clamp(14px, 3vw, 18px)",
            background: "linear-gradient(135deg, #00D4AA, #0099FF)",
            border: "none",
            borderRadius: "16px",
            color: "#FFF",
            fontSize: "clamp(1rem, 2vw, 1.1rem)",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Fredoka', sans-serif",
            boxShadow: "0 4px 16px rgba(0,212,170,0.3)",
          }}
        >
          {indice + 1 >= perguntas.length ? "🏁 Ver Resultado" : "Próxima →"}
        </button>
      )}
    </div>
  );
}

function Forca({ dados, onConcluir, cor, c }) {
  const { palavra, dica } = dados;
  const [letras, setLetras] = useState(new Set());
  const [erros, setErros] = useState(0);
  const MAX = 6;
  const BONECO = [
    "  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========",
    "  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========",
  ];
  const display = palavra
    .split("")
    .map((l) => (letras.has(l) ? l : "_"))
    .join(" ");
  const ganhou = !display.includes("_");
  const perdeu = erros >= MAX;

  const tentar = (l) => {
    if (letras.has(l) || ganhou || perdeu) return;
    const novo = new Set(letras);
    novo.add(l);
    setLetras(novo);
    if (!palavra.includes(l)) setErros((e) => e + 1);
  };

  return (
    <div
      style={{
        padding: "clamp(12px, 3vw, 24px)",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          background: c.card2,
          borderRadius: "16px",
          padding: "clamp(12px, 2.5vw, 20px)",
          fontFamily: "monospace",
          fontSize: "clamp(0.85rem, 2vw, 1.1rem)",
          lineHeight: 1.5,
          color: erros >= 4 ? "#FF6B6B" : c.texto,
          textAlign: "center",
          marginBottom: "12px",
          border: `2px solid ${erros >= 4 ? "#FF6B6B44" : c.borda}`,
          whiteSpace: "pre",
        }}
      >
        {BONECO[erros]}
      </div>
      <div style={{ marginBottom: "8px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <span
            style={{
              fontSize: "clamp(0.75rem, 1.6vw, 0.85rem)",
              color: c.textoSub,
              fontWeight: 600,
            }}
          >
            Tentativas restantes
          </span>
          <span
            style={{
              fontSize: "clamp(0.75rem, 1.6vw, 0.85rem)",
              color: erros >= 4 ? "#FF6B6B" : "#00D4AA",
              fontWeight: 700,
            }}
          >
            {MAX - erros} de {MAX}
          </span>
        </div>
        <div
          style={{
            height: "8px",
            background: c.borda,
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(erros / MAX) * 100}%`,
              background: erros >= 4 ? "#FF6B6B" : cor,
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>
      <div
        style={{
          textAlign: "center",
          marginBottom: "12px",
          background: c.card2,
          borderRadius: "12px",
          padding: "10px",
          border: `2px solid ${c.borda}`,
          fontSize: "clamp(0.82rem, 1.8vw, 0.92rem)",
          color: c.textoSub,
        }}
      >
        💡 <strong>Dica:</strong> {dica}
      </div>
      <div
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: "clamp(1.5rem, 5vw, 2.2rem)",
          letterSpacing: "clamp(6px, 2vw, 12px)",
          textAlign: "center",
          marginBottom: "20px",
          color: ganhou ? "#00D4AA" : perdeu ? "#FF6B6B" : c.texto,
          fontWeight: 700,
          minHeight: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {ganhou || perdeu ? palavra.split("").join(" ") : display}
      </div>
      {ganhou || perdeu ? (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "clamp(2.5rem, 8vw, 4rem)",
              marginBottom: "8px",
            }}
          >
            {ganhou ? "🎉" : "😔"}
          </div>
          <div
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
              color: c.texto,
              marginBottom: "20px",
            }}
          >
            {ganhou ? "Mensagem decodificada!" : `Era: ${palavra}`}
          </div>
          <button
            onClick={() => onConcluir(ganhou ? 1 : 0, 1)}
            style={{
              padding: "clamp(12px, 2.5vw, 16px) clamp(24px, 5vw, 40px)",
              background: "linear-gradient(135deg, #00D4AA, #0099FF)",
              border: "none",
              borderRadius: "16px",
              color: "#FFF",
              fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Fredoka', sans-serif",
            }}
          >
            Continuar →
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(clamp(36px, 8vw, 48px), 1fr))",
            gap: "clamp(4px, 1vw, 8px)",
          }}
        >
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => {
            const usada = letras.has(l),
              acertou = usada && palavra.includes(l),
              errou = usada && !palavra.includes(l);
            return (
              <button
                key={l}
                onClick={() => tentar(l)}
                disabled={usada}
                style={{
                  aspectRatio: "1",
                  background: acertou
                    ? "#00D4AA22"
                    : errou
                      ? "#FF6B6B11"
                      : c.card2,
                  border: `2px solid ${acertou ? "#00D4AA" : errou ? "#FF6B6B33" : c.borda}`,
                  borderRadius: "clamp(8px, 1.5vw, 12px)",
                  fontSize: "clamp(0.8rem, 2vw, 1rem)",
                  fontWeight: 700,
                  color: acertou ? "#00D4AA" : errou ? "#FF6B6B44" : c.texto,
                  cursor: usada ? "default" : "pointer",
                  opacity: errou ? 0.3 : 1,
                  transition: "all 0.15s",
                }}
              >
                {l}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Resultado({ acertos, total, fragmentos, onVoltar, cor, c }) {
  const pct = Math.round((acertos / total) * 100);
  const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "🎯" : "📚";
  const msg =
    pct >= 80
      ? "Missão Cumprida, Agente!"
      : pct >= 60
        ? "Bom Trabalho!"
        : "Continue Praticando!";
  const clrBar = pct >= 80 ? "#00D4AA" : pct >= 60 ? cor : "#FF6B6B";

  return (
    <div
      style={{
        padding: "clamp(20px, 5vw, 48px) clamp(16px, 4vw, 32px)",
        textAlign: "center",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <div
        style={{ fontSize: "clamp(3rem, 10vw, 5rem)", marginBottom: "12px" }}
      >
        {emoji}
      </div>
      <h2
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: "clamp(1.4rem, 4vw, 1.8rem)",
          color: c.texto,
          marginBottom: "8px",
        }}
      >
        {msg}
      </h2>
      <div
        style={{
          background: c.card2,
          borderRadius: "20px",
          padding: "clamp(20px, 4vw, 32px)",
          margin: "20px 0",
          border: `2px solid ${cor}44`,
        }}
      >
        <div
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: "clamp(2.5rem, 8vw, 3.5rem)",
            color: clrBar,
            fontWeight: 700,
          }}
        >
          {acertos}/{total}
        </div>
        <div
          style={{
            color: c.textoSub,
            fontSize: "clamp(0.85rem, 1.8vw, 0.95rem)",
            marginBottom: "16px",
          }}
        >
          {pct}% de acertos
        </div>
        <div
          style={{
            height: "12px",
            background: c.borda,
            borderRadius: "6px",
            overflow: "hidden",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: clrBar,
              borderRadius: "6px",
              transition: "width 1s ease",
              boxShadow: `0 0 10px ${clrBar}66`,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            background: "#00D4AA18",
            border: "2px solid #00D4AA44",
            borderRadius: "14px",
            padding: "clamp(10px, 2vw, 14px) clamp(16px, 3vw, 24px)",
          }}
        >
          <span style={{ fontSize: "clamp(1.2rem, 3vw, 1.6rem)" }}>🧩</span>
          <div>
            <div
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                color: "#00D4AA",
                fontWeight: 700,
              }}
            >
              +{fragmentos} Fragmentos
            </div>
            <div
              style={{
                fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)",
                color: c.textoSub,
              }}
            >
              coletados nesta missão
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onVoltar}
        style={{
          width: "100%",
          padding: "clamp(14px, 3vw, 18px)",
          background: "linear-gradient(135deg, #00D4AA, #0099FF)",
          border: "none",
          borderRadius: "16px",
          color: "#FFF",
          fontSize: "clamp(1rem, 2vw, 1.1rem)",
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "'Fredoka', sans-serif",
          boxShadow: "0 4px 16px rgba(0,212,170,0.3)",
        }}
      >
        ← Voltar às Missões
      </button>
    </div>
  );
}

export default function SubjectPage({ timer }) {
  const { disciplinaId } = useParams();
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();
  const c = useCores(tema);

  const [moduloAtivo, setModulo] = useState(null);
  const [atividade, setAtividade] = useState(null);
  const [resultado, setResultado] = useState(null);

  const disciplina = disciplinas[disciplinaId];

  if (!disciplina) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: c.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <div style={{ fontSize: "3rem" }}>🔍</div>
        <p style={{ color: c.textoSub }}>Departamento não encontrado.</p>
        <button
          onClick={() => navigate("/")}
          style={{
            color: "#00D4AA",
            background: "none",
            border: "none",
            fontSize: "1rem",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          ← Voltar ao Instituto
        </button>
      </div>
    );
  }

  const cor = disciplina.cor;
  const modulo = disciplina.modulos.find((m) => m.id === moduloAtivo);

  const concluir = (acertos, total) => {
    const frags = Math.round((acertos / total) * (modulo?.xp || 100));
    const atual = parseInt(localStorage.getItem("eduplay_xp") || "0");
    localStorage.setItem("eduplay_xp", atual + frags);
    setResultado({ acertos, total, frags });
    setAtividade(null);
  };

  // ── Resultado ──
  if (resultado) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: c.bg,
          paddingBottom: "90px",
          transition: "all 0.3s",
        }}
      >
        <PageHeader
          titulo="Resultado da Missão"
          subtitulo={modulo?.subtitulo}
          cor={cor}
          onVoltar={() => setResultado(null)}
          tema={tema}
          c={c}
          alternarTema={alternarTema}
        />
        <Resultado
          acertos={resultado.acertos}
          total={resultado.total}
          fragmentos={resultado.frags}
          onVoltar={() => {
            setResultado(null);
            setModulo(null);
          }}
          cor={cor}
          c={c}
        />
        <BottomNav />
      </div>
    );
  }

  // ── Atividade ──
  if (atividade && atividade !== "audio" && modulo) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: c.bg,
          paddingBottom: "90px",
          transition: "all 0.3s",
        }}
      >
        <PageHeader
          titulo={
            atividade === "quiz" ? "❓ Interrogatório" : "🔐 Decifrar Mensagem"
          }
          subtitulo={modulo.titulo}
          cor={cor}
          onVoltar={() => setAtividade(null)}
          tema={tema}
          c={c}
          alternarTema={alternarTema}
        />
        {atividade === "quiz" && (
          <Quiz
            perguntas={modulo.atividades.quiz}
            onConcluir={concluir}
            cor={cor}
            c={c}
          />
        )}
        {atividade === "forca" && (
          <Forca
            dados={modulo.atividades.forca}
            onConcluir={concluir}
            cor={cor}
            c={c}
          />
        )}
        <BottomNav />
      </div>
    );
  }

  // ── Módulo aberto ──
  if (moduloAtivo && modulo) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: c.bg,
          paddingBottom: "90px",
          transition: "all 0.3s",
        }}
      >
        {/* Podcast overlay */}
        {atividade === "audio" && (
          <AudioLesson
            disciplinaId={disciplinaId}
            moduloId={moduloAtivo}
            onFechar={() => setAtividade(null)}
            tema={tema}
            c={c}
            alternarTema={alternarTema}
          />
        )}

        <PageHeader
          titulo={modulo.titulo}
          subtitulo={modulo.subtitulo}
          cor={cor}
          onVoltar={() => setModulo(null)}
          tema={tema}
          c={c}
          alternarTema={alternarTema}
        />

        <main
          style={{
            padding: "clamp(12px, 3vw, 20px)",
            maxWidth: "640px",
            margin: "0 auto",
          }}
        >
          {/* Pergunta central */}
          <div
            style={{
              background: `linear-gradient(135deg, ${cor}22, ${cor}08)`,
              borderRadius: "18px",
              padding: "clamp(16px, 3vw, 24px)",
              marginBottom: "16px",
              border: `2px solid ${cor}33`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "clamp(2rem, 6vw, 3rem)",
                marginBottom: "8px",
              }}
            >
              {modulo.icone}
            </div>
            <div
              style={{
                fontSize: "clamp(0.65rem, 1.4vw, 0.75rem)",
                color: cor,
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              🔍 Pergunta Central
            </div>
            <div
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                color: c.texto,
                lineHeight: 1.4,
              }}
            >
              {modulo.perguntaCentral}
            </div>
          </div>

          {/* Podcast */}
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                fontSize: "clamp(0.72rem, 1.5vw, 0.8rem)",
                color: c.textoSub,
                fontWeight: 700,
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              🎙️ Podcast do Instituto
            </div>
            <button
              onClick={() => setAtividade("audio")}
              style={{
                width: "100%",
                background: tema === "escuro" ? "#0D1F30" : "#1A2B3C22",
                borderRadius: "16px",
                padding: "clamp(14px, 3vw, 20px)",
                border: `2px solid ${cor}44`,
                display: "flex",
                alignItems: "center",
                gap: "clamp(12px, 2.5vw, 20px)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.border = `2px solid ${cor}99`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.border = `2px solid ${cor}44`)
              }
            >
              <div
                style={{
                  width: "clamp(48px, 10vw, 64px)",
                  height: "clamp(48px, 10vw, 64px)",
                  flexShrink: 0,
                  background: `${cor}33`,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
                  border: `2px solid ${cor}55`,
                }}
              >
                🎙️
              </div>
              <div>
                <div
                  style={{
                    color: c.texto,
                    fontFamily: "'Fredoka', sans-serif",
                    fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
                    marginBottom: "4px",
                  }}
                >
                  {modulo.video.titulo}
                </div>
                <div
                  style={{
                    color: c.textoSub,
                    fontSize: "clamp(0.75rem, 1.5vw, 0.85rem)",
                  }}
                >
                  com legenda sincronizada
                </div>
              </div>
            </button>
          </div>

          {/* Atividades */}
          <div
            style={{
              fontSize: "clamp(0.72rem, 1.5vw, 0.8rem)",
              color: c.textoSub,
              fontWeight: 700,
              marginBottom: "10px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            🎯 Atividades da Missão
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "clamp(8px, 2vw, 14px)",
              marginBottom: "16px",
            }}
          >
            {[
              {
                id: "quiz",
                icone: "❓",
                titulo: "Interrogatório",
                sub: `${modulo.atividades.quiz.length} perguntas`,
                clr: "#0099FF",
              },
              {
                id: "forca",
                icone: "🔐",
                titulo: "Decifrar Mensagem",
                sub: "Adivinhe a palavra",
                clr: "#FFB830",
              },
            ].map((at) => (
              <button
                key={at.id}
                onClick={() => setAtividade(at.id)}
                style={{
                  background: c.card,
                  border: `2px solid ${at.clr}44`,
                  borderRadius: "18px",
                  padding: "clamp(14px, 3vw, 22px) clamp(12px, 2.5vw, 18px)",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.border = `2px solid ${at.clr}99`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.border = `2px solid ${at.clr}44`;
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
                    marginBottom: "8px",
                  }}
                >
                  {at.icone}
                </div>
                <div
                  style={{
                    fontFamily: "'Fredoka', sans-serif",
                    color: c.texto,
                    fontSize: "clamp(0.85rem, 2vw, 1rem)",
                    marginBottom: "4px",
                    fontWeight: 600,
                  }}
                >
                  {at.titulo}
                </div>
                <div
                  style={{
                    fontSize: "clamp(0.7rem, 1.4vw, 0.8rem)",
                    color: c.textoSub,
                  }}
                >
                  {at.sub}
                </div>
              </button>
            ))}
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "12px",
              background: c.card2,
              borderRadius: "12px",
              border: `2px solid ${c.borda}`,
            }}
          >
            <span
              style={{
                color: c.textoSub,
                fontSize: "clamp(0.78rem, 1.6vw, 0.88rem)",
              }}
            >
              🧩 Esta missão vale até{" "}
              <strong style={{ color: cor }}>{modulo.xp} fragmentos</strong>
            </span>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // ── Lista de Missões ──
  return (
    <div
      style={{
        minHeight: "100vh",
        background: c.bg,
        fontFamily: "'Nunito', sans-serif",
        paddingBottom: "90px",
        transition: "all 0.3s",
      }}
    >
      <header
        style={{
          background: c.header,
          borderBottom: `2px solid ${c.borda}`,
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${cor}22, ${cor}08)`,
            padding: "clamp(14px, 3vw, 20px)",
          }}
        >
          <div
            style={{
              maxWidth: "640px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <button
              onClick={() => navigate("/")}
              style={{
                width: "40px",
                height: "40px",
                flexShrink: 0,
                background: c.card2,
                border: `2px solid ${c.borda}`,
                borderRadius: "12px",
                fontSize: "1.1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: c.texto,
              }}
            >
              ←
            </button>
            <div
              style={{
                width: "clamp(44px, 8vw, 56px)",
                height: "clamp(44px, 8vw, 56px)",
                flexShrink: 0,
                background: `${cor}22`,
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                border: `2px solid ${cor}44`,
              }}
            >
              {disciplina.icone}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
                  color: c.texto,
                  fontWeight: 700,
                }}
              >
                {disciplina.depto}
              </div>
              <div
                style={{
                  fontSize: "clamp(0.72rem, 1.5vw, 0.82rem)",
                  color: cor,
                  fontWeight: 700,
                }}
              >
                {disciplina.missao}
              </div>
            </div>
            <button
              onClick={alternarTema}
              style={{
                width: "40px",
                height: "40px",
                flexShrink: 0,
                background: c.card2,
                border: `2px solid ${c.borda}`,
                borderRadius: "12px",
                fontSize: "1.1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {tema === "escuro" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <main
        style={{
          padding: "clamp(12px, 3vw, 20px)",
          maxWidth: "640px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            fontSize: "clamp(0.72rem, 1.5vw, 0.8rem)",
            color: c.textoSub,
            fontWeight: 700,
            marginBottom: "12px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          📋 {disciplina.modulos.length} missões disponíveis
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(10px, 2vw, 14px)",
          }}
        >
          {disciplina.modulos.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => m.desbloqueada && setModulo(m.id)}
              style={{
                background: c.card,
                border: `2px solid ${m.desbloqueada ? cor + "44" : c.borda}`,
                borderRadius: "18px",
                padding: "clamp(14px, 3vw, 20px)",
                display: "flex",
                alignItems: "center",
                gap: "clamp(12px, 2.5vw, 18px)",
                cursor: m.desbloqueada ? "pointer" : "not-allowed",
                opacity: m.desbloqueada ? 1 : 0.5,
                textAlign: "left",
                width: "100%",
                transition: "all 0.2s",
                boxShadow: m.desbloqueada ? `0 2px 12px ${cor}18` : "none",
              }}
              onMouseEnter={(e) => {
                if (m.desbloqueada) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 6px 20px ${cor}30`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = m.desbloqueada
                  ? `0 2px 12px ${cor}18`
                  : "none";
              }}
            >
              <div
                style={{
                  width: "clamp(48px, 10vw, 62px)",
                  height: "clamp(48px, 10vw, 62px)",
                  flexShrink: 0,
                  background: m.desbloqueada ? `${cor}22` : c.borda,
                  borderRadius: "16px",
                  border: `2px solid ${m.desbloqueada ? cor + "44" : c.borda}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(1.4rem, 3.5vw, 1.8rem)",
                }}
              >
                {m.desbloqueada ? m.icone : "🔒"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "clamp(0.65rem, 1.3vw, 0.72rem)",
                    color: cor,
                    fontWeight: 700,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: "3px",
                  }}
                >
                  Missão {String(idx + 1).padStart(2, "0")}
                </div>
                <div
                  style={{
                    fontFamily: "'Fredoka', sans-serif",
                    fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
                    color: c.texto,
                    marginBottom: "3px",
                    fontWeight: 600,
                  }}
                >
                  {m.titulo}
                </div>
                <div
                  style={{
                    fontSize: "clamp(0.75rem, 1.5vw, 0.85rem)",
                    color: c.textoSub,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {m.perguntaCentral}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "4px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(0.72rem, 1.4vw, 0.82rem)",
                    color: cor,
                    fontWeight: 700,
                    background: `${cor}18`,
                    padding: "3px 8px",
                    borderRadius: "8px",
                  }}
                >
                  🧩 {m.xp}
                </div>
                {m.desbloqueada && (
                  <div
                    style={{
                      color: c.textoSub,
                      fontSize: "clamp(1rem, 2vw, 1.3rem)",
                    }}
                  >
                    ›
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </main>
      <BottomNav />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700&display=swap');`}</style>
    </div>
  );
}
