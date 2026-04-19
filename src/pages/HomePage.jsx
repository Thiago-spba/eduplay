import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTema } from "../context/ThemeContext";
import { disciplinas, ordemDisciplinas, niveis } from "../utils/content";
import BottomNav from "../components/BottomNav";

export default function HomePage({ playerName, timer }) {
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();

  // Estado para armazenar quantas missões (Arquivos de IA) cada departamento tem
  const [contagemMissoes, setContagemMissoes] = useState({});

  useEffect(() => {
    if (!timer.rodando && !timer.bloqueado) timer.iniciar();

    // Vasculha o localStorage para ver quantas missões reais existem por disciplina
    const novaContagem = {};
    ordemDisciplinas.forEach((id) => {
      try {
        const salvas = JSON.parse(
          localStorage.getItem(`eduplay_missoes_ia_${id}`) || "[]",
        );
        novaContagem[id] = salvas.length;
      } catch {
        novaContagem[id] = 0;
      }
    });
    setContagemMissoes(novaContagem);
  }, []);

  const xpTotal = parseInt(localStorage.getItem("eduplay_xp") || "0");
  const nivelAtual =
    niveis.filter((n) => xpTotal >= n.xpNecessario).pop() || niveis[0];
  const proximoNivel = niveis.find((n) => n.xpNecessario > xpTotal);
  const percentualNivel = proximoNivel
    ? Math.round(
        ((xpTotal - nivelAtual.xpNecessario) /
          (proximoNivel.xpNecessario - nivelAtual.xpNecessario)) *
          100,
      )
    : 100;

  const c = {
    bg: tema === "escuro" ? "#0D141C" : "#F0F4F8",
    card: tema === "escuro" ? "#1A2633" : "#FFFFFF",
    card2: tema === "escuro" ? "#121C26" : "#F8FAFC",
    texto: tema === "escuro" ? "#E2E8F0" : "#1E293B",
    textoSub: tema === "escuro" ? "#94A3B8" : "#64748B",
    borda: tema === "escuro" ? "#2D3D50" : "#E2E8F0",
    header: tema === "escuro" ? "#0F172A" : "#FFFFFF",
    accent: "#00D4AA",
  };

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
      {/* HEADER TÁTICO */}
      <header
        style={{
          background: c.header,
          borderBottom: `1px solid ${c.borda}`,
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              background: "linear-gradient(135deg, #00D4AA, #0099FF)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              boxShadow: "0 2px 8px rgba(0,212,170,0.3)",
            }}
          >
            🔬
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontWeight: 700,
                fontSize: "1.1rem",
                color: c.texto,
                lineHeight: 1.1,
              }}
            >
              Instituto do Saber
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                color: c.accent,
                fontWeight: 800,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {nivelAtual.titulo}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div
            style={{
              background: timer.alertaProximo ? "#FF6B6B15" : `${c.accent}15`,
              color: timer.alertaProximo ? "#FF6B6B" : c.accent,
              padding: "6px 12px",
              borderRadius: "12px",
              fontSize: "0.8rem",
              fontWeight: 800,
              border: `1.5px solid ${timer.alertaProximo ? "#FF6B6B" : c.accent}`,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {timer.alertaProximo ? "⚠️" : "⏱️"} {timer.tempoFormatado}
          </div>
          <button
            onClick={alternarTema}
            style={{
              width: "36px",
              height: "36px",
              background: c.card2,
              border: `1.5px solid ${c.borda}`,
              borderRadius: "10px",
              fontSize: "1.1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "0.2s",
            }}
          >
            {tema === "escuro" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main
        style={{ padding: "20px 16px", maxWidth: "600px", margin: "0 auto" }}
      >
        {/* CARD DO AGENTE (PERFIL E PROGRESSO) */}
        <div
          style={{
            background: `linear-gradient(135deg, ${tema === "escuro" ? "#0D2137" : "#E8F7FF"}, ${tema === "escuro" ? "#1A3A52" : "#F0FFF8"})`,
            borderRadius: "24px",
            padding: "24px",
            marginBottom: "24px",
            border: `2px solid ${c.accent}33`,
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 8px 24px rgba(0, 212, 170, 0.08)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-10px",
              top: "-10px",
              fontSize: "8rem",
              opacity: 0.04,
              pointerEvents: "none",
            }}
          >
            🔬
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: c.accent,
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                  background: `${c.accent}22`,
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "8px",
                }}
              >
                🪪 CREDENCIAL ATIVA
              </div>
              <h2
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: "1.8rem",
                  color: c.texto,
                  margin: "8px 0 2px",
                }}
              >
                Agente {playerName || "Desconhecido"}
              </h2>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: c.textoSub,
                  fontWeight: 600,
                }}
              >
                {nivelAtual.titulo}
              </div>
            </div>

            <div
              style={{
                textAlign: "right",
                background: c.card,
                padding: "10px 16px",
                borderRadius: "16px",
                border: `1.5px solid ${c.accent}44`,
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  color: c.textoSub,
                  marginBottom: "2px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                🧩 Fragmentos
              </div>
              <div
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: "1.6rem",
                  color: c.accent,
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {xpTotal}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "0.8rem",
                  color: c.textoSub,
                  fontWeight: 700,
                }}
              >
                Nível {nivelAtual.nivel}
              </span>
              {proximoNivel && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: c.textoSub,
                    fontWeight: 700,
                  }}
                >
                  Próximo: {proximoNivel.xpNecessario} 🧩
                </span>
              )}
            </div>
            <div
              style={{
                height: "10px",
                background: c.borda,
                borderRadius: "5px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${percentualNivel}%`,
                  background: "linear-gradient(90deg, #00D4AA, #0099FF)",
                  borderRadius: "5px",
                  transition: "width 1s ease",
                  boxShadow: "0 0 8px rgba(0,212,170,0.5)",
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: "16px",
              height: "4px",
              background: c.borda,
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${timer.percentual}%`,
                background: timer.alertaProximo ? "#FF6B6B" : c.accent,
                borderRadius: "2px",
                transition: "width 1s linear",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: c.textoSub,
              marginTop: "6px",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {timer.percentual}% do tempo de pesquisa restante
          </div>
        </div>

        {/* LISTA DE DEPARTAMENTOS */}
        <div
          style={{
            marginBottom: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.1rem",
              color: c.texto,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🏛️ Departamentos
          </h3>
          <span
            style={{
              fontSize: "0.75rem",
              color: c.textoSub,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Escolha sua missão
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          {ordemDisciplinas.map((id) => {
            const d = disciplinas[id];
            const qtdMissoes = contagemMissoes[id] || 0;

            return (
              <button
                key={id}
                onClick={() => !d.bloqueada && navigate(`/${id}`)}
                style={{
                  background: c.card,
                  border: `2px solid ${d.bloqueada ? c.borda : d.cor + "44"}`,
                  borderRadius: "20px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  cursor: d.bloqueada ? "not-allowed" : "pointer",
                  opacity: d.bloqueada ? 0.6 : 1,
                  transition: "all 0.2s",
                  textAlign: "left",
                  width: "100%",
                  boxShadow: d.bloqueada
                    ? "none"
                    : `0 4px 12px rgba(0,0,0,0.03)`,
                }}
                onMouseEnter={(e) => {
                  if (!d.bloqueada) {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.borderColor = d.cor;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = d.bloqueada
                    ? c.borda
                    : d.cor + "44";
                }}
              >
                <div
                  style={{
                    width: "54px",
                    height: "54px",
                    background: d.bloqueada ? c.borda : d.cor + "22",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                    flexShrink: 0,
                    border: `2px solid ${d.bloqueada ? c.borda : d.cor + "44"}`,
                  }}
                >
                  {d.bloqueada ? "🔒" : d.icone}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Fredoka', sans-serif",
                      fontSize: "1.1rem",
                      color: c.texto,
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    {d.depto}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: c.textoSub,
                      marginBottom: "6px",
                    }}
                  >
                    {d.bloqueada ? "Acesso Restrito..." : d.missao}
                  </div>

                  {/* Status Dinâmico de Missões da IA (Substitui o antigo 0/3) */}
                  {!d.bloqueada && (
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: "0.7rem",
                        color: qtdMissoes > 0 ? d.cor : c.textoSub,
                        fontWeight: 800,
                        background: qtdMissoes > 0 ? d.cor + "15" : c.borda,
                        padding: "4px 10px",
                        borderRadius: "8px",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {qtdMissoes > 0
                        ? `📂 ${qtdMissoes} ARQUIVO(S) ATIVO(S)`
                        : "📡 INEXPLORADO"}
                    </div>
                  )}
                </div>

                {!d.bloqueada && (
                  <div
                    style={{
                      color: c.textoSub,
                      fontSize: "1.5rem",
                      flexShrink: 0,
                    }}
                  >
                    ›
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* MISSÃO DO DIA BÔNUS */}
        <div
          style={{
            background: `linear-gradient(135deg, ${tema === "escuro" ? "#1A1A2E" : "#FFF8E8"}, ${tema === "escuro" ? "#2D1B4E" : "#FFF0D4"})`,
            borderRadius: "20px",
            padding: "20px",
            border: "2px solid #FFB83044",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div style={{ fontSize: "2.5rem" }}>🎯</div>
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#FFB830",
                fontWeight: 800,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              Missão do Dia
            </div>
            <div
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "1.1rem",
                color: c.texto,
                marginBottom: "2px",
              }}
            >
              Escanear 1 Novo Setor
            </div>
            <div
              style={{ fontSize: "0.8rem", color: c.textoSub, fontWeight: 600 }}
            >
              Recompensa: +50 fragmentos bônus 🧩
            </div>
          </div>
        </div>
      </main>

      <BottomNav />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800&display=swap');
      `}</style>
    </div>
  );
}
