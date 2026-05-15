import { useState, useEffect, useRef } from "react";
import { useTema } from "../context/ThemeContext";
import BottomNav from "../components/BottomNav";
import { getProgresso, getTodasMissoes, adicionarBadge } from "../services/db";

// ═══════════════════════════════════════════════════════
// GERADOR DE CONQUISTAS INFINITAS
// Cresce junto com a vida escolar da criança
// ═══════════════════════════════════════════════════════

const DISCIPLINAS_INFO = {
  historia: { label: "História", icone: "📜", cor: "#C4A882" },
  geografia: { label: "Geografia", icone: "🗺️", cor: "#5A8F8C" },
  matematica: { label: "Matemática", icone: "📐", cor: "#6B5B95" },
  ciencias: { label: "Ciências", icone: "🔬", cor: "#2E8B57" },
  portugues: { label: "Português", icone: "✍️", cor: "#C0392B" },
};

const SERIES_INFO = {
  "6ano": { label: "6º Ano", icone: "🌱" },
  "7ano": { label: "7º Ano", icone: "🌿" },
  "8ano": { label: "8º Ano", icone: "🌳" },
  "9ano": { label: "9º Ano", icone: "🏅" },
};

// Marcos de consistência — crescem infinitamente
const MARCOS_DIAS = [1, 3, 7, 14, 30, 60, 100, 200, 365, 500, 730, 1000];
const MARCOS_MISSOES = [1, 5, 10, 25, 50, 100, 200, 365, 500, 1000];
const MARCOS_DISC = [1, 3, 5, 10, 20, 50];

function gerarConquistas(progresso, missoes) {
  const conquistas = [];
  const diasSeguidos = progresso?.diasSeguidos || 0;
  const missoesFeitas = progresso?.missoesFeitas || 0;

  // ── EIXO 1: Consistência — dias seguidos ──
  MARCOS_DIAS.forEach((marco) => {
    conquistas.push({
      id: `dias_${marco}`,
      eixo: "consistencia",
      icone:
        marco >= 365 ? "🌟" : marco >= 100 ? "🔥" : marco >= 30 ? "💪" : "📅",
      titulo:
        marco === 1
          ? "Primeiro Dia"
          : marco === 3
            ? "Três em Sequência"
            : marco === 7
              ? "Uma Semana Inteira"
              : marco === 14
                ? "Duas Semanas"
                : marco === 30
                  ? "Um Mês de Dedicação"
                  : marco === 60
                    ? "Dois Meses Seguidos"
                    : marco === 100
                      ? "100 Dias de Foco"
                      : marco === 200
                        ? "200 Dias Imparável"
                        : marco === 365
                          ? "Um Ano de Jornada"
                          : marco === 500
                            ? "500 Dias Lendário"
                            : marco === 730
                              ? "Dois Anos de História"
                              : "1000 Dias — Elite",
      descricao: `Estude ${marco} dia${marco > 1 ? "s seguidos" : ""}`,
      habilidade: "Disciplina e consistência — o hábito que transforma vidas.",
      desbloqueada: diasSeguidos >= marco,
      progresso: Math.min(diasSeguidos, marco),
      meta: marco,
    });
  });

  // ── EIXO 1b: Total de missões concluídas ──
  MARCOS_MISSOES.forEach((marco) => {
    conquistas.push({
      id: `missoes_${marco}`,
      eixo: "missoes",
      icone:
        marco >= 500 ? "👑" : marco >= 100 ? "🏆" : marco >= 25 ? "🎯" : "✅",
      titulo:
        marco === 1
          ? "Primeira Missão"
          : marco === 5
            ? "Agente Iniciante"
            : marco === 10
              ? "Agente Experiente"
              : marco === 25
                ? "Agente Sênior"
                : marco === 50
                  ? "Agente de Elite"
                  : marco === 100
                    ? "Centurião do Saber"
                    : marco === 200
                      ? "Mestre das Missões"
                      : marco === 365
                        ? "Um Ano de Missões"
                        : marco === 500
                          ? "Lenda do EduPlay"
                          : "1000 Missões — Imortal",
      descricao: `Complete ${marco} missão${marco > 1 ? "s" : ""}`,
      habilidade: "Cada missão é um passo real no seu conhecimento.",
      desbloqueada: missoesFeitas >= marco,
      progresso: Math.min(missoesFeitas, marco),
      meta: marco,
    });
  });

  // ── EIXO 2: Por disciplina ──
  Object.entries(DISCIPLINAS_INFO).forEach(([disc, info]) => {
    const feitasNaDisc = Object.values(missoes[disc] || []).filter(
      (m) => m.feita,
    ).length;

    MARCOS_DISC.forEach((marco) => {
      conquistas.push({
        id: `disc_${disc}_${marco}`,
        eixo: "disciplina",
        icone: info.icone,
        cor: info.cor,
        titulo:
          marco === 1
            ? `${info.label}: Primeiro Passo`
            : `${info.label}: ${marco} Missões`,
        descricao: `Complete ${marco} missão${marco > 1 ? "s" : ""} de ${info.label}`,
        habilidade: `Aprofundamento real em ${info.label} — conhecimento que fica.`,
        desbloqueada: feitasNaDisc >= marco,
        progresso: Math.min(feitasNaDisc, marco),
        meta: marco,
      });
    });
  });

  // ── EIXO 3: Marcos de série escolar ──
  Object.entries(SERIES_INFO).forEach(([serie, info]) => {
    const missoesNaSerie = Object.values(missoes)
      .flat()
      .filter((m) => m.serie === serie && m.feita).length;
    const metaSerie = 20; // 20 missões concluídas na série = "completou o ano"

    conquistas.push({
      id: `serie_${serie}`,
      eixo: "serie",
      icone: info.icone,
      titulo: `Completou o ${info.label}`,
      descricao: `Conclua ${metaSerie} missões do ${info.label}`,
      habilidade: `Marco histórico da sua vida escolar — o ${info.label} está no seu currículo.`,
      desbloqueada: missoesNaSerie >= metaSerie,
      progresso: Math.min(missoesNaSerie, metaSerie),
      meta: metaSerie,
      especial: true,
    });
  });

  // ── EIXO 4: Multidisciplinar ──
  const disciplinasComMissao = Object.keys(DISCIPLINAS_INFO).filter((d) =>
    (missoes[d] || []).some((m) => m.feita),
  ).length;

  conquistas.push({
    id: "explorador",
    eixo: "especial",
    icone: "🧭",
    titulo: "Explorador",
    descricao: "Faça missões em todas as 5 disciplinas",
    habilidade: "Visão interdisciplinar — você não tem limite.",
    desbloqueada: disciplinasComMissao >= 5,
    progresso: disciplinasComMissao,
    meta: 5,
    especial: true,
  });

  return conquistas;
}

// ═══════════════════════════════════════════════════════
// CARD DE COMPARTILHAMENTO (Canvas)
// ═══════════════════════════════════════════════════════

function gerarCardCompartilhamento(conquista, nomeAluno, canvasRef) {
  const canvas = canvasRef.current;
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  canvas.width = 800;
  canvas.height = 420;

  // Fundo gradiente
  const grad = ctx.createLinearGradient(0, 0, 800, 420);
  grad.addColorStop(0, "#0D1820");
  grad.addColorStop(1, "#1A2E3A");
  ctx.fillStyle = grad;
  ctx.roundRect(0, 0, 800, 420, 24);
  ctx.fill();

  // Borda verde
  ctx.strokeStyle = "#00D4AA44";
  ctx.lineWidth = 3;
  ctx.roundRect(4, 4, 792, 412, 22);
  ctx.stroke();

  // Logo
  ctx.fillStyle = "#00D4AA";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("EduPlay — Instituto do Saber", 40, 44);

  // Ícone grande
  ctx.font = "96px serif";
  ctx.textAlign = "center";
  ctx.fillText(conquista.icone, 400, 180);

  // Título conquista
  ctx.fillStyle = "#E8F4F8";
  ctx.font = "bold 36px sans-serif";
  ctx.fillText(conquista.titulo, 400, 240);

  // Nome do aluno
  ctx.fillStyle = "#00D4AA";
  ctx.font = "22px sans-serif";
  ctx.fillText(`🎉 ${nomeAluno} desbloqueou esta conquista!`, 400, 285);

  // Habilidade
  ctx.fillStyle = "#8BAFC0";
  ctx.font = "16px sans-serif";
  ctx.fillText(conquista.habilidade, 400, 320);

  // Link
  ctx.fillStyle = "#4A6B7A";
  ctx.font = "14px sans-serif";
  ctx.fillText("eduplay.olloapp.com.br", 400, 390);

  ctx.textAlign = "left";
  return canvas.toDataURL("image/png");
}

// ═══════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════

export default function ConquistasPage() {
  const { tema, alternarTema } = useTema();
  const e = tema === "escuro";
  const canvasRef = useRef(null);

  const [progresso, setProgresso] = useState(null);
  const [missoes, setMissoes] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [selecionada, setSelecionada] = useState(null);
  const [eixoAtivo, setEixoAtivo] = useState("todos");
  const [compartilhando, setCompartilhando] = useState(false);

  const codigoAcesso = localStorage.getItem("eduplay_codigo_acesso");
  const nomeAluno = localStorage.getItem("eduplay_player_name") || "Agente";
  const temLogin = !!codigoAcesso;

  const c = {
    bg: e ? "#0D141C" : "#F0F4F8",
    card: e ? "#1A2633" : "#FFFFFF",
    card2: e ? "#111B26" : "#F8FAFC",
    texto: e ? "#E2E8F0" : "#1E293B",
    textoSub: e ? "#94A3B8" : "#64748B",
    borda: e ? "#2D3D50" : "#E2E8F0",
    verde: "#0F6E56",
    verdeClaro: e ? "#0F6E5622" : "#E1F5EE",
    teal: "#00D4AA",
    gold: "#F59E0B",
  };

  useEffect(() => {
    if (!codigoAcesso) {
      setCarregando(false);
      return;
    }
    Promise.all([getProgresso(codigoAcesso), getTodasMissoes(codigoAcesso)])
      .then(([prog, miss]) => {
        setProgresso(prog);
        setMissoes(miss);
      })
      .catch((err) => console.error("Erro ao carregar conquistas:", err))
      .finally(() => setCarregando(false));
  }, [codigoAcesso]);

  // Auto-salvar badges novos no Firestore
  useEffect(() => {
    if (!codigoAcesso || !progresso) return;
    const conquistas = gerarConquistas(progresso, missoes);
    const badgesAtuais = progresso.badges || [];
    conquistas
      .filter((c) => c.desbloqueada && !badgesAtuais.includes(c.id))
      .forEach((c) => adicionarBadge(codigoAcesso, c.id).catch(() => {}));
  }, [progresso, missoes]);

  const conquistas = gerarConquistas(progresso || {}, missoes);
  const desbloqueadas = conquistas.filter((c) => c.desbloqueada).length;

  const EIXOS = [
    { id: "todos", label: "Todas" },
    { id: "consistencia", label: "Consistência" },
    { id: "missoes", label: "Missões" },
    { id: "disciplina", label: "Disciplinas" },
    { id: "serie", label: "Séries" },
    { id: "especial", label: "Especiais" },
  ];

  const conquistasFiltradas =
    eixoAtivo === "todos"
      ? conquistas
      : conquistas.filter((c) => c.eixo === eixoAtivo);

  // ── Compartilhar conquista ──
  const compartilharConquista = async (conq) => {
    setCompartilhando(true);
    const texto = `🏆 Conquista desbloqueada no EduPlay!\n\n${conq.icone} ${conq.titulo}\n"${conq.habilidade}"\n\n📚 ${nomeAluno} está evoluindo na vida escolar.\n\n👉 eduplay.olloapp.com.br`;

    if (navigator.share) {
      try {
        const imgData = gerarCardCompartilhamento(conq, nomeAluno, canvasRef);
        if (imgData) {
          const blob = await (await fetch(imgData)).blob();
          const file = new File([blob], "conquista.png", { type: "image/png" });
          await navigator.share({ files: [file], text: texto });
        } else {
          await navigator.share({ text: texto });
        }
      } catch {
        abrirWhatsApp(texto);
      }
    } else {
      abrirWhatsApp(texto);
    }
    setCompartilhando(false);
  };

  const abrirWhatsApp = (texto) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
  };

  const copiarConquista = (conq) => {
    const texto = `🏆 Conquista desbloqueada no EduPlay!\n\n${conq.icone} ${conq.titulo}\n"${conq.habilidade}"\n\n📚 ${nomeAluno} está evoluindo na vida escolar.\n\n👉 eduplay.olloapp.com.br`;
    navigator.clipboard
      ?.writeText(texto)
      .then(() => alert("Copiado! Cole no status do WhatsApp."))
      .catch(() => {});
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
              fontSize: "2.5rem",
              marginBottom: 12,
              animation: "girar 2s linear infinite",
            }}
          >
            🏆
          </div>
          <p style={{ color: c.textoSub, fontWeight: 600 }}>
            Carregando conquistas...
          </p>
        </div>
        <style>{`@keyframes girar{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Tela sem login ──
  if (!temLogin) {
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
            padding: "18px 20px",
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
              Conquistas
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
        </header>

        <main
          style={{
            padding: "32px 20px",
            maxWidth: 480,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: 16 }}>🔒</div>
          <h2
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.6rem",
              color: c.texto,
              margin: "0 0 8px",
            }}
          >
            Suas conquistas estão aqui!
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: c.textoSub,
              lineHeight: 1.6,
              margin: "0 0 28px",
            }}
          >
            Você está construindo uma história incrível.
            <br />
            Peça para seu responsável liberar o acesso completo para ver tudo
            que você já conquistou.
          </p>

          {/* Preview bloqueado de conquistas */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              marginBottom: 28,
            }}
          >
            {["🌱", "🔥", "📜", "🗺️", "🏆", "🌟"].map((icone, i) => (
              <div
                key={i}
                style={{
                  background: c.card,
                  borderRadius: 16,
                  padding: "18px 8px",
                  border: `2px solid ${c.borda}`,
                  opacity: 0.5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div style={{ fontSize: "1.8rem", filter: "grayscale(100%)" }}>
                  🔒
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: c.textoSub,
                    fontWeight: 700,
                  }}
                >
                  Bloqueado
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: c.card,
              borderRadius: 20,
              padding: "20px 24px",
              border: `2px solid #00D4AA33`,
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                color: c.textoSub,
                margin: "0 0 14px",
                fontWeight: 700,
              }}
            >
              Peça para seu responsável liberar 📲
            </p>
            <button
              onClick={() => {
                const msg = encodeURIComponent(
                  `EduPlay — Instituto do Saber\n\nSeu filho está acumulando conquistas no EduPlay mas ainda não tem acesso completo para ver!\n\nLibere agora com 5 dias grátis:\n👉 eduplay.olloapp.com.br`,
                );
                window.open(`https://wa.me/?text=${msg}`, "_blank");
              }}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 14,
                border: "none",
                background: "#25D366",
                color: "#fff",
                fontWeight: 900,
                fontSize: "0.95rem",
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              📲 Mandar pelo WhatsApp
            </button>
          </div>
        </main>
        <BottomNav />
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>
      </div>
    );
  }

  // ── Tela com login ──
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: c.bg,
        fontFamily: "'Nunito', sans-serif",
        paddingBottom: 90,
      }}
    >
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Header */}
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
            Conquistas
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
          {desbloqueadas} de {conquistas.length} desbloqueadas
        </p>
      </header>

      <main
        style={{
          padding: "20px 16px",
          maxWidth: 600,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Resumo */}
        <div style={{ display: "flex", gap: 10 }}>
          {[
            {
              icone: "🔥",
              label: "dias seguidos",
              valor: progresso?.diasSeguidos || 0,
            },
            {
              icone: "✅",
              label: "missões feitas",
              valor: progresso?.missoesFeitas || 0,
            },
            { icone: "🏅", label: "conquistas", valor: desbloqueadas },
          ].map((p) => (
            <div
              key={p.label}
              style={{
                flex: 1,
                background: c.card,
                borderRadius: 16,
                padding: "12px 10px",
                border: `1.5px solid ${c.borda}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ fontSize: "1.4rem" }}>{p.icone}</span>
              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: c.texto,
                  fontFamily: "'Fredoka', sans-serif",
                }}
              >
                {p.valor}
              </div>
              <div
                style={{
                  fontSize: "0.6rem",
                  color: c.textoSub,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {p.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filtro por eixo */}
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {EIXOS.map((eixo) => (
            <button
              key={eixo.id}
              onClick={() => setEixoAtivo(eixo.id)}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: "none",
                flexShrink: 0,
                background: eixoAtivo === eixo.id ? c.teal : c.card,
                color: eixoAtivo === eixo.id ? "#fff" : c.textoSub,
                fontWeight: 700,
                fontSize: "0.78rem",
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
                outline: `1.5px solid ${eixoAtivo === eixo.id ? c.teal : c.borda}`,
              }}
            >
              {eixo.label}
            </button>
          ))}
        </div>

        {/* Grade de conquistas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
            gap: 10,
          }}
        >
          {conquistasFiltradas.map((conq) => (
            <button
              key={conq.id}
              onClick={() => setSelecionada(conq)}
              style={{
                background: conq.desbloqueada
                  ? conq.especial
                    ? `linear-gradient(135deg, ${c.teal}22, ${c.gold}11)`
                    : c.verdeClaro
                  : c.card,
                border: `2px solid ${conq.desbloqueada ? (conq.especial ? c.gold : "#5DCAA5") : c.borda}`,
                borderRadius: 16,
                padding: "16px 12px",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
              }}
            >
              {/* Barra de progresso */}
              {!conq.desbloqueada && (
                <div
                  style={{
                    height: 3,
                    background: c.borda,
                    borderRadius: 2,
                    marginBottom: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 2,
                      width: `${Math.round((conq.progresso / conq.meta) * 100)}%`,
                      background: c.teal,
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  fontSize: "2rem",
                  marginBottom: 6,
                  filter: conq.desbloqueada ? "none" : "grayscale(80%)",
                  opacity: conq.desbloqueada ? 1 : 0.5,
                }}
              >
                {conq.desbloqueada ? conq.icone : "🔒"}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: conq.desbloqueada ? c.verde : c.textoSub,
                }}
              >
                {conq.titulo}
              </div>
              {!conq.desbloqueada && (
                <div
                  style={{
                    fontSize: "0.62rem",
                    color: c.textoSub,
                    marginTop: 4,
                  }}
                >
                  {conq.progresso}/{conq.meta}
                </div>
              )}
            </button>
          ))}
        </div>
      </main>

      {/* Modal da conquista */}
      {selecionada && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setSelecionada(null)}
        >
          <div
            style={{
              background: c.card,
              borderRadius: 24,
              padding: "28px 24px",
              maxWidth: 380,
              width: "100%",
              textAlign: "center",
              border: `2px solid ${selecionada.desbloqueada ? (selecionada.especial ? c.gold : "#5DCAA5") : c.borda}`,
              animation: "fadeIn 0.25s ease",
            }}
            onClick={(ev) => ev.stopPropagation()}
          >
            <div
              style={{
                fontSize: "3.5rem",
                marginBottom: 12,
                filter: selecionada.desbloqueada ? "none" : "grayscale(80%)",
              }}
            >
              {selecionada.desbloqueada ? selecionada.icone : "🔒"}
            </div>

            <h2
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "1.4rem",
                color: selecionada.desbloqueada ? c.verde : c.texto,
                margin: "0 0 6px",
              }}
            >
              {selecionada.titulo}
            </h2>
            <p
              style={{
                fontSize: "0.85rem",
                color: c.textoSub,
                margin: "0 0 16px",
                lineHeight: 1.5,
              }}
            >
              {selecionada.descricao}
            </p>

            {/* Progresso se não desbloqueada */}
            {!selecionada.desbloqueada && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    color: c.textoSub,
                    marginBottom: 6,
                  }}
                >
                  <span>Progresso</span>
                  <span>
                    {selecionada.progresso}/{selecionada.meta}
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: c.borda,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 4,
                      width: `${Math.round((selecionada.progresso / selecionada.meta) * 100)}%`,
                      background: `linear-gradient(90deg, ${c.teal}, #0099FF)`,
                      transition: "width 0.8s ease",
                    }}
                  />
                </div>
              </div>
            )}

            <div
              style={{
                background: e ? "#0D1820" : "#F0FFF8",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 16,
                border: `1.5px solid ${c.borda}`,
              }}
            >
              <p
                style={{
                  fontSize: "0.72rem",
                  color: c.verde,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  margin: "0 0 4px",
                }}
              >
                Habilidade desenvolvida
              </p>
              <p style={{ fontSize: "0.85rem", color: c.texto, margin: 0 }}>
                {selecionada.habilidade}
              </p>
            </div>

            {/* Botões de compartilhamento — só se desbloqueada */}
            {selecionada.desbloqueada && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: c.textoSub,
                    margin: 0,
                    fontWeight: 700,
                  }}
                >
                  🎉 Compartilhe essa conquista!
                </p>
                <button
                  onClick={() => compartilharConquista(selecionada)}
                  disabled={compartilhando}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 14,
                    border: "none",
                    background: "#25D366",
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  📲 Compartilhar no WhatsApp
                </button>
                <button
                  onClick={() => copiarConquista(selecionada)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 14,
                    border: `2px solid ${c.borda}`,
                    background: "transparent",
                    color: c.textoSub,
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  📋 Copiar para status
                </button>
              </div>
            )}

            <button
              onClick={() => setSelecionada(null)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 14,
                border: "none",
                background: selecionada.desbloqueada ? c.verde : c.borda,
                color: selecionada.desbloqueada ? "#E1F5EE" : c.textoSub,
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <BottomNav />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes girar { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
