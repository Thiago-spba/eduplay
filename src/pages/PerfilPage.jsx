import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTema } from "../context/ThemeContext";
import { niveis } from "../utils/content";
import BottomNav from "../components/BottomNav";

/* ═══════════════════════════════════════════════════════════════
   PERFIL PAGE — Dossiê do Agente
   ═══════════════════════════════════════════════════════════════ */
export default function PerfilPage({ playerName, clearName }) {
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();
  const [confirmando, setConfirmando] = useState(false);

  const e = tema === "escuro";

  /* ── Dados do jogador ── */
  const avatar = localStorage.getItem("eduplay_avatar") || "👦";
  const xpTotal = parseInt(localStorage.getItem("eduplay_xp") || "0");
  const nivelAtual = niveis.filter((n) => xpTotal >= n.xpNecessario).pop();
  const proximoNivel = niveis.find((n) => n.xpNecessario > xpTotal);
  const percentualNivel = proximoNivel
    ? Math.round(
        ((xpTotal - nivelAtual.xpNecessario) /
          (proximoNivel.xpNecessario - nivelAtual.xpNecessario)) *
          100,
      )
    : 100;

  /* ── Sequência de dias (placeholder — futuramente vem do Firestore) ── */
  const diasSemana = ["S", "T", "Q", "Q", "S", "S", "D"];
  const hoje = new Date().getDay();
  /* Simula: hoje está ativo */
  const diasAtivos = [hoje === 0 ? 6 : hoje - 1];

  /* ── Conquistas desbloqueadas ── */
  const conquistas = [
    {
      emoji: "🚀",
      titulo: "Primeiro acesso",
      desc: "Entrou no EduPlay",
      desbloqueado: true,
    },
    {
      emoji: "📚",
      titulo: "Primeira missão",
      desc: "Completou 1 atividade",
      desbloqueado: xpTotal >= 10,
    },
    {
      emoji: "🔥",
      titulo: "Em chamas",
      desc: "3 dias seguidos",
      desbloqueado: false,
    },
    {
      emoji: "🏆",
      titulo: "Centurião",
      desc: "100 fragmentos",
      desbloqueado: xpTotal >= 100,
    },
    {
      emoji: "⭐",
      titulo: "Explorador",
      desc: "Visitou todas as disciplinas",
      desbloqueado: false,
    },
    {
      emoji: "🧠",
      titulo: "Gênio",
      desc: "500 fragmentos",
      desbloqueado: xpTotal >= 500,
    },
  ];

  /* ── Cores ── */
  const c = {
    bg: e ? "#0F1923" : "#F0F7FF",
    card: e ? "#1A2B3C" : "#FFFFFF",
    texto: e ? "#E8F4F8" : "#1A2B3C",
    textoSub: e ? "#6B8A9A" : "#7A9AAA",
    borda: e ? "#1A3347" : "#EEF5FF",
    accent: "#00D4AA",
    accentBg: e ? "#00D4AA15" : "#00D4AA10",
    perigo: "#E05555",
    perigoBg: e ? "#E0555515" : "#E0555510",
  };

  const handleTrocar = () => {
    clearName();
    navigate("/");
  };

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
      {/* ── Header ── */}
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
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
            Dossiê do Agente
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
        {/* ── Card identidade ── */}
        <div
          style={{
            background: c.card,
            border: `2px solid ${c.accent}30`,
            borderRadius: 20,
            padding: "24px 20px",
            textAlign: "center",
            boxShadow: `0 4px 20px ${c.accent}10`,
          }}
        >
          <div style={{ fontSize: "3.5rem", marginBottom: 8 }}>{avatar}</div>
          <h2
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.4rem",
              color: c.texto,
              margin: "0 0 4px",
            }}
          >
            Agente {playerName}
          </h2>
          <p
            style={{
              fontSize: "0.85rem",
              color: c.accent,
              fontWeight: 700,
              margin: "0 0 16px",
            }}
          >
            {nivelAtual?.titulo || "Pesquisador Júnior"} — Nível{" "}
            {nivelAtual?.nivel || 1}
          </p>

          {/* Barra XP */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              color: c.textoSub,
              marginBottom: 6,
            }}
          >
            <span>{xpTotal} fragmentos</span>
            <span>
              {proximoNivel
                ? `Próximo: ${proximoNivel.xpNecessario}`
                : "Nível máximo!"}
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: 10,
              background: e ? "#0D1820" : "#E8F0F8",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${percentualNivel}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${c.accent}, #00A57A)`,
                borderRadius: 5,
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>

        {/* ── Sequência de dias ── */}
        <div
          style={{
            background: c.card,
            border: `1.5px solid ${c.borda}`,
            borderRadius: 16,
            padding: "16px 20px",
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
            Sequência da semana
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 6,
            }}
          >
            {diasSemana.map((dia, i) => {
              const ativo = diasAtivos.includes(i);
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "8px 0",
                    borderRadius: 10,
                    background: ativo ? c.accentBg : "transparent",
                    border: `1.5px solid ${ativo ? c.accent + "50" : c.borda}`,
                    transition: "all 0.3s",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.95rem",
                      marginBottom: 2,
                    }}
                  >
                    {ativo ? "🔥" : "⚪"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: ativo ? c.accent : c.textoSub,
                    }}
                  >
                    {dia}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Conquistas ── */}
        <div
          style={{
            background: c.card,
            border: `1.5px solid ${c.borda}`,
            borderRadius: 16,
            padding: "16px 20px",
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
            Conquistas
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
            }}
          >
            {conquistas.map((c2, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  padding: "12px 6px",
                  borderRadius: 12,
                  background: c2.desbloqueado ? c.accentBg : "transparent",
                  border: `1.5px solid ${c2.desbloqueado ? c.accent + "40" : c.borda}`,
                  opacity: c2.desbloqueado ? 1 : 0.45,
                  transition: "all 0.3s",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>
                  {c2.desbloqueado ? c2.emoji : "🔒"}
                </div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: c.texto,
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {c2.titulo}
                </p>
                <p
                  style={{
                    fontSize: "0.6rem",
                    color: c.textoSub,
                    margin: "2px 0 0",
                  }}
                >
                  {c2.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Estatísticas rápidas ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {[
            { emoji: "🧩", label: "Fragmentos", valor: xpTotal },
            {
              emoji: "📊",
              label: "Nível",
              valor: nivelAtual?.nivel || 1,
            },
            {
              emoji: "🏅",
              label: "Conquistas",
              valor:
                conquistas.filter((c2) => c2.desbloqueado).length +
                "/" +
                conquistas.length,
            },
            {
              emoji: "🔥",
              label: "Sequência",
              valor: diasAtivos.length + " dia",
            },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: c.card,
                border: `1.5px solid ${c.borda}`,
                borderRadius: 14,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>{stat.emoji}</span>
              <div>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: c.texto,
                    margin: 0,
                    fontFamily: "'Fredoka', sans-serif",
                  }}
                >
                  {stat.valor}
                </p>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: c.textoSub,
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Trocar explorador ── */}
        <div
          style={{
            marginTop: 8,
            padding: "16px",
            borderRadius: 14,
            border: `1.5px solid ${c.borda}`,
            background: c.card,
          }}
        >
          {!confirmando ? (
            <button
              onClick={() => setConfirmando(true)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                border: `1.5px solid ${c.borda}`,
                background: "transparent",
                color: c.textoSub,
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>🔄</span>
              Trocar explorador
            </button>
          ) : (
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: c.texto,
                  marginBottom: 6,
                }}
              >
                Tem certeza?
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: c.accent,
                  marginBottom: 14,
                  fontWeight: 600,
                }}
              >
                Seu progresso está salvo!
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setConfirmando(false)}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: 12,
                    border: `1.5px solid ${c.borda}`,
                    background: "transparent",
                    color: c.textoSub,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleTrocar}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: 12,
                    border: "none",
                    background: c.perigoBg,
                    color: c.perigo,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                    border: `1.5px solid ${c.perigo}30`,
                  }}
                >
                  🔄 Trocar
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
      `}</style>
    </div>
  );
}
