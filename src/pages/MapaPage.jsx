import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTema } from "../context/ThemeContext";
import BottomNav from "../components/BottomNav";
import { getTodasMissoes, dataConclusaoSP, inicioSemanaSP, ehFimDeSemanaSP } from "../services/db";
import FimDeSemana from "../components/FimDeSemana";

const DISCIPLINAS = [
  { id: "historia", label: "História", icone: "📜", cor: "#F5A623" },
  { id: "geografia", label: "Geografia", icone: "🗺️", cor: "#1FC1B0" },
  { id: "matematica", label: "Matemática", icone: "📐", cor: "#9B7BFF" },
  { id: "ciencias", label: "Ciências", icone: "🔬", cor: "#3DDC84" },
  { id: "portugues", label: "Português", icone: "✍️", cor: "#FF6B7A" },
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

  // Concluídas nesta semana (fuso SP) — o total histórico não conta como atividade recente
  const segundaSP = inicioSemanaSP();
  const feitaNaSemana = (m) => (dataConclusaoSP(m) || "") >= segundaSP;
  const feitasSemanaTotal = Object.values(missoes).flat().filter(feitaNaSemana).length;
  const totalMissoes = Object.values(missoes).flat().length;
  // Sábado e domingo: missões ficam guardadas para segunda
  const fimDeSemana = ehFimDeSemanaSP();

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
          background: "linear-gradient(135deg,#0F6E56 0%,#13A07C 60%,#1FC1B0 100%)",
          padding: "18px 20px 20px",
          borderRadius: "0 0 26px 26px",
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
            : fimDeSemana
              ? "Fim de semana — as missões voltam na segunda 💚"
              : totalPendentes > 0
              ? `${totalPendentes} ${totalPendentes === 1 ? "missão pendente" : "missões pendentes"}`
              : feitasSemanaTotal > 0
                ? "Tudo em dia! 🎉"
                : totalMissoes === 0
                  ? "Nenhuma missão ainda"
                  : "Nenhuma missão nova agora"}
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
            {fimDeSemana && <FimDeSemana c={c} />}
            {!fimDeSemana && totalMissoes === 0 && (
              <div
                style={{
                  background: c.card,
                  borderRadius: 22,
                  padding: "24px 18px",
                  textAlign: "center",
                  border: "2px dashed #1FC1B088",
                  animation: "edu-pop 0.45s ease",
                }}
              >
                <span style={{ fontSize: "4rem", display: "inline-block", animation: "edu-flutuar 3s ease-in-out infinite" }}>🦉</span>
                <p style={{ color: c.texto, fontSize: "0.95rem", fontWeight: 800, margin: "10px 0 4px" }}>
                  Suas missões estão a caminho!
                </p>
                <p style={{ color: c.textoSub, fontSize: "0.82rem", margin: 0, lineHeight: 1.5 }}>
                  Peça para o responsável gerar missões no Painel e volte aqui para jogar.
                </p>
              </div>
            )}
            {DISCIPLINAS.map((d, idx) => {
              const lista = missoes[d.id] || [];
              const pendentes = lista.filter((m) => !m.feita).length;
              const concluidas = lista.filter(feitaNaSemana).length;
              // Progresso da semana: concluídas nesta semana / (concluídas + pendentes)
              const pctSemana =
                concluidas + pendentes > 0
                  ? Math.round((concluidas / (concluidas + pendentes)) * 100)
                  : 0;

              return (
                <button
                  key={d.id}
                  onClick={() => !fimDeSemana && navigate(`/${d.id}`)}
                  disabled={fimDeSemana}
                  style={{
                    background: c.card,
                    borderRadius: 22,
                    padding: "16px 18px",
                    border:
                      pendentes > 0
                        ? `2px solid ${d.cor}88`
                        : `1.5px solid ${c.borda}`,
                    borderLeft: `6px solid ${d.cor}`,
                    animation: `edu-surgir 0.4s ease ${idx * 0.06}s backwards`,
                    fontFamily: "'Nunito', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: fimDeSemana ? "default" : "pointer",
                    opacity: fimDeSemana ? 0.6 : 1,
                    textAlign: "left",
                    width: "100%",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 18,
                      flexShrink: 0,
                      background: `${d.cor}2E`,
                      border: `2px solid ${d.cor}77`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.6rem",
                    }}
                  >
                    {d.icone}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
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
                          ? `${concluidas} ${concluidas === 1 ? "concluída" : "concluídas"} nesta semana ✓`
                          : lista.length === 0
                            ? "Nenhuma missão ainda"
                            : "Nenhuma missão nova"}
                    </div>
                    {concluidas + pendentes > 0 && (
                      <div style={{ height: 7, background: c.borda, borderRadius: 4, overflow: "hidden", marginTop: 7 }}>
                        <div style={{ height: "100%", width: `${pctSemana}%`, background: d.cor, borderRadius: 4, transition: "width 1s ease" }} />
                      </div>
                    )}
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
                          color: "#0D141C",
                          borderRadius: 20,
                          animation: "edu-pulso-suave 2s ease-in-out infinite",
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
        @keyframes edu-flutuar { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes edu-pop { 0%{opacity:0;transform:scale(0.6)} 70%{transform:scale(1.08)} 100%{opacity:1;transform:scale(1)} }
        @keyframes edu-surgir { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes edu-pulso-suave { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
      `}</style>
    </div>
  );
}
