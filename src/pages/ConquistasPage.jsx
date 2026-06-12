import { useState, useEffect } from "react";
import { useTema } from "../context/ThemeContext";
import BottomNav from "../components/BottomNav";
import { getProgresso, getTodasMissoes, getCrianca } from "../services/db";

const DISC = {
  historia: { label: "História", icone: "📜", cor: "#C4A882" },
  geografia: { label: "Geografia", icone: "🗺️", cor: "#5A8F8C" },
  matematica: { label: "Matemática", icone: "📐", cor: "#6B5B95" },
  ciencias: { label: "Ciências", icone: "🔬", cor: "#2E8B57" },
  portugues: { label: "Português", icone: "✍️", cor: "#C0392B" },
};

function calcularNivel(total) {
  const marcos = [
    0, 5, 10, 20, 35, 55, 80, 110, 145, 185, 230, 280, 340, 410, 490, 580, 680,
    790, 910, 1000,
  ];
  let nivel = 1;
  for (let i = 0; i < marcos.length; i++) {
    if (total >= marcos[i]) nivel = i + 1;
    else break;
  }
  const atual = marcos[nivel - 1] || 0;
  const prox = marcos[nivel] || marcos[marcos.length - 1] + 100;
  const pct =
    prox > atual ? Math.round(((total - atual) / (prox - atual)) * 100) : 100;
  return { nivel, pct: Math.min(pct, 100) };
}

function gerarFrase(progresso, missoesPorDisc, nome) {
  const total = Object.values(missoesPorDisc).flat().length;
  const feitas = Object.values(missoesPorDisc)
    .flat()
    .filter((m) => m.feita).length;
  const dias = progresso?.diasSeguidos || 0;
  const diasAtivos = progresso?.diasAtivos?.length || 0;
  const media = progresso?.mediaGeral || 0;

  if (total === 0)
    return {
      emoji: "🌱",
      frase: `${nome}, sua jornada começa agora. Cada missão que você fizer vai aparecer aqui. Vamos lá!`,
    };

  if (media >= 80 && dias >= 3)
    return {
      emoji: "🌟",
      frase: `${nome}, seu desempenho está excelente! ${media}% de aproveitamento e ${dias} dias seguidos de estudo. Esse ritmo é de quem chega longe.`,
    };

  if (media >= 80)
    return {
      emoji: "🎯",
      frase: `${nome}, parabéns! ${media}% de aproveitamento mostra que você está dominando o conteúdo. Continue assim!`,
    };

  if (media >= 50 && dias >= 2)
    return {
      emoji: "💪",
      frase: `${nome}, você está evoluindo. ${feitas} missões concluídas com consistência. Seu esforço está valendo a pena.`,
    };

  if (media >= 50)
    return {
      emoji: "📚",
      frase: `${nome}, bom trabalho! Você já concluiu ${feitas} missões. Continue praticando e a média vai subir naturalmente.`,
    };

  if (media > 0 && media < 50)
    return {
      emoji: "🔄",
      frase: `${nome}, vamos mudar isso juntos. Você tem potencial — preciso que se esforce um pouco mais. Cada missão refeita é uma chance de melhorar.`,
    };

  if (diasAtivos >= 2)
    return {
      emoji: "🔥",
      frase: `${nome}, você já criou o hábito de voltar. Isso é mais importante do que qualquer nota. Continue!`,
    };

  return {
    emoji: "⚡",
    frase: `${nome}, você completou ${feitas} missões até agora. Cada uma delas é um passo real no seu conhecimento.`,
  };
}

function RadarHabilidades({ missoesPorDisc, c, e }) {
  const ids = ["historia", "geografia", "matematica", "ciencias", "portugues"];
  const labels = [
    "História",
    "Geografia",
    "Matemática",
    "Ciências",
    "Português",
  ];
  const cores = ["#C4A882", "#5A8F8C", "#6B5B95", "#2E8B57", "#C0392B"];

  const qtds = ids.map(
    (d) => (missoesPorDisc[d] || []).filter((m) => m.feita).length,
  );
  const max = Math.max(...qtds, 1);
  const cx = 150,
    cy = 140,
    raio = 100;
  const angulos = ids.map((_, i) => (Math.PI * 2 * i) / 5 - Math.PI / 2);

  const pontosValor = angulos
    .map((a, i) => {
      const r = Math.max(12, (qtds[i] / max) * raio);
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    })
    .join(" ");

  const melhorIdx = qtds.indexOf(Math.max(...qtds));
  const melhorDisc = qtds[melhorIdx] > 0 ? labels[melhorIdx] : null;

  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${c.borda}`,
        borderRadius: 16,
        padding: 16,
        textAlign: "center",
      }}
    >
      <svg
        viewBox="0 0 300 280"
        width="100%"
        style={{ maxWidth: 300, margin: "0 auto" }}
      >
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon
            key={f}
            points={angulos
              .map(
                (a) =>
                  `${cx + raio * f * Math.cos(a)},${cy + raio * f * Math.sin(a)}`,
              )
              .join(" ")}
            fill="none"
            stroke={e ? "#2D3D50" : "#E2E8F0"}
            strokeWidth="0.5"
          />
        ))}
        {angulos.map((a, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + raio * Math.cos(a)}
            y2={cy + raio * Math.sin(a)}
            stroke={e ? "#2D3D50" : "#E2E8F0"}
            strokeWidth="0.5"
          />
        ))}
        <polygon
          points={pontosValor}
          fill={e ? "rgba(0,212,170,0.15)" : "rgba(15,110,86,0.12)"}
          stroke="#0F6E56"
          strokeWidth="2"
        />
        {angulos.map((a, i) => {
          const r = Math.max(12, (qtds[i] / max) * raio);
          return (
            <circle
              key={i}
              cx={cx + r * Math.cos(a)}
              cy={cy + r * Math.sin(a)}
              r="4"
              fill={cores[i]}
              stroke="#fff"
              strokeWidth="1.5"
            />
          );
        })}
        {angulos.map((a, i) => (
          <text
            key={i}
            x={cx + (raio + 28) * Math.cos(a)}
            y={cy + (raio + 28) * Math.sin(a)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={cores[i]}
            fontSize="10"
            fontWeight="700"
            fontFamily="Nunito, sans-serif"
          >
            {labels[i]}
          </text>
        ))}
      </svg>
      {melhorDisc ? (
        <p
          style={{
            fontSize: "0.82rem",
            color: "#0F6E56",
            fontWeight: 700,
            margin: "4px 0 0",
          }}
        >
          Sua força é {melhorDisc}
        </p>
      ) : (
        <p
          style={{ fontSize: "0.82rem", color: c.textoSub, margin: "4px 0 0" }}
        >
          Faça missões para revelar seu radar
        </p>
      )}
    </div>
  );
}

export default function ConquistasPage() {
  const { tema, alternarTema } = useTema();
  const e = tema === "escuro";

  const c = {
    bg: e ? "#0D141C" : "#F0F4F8",
    card: e ? "#1A2633" : "#FFFFFF",
    texto: e ? "#E2E8F0" : "#1E293B",
    textoSub: e ? "#94A3B8" : "#64748B",
    borda: e ? "#2D3D50" : "#E2E8F0",
    verde: "#0F6E56",
  };

  const [progresso, setProgresso] = useState(null);
  const [missoesPorDisc, setMissoes] = useState({});
  const [crianca, setCrianca] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [exp, setExp] = useState({
    consistencia: false,
    missoes: false,
    disciplinas: false,
    semana: true,
  });
  const tog = (k) => setExp((p) => ({ ...p, [k]: !p[k] }));

  const codigoAcesso = localStorage.getItem("eduplay_codigo_acesso");

  useEffect(() => {
    if (!codigoAcesso) {
      setCarregando(false);
      return;
    }
    Promise.all([
      getProgresso(codigoAcesso),
      getTodasMissoes(codigoAcesso),
      getCrianca(codigoAcesso),
    ])
      .then(([prog, miss, cri]) => {
        setProgresso(prog);
        setMissoes(miss || {});
        setCrianca(cri);
      })
      .catch((err) => console.error("Erro:", err))
      .finally(() => setCarregando(false));
  }, [codigoAcesso]);

  if (carregando) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: c.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: "2rem", animation: "spin 1s linear infinite" }}>
          🏆
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const nome = crianca?.nome?.split(" ")[0] || "Agente";
  const serie = crianca?.serie || "6ano";
  const serieNum = parseInt(serie.replace("ano", "")) || 6;
  const totalFeitas = Object.values(missoesPorDisc)
    .flat()
    .filter((m) => m.feita).length;
  const nivel = calcularNivel(totalFeitas);
  const dias = progresso?.diasSeguidos || 0;
  const diasAtivos = progresso?.diasAtivos || [];
  const media = progresso?.mediaGeral || 0;
  const info = gerarFrase(progresso, missoesPorDisc, nome);

  const SecHeader = ({ titulo, chave }) => (
    <div
      onClick={() => tog(chave)}
      style={{
        padding: "14px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        borderBottom: exp[chave] ? `0.5px solid ${c.borda}` : "none",
      }}
    >
      <span style={{ fontSize: "0.88rem", fontWeight: 700, color: c.texto }}>
        {titulo}
      </span>
      <span
        style={{
          fontSize: 18,
          color: c.textoSub,
          transition: "transform .3s",
          display: "inline-block",
          transform: exp[chave] ? "rotate(90deg)" : "rotate(0deg)",
        }}
      >
        ›
      </span>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: c.bg,
        fontFamily: "'Nunito', sans-serif",
        paddingBottom: 90,
      }}
    >
      {/* HEADER */}
      <div style={{ background: c.verde, padding: "18px 20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
              🏆
            </div>
            <span
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#E1F5EE",
              }}
            >
              Conquistas
            </span>
          </div>
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

      <main
        style={{
          padding: "16px",
          maxWidth: 480,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* CARD AGENTE */}
        <div
          style={{
            background: "#085041",
            borderRadius: 16,
            padding: 20,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: -30,
              right: -30,
              width: 130,
              height: 130,
              background: "rgba(255,255,255,.04)",
              borderRadius: "50%",
            }}
          />
          <p
            style={{
              fontSize: "0.65rem",
              letterSpacing: 2,
              color: "#9FE1CB",
              margin: "0 0 8px",
              textTransform: "uppercase",
            }}
          >
            Agente Pesquisador
          </p>
          <p
            style={{
              fontSize: "1.3rem",
              fontWeight: 800,
              color: "#E1F5EE",
              margin: "0 0 2px",
              fontFamily: "'Fredoka', sans-serif",
            }}
          >
            {nome}
          </p>
          <p
            style={{
              fontSize: "0.82rem",
              color: "#9FE1CB",
              margin: "0 0 14px",
            }}
          >
            Nível {nivel.nivel} · {serieNum}º Ano
          </p>
          <div
            style={{
              background: "rgba(255,255,255,.08)",
              borderRadius: 10,
              padding: "10px 14px",
            }}
          >
            <div
              style={{
                height: 6,
                background: "rgba(255,255,255,.12)",
                borderRadius: 3,
                overflow: "hidden",
                marginBottom: 5,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${nivel.pct}%`,
                  background: "linear-gradient(90deg,#5DCAA5,#FFD700)",
                  borderRadius: 3,
                  transition: "width 1s ease",
                }}
              />
            </div>
            <p
              style={{
                fontSize: "0.7rem",
                color: "#9FE1CB",
                margin: 0,
                textAlign: "right",
              }}
            >
              próximas missões
            </p>
          </div>
        </div>

        {/* RADAR */}
        <RadarHabilidades missoesPorDisc={missoesPorDisc} c={c} e={e} />

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 8,
          }}
        >
          {[
            { emoji: "🔥", num: dias, label: "dias seguidos" },
            { emoji: "🎯", num: totalFeitas, label: "missões feitas" },
            {
              emoji: "⭐",
              num: totalFeitas > 0 ? `${media}%` : "--",
              label: "média geral",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: c.card,
                border: `1.5px solid ${c.borda}`,
                borderRadius: 12,
                padding: "12px 8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.emoji}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.verde }}>
                {s.num}
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: c.textoSub,
                  marginTop: 2,
                  lineHeight: 1.3,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* FRASE DE INCENTIVO */}
        <div
          style={{
            background: c.card,
            border: `1.5px solid ${c.borda}`,
            borderRadius: 16,
            padding: "16px 18px",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: "1.8rem", flexShrink: 0 }}>
            {info.emoji}
          </span>
          <p
            style={{
              fontSize: "0.85rem",
              color: c.texto,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {info.frase}
          </p>
        </div>

        {/* SECAO: CONSISTENCIA */}
        <div
          style={{
            background: c.card,
            border: `1.5px solid ${c.borda}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <SecHeader
            titulo={`Consistência · ${diasAtivos.length} dias ativos`}
            chave="consistencia"
          />
          {exp.consistencia && (
            <div style={{ padding: "12px 16px" }}>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: c.textoSub,
                  margin: "0 0 8px",
                }}
              >
                {dias > 0
                  ? `Você está em ${dias} dias seguidos de estudo.`
                  : "Comece uma sequência de dias de estudo!"}{" "}
                {progresso?.recordeDias > 0 &&
                  `Seu recorde é ${progresso.recordeDias} dias.`}
              </p>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {diasAtivos.slice(-14).map((d, i) => (
                  <div
                    key={i}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#0F6E56",
                      color: "#E1F5EE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </div>
                ))}
                {diasAtivos.length === 0 && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: c.textoSub,
                      margin: 0,
                    }}
                  >
                    Nenhum dia ativo ainda.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECAO: MISSOES */}
        <div
          style={{
            background: c.card,
            border: `1.5px solid ${c.borda}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <SecHeader
            titulo={`Missões · ${totalFeitas} concluídas`}
            chave="missoes"
          />
          {exp.missoes && (
            <div style={{ padding: "12px 16px" }}>
              {Object.entries(DISC).map(([id, info]) => {
                const feitas = (missoesPorDisc[id] || []).filter(
                  (m) => m.feita,
                ).length;
                const total = (missoesPorDisc[id] || []).length;
                return (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>{info.icone}</span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 3,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            color: c.texto,
                          }}
                        >
                          {info.label}
                        </span>
                        <span
                          style={{ fontSize: "0.72rem", color: c.textoSub }}
                        >
                          {feitas} feitas
                        </span>
                      </div>
                      <div
                        style={{
                          height: 4,
                          background: c.borda,
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width:
                              total > 0
                                ? `${Math.round((feitas / total) * 100)}%`
                                : "0%",
                            background: info.cor,
                            borderRadius: 2,
                            transition: "width 0.5s",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECAO: DISCIPLINAS */}
        <div
          style={{
            background: c.card,
            border: `1.5px solid ${c.borda}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <SecHeader titulo="Disciplinas" chave="disciplinas" />
          {exp.disciplinas && (
            <div
              style={{
                padding: "12px 16px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 8,
              }}
            >
              {Object.entries(DISC).map(([id, info]) => {
                const feitas = (missoesPorDisc[id] || []).filter(
                  (m) => m.feita,
                ).length;
                return (
                  <div
                    key={id}
                    style={{
                      background:
                        feitas > 0 ? (e ? "#0F6E5622" : "#E1F5EE") : c.bg,
                      border: `1.5px solid ${feitas > 0 ? "#5DCAA5" : c.borda}`,
                      borderRadius: 12,
                      padding: "14px 10px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>
                      {info.icone}
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: c.texto,
                        marginBottom: 2,
                      }}
                    >
                      {info.label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: feitas > 0 ? "#0F6E56" : c.textoSub,
                      }}
                    >
                      {feitas > 0 ? `${feitas} missões` : "Nenhuma ainda"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECAO: ESTA SEMANA */}
        <div
          style={{
            background: c.card,
            border: `1.5px solid ${c.borda}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <SecHeader titulo="Esta semana" chave="semana" />
          {exp.semana && (
            <div style={{ padding: "12px 16px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7,1fr)",
                  gap: 4,
                  marginBottom: 10,
                }}
              >
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
                  (dia, i) => {
                    const hoje = new Date().getDay();
                    const diaIdx = i === 6 ? 0 : i + 1;
                    const isHoje = diaIdx === hoje;
                    const feito = diasAtivos.some(
                      (d) => new Date(d).getDay() === diaIdx,
                    );
                    return (
                      <div key={i} style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: "0.6rem",
                            color: c.textoSub,
                            marginBottom: 4,
                          }}
                        >
                          {dia}
                        </div>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            margin: "0 auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                            background: isHoje
                              ? "#FFD700"
                              : feito
                                ? "#0F6E56"
                                : c.borda,
                            color: isHoje
                              ? "#633806"
                              : feito
                                ? "#E1F5EE"
                                : c.textoSub,
                          }}
                        >
                          {isHoje ? "🔥" : feito ? "✓" : "—"}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
              {dias > 0 && (
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: c.textoSub,
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  🏆 Recorde: {progresso?.recordeDias || dias} dias seguidos.
                  Você está em {dias} agora. Consegue superar?
                </p>
              )}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
