import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTema } from "../context/ThemeContext";
import { disciplinas, ordemDisciplinas, niveis } from "../utils/content";
import BottomNav from "../components/BottomNav";

export default function HomePage({ playerName, timer }) {
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();

  useEffect(() => {
    if (!timer.rodando && !timer.bloqueado) timer.iniciar();
  }, []);

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

  const c = {
    bg: tema === "escuro" ? "#0F1923" : "#F0F7FF",
    card: tema === "escuro" ? "#1A2B3C" : "#FFFFFF",
    card2: tema === "escuro" ? "#1E3347" : "#F8FBFF",
    texto: tema === "escuro" ? "#E8F4F8" : "#1A2B3C",
    textoSub: tema === "escuro" ? "#8BAFC0" : "#5A7A8A",
    borda: tema === "escuro" ? "#2A3F52" : "#E0EEF5",
    accent: "#00D4AA",
    header: tema === "escuro" ? "#0D1820" : "#FFFFFF",
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
      {/* HEADER */}
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
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #00D4AA, #0099FF)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              boxShadow: "0 2px 8px rgba(0,212,170,0.4)",
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
                lineHeight: 1,
              }}
            >
              Instituto do Saber
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                color: c.accent,
                fontWeight: 700,
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
              background: timer.alertaProximo ? "#FF6B6B22" : `${c.accent}22`,
              color: timer.alertaProximo ? "#FF6B6B" : c.accent,
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: 700,
              border: `2px solid ${timer.alertaProximo ? "#FF6B6B" : c.accent}`,
              display: "flex",
              alignItems: "center",
              gap: "5px",
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
              border: `2px solid ${c.borda}`,
              borderRadius: "10px",
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

      <main style={{ padding: "16px", maxWidth: "480px", margin: "0 auto" }}>
        {/* CARD AGENTE */}
        <div
          style={{
            background: `linear-gradient(135deg, ${tema === "escuro" ? "#0D2137" : "#E8F7FF"}, ${tema === "escuro" ? "#1A3A52" : "#F0FFF8"})`,
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "16px",
            border: `2px solid ${c.accent}33`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-20px",
              top: "-20px",
              fontSize: "6rem",
              opacity: 0.06,
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
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                🪪 Credencial Ativa
              </div>
              <h2
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: "1.5rem",
                  color: c.texto,
                  marginBottom: "2px",
                }}
              >
                Agente {playerName}
              </h2>
              <div style={{ fontSize: "0.85rem", color: c.textoSub }}>
                {nivelAtual.titulo}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: c.textoSub,
                  marginBottom: "2px",
                }}
              >
                🧩 Fragmentos
              </div>
              <div
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: "1.4rem",
                  color: c.accent,
                  fontWeight: 700,
                }}
              >
                {xpTotal}
              </div>
            </div>
          </div>
          <div style={{ marginTop: "14px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: c.textoSub }}>
                Nível {nivelAtual.nivel}
              </span>
              {proximoNivel && (
                <span style={{ fontSize: "0.75rem", color: c.textoSub }}>
                  Próximo: {proximoNivel.xpNecessario} fragmentos
                </span>
              )}
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
                  width: `${percentualNivel}%`,
                  background: "linear-gradient(90deg, #00D4AA, #0099FF)",
                  borderRadius: "4px",
                  transition: "width 1s ease",
                  boxShadow: "0 0 8px rgba(0,212,170,0.5)",
                }}
              />
            </div>
          </div>
          <div
            style={{
              marginTop: "10px",
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
            style={{ fontSize: "0.7rem", color: c.textoSub, marginTop: "4px" }}
          >
            {timer.percentual}% do tempo de pesquisa restante
          </div>
        </div>

        {/* DEPARTAMENTOS */}
        <div
          style={{
            marginBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1rem",
              color: c.texto,
            }}
          >
            🏛️ Departamentos
          </h3>
          <span style={{ fontSize: "0.75rem", color: c.textoSub }}>
            Escolha sua missão
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          {ordemDisciplinas.map((id) => {
            const d = disciplinas[id];
            const missoesConcluidas = 0;
            const totalMissoes = d.modulos.length;

            return (
              <button
                key={id}
                onClick={() => !d.bloqueada && navigate(`/${id}`)}
                style={{
                  background: c.card,
                  border: `2px solid ${d.bloqueada ? c.borda : d.cor + "44"}`,
                  borderRadius: "16px",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  cursor: d.bloqueada ? "not-allowed" : "pointer",
                  opacity: d.bloqueada ? 0.5 : 1,
                  transition: "all 0.2s",
                  textAlign: "left",
                  width: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (!d.bloqueada)
                    e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    background: d.bloqueada ? c.borda : d.cor,
                    borderRadius: "16px 0 0 16px",
                  }}
                />
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    background: d.bloqueada ? c.borda : d.cor + "22",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    flexShrink: 0,
                    border: `2px solid ${d.bloqueada ? c.borda : d.cor + "44"}`,
                  }}
                >
                  {d.bloqueada ? "🔒" : d.icone}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "2px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Fredoka', sans-serif",
                        fontSize: "0.95rem",
                        color: c.texto,
                        fontWeight: 600,
                      }}
                    >
                      {d.depto}
                    </div>
                    {!d.bloqueada && totalMissoes > 0 && (
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: d.cor,
                          fontWeight: 700,
                          background: d.cor + "22",
                          padding: "2px 8px",
                          borderRadius: "10px",
                        }}
                      >
                        {missoesConcluidas}/{totalMissoes}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: c.textoSub,
                      marginBottom:
                        d.bloqueada || totalMissoes === 0 ? 0 : "8px",
                    }}
                  >
                    {d.bloqueada ? "Em breve..." : d.missao}
                  </div>
                  {!d.bloqueada && totalMissoes > 0 && (
                    <div
                      style={{
                        height: "3px",
                        background: c.borda,
                        borderRadius: "2px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(missoesConcluidas / totalMissoes) * 100}%`,
                          background: d.cor,
                          borderRadius: "2px",
                        }}
                      />
                    </div>
                  )}
                </div>
                {!d.bloqueada && (
                  <div
                    style={{
                      color: c.textoSub,
                      fontSize: "1.2rem",
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

        {/* MISSÃO DO DIA */}
        <div
          style={{
            background: `linear-gradient(135deg, ${tema === "escuro" ? "#1A1A2E" : "#FFF8E8"}, ${tema === "escuro" ? "#2D1B4E" : "#FFF0D4"})`,
            borderRadius: "16px",
            padding: "16px",
            border: "2px solid #FFB83044",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "2rem" }}>🎯</div>
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#FFB830",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Missão do Dia
              </div>
              <div
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: "1rem",
                  color: c.texto,
                }}
              >
                Complete 1 atividade hoje
              </div>
              <div style={{ fontSize: "0.78rem", color: c.textoSub }}>
                Recompensa: +50 fragmentos bônus 🧩
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700&display=swap');
      `}</style>
    </div>
  );
}
