import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTema } from "../context/ThemeContext";
import BottomNav from "../components/BottomNav";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  getTodasMissoes,
  getProgresso,
  registrarAcessoDiario,
} from "../services/db";

// ── Utilitários ──
function obterSaudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia,";
  if (h < 18) return "Boa tarde,";
  return "Boa noite,";
}

function obterDiasSemana(diasAtivos = []) {
  const nomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setDate(hoje.getDate() - ((hoje.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    return {
      label: nomes[d.getDay()],
      iso,
      feito: diasAtivos.includes(iso),
      hoje: iso === hoje.toISOString().slice(0, 10),
    };
  });
}

const DISCIPLINAS_META = {
  historia: { label: "História", icone: "📜", cor: "#C4A882" },
  geografia: { label: "Geografia", icone: "🗺️", cor: "#5A8F8C" },
  matematica: { label: "Matemática", icone: "📐", cor: "#6B5B95" },
  ciencias: { label: "Ciências", icone: "🔬", cor: "#2E8B57" },
  portugues: { label: "Português", icone: "✍️", cor: "#C0392B" },
};

const ORDEM_DISCIPLINAS = [
  "historia",
  "geografia",
  "matematica",
  "ciencias",
  "portugues",
];

// ── Componente principal ──
export default function HomePage({ playerName }) {
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();
  const e = tema === "escuro";

  const [carregando, setCarregando] = useState(true);
  const [missoes, setMissoes] = useState({});
  const [progresso, setProgresso] = useState(null);
  const [diasSemana, setDiasSemana] = useState([]);

  const c = {
    bg: e ? "#0D141C" : "#F0F4F8",
    card: e ? "#1A2633" : "#FFFFFF",
    texto: e ? "#E2E8F0" : "#1E293B",
    textoSub: e ? "#94A3B8" : "#64748B",
    borda: e ? "#2D3D50" : "#E2E8F0",
    verde: "#0F6E56",
    verdeClaro: "#E1F5EE",
    verdeSub: "#9FE1CB",
  };

  const codigoAcesso = localStorage.getItem("eduplay_codigo_acesso");
  const nomeExibido = playerName?.split(" ")[0] || "Agente";

  // ── Carrega dados do Firestore ──
  useEffect(() => {
    if (!codigoAcesso) {
      setCarregando(false);
      return;
    }
    const carregar = async () => {
      try {
        // Garante autenticação anônima antes de qualquer leitura do Firestore
        await signInAnonymously(auth).catch(() => {});

        const [missoesFB, progressoFB] = await Promise.all([
          getTodasMissoes(codigoAcesso),
          registrarAcessoDiario(codigoAcesso),
        ]);
        setMissoes(missoesFB);
        setProgresso(progressoFB);
        setDiasSemana(obterDiasSemana(progressoFB?.diasAtivos || []));
      } catch (err) {
        console.error("Erro ao carregar HomePage:", err);
        try {
          const prog = await getProgresso(codigoAcesso);
          setProgresso(prog);
          setDiasSemana(obterDiasSemana(prog?.diasAtivos || []));
        } catch {
          /* silencia */
        }
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [codigoAcesso]);

  // ── Missão principal ──
  const missaoPrincipal = (() => {
    for (const id of ORDEM_DISCIPLINAS) {
      const lista = missoes[id] || [];
      const pendentes = lista.filter((m) => !m.feita);
      if (pendentes.length > 0)
        return { id, missao: pendentes[0], ...DISCIPLINAS_META[id] };
    }
    return null;
  })();

  // ── Outras disciplinas com missões pendentes ──
  const outrasDisciplinas = ORDEM_DISCIPLINAS.filter((id) => {
    if (id === missaoPrincipal?.id) return false;
    return (missoes[id] || []).some((m) => !m.feita);
  });

  // ── Badges de esforço ──
  const diasSeguidos = progresso?.diasSeguidos || 0;
  const missoesFeitas = progresso?.missoesFeitas || 0;
  const badges = [];
  if (diasSeguidos >= 3)
    badges.push({ icone: "🔥", label: `${diasSeguidos} dias seguidos` });
  if (missoesFeitas >= 5)
    badges.push({ icone: "✅", label: "5 missões concluídas" });
  if (missoesFeitas >= 1 && diasSeguidos >= 1)
    badges.push({ icone: "💡", label: "Voltou para aprender" });

  // ── Trocar usuário ──
  const trocarUsuario = async () => {
    localStorage.removeItem("eduplay_player_name");
    localStorage.removeItem("eduplay_codigo_acesso");
    try {
      const { signOut } = await import("firebase/auth");
      const { auth } = await import("../services/firebase");
      await signOut(auth);
    } catch {}
    window.location.replace("/");
  };

  // ── Loading ──
  if (carregando) {
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
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: c.verde,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              fontSize: "1.6rem",
              animation: "pulsar 1.4s ease-in-out infinite",
            }}
          >
            🎮
          </div>
          <p
            style={{ color: c.textoSub, fontWeight: 700, fontSize: "0.88rem" }}
          >
            Carregando suas missões...
          </p>
        </div>
        <style>{`@keyframes pulsar{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: c.bg,
        fontFamily: "'Nunito', sans-serif",
        paddingBottom: 90,
      }}
    >
      {/* ── HEADER VERDE ── */}
      <div style={{ background: c.verde, padding: "18px 20px 22px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
              }}
            >
              🎮
            </div>
            <span
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#E1F5EE",
              }}
            >
              EduPlay
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={trocarUsuario}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "none",
                borderRadius: 9,
                padding: "5px 10px",
                color: "#9FE1CB",
                fontSize: "0.72rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Trocar usuário
            </button>
            <button
              onClick={alternarTema}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "none",
                borderRadius: 9,
                width: 32,
                height: 32,
                cursor: "pointer",
                fontSize: "0.95rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {e ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        <p
          style={{ margin: "0 0 2px", fontSize: "0.82rem", color: c.verdeSub }}
        >
          {obterSaudacao()}
        </p>
        <p
          style={{
            margin: "0 0 16px",
            fontSize: "1.6rem",
            fontWeight: 600,
            color: "#E1F5EE",
            fontFamily: "'Fredoka', sans-serif",
          }}
        >
          {nomeExibido}!
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          {[
            {
              icone: "🔥",
              label: "dias seguidos",
              valor: `${diasSeguidos} ${diasSeguidos === 1 ? "dia" : "dias"}`,
            },
            {
              icone: "✅",
              label: "missões feitas",
              valor: `${missoesFeitas} ${missoesFeitas === 1 ? "missão" : "missões"}`,
            },
          ].map((p) => (
            <div
              key={p.label}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.12)",
                borderRadius: 13,
                padding: "10px 13px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{p.icone}</span>
              <div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: c.verdeSub,
                    lineHeight: 1.2,
                  }}
                >
                  {p.label}
                </div>
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#E1F5EE",
                    fontFamily: "'Fredoka', sans-serif",
                  }}
                >
                  {p.valor}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTEÚDO ── */}
      <main style={{ padding: "20px 16px", maxWidth: 600, margin: "0 auto" }}>
        <p
          style={{
            fontSize: "0.66rem",
            fontWeight: 700,
            color: c.textoSub,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: "0 0 10px",
          }}
        >
          Missão de hoje
        </p>

        {missaoPrincipal ? (
          <button
            onClick={() => navigate(`/${missaoPrincipal.id}`)}
            style={{
              width: "100%",
              background: c.verdeClaro,
              borderRadius: 20,
              padding: "18px",
              border: "1.5px solid #9FE1CB",
              cursor: "pointer",
              textAlign: "left",
              marginBottom: 20,
              transition: "opacity 0.15s",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: c.verde,
                  background: "#fff",
                  borderRadius: 20,
                  padding: "3px 10px",
                  border: "1px solid #9FE1CB",
                }}
              >
                {missaoPrincipal.label}
              </span>
              <span style={{ fontSize: "0.7rem", color: "#085041" }}>
                ~15 min
              </span>
            </div>
            <p
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "#085041",
                margin: "0 0 6px",
              }}
            >
              {missaoPrincipal.missao?.titulo ||
                `Missão de ${missaoPrincipal.label}`}
            </p>
            <p
              style={{
                fontSize: "0.78rem",
                color: "#0F6E56",
                margin: "0 0 14px",
                lineHeight: 1.5,
              }}
            >
              {missaoPrincipal.missao?.perguntaCentral ||
                "Clique para iniciar sua missão de hoje."}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  background: c.verde,
                  color: c.verdeClaro,
                  borderRadius: 10,
                  padding: "7px 18px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                ▶ Jogar
              </div>
            </div>
          </button>
        ) : (
          <div
            style={{
              background: c.card,
              borderRadius: 20,
              padding: "24px",
              textAlign: "center",
              border: `1.5px dashed ${c.borda}`,
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: "2rem" }}>📭</span>
            <p
              style={{
                color: c.textoSub,
                fontSize: "0.88rem",
                fontWeight: 600,
                margin: "10px 0 4px",
              }}
            >
              Nenhuma missão disponível ainda.
            </p>
            <p
              style={{
                color: c.textoSub,
                fontSize: "0.76rem",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Peça para o responsável gerar missões no Painel.
            </p>
          </div>
        )}

        {/* Semana */}
        <p
          style={{
            fontSize: "0.66rem",
            fontWeight: 700,
            color: c.textoSub,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: "0 0 10px",
          }}
        >
          Semana
        </p>
        <div
          style={{
            background: c.card,
            borderRadius: 16,
            padding: "14px 16px",
            border: `1.5px solid ${c.borda}`,
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          {diasSemana.map((d) => (
            <div
              key={d.iso}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: d.feito
                    ? c.verdeClaro
                    : d.hoje
                      ? "#E6F1FB"
                      : "transparent",
                  border: d.feito
                    ? "1.5px solid #5DCAA5"
                    : d.hoje
                      ? "1.5px solid #378ADD"
                      : `1.5px solid ${c.borda}`,
                }}
              >
                {d.feito ? (
                  <span
                    style={{
                      color: c.verde,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                ) : d.hoje ? (
                  <span
                    style={{
                      color: "#185FA5",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                    }}
                  >
                    •
                  </span>
                ) : (
                  <span style={{ color: c.borda, fontSize: "0.9rem" }}>·</span>
                )}
              </div>
              <span
                style={{
                  fontSize: "0.6rem",
                  color: d.hoje ? c.texto : c.textoSub,
                  fontWeight: d.hoje ? 700 : 400,
                }}
              >
                {d.label}
              </span>
            </div>
          ))}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <>
            <p
              style={{
                fontSize: "0.66rem",
                fontWeight: 700,
                color: c.textoSub,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "0 0 10px",
              }}
            >
              Conquistado
            </p>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              {badges.map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: c.card,
                    borderRadius: 12,
                    padding: "8px 12px",
                    border: `1.5px solid ${c.borda}`,
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{b.icone}</span>
                  <span
                    style={{
                      fontSize: "0.76rem",
                      color: c.texto,
                      fontWeight: 600,
                    }}
                  >
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Outras matérias */}
        {outrasDisciplinas.length > 0 && (
          <>
            <p
              style={{
                fontSize: "0.66rem",
                fontWeight: 700,
                color: c.textoSub,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "0 0 10px",
              }}
            >
              Outras matérias disponíveis
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {outrasDisciplinas.map((id) => {
                const meta = DISCIPLINAS_META[id];
                const total = (missoes[id] || []).filter(
                  (m) => !m.feita,
                ).length;
                return (
                  <button
                    key={id}
                    onClick={() => navigate(`/${id}`)}
                    style={{
                      background: c.card,
                      borderRadius: 16,
                      padding: "14px 16px",
                      border: `1.5px solid ${c.borda}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: `${meta.cor}22`,
                        border: `1.5px solid ${meta.cor}44`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.4rem",
                        flexShrink: 0,
                      }}
                    >
                      {meta.icone}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "'Fredoka', sans-serif",
                          fontSize: "0.95rem",
                          color: c.texto,
                          fontWeight: 600,
                        }}
                      >
                        {meta.label}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: c.textoSub }}>
                        {total}{" "}
                        {total === 1 ? "missão pendente" : "missões pendentes"}
                      </div>
                    </div>
                    <span style={{ color: c.textoSub, fontSize: "1.1rem" }}>
                      ›
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </main>

      <BottomNav />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes pulsar { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
      `}</style>
    </div>
  );
}
