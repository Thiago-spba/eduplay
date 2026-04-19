import { useState } from "react";
import { useTema } from "../context/ThemeContext";
import BottomNav from "../components/BottomNav";
import AchievementBadge from "../components/AchievementBadge";

const PREMIO_KEY = "eduplay_premio_secreto";

export default function ConquistasPage() {
  const { tema, alternarTema } = useTema();
  const e = tema === "escuro";

  const [conquistaSelecionada, setConquistaSelecionada] = useState(null);

  const playerName = localStorage.getItem("eduplay_player_name") || "Agente";
  const xpTotal = parseInt(localStorage.getItem("eduplay_xp") || "0");
  const missoesConcluidas =
    parseInt(localStorage.getItem("eduplay_total_concluidas") || "0") ||
    Math.floor(xpTotal / 100);
  const metaRecompensa = 5;
  const progressoRecompensa = Math.min(
    (missoesConcluidas / metaRecompensa) * 100,
    100,
  );
  const premioConfigurado =
    localStorage.getItem(PREMIO_KEY) || "Uma surpresa especial!";

  const c = {
    bg: e ? "#0D141C" : "#F0F4F8",
    card: e ? "#1A2633" : "#FFFFFF",
    texto: e ? "#E2E8F0" : "#1E293B",
    textoSub: e ? "#94A3B8" : "#64748B",
    accent: "#00D4AA",
    borda: e ? "#2D3D50" : "#E2E8F0",
    gold: "#FFB830",
    overlay: "rgba(0, 0, 0, 0.9)", // Mais escuro para destacar o modal
  };

  const listaConquistas = [
    {
      id: 1,
      icone: "🎯",
      titulo: "Precisão Total",
      req: "Acertar 5 perguntas seguidas",
      check: xpTotal >= 50,
      pedagogico: "Desenvolve foco e atenção plena.",
      marketing: "Treine sua mente para o nível elite!",
    },
    {
      id: 2,
      icone: "🔥",
      titulo: "Agente Ativo",
      req: "Estudar 3 dias na semana",
      check: false,
      pedagogico: "Criação de hábito e disciplina.",
      marketing: "A constância gera gênios!",
    },
    {
      id: 3,
      icone: "🔬",
      titulo: "Cientista",
      req: "Completar missão de Ciências",
      check: localStorage.getItem("eduplay_missoes_ia_ciencias") !== null,
      pedagogico: "Pensamento crítico e investigação.",
      marketing: "Descubra os segredos do universo!",
    },
    {
      id: 4,
      icone: "📜",
      titulo: "Historiador",
      req: "Completar missão de História",
      check: localStorage.getItem("eduplay_missoes_ia_historia") !== null,
      pedagogico: "Consciência temporal e social.",
      marketing: "Domine o passado para criar o futuro!",
    },
    {
      id: 5,
      icone: "🗺️",
      titulo: "Cartógrafo",
      req: "Completar missão de Geografia",
      check: localStorage.getItem("eduplay_missoes_ia_geografia") !== null,
      pedagogico: "Percepção espacial e global.",
      marketing: "O mundo não tem fronteiras para você!",
    },
    {
      id: 6,
      icone: "🧠",
      titulo: "Mestre da Base",
      req: "Atingir 1000 fragmentos",
      check: xpTotal >= 1000,
      pedagogico: "Retenção de conhecimento longo.",
      marketing: "Inteligência máxima desbloqueada!",
    },
  ];

  const shareText = `🚀 O Agente ${playerName} desbloqueou a conquista "${conquistaSelecionada?.titulo}" no EduPlay! Venha aprender brincando também!`;
  const shareUrl = window.location.origin;

  const redes = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    instagram: () => {
      navigator.clipboard.writeText(shareText + " " + shareUrl);
      alert("Texto e link copiados! Agora é só postar nos seus Stories 📸");
    },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: c.bg,
        fontFamily: "'Nunito', sans-serif",
        paddingBottom: "120px",
        color: c.texto,
      }}
    >
      <header
        style={{
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${c.borda}`,
          background: c.card,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ width: 40 }} />
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "clamp(1rem, 4vw, 1.3rem)",
              margin: 0,
            }}
          >
            Galeria de Troféus
          </h1>
          <p
            style={{
              fontSize: "0.7rem",
              color: c.accent,
              fontWeight: 800,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Operação de Campo
          </p>
        </div>
        <button
          onClick={alternarTema}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: `2px solid ${c.borda}`,
            background: e ? "#121C26" : "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {e ? "☀️" : "🌙"}
        </button>
      </header>

      <main style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${e ? "#1E1E3A" : "#FFF9EB"}, ${e ? "#2D1B4E" : "#FFF0D4"})`,
            borderRadius: "24px",
            padding: "clamp(15px, 5vw, 30px)",
            marginBottom: "30px",
            border: `2px solid ${progressoRecompensa >= 100 ? c.accent : c.gold + "44"}`,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <span style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>🎁</span>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontFamily: "'Fredoka', sans-serif",
                  color: e ? c.gold : "#B07D00",
                  fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
                }}
              >
                Missão Recompensa
              </h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: c.textoSub }}>
                Meta do Comandante-Chefe
              </p>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.9rem",
                fontWeight: 800,
                marginBottom: "10px",
              }}
            >
              <span>Progresso</span>
              <span>
                {missoesConcluidas}/{metaRecompensa}
              </span>
            </div>
            <div
              style={{
                height: "12px",
                background: e ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.6)",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progressoRecompensa}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${c.gold}, #FF8C00)`,
                  transition: "width 1.2s ease",
                }}
              />
            </div>
          </div>

          <div
            style={{
              background: e ? "rgba(0,0,0,0.2)" : "#FFFFFF",
              padding: "15px",
              borderRadius: "16px",
              textAlign: "center",
              border: `2px dashed ${c.gold}44`,
            }}
          >
            {progressoRecompensa >= 100 ? (
              <strong style={{ color: c.accent }}>{premioConfigurado}</strong>
            ) : (
              <span
                style={{
                  fontWeight: 700,
                  color: c.textoSub,
                  fontSize: "0.85rem",
                }}
              >
                Complete as missões para ver seu prêmio!
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: "15px",
          }}
        >
          {listaConquistas.map((conq) => (
            <div
              key={conq.id}
              onClick={() => setConquistaSelecionada(conq)}
              style={{ cursor: "pointer" }}
            >
              <AchievementBadge
                icone={conq.icone}
                titulo={conq.titulo}
                desbloqueado={conq.check}
              />
            </div>
          ))}
        </div>
      </main>

      {/* MODAL CORRIGIDO PARA DESKTOP */}
      {conquistaSelecionada && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: c.overlay,
            zIndex: 1000, // Z-INDEX ALTO
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              background: c.card,
              width: "100%",
              maxWidth: "420px",
              maxHeight: "90vh", // LIMITA A ALTURA PARA NÃO CORTAR
              borderRadius: "28px",
              position: "relative",
              border: `2px solid ${conquistaSelecionada.check ? c.gold : c.borda}`,
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              overflowY: "auto", // PERMITE ROLAR SE FOR TALL
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Botão Fechar Fixo no Modal */}
            <button
              onClick={() => setConquistaSelecionada(null)}
              style={{
                position: "sticky",
                top: "20px",
                left: "90%",
                background: c.card,
                border: "none",
                color: c.textoSub,
                fontSize: "1.5rem",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              ✕
            </button>

            <div style={{ padding: "0 30px 30px" }}>
              <div
                style={{
                  fontSize: "4.5rem",
                  marginBottom: "15px",
                  filter: conquistaSelecionada.check
                    ? "none"
                    : "grayscale(100%)",
                }}
              >
                {conquistaSelecionada.icone}
              </div>

              <h2
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: "1.6rem",
                  margin: "0 0 10px",
                  color: conquistaSelecionada.check ? c.gold : c.texto,
                }}
              >
                {conquistaSelecionada.titulo}
              </h2>

              <div
                style={{
                  background: e ? "#0A0F14" : "#F8FAFC",
                  padding: "15px",
                  borderRadius: "16px",
                  marginBottom: "20px",
                }}
              >
                <p
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    color: c.accent,
                    margin: "0 0 5px",
                    textTransform: "uppercase",
                  }}
                >
                  Objetivo da Missão
                </p>
                <p style={{ fontSize: "0.95rem", margin: 0, fontWeight: 600 }}>
                  {conquistaSelecionada.req}
                </p>
              </div>

              {conquistaSelecionada.check ? (
                <div style={{ marginBottom: "20px" }}>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: c.textoSub,
                      marginBottom: "12px",
                      letterSpacing: 1,
                    }}
                  >
                    COMPARTILHE COM O MUNDO:
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "15px",
                    }}
                  >
                    <a
                      href={redes.whatsapp}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        width: "45px",
                        height: "45px",
                        background: "#25D366",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        fontSize: "1.2rem",
                      }}
                    >
                      🟢
                    </a>
                    <a
                      href={redes.facebook}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        width: "45px",
                        height: "45px",
                        background: "#1877F2",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textDecoration: "none",
                        fontSize: "1.2rem",
                      }}
                    >
                      🔵
                    </a>
                    <button
                      onClick={redes.instagram}
                      style={{
                        width: "45px",
                        height: "45px",
                        background:
                          "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                      }}
                    >
                      📸
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "left",
                    fontSize: "0.8rem",
                    color: c.textoSub,
                    borderTop: `1px solid ${c.borda}`,
                    paddingTop: "15px",
                  }}
                >
                  <p style={{ marginBottom: "8px" }}>
                    <strong>🧠 Habilidade:</strong>{" "}
                    {conquistaSelecionada.pedagogico}
                  </p>
                  <p>
                    <strong>🚀 Dica:</strong> {conquistaSelecionada.marketing}
                  </p>
                </div>
              )}

              <button
                onClick={() => setConquistaSelecionada(null)}
                style={{
                  marginTop: "20px",
                  width: "100%",
                  padding: "14px",
                  borderRadius: "16px",
                  border: "none",
                  background: conquistaSelecionada.check ? c.accent : c.borda,
                  color: "#fff",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {conquistaSelecionada.check ? "SAIR" : "ENTENDIDO!"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
