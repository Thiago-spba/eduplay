import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTema } from "../context/ThemeContext";
import { useParentLock } from "../hooks/useParentLock";
import { gerarMissaoIA } from "../services/ia";
import BottomNav from "../components/BottomNav";

const CONFIG_KEY = "eduplay_config";
const LIMITE_KEY = "eduplay_limite_diario";
const MAX_MISSOES_DIA = 3;

const SERIES = [
  { id: "6ano", label: "6º ano" },
  { id: "7ano", label: "7º ano" },
  { id: "8ano", label: "8º ano" },
  { id: "9ano", label: "9º ano" },
];

const BIMESTRES = [
  { id: "1bimestre", label: "1º Bimestre" },
  { id: "2bimestre", label: "2º Bimestre" },
  { id: "3bimestre", label: "3º Bimestre" },
  { id: "4bimestre", label: "4º Bimestre" },
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
   TELA DE PIN
   ═══════════════════════════════════════════════════════════════ */
function TelaPIN({ onDesbloquear, lock, tema, c }) {
  const [pin, setPin] = useState("");
  const [erro, setErro] = useState("");

  const digitar = (n) => {
    if (pin.length >= 4) return;
    const novo = pin + n;
    setPin(novo);
    setErro("");

    if (novo.length === 4) {
      const resultado = lock.verificarSenha(novo);
      if (resultado.ok) {
        onDesbloquear();
      } else {
        setPin("");
        if (resultado.motivo === "bloqueado") {
          setErro("Muitas tentativas. Aguarde 60 segundos.");
        } else if (resultado.motivo === "cooldown") {
          setErro(`Aguarde ${lock.tempoCooldown}s para tentar novamente.`);
        } else {
          setErro(
            `PIN incorreto. ${resultado.tentativasRestantes} tentativa${resultado.tentativasRestantes !== 1 ? "s" : ""} restante${resultado.tentativasRestantes !== 1 ? "s" : ""}.`,
          );
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
              disabled={lock.emCooldown}
              style={{
                aspectRatio: "1",
                borderRadius: 14,
                border: `1.5px solid ${c.borda}`,
                background: c.card,
                color: c.texto,
                fontSize: n === "⌫" ? "1.2rem" : "1.4rem",
                fontWeight: 700,
                fontFamily: "'Fredoka', sans-serif",
                cursor: lock.emCooldown ? "not-allowed" : "pointer",
                opacity: lock.emCooldown ? 0.4 : 1,
                transition: "all 0.15s",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>

      <p
        style={{
          color: c.textoSub,
          fontSize: "0.72rem",
          marginTop: 20,
          textAlign: "center",
        }}
      >
        PIN padrão: 1234 · Pode ser alterado após o acesso
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAINEL DO RESPONSÁVEL
   ═══════════════════════════════════════════════════════════════ */
export default function PaisPage() {
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();
  const lock = useParentLock();

  const [desbloqueado, setDesbloqueado] = useState(false);
  const [config, setConfig] = useState(
    () =>
      carregarConfig() || {
        serie: "6ano",
        bimestre: "1bimestre",
        modo: "escola",
        temaLivre: "",
      },
  );
  const [gerando, setGerando] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [secao, setSecao] = useState("config");
  const [fraseLoading, setFraseLoading] = useState(0);
  const [missoesHoje, setMissoesHoje] = useState(() => getLimiteDiario());

  const limiteAtingido = missoesHoje >= MAX_MISSOES_DIA;
  const missoesRestantes = MAX_MISSOES_DIA - missoesHoje;

  const e = tema === "escuro";
  const c = {
    bg: e ? "#0F1923" : "#F0F7FF",
    card: e ? "#1A2B3C" : "#FFFFFF",
    texto: e ? "#E8F4F8" : "#1A2B3C",
    textoSub: e ? "#6B8A9A" : "#7A9AAA",
    borda: e ? "#1A3347" : "#EEF5FF",
    accent: "#00D4AA",
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
  }, [config]);

  const gerarMissao = async (disciplinaId) => {
    if (limiteAtingido) return;

    setGerando(disciplinaId);
    setMensagem(null);

    try {
      const tema =
        config.modo === "livre" && config.temaLivre.trim()
          ? config.temaLivre.trim()
          : `Conteúdo do ${SERIES.find((s) => s.id === config.serie)?.label} - ${BIMESTRES.find((b) => b.id === config.bimestre)?.label}`;

      const missao = await gerarMissaoIA({
        disciplina: disciplinaId,
        serie: config.serie,
        bimestre: config.bimestre,
        tema,
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
        titulo: `${nomeDisc}: "${missao.titulo}"`,
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
        {/* ── Abas ── */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { id: "config", label: "Configurar", icone: "⚙️" },
            { id: "gerar", label: "Gerar Missões", icone: "🤖" },
          ].map((aba) => (
            <button
              key={aba.id}
              onClick={() => setSecao(aba.id)}
              style={{
                flex: 1,
                padding: "12px 8px",
                borderRadius: 14,
                border: `2px solid ${secao === aba.id ? c.accent : c.borda}`,
                background: secao === aba.id ? `${c.accent}15` : "transparent",
                color: secao === aba.id ? c.accent : c.textoSub,
                fontWeight: 800,
                fontSize: "0.85rem",
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 0.2s",
              }}
            >
              {aba.icone} {aba.label}
            </button>
          ))}
        </div>

        {/* ═══ ABA CONFIGURAR ═══ */}
        {secao === "config" && (
          <>
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
                Como seu filho vai estudar?
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  {
                    id: "escola",
                    label: "Acompanhar a escola",
                    icone: "🏫",
                    desc: "Série + bimestre do currículo",
                  },
                  {
                    id: "livre",
                    label: "Exploração livre",
                    icone: "🧭",
                    desc: "Escolha o tema",
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setConfig({ ...config, modo: m.id })}
                    style={{
                      flex: 1,
                      padding: "14px 10px",
                      borderRadius: 14,
                      border: `2px solid ${config.modo === m.id ? c.accent : c.borda}`,
                      background:
                        config.modo === m.id ? `${c.accent}12` : "transparent",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>
                      {m.icone}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: config.modo === m.id ? c.accent : c.texto,
                        marginBottom: 2,
                      }}
                    >
                      {m.label}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: c.textoSub }}>
                      {m.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {config.modo === "escola" && (
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
                  Série do seu filho
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  {SERIES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setConfig({ ...config, serie: s.id })}
                      style={{
                        padding: "10px 6px",
                        borderRadius: 12,
                        border: `2px solid ${config.serie === s.id ? c.accent : c.borda}`,
                        background:
                          config.serie === s.id
                            ? `${c.accent}15`
                            : "transparent",
                        color: config.serie === s.id ? c.accent : c.texto,
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        fontFamily: "'Nunito', sans-serif",
                        transition: "all 0.2s",
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
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
                  Bimestre atual
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 8,
                  }}
                >
                  {BIMESTRES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setConfig({ ...config, bimestre: b.id })}
                      style={{
                        padding: "10px 6px",
                        borderRadius: 12,
                        border: `2px solid ${config.bimestre === b.id ? c.accent : c.borda}`,
                        background:
                          config.bimestre === b.id
                            ? `${c.accent}15`
                            : "transparent",
                        color: config.bimestre === b.id ? c.accent : c.texto,
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        fontFamily: "'Nunito', sans-serif",
                        transition: "all 0.2s",
                      }}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {config.modo === "livre" && (
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
                    margin: "0 0 8px",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Qual tema seu filho vai explorar?
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: c.textoSub,
                    margin: "0 0 12px",
                  }}
                >
                  Ex: dinossauros, sistema solar, vulcões, corpo humano...
                </p>
                <input
                  type="text"
                  value={config.temaLivre}
                  onChange={(ev) =>
                    setConfig({ ...config, temaLivre: ev.target.value })
                  }
                  placeholder="Digite o tema..."
                  maxLength={120}
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    border: `2px solid ${c.borda}`,
                    borderRadius: 14,
                    fontSize: "0.95rem",
                    fontFamily: "'Nunito', sans-serif",
                    background: e ? "#0D1820" : "#F8FBFF",
                    color: c.texto,
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(ev) => (ev.target.style.borderColor = c.accent)}
                  onBlur={(ev) => (ev.target.style.borderColor = c.borda)}
                />
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: c.textoSub,
                    margin: "16px 0 8px",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Série (pra adequar a linguagem)
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 8,
                  }}
                >
                  {SERIES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setConfig({ ...config, serie: s.id })}
                      style={{
                        padding: "8px 6px",
                        borderRadius: 10,
                        border: `2px solid ${config.serie === s.id ? c.accent : c.borda}`,
                        background:
                          config.serie === s.id
                            ? `${c.accent}15`
                            : "transparent",
                        color: config.serie === s.id ? c.accent : c.texto,
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        fontFamily: "'Nunito', sans-serif",
                        transition: "all 0.2s",
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{
                background: `${c.accent}10`,
                border: `1.5px solid ${c.accent}30`,
                borderRadius: 14,
                padding: "14px 18px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "0.82rem",
                  color: c.accent,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {config.modo === "escola"
                  ? `${SERIES.find((s) => s.id === config.serie)?.label} · ${BIMESTRES.find((b) => b.id === config.bimestre)?.label} · Currículo Paulista`
                  : config.temaLivre
                    ? `Tema livre: "${config.temaLivre}" · ${SERIES.find((s) => s.id === config.serie)?.label}`
                    : "Digite um tema para explorar"}
              </p>
            </div>

            <p
              style={{
                fontSize: "0.75rem",
                color: c.textoSub,
                textAlign: "center",
              }}
            >
              Após configurar, vá na aba "Gerar Missões" para criar conteúdo.
            </p>
          </>
        )}

        {/* ═══ ABA GERAR MISSÕES ═══ */}
        {secao === "gerar" && (
          <>
            {/* ── Contador de limite diário ── */}
            <div
              style={{
                background: limiteAtingido ? "#F59E0B12" : `${c.accent}10`,
                border: `1.5px solid ${limiteAtingido ? "#F59E0B40" : `${c.accent}30`}`,
                borderRadius: 14,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
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
                    ? "Seu filho já tem conteúdo suficiente para hoje!"
                    : "Cada missão é preparada com cuidado pedagógico"}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  flexShrink: 0,
                }}
              >
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

            {/* ── Mensagem quando atinge limite ── */}
            {limiteAtingido && !gerando && (
              <div
                style={{
                  background: c.card,
                  border: `1.5px solid #F59E0B40`,
                  borderRadius: 16,
                  padding: "20px 18px",
                  textAlign: "center",
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
                  Seu filho já tem {MAX_MISSOES_DIA} missões novas para
                  explorar. O aprendizado é mais efetivo com consistência diária
                  do que com volume.
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: c.accent,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  Volte amanhã para novas descobertas!
                </p>
              </div>
            )}

            {/* ── Loading com frases rotativas ── */}
            {gerando && (
              <div
                style={{
                  background: `linear-gradient(135deg, ${c.accent}12, ${c.accent}05)`,
                  border: `2px solid ${c.accent}30`,
                  borderRadius: 16,
                  padding: "20px 18px",
                  textAlign: "center",
                  animation: "pulsar 2s ease-in-out infinite",
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
                    lineHeight: 1.4,
                    minHeight: "2.8em",
                    transition: "opacity 0.3s",
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

            {/* ── Mensagem de resultado ── */}
            {mensagem && !gerando && (
              <div
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  border: `1.5px solid ${mensagem.tipo === "sucesso" ? `${c.accent}40` : "#E0555540"}`,
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
                      : "❌ Erro ao gerar missão. Tente novamente."}
                  </p>
                </div>
                {mensagem.tipo === "sucesso" && mensagem.topicos.length > 0 && (
                  <div style={{ background: c.card, padding: "14px 18px" }}>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: c.textoSub,
                        margin: "0 0 8px",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Seu filho vai aprender sobre:
                    </p>
                    {mensagem.topicos.map((t, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            color: c.accent,
                            fontSize: "0.8rem",
                            flexShrink: 0,
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
                    <div
                      style={{
                        marginTop: 10,
                        padding: "8px 12px",
                        background: `${c.accent}08`,
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ fontSize: "0.9rem" }}>🧩</span>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: c.accent,
                          fontWeight: 700,
                        }}
                      >
                        Vale até {mensagem.xp} fragmentos
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Configuração ativa */}
            {!gerando && (
              <div
                style={{
                  background: c.card,
                  border: `1.5px solid ${c.borda}`,
                  borderRadius: 14,
                  padding: "12px 16px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: c.textoSub,
                    margin: "0 0 4px",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: 700,
                  }}
                >
                  Configuração ativa
                </p>
                <p
                  style={{
                    fontSize: "0.88rem",
                    color: c.texto,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {config.modo === "escola"
                    ? `${SERIES.find((s) => s.id === config.serie)?.label} · ${BIMESTRES.find((b) => b.id === config.bimestre)?.label}`
                    : `Tema: "${config.temaLivre || "não definido"}" · ${SERIES.find((s) => s.id === config.serie)?.label}`}
                </p>
              </div>
            )}

            {/* Grid de disciplinas */}
            {!gerando && !limiteAtingido && (
              <>
                <p
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: c.textoSub,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    margin: 0,
                  }}
                >
                  Escolha a disciplina
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {DISCIPLINAS.map((d) => {
                    const missoesExistentes = JSON.parse(
                      localStorage.getItem(`eduplay_missoes_ia_${d.id}`) ||
                        "[]",
                    ).length;
                    return (
                      <button
                        key={d.id}
                        onClick={() => gerarMissao(d.id)}
                        disabled={
                          config.modo === "livre" && !config.temaLivre.trim()
                        }
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
                          transition: "all 0.2s",
                          fontFamily: "'Nunito', sans-serif",
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
                            flexShrink: 0,
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
                          <div
                            style={{ fontSize: "0.75rem", color: c.textoSub }}
                          >
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
                            flexShrink: 0,
                          }}
                        >
                          🤖 Gerar
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <p
              style={{
                fontSize: "0.72rem",
                color: c.textoSub,
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              {limiteAtingido
                ? "O aprendizado consistente supera o volume. Qualidade é o nosso compromisso."
                : "As missões aparecem automaticamente para seu filho. Cada missão inclui quiz, forca e podcast educativo."}
            </p>
          </>
        )}

        {/* ── Bloquear painel ── */}
        <div style={{ marginTop: 8, textAlign: "center" }}>
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
        @keyframes pulsar {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        @keyframes girarIA {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
