import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTema } from "../context/ThemeContext";
import { disciplinas } from "../utils/content";
import BottomNav from "../components/BottomNav";
import AudioLesson from "../components/AudioLesson";
import OlloAssistant from "../components/OlloAssistant";
import {
  getMissoesPorDisciplina,
  marcarMissaoFeita,
  registrarMissaoConcluida,
  salvarMissao,
} from "../services/db";
import { gerarMissaoIA } from "../services/ia";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../services/firebase";

function useCores(tema) {
  const e = tema === "escuro";
  return {
    bg: e ? "#0F1923" : "#F5F9FF",
    card: e ? "#1A2B3C" : "#FFFFFF",
    card2: e ? "#1E3347" : "#F0F7FF",
    texto: e ? "#E8F4F8" : "#1A2B3C",
    textoSub: e ? "#7A9BB0" : "#5A7A8A",
    borda: e ? "#2A3F52" : "#DDE8F0",
    header: e ? "#0D1820" : "#FFFFFF",
    verde: "#0F6E56",
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
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${cor}22, ${cor}08)`,
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={onVoltar}
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              background: c.card2,
              border: `2px solid ${c.borda}`,
              borderRadius: 12,
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
                fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                color: c.texto,
                fontWeight: 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {titulo}
            </div>
            {subtitulo && (
              <div style={{ fontSize: "0.75rem", color: cor, fontWeight: 700 }}>
                {subtitulo}
              </div>
            )}
          </div>
          <button
            onClick={alternarTema}
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              background: c.card2,
              border: `2px solid ${c.borda}`,
              borderRadius: 12,
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
  );
}

// ── Embaralha array sem mutar o original ──
function embaralhar(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Quiz com alternativas embaralhadas ──
function Quiz({ perguntas, onConcluir, cor, c }) {
  const [indice, setIndice] = useState(0);
  const [sel, setSel] = useState(null);
  const [respondeu, setRespondeu] = useState(false);
  const [acertos, setAcertos] = useState(0);

  // Embaralha as opções uma vez ao montar, guardando o texto correto
  const [perguntasEmbaralhadas] = useState(() =>
    perguntas.map((q) => {
      const textoCorreto = q.opcoes[q.correta];
      const opcoesNovas = embaralhar(q.opcoes);
      return {
        ...q,
        opcoes: opcoesNovas,
        correta: opcoesNovas.indexOf(textoCorreto),
      };
    }),
  );

  if (!perguntasEmbaralhadas?.length) return null;
  const q = perguntasEmbaralhadas[indice];
  const total = perguntasEmbaralhadas.length;

  const responder = (i) => {
    if (respondeu) return;
    setSel(i);
    setRespondeu(true);
    if (i === q.correta) setAcertos((a) => a + 1);
  };

  const proxima = () => {
    // acertos já foi incrementado por setAcertos em responder()
    // NÃO somar novamente aqui para evitar contagem dupla na última pergunta
    if (indice + 1 >= total) {
      onConcluir(acertos, total);
    } else {
      setIndice((i) => i + 1);
      setSel(null);
      setRespondeu(false);
    }
  };

  const acertou = respondeu && sel === q.correta;
  const msgAcerto = [
    "Isso mesmo! Você entendeu! 🌟",
    "Ótimo raciocínio! Continue assim! 🎯",
    "Correto! Seu esforço está valendo! ✨",
    "Excelente! Você está crescendo! 🏆",
  ][indice % 4];
  const msgErro = [
    "Quase lá! Veja o que acontece aqui 💪",
    "Boa tentativa! O aprendizado vem da prática 📚",
    "Não foi dessa vez — mas você está evoluindo! 🌱",
    "Continue tentando! Cada erro ensina algo novo 💡",
  ][indice % 4];

  return (
    <div
      style={{
        padding: "16px",
        maxWidth: 640,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 14,
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
        <span
          style={{ fontSize: "0.8rem", color: c.textoSub, fontWeight: 600 }}
        >
          Pergunta {indice + 1} de {total}
        </span>
        <div style={{ display: "flex", gap: 5 }}>
          {perguntasEmbaralhadas.map((_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: i <= indice ? cor : c.borda,
                opacity: i < indice ? 0.4 : 1,
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          background: c.card2,
          borderRadius: 18,
          padding: "18px 20px",
          border: `2px solid ${c.borda}`,
          fontFamily: "'Fredoka', sans-serif",
          fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
          color: c.texto,
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        {q.pergunta}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opcoes.map((op, i) => {
          let bg = c.card,
            brd = c.borda,
            clr = c.texto;
          if (respondeu) {
            if (i === q.correta) {
              bg = "#0F6E5618";
              brd = "#0F6E56";
              clr = "#0F6E56";
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
                borderRadius: 14,
                padding: "13px 16px",
                color: clr,
                fontSize: "0.95rem",
                fontWeight: respondeu && i === q.correta ? 700 : 500,
                cursor: respondeu ? "default" : "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                fontFamily: "'Nunito', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>
                {respondeu && i === q.correta
                  ? "✅"
                  : respondeu && i === sel && i !== q.correta
                    ? "💙"
                    : "○"}
              </span>
              {op}
            </button>
          );
        })}
      </div>

      {respondeu && (
        <div
          style={{
            background: acertou ? "#0F6E5611" : "#E0F0FF18",
            border: `2px solid ${acertou ? "#0F6E5644" : "#6B9FD444"}`,
            borderRadius: 14,
            padding: "14px 16px",
            color: c.texto,
            fontSize: "0.9rem",
            lineHeight: 1.6,
          }}
        >
          <strong>{acertou ? msgAcerto : msgErro} </strong>
          {q.explicacao}
        </div>
      )}

      {respondeu && (
        <button
          onClick={proxima}
          style={{
            width: "100%",
            padding: "14px",
            background: `linear-gradient(135deg, ${cor}, ${cor}CC)`,
            border: "none",
            borderRadius: 14,
            color: "#fff",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Fredoka', sans-serif",
            boxShadow: `0 4px 16px ${cor}40`,
          }}
        >
          {indice + 1 >= total ? "🏁 Ver Resultado" : "Próxima →"}
        </button>
      )}
    </div>
  );
}

function Forca({ dados, onConcluir, cor, c }) {
  const palavra = (dados?.palavra || "APRENDER").toUpperCase();
  const dica = dados?.dica || dados?.dicas?.[0] || "";
  const MAX_ERROS = 6;
  const [letrasUsadas, setLetrasUsadas] = useState(new Set());
  const [erros, setErros] = useState(0);

  const completa = palavra
    .split("")
    .filter((l) => l !== " ")
    .every((l) => letrasUsadas.has(l));
  const perdeu = erros >= MAX_ERROS;

  useEffect(() => {
    if (completa) setTimeout(() => onConcluir(1, 1), 800);
    if (perdeu) setTimeout(() => onConcluir(0, 1), 800);
  }, [completa, perdeu]);

  const tentarLetra = (letra) => {
    if (letrasUsadas.has(letra) || completa || perdeu) return;
    const novas = new Set(letrasUsadas);
    novas.add(letra);
    setLetrasUsadas(novas);
    if (!palavra.includes(letra)) setErros((e) => e + 1);
  };

  return (
    <div
      style={{
        padding: "16px",
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "center",
      }}
    >
      {dica && (
        <div
          style={{
            background: `${cor}15`,
            border: `1.5px solid ${cor}44`,
            borderRadius: 12,
            padding: "10px 16px",
            fontSize: "0.85rem",
            color: c.texto,
            fontWeight: 600,
            width: "100%",
            textAlign: "center",
          }}
        >
          💡 Dica: {dica}
        </div>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: MAX_ERROS }, (_, i) => (
          <div
            key={i}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: i < erros ? "#FF6B6B22" : `${cor}22`,
              border: `2px solid ${i < erros ? "#FF6B6B44" : `${cor}44`}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
            }}
          >
            {i < erros ? "💔" : "❤️"}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {palavra.split("").map((letra, i) =>
          letra === " " ? (
            <div key={i} style={{ width: 20 }} />
          ) : (
            <div
              key={i}
              style={{
                width: 34,
                height: 42,
                borderBottom: `3px solid ${cor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                fontWeight: 700,
                color: c.texto,
                fontFamily: "'Fredoka', sans-serif",
              }}
            >
              {letrasUsadas.has(letra) ? (
                letra
              ) : perdeu ? (
                <span style={{ color: "#FF6B6B" }}>{letra}</span>
              ) : (
                ""
              )}
            </div>
          ),
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 5,
          justifyContent: "center",
          maxWidth: 320,
        }}
      >
        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => {
          const usada = letrasUsadas.has(l);
          const certa = usada && palavra.includes(l);
          const errada = usada && !palavra.includes(l);
          return (
            <button
              key={l}
              onClick={() => tentarLetra(l)}
              disabled={usada || completa || perdeu}
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                border: `2px solid ${certa ? cor : errada ? "#FF6B6B44" : c.borda}`,
                background: certa ? `${cor}22` : errada ? "#FF6B6B11" : c.card,
                color: certa ? cor : errada ? "#FF6B6B" : c.texto,
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: usada ? "default" : "pointer",
                opacity: usada ? 0.5 : 1,
                transition: "all 0.15s",
              }}
            >
              {l}
            </button>
          );
        })}
      </div>
      {(completa || perdeu) && (
        <div
          style={{
            background: completa ? "#0F6E5618" : "#FF6B6B15",
            border: `2px solid ${completa ? "#0F6E56" : "#FF6B6B"}44`,
            borderRadius: 14,
            padding: "14px 20px",
            textAlign: "center",
            width: "100%",
          }}
        >
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: c.texto,
              margin: 0,
            }}
          >
            {completa
              ? "🌟 Você descobriu a palavra!"
              : `💪 A palavra era: ${palavra}`}
          </p>
          {perdeu && (
            <p
              style={{
                fontSize: "0.78rem",
                color: c.textoSub,
                margin: "6px 0 0",
              }}
            >
              Continue praticando — cada tentativa é aprendizado!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Resultado({ acertos, total, onVoltar, cor, c }) {
  const pct = Math.round((acertos / total) * 100);
  const msg =
    pct >= 80
      ? {
          emoji: "🌟",
          titulo: "Excelente trabalho!",
          sub: "Você demonstrou ótima compreensão do conteúdo.",
        }
      : pct >= 50
        ? {
            emoji: "💪",
            titulo: "Você está evoluindo!",
            sub: "Cada tentativa te deixa mais preparado. Continue!",
          }
        : {
            emoji: "📚",
            titulo: "Você se dedicou hoje!",
            sub: "O mais importante é ter tentado. Pratique mais e vai melhorar!",
          };

  return (
    <main
      style={{
        padding: "20px 16px",
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          background: c.card,
          borderRadius: 24,
          padding: "28px 24px",
          border: `2px solid ${cor}33`,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>{msg.emoji}</div>
        <h2
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: "1.6rem",
            color: c.texto,
            margin: "0 0 8px",
          }}
        >
          {msg.titulo}
        </h2>
        <p
          style={{
            fontSize: "0.88rem",
            color: c.textoSub,
            margin: "0 0 20px",
            lineHeight: 1.5,
          }}
        >
          {msg.sub}
        </p>
        <div
          style={{
            height: 10,
            background: c.borda,
            borderRadius: 5,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${cor}, ${cor}99)`,
              borderRadius: 5,
              transition: "width 1.2s ease",
            }}
          />
        </div>
        <p style={{ fontSize: "0.78rem", color: c.textoSub, margin: 0 }}>
          {acertos} de {total} {total === 1 ? "questão" : "questões"} — missão
          concluída!
        </p>
      </div>
      <div
        style={{
          background: `${cor}12`,
          border: `1.5px solid ${cor}33`,
          borderRadius: 16,
          padding: "16px 20px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "0.85rem",
            color: c.texto,
            margin: 0,
            lineHeight: 1.6,
            fontStyle: "italic",
          }}
        >
          "Estudar hoje é plantar uma semente que vai crescer para sempre."
        </p>
      </div>
      <button
        onClick={onVoltar}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 14,
          border: "none",
          background: `linear-gradient(135deg, ${cor}, ${cor}CC)`,
          color: "#fff",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: "pointer",
          fontFamily: "'Fredoka', sans-serif",
        }}
      >
        ← Voltar às missões
      </button>
    </main>
  );
}

// ══════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════
export default function SubjectPage() {
  const { disciplinaId } = useParams();
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();
  const c = useCores(tema);

  const [missoes, setMissoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [gerandoAuto, setGerandoAuto] = useState(false);
  const [erroAutoGerar, setErroAutoGerar] = useState(false);
  const [moduloAtivo, setModuloAtivo] = useState(null);
  const [atividade, setAtividade] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [bloqueioSaida, setBloqueioSaida] = useState(false);

  const disciplinaBase = disciplinas[disciplinaId];
  const codigoAcesso = localStorage.getItem("eduplay_codigo_acesso");

  // ── Carrega missões ──
  useEffect(() => {
    if (!disciplinaId) return;
    const carregar = async () => {
      try {
        // Garante auth anônima antes de qualquer leitura do Firestore
        await signInAnonymously(auth).catch(() => {});

        if (codigoAcesso) {
          const lista = await getMissoesPorDisciplina(
            codigoAcesso,
            disciplinaId,
          );
          const pendentes = lista.filter((m) => !m.feita);
          if (pendentes.length > 0) {
            setMissoes(pendentes);
            setCarregando(false);
          } else {
            setCarregando(false);
            setGerandoAuto(true);
            try {
              const missao = await gerarMissaoIA({
                disciplina: disciplinaId,
                serie: localStorage.getItem("eduplay_serie") || "6ano",
                bimestre: "1bimestre",
                tema: `Conteudo introdutorio de ${disciplinaId}`,
              });
              await salvarMissao(codigoAcesso, disciplinaId, missao);
              const novaLista = await getMissoesPorDisciplina(
                codigoAcesso,
                disciplinaId,
              );
              setMissoes(novaLista.filter((m) => !m.feita));
            } catch (err) {
              console.error("Erro ao gerar missao automatica:", err);
              setErroAutoGerar(true);
            } finally {
              setGerandoAuto(false);
            }
          }
        } else {
          setCarregando(false);
        }
      } catch (err) {
        console.error("Erro ao carregar missoes:", err);
        setCarregando(false);
      }
    };
    carregar();
  }, [disciplinaId, codigoAcesso]);

  if (!disciplinaBase) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: c.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <div style={{ fontSize: "3rem" }}>🔍</div>
        <p style={{ color: c.textoSub }}>Disciplina não encontrada.</p>
        <button
          onClick={() => navigate("/")}
          style={{
            color: "#0F6E56",
            background: "none",
            border: "none",
            fontSize: "1rem",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          ← Voltar
        </button>
      </div>
    );
  }

  const cor = disciplinaBase.cor;
  const moduloSelecionado = moduloAtivo !== null ? missoes[moduloAtivo] : null;

  // ── Concluir missão ──
  const concluir = async (acertos, total) => {
    setResultado({ acertos, total });
    setAtividade(null);
    if (moduloSelecionado?.id && codigoAcesso) {
      try {
        await Promise.all([
          marcarMissaoFeita(codigoAcesso, moduloSelecionado.id),
          registrarMissaoConcluida(
            codigoAcesso,
            `${disciplinaId}_${moduloSelecionado.id}`,
          ),
        ]);
        setMissoes((prev) => prev.filter((m) => m.id !== moduloSelecionado.id));
      } catch (err) {
        console.error("Erro ao salvar conclusao:", err);
      }
    }
  };

  // ── Resultado ──
  if (resultado) {
    return (
      <div style={{ minHeight: "100dvh", background: c.bg, paddingBottom: 90 }}>
        <PageHeader
          titulo="Missão Concluída"
          subtitulo={moduloSelecionado?.titulo}
          cor={cor}
          onVoltar={() => {
            setResultado(null);
            setModuloAtivo(null);
          }}
          tema={tema}
          c={c}
          alternarTema={alternarTema}
        />
        <Resultado
          acertos={resultado.acertos}
          total={resultado.total}
          onVoltar={() => {
            setResultado(null);
            setModuloAtivo(null);
          }}
          cor={cor}
          c={c}
        />
        <BottomNav />
      </div>
    );
  }

  // ── Atividade ──
  if (atividade && atividade !== "audio" && moduloSelecionado) {
    return (
      <div style={{ minHeight: "100dvh", background: c.bg, paddingBottom: 90 }}>
        <PageHeader
          titulo={
            atividade === "quiz"
              ? "Perguntas e Respostas"
              : "Descobrir a Palavra"
          }
          subtitulo={moduloSelecionado.titulo}
          cor={cor}
          onVoltar={() => setBloqueioSaida(true)}
          tema={tema}
          c={c}
          alternarTema={alternarTema}
        />

        {atividade === "quiz" && (
          <Quiz
            perguntas={moduloSelecionado.atividades?.quiz}
            onConcluir={concluir}
            cor={cor}
            c={c}
          />
        )}
        {atividade === "forca" && (
          <Forca
            dados={moduloSelecionado.atividades?.forca}
            onConcluir={concluir}
            cor={cor}
            c={c}
          />
        )}

        {bloqueioSaida && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <div
              style={{
                background: c.card,
                borderRadius: 24,
                padding: "28px 24px",
                maxWidth: 340,
                width: "100%",
                textAlign: "center",
                border: `2px solid ${cor}44`,
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🌱</div>
              <h3
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: "1.3rem",
                  color: c.texto,
                  margin: "0 0 10px",
                }}
              >
                Quase lá!
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: c.textoSub,
                  margin: "0 0 20px",
                  lineHeight: 1.6,
                }}
              >
                Você está no meio da missão. Cada pergunta respondida fortalece
                seu aprendizado — vale a pena terminar!
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <button
                  onClick={() => setBloqueioSaida(false)}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: 14,
                    border: "none",
                    background: cor,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  Continuar a missão ✨
                </button>
                <button
                  onClick={() => {
                    setBloqueioSaida(false);
                    setAtividade(null);
                  }}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: 14,
                    border: `1.5px solid ${c.borda}`,
                    background: "transparent",
                    color: c.textoSub,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  Sair mesmo assim
                </button>
              </div>
            </div>
          </div>
        )}
        <OlloAssistant missao={moduloSelecionado} c={c} tema={tema} />
        <BottomNav />
      </div>
    );
  }

  // ── Detalhes da missão ──
  if (moduloAtivo !== null && moduloSelecionado) {
    return (
      <div style={{ minHeight: "100dvh", background: c.bg, paddingBottom: 90 }}>
        {atividade === "audio" && (
          <AudioLesson
            disciplinaId={disciplinaId}
            moduloId={moduloAtivo}
            missao={moduloSelecionado}
            onFechar={() => setAtividade(null)}
            tema={tema}
            c={c}
            alternarTema={alternarTema}
          />
        )}
        <PageHeader
          titulo={moduloSelecionado.titulo || "Missão"}
          subtitulo="Sua missão de hoje"
          cor={cor}
          onVoltar={() => setModuloAtivo(null)}
          tema={tema}
          c={c}
          alternarTema={alternarTema}
        />

        <main style={{ padding: "16px", maxWidth: 640, margin: "0 auto" }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${cor}22, ${cor}08)`,
              borderRadius: 18,
              padding: "20px",
              marginBottom: 16,
              border: `2px solid ${cor}33`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>
              {disciplinaBase.icone}
            </div>
            <div
              style={{
                fontSize: "0.68rem",
                color: cor,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              O que vamos descobrir hoje?
            </div>
            <div
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                color: c.texto,
                lineHeight: 1.4,
              }}
            >
              {moduloSelecionado.perguntaCentral ||
                "Explore esta missão e aprenda algo novo!"}
            </div>
          </div>

          {moduloSelecionado.video && (
            <div style={{ marginBottom: 14 }}>
              <p
                style={{
                  fontSize: "0.68rem",
                  color: c.textoSub,
                  fontWeight: 700,
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                🎙️ Explicação em áudio
              </p>
              <button
                onClick={() => setAtividade("audio")}
                style={{
                  width: "100%",
                  background: c.card2,
                  borderRadius: 16,
                  padding: "14px 18px",
                  border: `2px solid ${cor}44`,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    flexShrink: 0,
                    background: `${cor}33`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
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
                      fontSize: "1rem",
                      marginBottom: 3,
                    }}
                  >
                    {moduloSelecionado.video.titulo || "Ouça a explicação"}
                  </div>
                  <div style={{ color: c.textoSub, fontSize: "0.75rem" }}>
                    Ouça antes de iniciar as atividades
                  </div>
                </div>
              </button>
            </div>
          )}

          <p
            style={{
              fontSize: "0.68rem",
              color: c.textoSub,
              fontWeight: 700,
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            🎯 Escolha uma atividade
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
              marginBottom: 14,
            }}
          >
            {[
              {
                id: "quiz",
                icone: "❓",
                titulo: "Perguntas",
                sub: "Responder questões",
                clr: "#0099FF",
              },
              {
                id: "forca",
                icone: "🔤",
                titulo: "Palavras",
                sub: "Descobrir palavras",
                clr: "#FFB830",
              },
            ].map((at) => (
              <button
                key={at.id}
                onClick={() => setAtividade(at.id)}
                style={{
                  background: c.card,
                  border: `2px solid ${at.clr}44`,
                  borderRadius: 18,
                  padding: "18px 14px",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: "2.2rem", marginBottom: 8 }}>
                  {at.icone}
                </div>
                <div
                  style={{
                    fontFamily: "'Fredoka', sans-serif",
                    color: c.texto,
                    fontSize: "0.95rem",
                    marginBottom: 4,
                    fontWeight: 600,
                  }}
                >
                  {at.titulo}
                </div>
                <div style={{ fontSize: "0.72rem", color: c.textoSub }}>
                  {at.sub}
                </div>
              </button>
            ))}
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "12px 16px",
              background: c.card2,
              borderRadius: 12,
              border: `1.5px solid ${c.borda}`,
              fontSize: "0.78rem",
              color: c.textoSub,
            }}
          >
            💡 Complete as atividades para marcar esta missão como concluída
          </div>
        </main>
        <OlloAssistant missao={moduloSelecionado} c={c} tema={tema} />
        <BottomNav />
      </div>
    );
  }

  // ── Loading / Gerando ──
  if (carregando || gerandoAuto) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: c.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "0 24px" }}>
          <div
            style={{
              fontSize: "2.5rem",
              marginBottom: 14,
              animation: "girar 2s linear infinite",
            }}
          >
            {gerandoAuto ? "🧠" : disciplinaBase?.icone || "📚"}
          </div>
          <p
            style={{
              color: c.textoSub,
              fontWeight: 700,
              fontSize: "0.95rem",
              margin: "0 0 8px",
            }}
          >
            {gerandoAuto ? "Preparando sua missão..." : "Carregando..."}
          </p>
          {gerandoAuto && (
            <p
              style={{
                color: c.textoSub,
                fontSize: "0.78rem",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              A IA está criando uma missão especial de {disciplinaBase?.label}{" "}
              para você ✨
            </p>
          )}
        </div>
        <style>{`@keyframes girar{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Lista de missões ──
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: c.bg,
        fontFamily: "'Nunito', sans-serif",
        paddingBottom: 90,
      }}
    >
      <header
        style={{
          background: c.header,
          borderBottom: `2px solid ${c.borda}`,
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${cor}22, ${cor}08)`,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <button
              onClick={() => navigate("/")}
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
                background: c.card2,
                border: `2px solid ${c.borda}`,
                borderRadius: 12,
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
                width: 48,
                height: 48,
                flexShrink: 0,
                background: `${cor}22`,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
                border: `2px solid ${cor}44`,
              }}
            >
              {disciplinaBase.icone}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
                  color: c.texto,
                  fontWeight: 700,
                }}
              >
                {disciplinaBase.depto || disciplinaBase.label}
              </div>
              <div style={{ fontSize: "0.75rem", color: cor, fontWeight: 700 }}>
                {disciplinaBase.missao || "Suas missões disponíveis"}
              </div>
            </div>
            <button
              onClick={alternarTema}
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
                background: c.card2,
                border: `2px solid ${c.borda}`,
                borderRadius: 12,
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
          padding: "clamp(16px, 4vw, 24px)",
          maxWidth: 640,
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            color: c.textoSub,
            textTransform: "uppercase",
            letterSpacing: 1,
            margin: "0 0 14px",
          }}
        >
          {missoes.length > 0
            ? `${missoes.length} ${missoes.length === 1 ? "missão disponível" : "missões disponíveis"}`
            : "Missões"}
        </p>

        {missoes.length === 0 ? (
          <div
            style={{
              background: c.card,
              borderRadius: 20,
              padding: "32px 24px",
              textAlign: "center",
              border: `1.5px dashed ${c.borda}`,
            }}
          >
            {erroAutoGerar ? (
              <>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>📡</div>
                <h3
                  style={{
                    fontFamily: "'Fredoka', sans-serif",
                    fontSize: "1.2rem",
                    color: c.texto,
                    margin: "0 0 8px",
                  }}
                >
                  Ops, sem conexão com a IA
                </h3>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: c.textoSub,
                    margin: "0 0 20px",
                    lineHeight: 1.5,
                  }}
                >
                  Não conseguimos gerar sua missão agora.
                  <br />
                  Verifique a conexão e tente novamente.
                </p>
                <button
                  onClick={() => {
                    setErroAutoGerar(false);
                    setCarregando(true);
                  }}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 12,
                    border: "none",
                    background: cor,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  Tentar novamente
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎉</div>
                <h3
                  style={{
                    fontFamily: "'Fredoka', sans-serif",
                    fontSize: "1.3rem",
                    color: c.texto,
                    margin: "0 0 8px",
                  }}
                >
                  Tudo em dia!
                </h3>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: c.textoSub,
                    margin: "0 0 20px",
                    lineHeight: 1.5,
                  }}
                >
                  Você completou todas as missões de {disciplinaBase.label}.
                  <br />
                  Seu responsável pode gerar novas quando quiser.
                </p>
                <button
                  onClick={() => navigate("/")}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 12,
                    border: "none",
                    background: cor,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  Voltar ao início
                </button>
              </>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 14,
            }}
          >
            {missoes.map((m, idx) => (
              <button
                key={m.id || idx}
                onClick={() => setModuloAtivo(idx)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = cor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = c.borda;
                }}
                style={{
                  background: c.card,
                  border: `2px solid ${c.borda}`,
                  borderRadius: 20,
                  padding: "18px",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 150,
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: `${cor}15`,
                        borderRadius: 12,
                        border: `2px solid ${cor}44`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                      }}
                    >
                      {disciplinaBase.icone}
                    </div>
                    <div
                      style={{
                        fontSize: "0.66rem",
                        color: cor,
                        fontWeight: 800,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        background: `${cor}15`,
                        padding: "4px 8px",
                        borderRadius: 8,
                      }}
                    >
                      Missão {String(idx + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Fredoka', sans-serif",
                      fontSize: "1.05rem",
                      color: c.texto,
                      fontWeight: 600,
                      marginBottom: 6,
                      lineHeight: 1.3,
                    }}
                  >
                    {m.titulo || "Missão disponível"}
                  </div>
                  {m.perguntaCentral && (
                    <div
                      style={{
                        fontSize: "0.74rem",
                        color: c.textoSub,
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {m.perguntaCentral}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    borderTop: `1.5px dashed ${c.borda}`,
                    paddingTop: 10,
                    marginTop: 10,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{ fontSize: "0.8rem", color: cor, fontWeight: 700 }}
                  >
                    Iniciar missão →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes girar { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
