import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTema } from "../context/ThemeContext";
import BottomNav from "../components/BottomNav";
import { getTodasMissoes } from "../services/db";

const DISCIPLINAS = [
  { id: "historia", label: "História", icone: "📜", cor: "#C4A882" },
  { id: "geografia", label: "Geografia", icone: "🗺️", cor: "#5A8F8C" },
  { id: "matematica", label: "Matemática", icone: "📐", cor: "#6B5B95" },
  { id: "ciencias", label: "Ciências", icone: "🔬", cor: "#2E8B57" },
  { id: "portugues", label: "Português", icone: "✍️", cor: "#C0392B" },
];

export default function MapaPage() {
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();
  const e = tema === "escuro";

  const [missoes, setMissoes] = useState({});
  const [carregando, setCarregando] = useState(true);

  const codigoAcesso = localStorage.getItem("eduplay_codigo_acesso");

  const c = {
    bg: e ? "#0D141C" : "#F0F4F8",
    card: e ? "#1A2633" : "#FFFFFF",
    texto: e ? "#E2E8F0" : "#1E293B",
    textoSub: e ? "#94A3B8" : "#64748B",
    borda: e ? "#2D3D50" : "#E2E8F0",
    verde: "#0F6E56",
  };

  useEffect(() => {
    if (!codigoAcesso) {
      setCarregando(false);
      return;
    }
    getTodasMissoes(codigoAcesso)
      .then((m) => setMissoes(m))
      .catch((err) => console.error("Erro ao carregar missões:", err))
      .finally(() => setCarregando(false));
  }, [codigoAcesso]);

  const totalPendentes = DISCIPLINAS.reduce((acc, d) => {
    return acc + (missoes[d.id] || []).filter((m) => !m.feita).length;
  }, 0);

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
          background: c.verde,
          padding: "18px 20px 20px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "#E1F5EE",
            }}
          >
            Missões
          </span>
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
        <p style={{ margin: 0, fontSize: "0.78rem", color: "#9FE1CB" }}>
          {carregando
            ? "Carregando..."
            : totalPendentes > 0
              ? `${totalPendentes} ${totalPendentes === 1 ? "missão pendente" : "missões pendentes"}`
              : "Tudo em dia! 🎉"}
        </p>
      </header>

      <main style={{ padding: "20px 16px", maxWidth: 600, margin: "0 auto" }}>
        {carregando ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div
              style={{
                fontSize: "2rem",
                marginBottom: 12,
                animation: "girar 2s linear infinite",
              }}
            >
              📚
            </div>
            <p style={{ color: c.textoSub, fontWeight: 600 }}>
              Carregando suas missões...
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {DISCIPLINAS.map((d) => {
              const lista = missoes[d.id] || [];
              const pendentes = lista.filter((m) => !m.feita).length;
              const concluidas = lista.filter((m) => m.feita).length;

              return (
                <button
                  key={d.id}
                  onClick={() => navigate(`/${d.id}`)}
                  style={{
                    background: c.card,
                    borderRadius: 18,
                    padding: "16px 18px",
                    border:
                      pendentes > 0
                        ? `2px solid ${d.cor}66`
                        : `1.5px solid ${c.borda}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      flexShrink: 0,
                      background: `${d.cor}22`,
                      border: `2px solid ${d.cor}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.6rem",
                    }}
                  >
                    {d.icone}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "'Fredoka', sans-serif",
                        fontSize: "1.05rem",
                        color: c.texto,
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    >
                      {d.label}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: c.textoSub }}>
                      {pendentes > 0
                        ? `${pendentes} ${pendentes === 1 ? "missão disponível" : "missões disponíveis"}`
                        : concluidas > 0
                          ? `${concluidas} ${concluidas === 1 ? "missão concluída" : "missões concluídas"} ✓`
                          : "Nenhuma missão ainda"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 4,
                    }}
                  >
                    {pendentes > 0 && (
                      <div
                        style={{
                          background: d.cor,
                          color: "#fff",
                          borderRadius: 20,
                          padding: "3px 10px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                        }}
                      >
                        {pendentes} nova{pendentes > 1 ? "s" : ""}
                      </div>
                    )}
                    <span
                      style={{
                        color: pendentes > 0 ? d.cor : c.textoSub,
                        fontSize: "1.1rem",
                      }}
                    >
                      ›
                    </span>
                  </div>
                </button>
              );
            })}
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
