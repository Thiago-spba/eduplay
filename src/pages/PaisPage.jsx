import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTema } from "../context/ThemeContext";
import { useParentLock } from "../hooks/useParentLock";
import { gerarMissaoIA } from "../services/ia";
import BottomNav from "../components/BottomNav";

const CONFIG_KEY = "eduplay_config";
const LIMITE_KEY = "eduplay_limite_diario";
const PIN_KEY = "eduplay_parent_pin";
const PREMIO_KEY = "eduplay_premio_secreto";
const MAX_MISSOES_DIA = 3;

const SERIES = [
  { id: "6ano", label: "6º ano" },
  { id: "7ano", label: "7º ano" },
  { id: "8ano", label: "8º ano" },
  { id: "9ano", label: "9º ano" },
];

const BIMESTRES = [
  { id: "1bimestre", label: "1º Bim" },
  { id: "2bimestre", label: "2º Bim" },
  { id: "3bimestre", label: "3º Bim" },
  { id: "4bimestre", label: "4º Bim" },
];

const DISCIPLINAS = [
  { id: "historia", label: "História", icone: "📜", cor: "#C4A882" },
  { id: "geografia", label: "Geografia", icone: "🗺️", cor: "#5A8F8C" },
  { id: "matematica", label: "Matemática", icone: "📐", cor: "#6B5B95" },
  { id: "ciencias", label: "Ciências", icone: "🔬", cor: "#2E8B57" },
  { id: "portugues", label: "Português", icone: "✍️", cor: "#C0392B" },
];

const FRASES_LOADING = [
  "Analisando o currículo escolar do seu filho...",
  "Preparando um plano pedagógico personalizado...",
  "Construindo atividades que desafiam e ensinam...",
  "Cada missão é única — feita sob medida para ele...",
  "Transformando conhecimento em aventura...",
  "Quase pronto — seu filho vai se surpreender...",
  "Nossos especialistas estão calibrando o conteúdo...",
  "Criando perguntas que estimulam o raciocínio...",
];

function carregarConfig() {
  try {
    const salvo = localStorage.getItem(CONFIG_KEY);
    return salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
}

function salvarConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

/* ── Controle de limite diário ── */
function getLimiteDiario() {
  try {
    const salvo = JSON.parse(localStorage.getItem(LIMITE_KEY) || "{}");
    const hoje = new Date().toISOString().slice(0, 10);
    if (salvo.data === hoje) return salvo.count || 0;
    return 0;
  } catch {
    return 0;
  }
}

function incrementarLimite() {
  const hoje = new Date().toISOString().slice(0, 10);
  const atual = getLimiteDiario();
  localStorage.setItem(
    LIMITE_KEY,
    JSON.stringify({ data: hoje, count: atual + 1 }),
  );
}

/* ═══════════════════════════════════════════════════════════════
   TELA DE PIN (COM BOTÃO VOLTAR INJETADO)
   ═══════════════════════════════════════════════════════════════ */
function TelaPIN({ onDesbloquear, lock, tema, c }) {
  const [pin, setPin] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate(); // Única adição de lógica aqui

  const digitar = (n) => {
    if (pin.length >= 4) return;
    const novo = pin + n;
    setPin(novo);
    setErro("");

    if (novo.length === 4) {
      const pinSalvo = localStorage.getItem(PIN_KEY) || "1234";
      const resultado = lock.verificarSenha
        ? lock.verificarSenha(novo)
        : { ok: false };

      if (novo === pinSalvo || resultado.ok) {
        onDesbloquear();
      } else {
        setPin("");
        if (resultado.motivo === "bloqueado") {
          setErro("Muitas tentativas. Aguarde 60 segundos.");
        } else if (resultado.motivo === "cooldown") {
          setErro(`Aguarde ${lock.tempoCooldown}s para tentar novamente.`);
        } else {
          setErro("PIN incorreto. Tente novamente.");
        }
      }
    }
  };

  const apagar = () => {
    setPin((p) => p.slice(0, -1));
    setErro("");
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: c.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔒</div>
      <h2
        style={{
          fontFamily: "'Fredoka', sans-serif",
          color: c.texto,
          fontSize: "1.3rem",
          marginBottom: 6,
        }}
      >
        Área do Responsável
      </h2>
      <p
        style={{
          color: c.textoSub,
          fontSize: "0.85rem",
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        Digite o PIN de 4 dígitos para acessar
      </p>

      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: pin.length > i ? c.accent : "transparent",
              border: `2px solid ${pin.length > i ? c.accent : c.borda}`,
              transition: "all 0.15s",
              boxShadow: pin.length > i ? `0 0 8px ${c.accent}50` : "none",
            }}
          />
        ))}
      </div>

      {erro && (
        <p
          style={{
            color: "#E05555",
            fontSize: "0.82rem",
            fontWeight: 700,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          {erro}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          maxWidth: 240,
          width: "100%",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"].map((n, i) => {
          if (n === null) return <div key={i} />;
          return (
            <button
              key={i}
              onClick={() => (n === "⌫" ? apagar() : digitar(String(n)))}
              disabled={lock?.emCooldown}
              style={{
                aspectRatio: "1",
                borderRadius: 14,
                border: `1.5px solid ${c.borda}`,
                background: c.card,
                color: c.texto,
                fontSize: n === "⌫" ? "1.2rem" : "1.4rem",
                fontWeight: 700,
                fontFamily: "'Fredoka', sans-serif",
                cursor: lock?.emCooldown ? "not-allowed" : "pointer",
                opacity: lock?.emCooldown ? 0.4 : 1,
                transition: "all 0.15s",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>

      {/* BOTÃO DE VOLTAR INJETADO ABAIXO */}
      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: 30,
          background: "none",
          border: "none",
          color: c.textoSub,
          fontSize: "0.9rem",
          fontWeight: 700,
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        ← Voltar para a Base do Agente
      </button>

      <p
        style={{
          color: c.textoSub,
          fontSize: "0.72rem",
          marginTop: 20,
          textAlign: "center",
        }}
      >
        O PIN protege as configurações do seu filho.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAINEL DO RESPONSÁVEL (MVP COM VALOR PERCEPTÍVEL)
   ═══════════════════════════════════════════════════════════════ */
export default function PaisPage({ timer }) {
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();
  const lock = useParentLock();

  const [desbloqueado, setDesbloqueado] = useState(false);
  const [secao, setSecao] = useState("monitor"); // Nova aba default
  const [config, setConfig] = useState(
    () =>
      carregarConfig() || {
        serie: "6ano",
        bimestre: "1bimestre",
        modo: "escola",
        temaLivre: "",
        tempoEstudo: 45, // Controle de tempo
      },
  );

  const [premio, setPremio] = useState(localStorage.getItem(PREMIO_KEY) || "");

  const [gerando, setGerando] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [fraseLoading, setFraseLoading] = useState(0);
  const [missoesHoje, setMissoesHoje] = useState(() => getLimiteDiario());

  // Estado para alterar PIN
  const [novoPin, setNovoPin] = useState("");
  const [mensagemPin, setMensagemPin] = useState("");

  const limiteAtingido = missoesHoje >= MAX_MISSOES_DIA;

  const e = tema === "escuro";
  const c = {
    bg: e ? "#0F1923" : "#F0F7FF",
    card: e ? "#1A2B3C" : "#FFFFFF",
    texto: e ? "#E8F4F8" : "#1A2B3C",
    textoSub: e ? "#6B8A9A" : "#7A9AAA",
    borda: e ? "#1A3347" : "#EEF5FF",
    accent: "#00D4AA",
    accentHover: "#00B894",
  };

  useEffect(() => {
    if (!gerando) return;
    setFraseLoading(0);
    const iv = setInterval(
      () => setFraseLoading((f) => (f + 1) % FRASES_LOADING.length),
      3000,
    );
    return () => clearInterval(iv);
  }, [gerando]);

  useEffect(() => {
    salvarConfig(config);
    if (timer && timer.ajustarTempo) {
      timer.ajustarTempo(config.tempoEstudo);
    }
  }, [config, timer]);

  useEffect(() => {
    localStorage.setItem(PREMIO_KEY, premio);
  }, [premio]);

  const handleSalvarPin = () => {
    if (novoPin.length === 4) {
      localStorage.setItem(PIN_KEY, novoPin);
      setMensagemPin("PIN atualizado com segurança!");
      setNovoPin("");
      setTimeout(() => setMensagemPin(""), 3000);
    } else {
      setMensagemPin("O PIN deve ter 4 dígitos.");
    }
  };

  const gerarMissao = async (disciplinaId) => {
    if (limiteAtingido) return;
    setGerando(disciplinaId);
    setMensagem(null);

    try {
      const temaAtual =
        config.modo === "livre" && config.temaLivre.trim()
          ? config.temaLivre.trim()
          : `Conteúdo do ${SERIES.find((s) => s.id === config.serie)?.label} - ${BIMESTRES.find((b) => b.id === config.bimestre)?.label}`;

      const missao = await gerarMissaoIA({
        disciplina: disciplinaId,
        serie: config.serie,
        bimestre: config.bimestre,
        tema: temaAtual,
      });

      const chave = `eduplay_missoes_ia_${disciplinaId}`;
      const existentes = JSON.parse(localStorage.getItem(chave) || "[]");
      existentes.push(missao);
      localStorage.setItem(chave, JSON.stringify(existentes));

      incrementarLimite();
      setMissoesHoje((m) => m + 1);

      const topicos =
        missao.atividades?.quiz?.map((q) => q.pergunta).slice(0, 3) || [];
      const nomeDisc = DISCIPLINAS.find((d) => d.id === disciplinaId)?.label;

      setMensagem({
        tipo: "sucesso",
        titulo: `${nomeDisc}: "${missao.titulo || "Missão Gerada"}"`,
        topicos,
        xp: missao.xp || 100,
      });
    } catch (err) {
      console.error("Erro ao gerar missao:", err);
      setMensagem({
        tipo: "erro",
        titulo: "Erro ao gerar missão",
        topicos: [],
        xp: 0,
      });
    } finally {
      setGerando(null);
    }
  };

  // Função para calcular estatísticas simuladas lendo do local storage
  const obterEstatisticas = () => {
    let totalMissoes = 0;
    DISCIPLINAS.forEach((d) => {
      totalMissoes += JSON.parse(
        localStorage.getItem(`eduplay_missoes_ia_${d.id}`) || "[]",
      ).length;
    });
    return {
      missoes: totalMissoes,
      tempo: Math.min(totalMissoes * 15, 120), // Simulando 15 min por missão
    };
  };

  if (!desbloqueado) {
    return (
      <TelaPIN
        onDesbloquear={() => setDesbloqueado(true)}
        lock={lock}
        tema={tema}
        c={c}
      />
    );
  }

  const estatisticas = obterEstatisticas();

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: c.bg,
        fontFamily: "'Nunito', sans-serif",
        paddingBottom: 100,
        transition: "background 0.3s",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: `2px solid ${c.borda}`,
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: c.bg,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
              color: c.texto,
              padding: "4px 8px",
              borderRadius: 8,
            }}
          >
            ←
          </button>
          <span
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: c.accent,
            }}
          >
            Painel do Responsável
          </span>
        </div>
        <button
          onClick={alternarTema}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: `2px solid ${c.borda}`,
            background: e ? "#1A2B3C" : "#fff",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {e ? "\u2600\uFE0F" : "\uD83C\uDF19"}
        </button>
      </header>

      <main
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* ── Abas de Navegação ── */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "monitor", label: "Desempenho", icone: "📊" },
            { id: "config", label: "Configurar", icone: "⚙️" },
            { id: "gerar", label: "Missões", icone: "🤖" },
          ].map((aba) => (
            <button
              key={aba.id}
              onClick={() => setSecao(aba.id)}
              style={{
                flex: 1,
                padding: "10px 4px",
                borderRadius: 12,
                border: `2px solid ${secao === aba.id ? c.accent : c.borda}`,
                background: secao === aba.id ? `${c.accent}15` : "transparent",
                color: secao === aba.id ? c.accent : c.textoSub,
                fontWeight: 800,
                fontSize: "0.78rem",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{aba.icone}</span>
              {aba.label}
            </button>
          ))}
        </div>

        {/* ═══ ABA 1: MONITORAMENTO (DESEMPENHO) ═══ */}
        {secao === "monitor" && (
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
                border: `1.5px solid ${c.borda}`,
                borderRadius: 16,
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: c.textoSub,
                    margin: "0 0 4px",
                    textTransform: "uppercase",
                  }}
                >
                  Tempo de Estudo Estimado
                </p>
                <h3
                  style={{
                    fontSize: "1.8rem",
                    color: c.texto,
                    margin: 0,
                    fontFamily: "'Fredoka', sans-serif",
                  }}
                >
                  {estatisticas.tempo}{" "}
                  <span style={{ fontSize: "1rem", color: c.textoSub }}>
                    min
                  </span>
                </h3>
              </div>
              <div style={{ fontSize: "2.5rem" }}>⏱️</div>
            </div>

            <div
              style={{
                background: c.card,
                border: `1.5px solid ${c.borda}`,
                borderRadius: 16,
                padding: "20px",
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: c.textoSub,
                  margin: "0 0 16px",
                  textTransform: "uppercase",
                }}
              >
                Progresso por Disciplina
              </p>

              {DISCIPLINAS.map((d) => {
                const total = JSON.parse(
                  localStorage.getItem(`eduplay_missoes_ia_${d.id}`) || "[]",
                ).length;
                return (
                  <div key={d.id} style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                        color: c.texto,
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      <span>
                        {d.icone} {d.label}
                      </span>
                      <span>{total > 0 ? `${total} missões` : "Pendente"}</span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 8,
                        background: c.borda,
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(total * 20, 100)}%`,
                          height: "100%",
                          background: d.cor,
                          transition: "width 0.5s",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p
              style={{
                fontSize: "0.75rem",
                color: c.textoSub,
                textAlign: "center",
                margin: 0,
              }}
            >
              * Os dados representam o volume de missões geradas pela
              plataforma.
            </p>
          </div>
        )}

        {/* ═══ ABA 2: CONFIGURAR ═══ */}
        {secao === "config" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              animation: "fadeIn 0.3s ease",
            }}
          >
            {/* Bloco de Configuração de Tempo (INJETADO) */}
            <div
              style={{
                background: c.card,
                border: `1.5px solid ${c.borda}`,
                borderRadius: 16,
                padding: "16px 18px",
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: c.textoSub,
                  margin: "0 0 12px",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Limite de Tempo Diário
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  color: c.texto,
                  fontWeight: 700,
                }}
              >
                <span>{config.tempoEstudo} minutos</span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={config.tempoEstudo}
                onChange={(e) =>
                  setConfig({ ...config, tempoEstudo: Number(e.target.value) })
                }
                style={{ width: "100%", accentColor: c.accent }}
              />
              <p
                style={{
                  fontSize: "0.7rem",
                  color: c.textoSub,
                  margin: "8px 0 0",
                }}
              >
                Evita bloqueios abruptos. O app avisará o aluno antes do tempo
                esgotar.
              </p>
            </div>

            {/* Bloco do Contrato de Recompensa Secreta (INJETADO) */}
            <div
              style={{
                background: `linear-gradient(135deg, ${e ? "#1A1A2E" : "#FFF8E8"}, ${e ? "#2D1B4E" : "#FFF0D4"})`,
                border: "2px solid #FFB83044",
                borderRadius: 16,
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>🎁</span>
                <p
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 800,
                    color: e ? "#FFB830" : "#B07D00",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Contrato de Premiação
                </p>
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: e ? "#A0B8C8" : "#8A6D3B",
                  margin: "0 0 12px",
                }}
              >
                O que o Agente ganhará após concluir 5 missões? (Aparecerá como
                surpresa para ele).
              </p>
              <textarea
                value={premio}
                onChange={(e) => setPremio(e.target.value)}
                placeholder="Ex: Uma Noite da Pizza, Gift Card do Roblox, 1h extra de videogame..."
                style={{
                  width: "100%",
                  height: "70px",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #FFB83066",
                  background: e ? "rgba(0,0,0,0.2)" : "#FFFFFF",
                  color: c.texto,
                  outline: "none",
                  resize: "none",
                  fontSize: "0.85rem",
                  fontFamily: "'Nunito', sans-serif",
                }}
              />
            </div>

            <div
              style={{
                background: c.card,
                border: `1.5px solid ${c.borda}`,
                borderRadius: 16,
                padding: "16px 18px",
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: c.textoSub,
                  margin: "0 0 12px",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Segurança
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Novo PIN (4 dígitos)"
                  value={novoPin}
                  onChange={(e) =>
                    setNovoPin(e.target.value.replace(/\D/g, ""))
                  }
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    border: `2px solid ${c.borda}`,
                    borderRadius: 12,
                    background: e ? "#0D1820" : "#F8FBFF",
                    color: c.texto,
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleSalvarPin}
                  style={{
                    padding: "10px 16px",
                    background: c.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Salvar PIN
                </button>
              </div>
              {mensagemPin && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: c.accent,
                    marginTop: 8,
                    fontWeight: 700,
                  }}
                >
                  {mensagemPin}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ═══ ABA 3: GERAR MISSÕES ═══ */}
        {secao === "gerar" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div
              style={{
                background: limiteAtingido ? "#F59E0B12" : `${c.accent}10`,
                border: `1.5px solid ${limiteAtingido ? "#F59E0B40" : `${c.accent}30`}`,
                borderRadius: 14,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: limiteAtingido ? "#F59E0B" : c.accent,
                    margin: 0,
                  }}
                >
                  {limiteAtingido
                    ? "Limite diário atingido"
                    : "Missões disponíveis hoje"}
                </p>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: c.textoSub,
                    margin: "2px 0 0",
                  }}
                >
                  {limiteAtingido
                    ? "Seu filho já tem conteúdo suficiente."
                    : "Cada missão é preparada com cuidado."}
                </p>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background:
                        i < missoesHoje
                          ? limiteAtingido
                            ? "#F59E0B"
                            : c.accent
                          : "transparent",
                      border: `2px solid ${i < missoesHoje ? (limiteAtingido ? "#F59E0B" : c.accent) : c.borda}`,
                      transition: "all 0.3s",
                    }}
                  />
                ))}
              </div>
            </div>

            {limiteAtingido && !gerando && (
              <div
                style={{
                  background: c.card,
                  border: `1.5px solid #F59E0B40`,
                  borderRadius: 16,
                  padding: "20px 18px",
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>🌟</div>
                <p
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    color: c.texto,
                    margin: "0 0 6px",
                    fontFamily: "'Fredoka', sans-serif",
                  }}
                >
                  Missão cumprida por hoje!
                </p>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: c.textoSub,
                    margin: "0 0 12px",
                    lineHeight: 1.5,
                  }}
                >
                  Volte amanhã para novas descobertas pedagógicas.
                </p>
              </div>
            )}

            {gerando && (
              <div
                style={{
                  background: `linear-gradient(135deg, ${c.accent}12, ${c.accent}05)`,
                  border: `2px solid ${c.accent}30`,
                  borderRadius: 16,
                  padding: "20px 18px",
                  textAlign: "center",
                  animation: "pulsar 2s ease-in-out infinite",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: "2.2rem",
                    marginBottom: 10,
                    animation: "girarIA 2s linear infinite",
                  }}
                >
                  🧠
                </div>
                <p
                  style={{
                    fontSize: "0.92rem",
                    fontWeight: 700,
                    color: c.accent,
                    margin: "0 0 6px",
                    minHeight: "2.8em",
                  }}
                >
                  {FRASES_LOADING[fraseLoading]}
                </p>
                <p
                  style={{ fontSize: "0.72rem", color: c.textoSub, margin: 0 }}
                >
                  Isso pode levar alguns segundos...
                </p>
              </div>
            )}

            {mensagem && !gerando && (
              <div
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  border: `1.5px solid ${mensagem.tipo === "sucesso" ? `${c.accent}40` : "#E0555540"}`,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    background:
                      mensagem.tipo === "sucesso"
                        ? `${c.accent}15`
                        : "#E0555515",
                    padding: "14px 18px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 800,
                      color: mensagem.tipo === "sucesso" ? c.accent : "#E05555",
                      margin: 0,
                    }}
                  >
                    {mensagem.tipo === "sucesso"
                      ? `✅ ${mensagem.titulo}`
                      : "❌ Erro ao gerar missão."}
                  </p>
                </div>
                {mensagem.tipo === "sucesso" && mensagem.topicos.length > 0 && (
                  <div style={{ background: c.card, padding: "14px 18px" }}>
                    {mensagem.topicos.map((t, i) => (
                      <div
                        key={i}
                        style={{ display: "flex", gap: 8, marginBottom: 6 }}
                      >
                        <span
                          style={{
                            color: c.accent,
                            fontSize: "0.8rem",
                            marginTop: 1,
                          }}
                        >
                          ▸
                        </span>
                        <p
                          style={{
                            fontSize: "0.82rem",
                            color: c.texto,
                            margin: 0,
                            lineHeight: 1.4,
                          }}
                        >
                          {t}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!gerando && !limiteAtingido && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {DISCIPLINAS.map((d) => {
                  const missoesExistentes = JSON.parse(
                    localStorage.getItem(`eduplay_missoes_ia_${d.id}`) || "[]",
                  ).length;
                  return (
                    <button
                      key={d.id}
                      onClick={() => gerarMissao(d.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "16px 18px",
                        background: c.card,
                        border: `2px solid ${d.cor}44`,
                        borderRadius: 16,
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        opacity:
                          config.modo === "livre" && !config.temaLivre.trim()
                            ? 0.5
                            : 1,
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          background: `${d.cor}22`,
                          border: `2px solid ${d.cor}44`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                        }}
                      >
                        {d.icone}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontFamily: "'Fredoka', sans-serif",
                            fontSize: "1rem",
                            color: c.texto,
                            fontWeight: 600,
                          }}
                        >
                          {d.label}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: c.textoSub }}>
                          {missoesExistentes > 0
                            ? `${missoesExistentes} missão(ões) gerada(s)`
                            : "Toque para gerar uma missão"}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: d.cor,
                          fontWeight: 700,
                          background: `${d.cor}18`,
                          padding: "4px 10px",
                          borderRadius: 8,
                        }}
                      >
                        🤖 Gerar
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <button
            onClick={() => setDesbloqueado(false)}
            style={{
              background: "transparent",
              border: `1.5px solid ${c.borda}`,
              borderRadius: 12,
              padding: "10px 20px",
              color: c.textoSub,
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            🔒 Bloquear painel
          </button>
        </div>
      </main>

      <BottomNav />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes pulsar { 0%, 100% { opacity: 1; } 50% { opacity: 0.85; } }
        @keyframes girarIA { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
