import { useTema } from "../context/ThemeContext";
import BottomNav from "../components/BottomNav";

export default function MapaPage() {
  // ADICIONADO: alternarTema extraído do contexto
  const { tema, alternarTema } = useTema();
  const e = tema === "escuro";

  const xpTotal = parseInt(localStorage.getItem("eduplay_xp") || "0");
  const nivelAtual = Math.floor(xpTotal / 500) + 1;

  const c = {
    bg: e ? "#0A0F14" : "#F0F7FF",
    card: e ? "#121A22" : "#FFFFFF",
    texto: e ? "#E8F4F8" : "#1A2B3C",
    accent: "#00D4AA",
    borda: e ? "#1A3347" : "#EEF5FF",
    caminho: e ? "#1A3347" : "#DDE8F0",
  };

  const setores = [
    { id: 1, nome: "Base de Treinamento", icone: "🏠", status: "concluido" },
    {
      id: 2,
      nome: "Laboratório de História",
      icone: "📜",
      status: nivelAtual >= 2 ? "atual" : "bloqueado",
    },
    {
      id: 3,
      nome: "Setor de Geopolítica",
      icone: "🗺️",
      status: nivelAtual >= 3 ? "concluido" : "bloqueado",
    },
    { id: 4, nome: "Domínio Matemático", icone: "📐", status: "bloqueado" },
    { id: 5, nome: "Centro de Biologia", icone: "🔬", status: "bloqueado" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: c.bg,
        color: c.texto,
        fontFamily: "'Nunito', sans-serif",
        paddingBottom: "100px",
      }}
    >
      {/* HEADER ATUALIZADO COM SELETOR DARK MODE */}
      <header
        style={{
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: c.card,
          borderBottom: `2px solid ${c.borda}`,
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
              fontSize: "1.2rem",
              margin: 0,
            }}
          >
            Mapa de Operações
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
            Jornada do Agente
          </p>
        </div>
        <button
          onClick={alternarTema}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border: `2px solid ${c.borda}`,
            background: e ? "#1A2B3C" : "#fff",
            fontSize: "1.1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {e ? "☀️" : "🌙"}
        </button>
      </header>

      <main
        style={{
          padding: "40px 20px",
          maxWidth: "500px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* O conteúdo do mapa continua exatamente o mesmo aqui... */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "60px",
            bottom: "100px",
            width: "6px",
            background: c.caminho,
            transform: "translateX(-50%)",
            borderRadius: "3px",
            zIndex: 1,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "40px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {setores.map((setor, index) => {
            const isAtivo = setor.status !== "bloqueado";
            const isAtual = setor.status === "atual";
            return (
              <div
                key={setor.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: index % 2 === 0 ? "row" : "row-reverse",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background: isAtual ? c.accent : isAtivo ? c.card : c.bg,
                    border: `4px solid ${isAtual ? "#fff" : isAtivo ? c.accent : c.borda}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    boxShadow: isAtual ? `0 0 20px ${c.accent}` : "none",
                    filter: isAtivo ? "none" : "grayscale(100%)",
                  }}
                >
                  {setor.icone}
                </div>
                <div
                  style={{
                    flex: 1,
                    background: isAtivo ? c.card : "transparent",
                    padding: "15px",
                    borderRadius: "16px",
                    border: isAtivo
                      ? `1px solid ${c.borda}`
                      : "1px dashed #ccc",
                    textAlign: index % 2 === 0 ? "left" : "right",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 4px",
                      fontSize: "1rem",
                      fontFamily: "'Fredoka', sans-serif",
                    }}
                  >
                    {setor.nome}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.75rem",
                      color: isAtivo ? c.accent : "#888",
                      fontWeight: 800,
                    }}
                  >
                    {isAtual
                      ? "📍 ATUAL"
                      : isAtivo
                        ? "✅ EXPLORADO"
                        : "🔒 RESTRITO"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
