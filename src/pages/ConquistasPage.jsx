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

// ─────────────────────────────────────────────────────────────
// NÍVEL INFINITO — os 20 marcos originais permanecem intactos;
// depois deles a progressão continua para sempre.
// ─────────────────────────────────────────────────────────────
const MARCOS = [
  0, 5, 10, 20, 35, 55, 80, 110, 145, 185, 230, 280, 340, 410, 490, 580, 680,
  790, 910, 1000,
];

function marcoDoNivel(idx) {
  if (idx < MARCOS.length) return MARCOS[idx];
  // Após o nível 20: cada nível exige +120 missões (jornada sem fim)
  return MARCOS[MARCOS.length - 1] + (idx - (MARCOS.length - 1)) * 120;
}

function calcularNivel(total) {
  let nivel = 1;
  while (total >= marcoDoNivel(nivel)) nivel++;
  const atual = marcoDoNivel(nivel - 1);
  const prox = marcoDoNivel(nivel);
  const pct =
    prox > atual ? Math.round(((total - atual) / (prox - atual)) * 100) : 100;
  return { nivel, pct: Math.min(pct, 100), atual, prox };
}

// Identidade que cresce com a criança
function tituloDoNivel(nivel) {
  if (nivel < 5) return { titulo: "Explorador", emoji: "🧭" };
  if (nivel < 10) return { titulo: "Investigador", emoji: "🔍" };
  if (nivel < 15) return { titulo: "Pesquisador", emoji: "📖" };
  if (nivel < 20) return { titulo: "Cientista", emoji: "🔬" };
  if (nivel < 30) return { titulo: "Mestre do Saber", emoji: "🎓" };
  return { titulo: "Lenda do Saber", emoji: "🏛️" };
}

// ─────────────────────────────────────────────────────────────
// DATAS NO FUSO DE SÃO PAULO (corrige o calendário deslocado)
// ─────────────────────────────────────────────────────────────
const fmtSP = (d) =>
  d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

function datasDaSemanaAtual() {
  // Constrói a data de hoje em SP sem ambiguidade de UTC
  const [y, m, dia] = fmtSP(new Date()).split("-").map(Number);
  const hojeLocal = new Date(y, m - 1, dia);
  const diaSemana = hojeLocal.getDay(); // 0=Dom
  const idxSegunda = diaSemana === 0 ? 6 : diaSemana - 1;
  const segunda = new Date(hojeLocal);
  segunda.setDate(hojeLocal.getDate() - idxSegunda);
  const dias = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dias.push(`${yy}-${mm}-${dd}`);
  }
  return { dias, idxHoje: idxSegunda };
}

// ─────────────────────────────────────────────────────────────
// CONQUISTAS — calculadas só com dados que JÁ existem no banco
// ─────────────────────────────────────────────────────────────
function gerarConquistas(progresso, totalFeitas, missoesPorDisc) {
  const dias = progresso?.diasSeguidos || 0;
  const recorde = progresso?.recordeDias || 0;
  const media = progresso?.mediaGeral || 0;
  const melhorNota = progresso?.melhorNota || 0;
  const discComMissao = Object.keys(DISC).filter((d) =>
    (missoesPorDisc[d] || []).some((m) => m.feita),
  ).length;

  return [
    {
      id: "m1",
      emoji: "🚀",
      nome: "Decolagem",
      desc: "1ª missão concluída",
      ok: totalFeitas >= 1,
      req: "Complete sua 1ª missão",
    },
    {
      id: "m5",
      emoji: "⭐",
      nome: "Constelação",
      desc: "5 missões",
      ok: totalFeitas >= 5,
      req: "Complete 5 missões",
    },
    {
      id: "m10",
      emoji: "🌟",
      nome: "Supernova",
      desc: "10 missões",
      ok: totalFeitas >= 10,
      req: "Complete 10 missões",
    },
    {
      id: "m25",
      emoji: "🏅",
      nome: "Maratonista",
      desc: "25 missões",
      ok: totalFeitas >= 25,
      req: "Complete 25 missões",
    },
    {
      id: "m50",
      emoji: "🏆",
      nome: "Campeão",
      desc: "50 missões",
      ok: totalFeitas >= 50,
      req: "Complete 50 missões",
    },
    {
      id: "d3",
      emoji: "🔥",
      nome: "Chama Acesa",
      desc: "3 dias seguidos",
      ok: dias >= 3 || recorde >= 3,
      req: "Estude 3 dias seguidos",
    },
    {
      id: "d7",
      emoji: "🔥",
      nome: "Semana de Fogo",
      desc: "7 dias seguidos",
      ok: dias >= 7 || recorde >= 7,
      req: "Estude 7 dias seguidos",
    },
    {
      id: "d14",
      emoji: "💎",
      nome: "Imparável",
      desc: "14 dias seguidos",
      ok: dias >= 14 || recorde >= 14,
      req: "Estude 14 dias seguidos",
    },
    {
      id: "n80",
      emoji: "🎯",
      nome: "Precisão",
      desc: "Média ≥ 80%",
      ok: media >= 80 && totalFeitas > 0,
      req: "Alcance média de 80%",
    },
    {
      id: "n100",
      emoji: "💯",
      nome: "Nota Máxima",
      desc: "100% em uma missão",
      ok: melhorNota >= 100,
      req: "Tire 100% em uma missão",
    },
    {
      id: "disc5",
      emoji: "🗺️",
      nome: "Desbravador",
      desc: "Todas as 5 matérias",
      ok: discComMissao >= 5,
      req: "Faça missões nas 5 matérias",
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// MENSAGENS MOTIVACIONAIS ROTATIVAS — tom de mentalidade de
// crescimento: elogia esforço e estratégia, nunca rotula.
// ─────────────────────────────────────────────────────────────
function gerarMensagens(progresso, missoesPorDisc, nome) {
  const total = Object.values(missoesPorDisc)
    .flat()
    .filter((m) => m.feita).length;
  const dias = progresso?.diasSeguidos || 0;
  const media = progresso?.mediaGeral || 0;
  const recorde = progresso?.recordeDias || 0;

  const qtds = Object.keys(DISC).map((d) => ({
    id: d,
    n: (missoesPorDisc[d] || []).filter((m) => m.feita).length,
  }));
  const forte = qtds.reduce((a, b) => (b.n > a.n ? b : a), qtds[0]);
  const fraca = qtds.reduce((a, b) => (b.n < a.n ? b : a), qtds[0]);

  const msgs = [];

  if (total === 0) {
    return [
      {
        emoji: "🌱",
        texto: `${nome}, toda grande jornada começa com um único passo. Sua primeira missão está esperando!`,
      },
      {
        emoji: "🧭",
        texto: `Sabia que seu cérebro cria novas conexões cada vez que você aprende algo? Vamos começar a construir!`,
      },
    ];
  }

  msgs.push({
    emoji: "⚡",
    texto: `${nome}, você já completou ${total} ${total === 1 ? "missão" : "missões"}. Cada uma delas mudou seu cérebro de verdade — isso é ciência!`,
  });

  if (dias >= 2)
    msgs.push({
      emoji: "🔥",
      texto: `${dias} dias seguidos! A constância vale mais que a pressa. Quem estuda um pouco todo dia chega mais longe que quem estuda muito de vez em quando.`,
    });
  else
    msgs.push({
      emoji: "🌅",
      texto: `Que tal voltar amanhã também? Sequências de dias são o segredo dos grandes estudantes — comece a sua hoje.`,
    });

  if (media >= 80)
    msgs.push({
      emoji: "🎯",
      texto: `Média de ${media}%! Isso mostra que você não está só fazendo — está entendendo. Continue revisando o que erra, é assim que se chega ao topo.`,
    });
  else if (media > 0)
    msgs.push({
      emoji: "💪",
      texto: `Errar faz parte do treino, ${nome}. Cada erro mostra exatamente onde focar. Refazer uma missão é jogada de mestre, não de quem desistiu.`,
    });

  if (forte && forte.n > 0)
    msgs.push({
      emoji: DISC[forte.id].icone,
      texto: `${DISC[forte.id].label} é a sua força! Que tal usar essa confiança para encarar um desafio novo hoje?`,
    });

  if (fraca && fraca.n < forte.n)
    msgs.push({
      emoji: DISC[fraca.id].icone,
      texto: `${DISC[fraca.id].label} ainda é território pouco explorado. Os melhores exploradores vão onde poucos foram. Topa desbravar?`,
    });

  if (recorde > 0 && dias < recorde)
    msgs.push({
      emoji: "🏆",
      texto: `Seu recorde é ${recorde} dias seguidos. Você já provou que consegue — agora é só repetir a fórmula!`,
    });

  msgs.push({
    emoji: "🧠",
    texto: `Conselho de mestre: explicar o que você aprendeu para alguém da família fixa o conhecimento 2x mais. Experimenta!`,
  });

  return msgs;
}

// ─────────────────────────────────────────────────────────────
// TRILHA DO SABER — mapa interativo da jornada
// ─────────────────────────────────────────────────────────────
function TrilhaDoSaber({ nivelInfo, totalFeitas, c, e }) {
  const [selecionado, setSelecionado] = useState(nivelInfo.nivel);

  // Mostra do nível 1 (ou atual-2) até atual+3 — a estrada continua...
  const inicio = Math.max(1, nivelInfo.nivel - 2);
  const fim = nivelInfo.nivel + 3;
  const niveis = [];
  for (let n = inicio; n <= fim; n++) niveis.push(n);

  const altura = niveis.length * 86 + 40;
  const xEsq = 80,
    xDir = 220,
    cxMeio = 150;

  const pos = niveis.map((n, i) => ({
    nivel: n,
    x: i % 2 === 0 ? xEsq : xDir,
    y: 40 + i * 86,
  }));

  // Caminho sinuoso ligando os nós
  let path = `M ${pos[0].x} ${pos[0].y}`;
  for (let i = 1; i < pos.length; i++) {
    const a = pos[i - 1],
      b = pos[i];
    path += ` C ${a.x} ${a.y + 43}, ${b.x} ${b.y - 43}, ${b.x} ${b.y}`;
  }

  const infoSel = (() => {
    const m = marcoDoNivel(selecionado - 1);
    const mProx = marcoDoNivel(selecionado);
    const tit = tituloDoNivel(selecionado);
    if (selecionado < nivelInfo.nivel)
      return {
        emoji: "✅",
        titulo: `Nível ${selecionado} · ${tit.titulo}`,
        texto: `Conquistado! Você passou por aqui com ${m}+ missões. Esse caminho já é seu.`,
      };
    if (selecionado === nivelInfo.nivel)
      return {
        emoji: "📍",
        titulo: `Você está aqui! Nível ${selecionado} · ${tit.titulo}`,
        texto: `Faltam ${Math.max(0, mProx - totalFeitas)} ${mProx - totalFeitas === 1 ? "missão" : "missões"} para o nível ${selecionado + 1}. Um passo de cada vez!`,
      };
    return {
      emoji: "🔒",
      titulo: `Nível ${selecionado} · ${tit.titulo}`,
      texto: `Para chegar aqui: ${m} missões no total. Faltam ${Math.max(0, m - totalFeitas)}. A trilha está esperando você.`,
    };
  })();

  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${c.borda}`,
        borderRadius: 16,
        padding: 16,
        overflow: "hidden",
      }}
    >
      <p
        style={{
          fontSize: "0.88rem",
          fontWeight: 700,
          color: c.texto,
          margin: "0 0 4px",
          fontFamily: "'Fredoka', sans-serif",
        }}
      >
        🗺️ Trilha do Saber
      </p>
      <p style={{ fontSize: "0.72rem", color: c.textoSub, margin: "0 0 8px" }}>
        Toque nas estações da sua jornada — ela não tem fim!
      </p>

      <svg
        viewBox={`0 0 300 ${altura}`}
        width="100%"
        style={{ maxWidth: 320, margin: "0 auto", display: "block" }}
      >
        {/* Estrada */}
        <path
          d={path}
          fill="none"
          stroke={e ? "#2D3D50" : "#E2E8F0"}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={path}
          fill="none"
          stroke="#0F6E56"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="2000"
          strokeDashoffset="2000"
          style={{ animation: "edu-trilha 2.5s ease forwards" }}
          pathLength="2000"
        />
        {/* Continuação da estrada (a jornada não acaba) */}
        <text
          x={pos[pos.length - 1].x}
          y={altura - 4}
          textAnchor="middle"
          fontSize="14"
          fill={c.textoSub}
        >
          ⋯
        </text>

        {pos.map((p) => {
          const feito = p.nivel < nivelInfo.nivel;
          const atual = p.nivel === nivelInfo.nivel;
          const sel = p.nivel === selecionado;
          return (
            <g
              key={p.nivel}
              onClick={() => setSelecionado(p.nivel)}
              style={{ cursor: "pointer" }}
            >
              {atual && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="26"
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth="2"
                  opacity="0.6"
                  style={{ animation: "edu-pulso 1.8s ease-in-out infinite" }}
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r="20"
                fill={
                  atual
                    ? "#FFD700"
                    : feito
                      ? "#0F6E56"
                      : e
                        ? "#1A2633"
                        : "#F0F4F8"
                }
                stroke={sel ? "#FFD700" : feito || atual ? "#0F6E56" : c.borda}
                strokeWidth={sel ? 3 : 2}
              />
              <text
                x={p.x}
                y={p.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                fontWeight="800"
                fill={atual ? "#633806" : feito ? "#E1F5EE" : c.textoSub}
                fontFamily="Nunito, sans-serif"
              >
                {feito ? "✓" : atual ? "★" : p.nivel}
              </text>
              <text
                x={p.x}
                y={p.y + 34}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill={atual ? "#FFD700" : c.textoSub}
                fontFamily="Nunito, sans-serif"
              >
                Nv {p.nivel}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Card de detalhe da estação selecionada */}
      <div
        key={selecionado}
        style={{
          marginTop: 10,
          background: e ? "#0F6E5622" : "#E1F5EE",
          border: "1.5px solid #5DCAA5",
          borderRadius: 12,
          padding: "10px 14px",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          animation: "edu-surgir 0.35s ease",
        }}
      >
        <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>
          {infoSel.emoji}
        </span>
        <div>
          <p
            style={{
              fontSize: "0.8rem",
              fontWeight: 800,
              color: c.texto,
              margin: "0 0 2px",
            }}
          >
            {infoSel.titulo}
          </p>
          <p
            style={{
              fontSize: "0.75rem",
              color: c.textoSub,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {infoSel.texto}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RADAR (mantido do original)
// ─────────────────────────────────────────────────────────────
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
          style={{ animation: "edu-surgir 0.8s ease" }}
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

// ─────────────────────────────────────────────────────────────
// PÁGINA
// ─────────────────────────────────────────────────────────────
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
  const [msgIdx, setMsgIdx] = useState(0);
  const [exp, setExp] = useState({
    conquistas: true,
    consistencia: false,
    missoes: false,
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

  // Rotação das mensagens motivacionais (a cada 7s)
  const nome = crianca?.nome?.split(" ")[0] || "Agente";
  const mensagens = gerarMensagens(progresso, missoesPorDisc, nome);
  useEffect(() => {
    if (mensagens.length <= 1) return;
    const t = setInterval(
      () => setMsgIdx((i) => (i + 1) % mensagens.length),
      7000,
    );
    return () => clearInterval(t);
  }, [mensagens.length]);

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

  const serie = crianca?.serie || "6ano";
  const serieNum = parseInt(serie.replace("ano", "")) || 6;
  const totalFeitas = Object.values(missoesPorDisc)
    .flat()
    .filter((m) => m.feita).length;
  const nivelInfo = calcularNivel(totalFeitas);
  const tit = tituloDoNivel(nivelInfo.nivel);
  const dias = progresso?.diasSeguidos || 0;
  const diasAtivos = progresso?.diasAtivos || [];
  const media = progresso?.mediaGeral || 0;
  const conquistas = gerarConquistas(progresso, totalFeitas, missoesPorDisc);
  const desbloqueadas = conquistas.filter((cq) => cq.ok).length;
  const msg = mensagens[msgIdx % mensagens.length];
  const { dias: semanaDias, idxHoje } = datasDaSemanaAtual();

  // Próximo desafio: disciplina menos explorada, como convite
  const qtdsDisc = Object.keys(DISC).map((d) => ({
    id: d,
    n: (missoesPorDisc[d] || []).filter((m) => m.feita).length,
  }));
  const desafio = qtdsDisc.reduce((a, b) => (b.n < a.n ? b : a), qtdsDisc[0]);

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
            animation: "edu-surgir 0.5s ease",
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
          <span
            style={{
              position: "absolute",
              top: 14,
              right: 16,
              fontSize: "1.6rem",
              animation: "edu-flutuar 3s ease-in-out infinite",
            }}
          >
            {tit.emoji}
          </span>
          <p
            style={{
              fontSize: "0.65rem",
              letterSpacing: 2,
              color: "#9FE1CB",
              margin: "0 0 8px",
              textTransform: "uppercase",
            }}
          >
            Agente {tit.titulo}
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
            Nível {nivelInfo.nivel} · {serieNum}º Ano
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
                  width: `${nivelInfo.pct}%`,
                  background: "linear-gradient(90deg,#5DCAA5,#FFD700)",
                  borderRadius: 3,
                  transition: "width 1s ease",
                  backgroundSize: "200% 100%",
                  animation: "edu-brilho 2.5s linear infinite",
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
              {Math.max(0, nivelInfo.prox - totalFeitas)}{" "}
              {nivelInfo.prox - totalFeitas === 1 ? "missão" : "missões"} para o
              nível {nivelInfo.nivel + 1}
            </p>
          </div>
        </div>

        {/* MENSAGEM MOTIVACIONAL ROTATIVA */}
        <div
          key={msgIdx}
          style={{
            background: c.card,
            border: `1.5px solid ${c.borda}`,
            borderRadius: 16,
            padding: "16px 18px",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            animation: "edu-surgir 0.5s ease",
          }}
        >
          <span
            style={{
              fontSize: "1.8rem",
              flexShrink: 0,
              animation: "edu-flutuar 3s ease-in-out infinite",
            }}
          >
            {msg.emoji}
          </span>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: "0.85rem",
                color: c.texto,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {msg.texto}
            </p>
            {mensagens.length > 1 && (
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                {mensagens.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background:
                        i === msgIdx % mensagens.length ? "#0F6E56" : c.borda,
                      transition: "background 0.3s",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TRILHA DO SABER */}
        <TrilhaDoSaber
          nivelInfo={nivelInfo}
          totalFeitas={totalFeitas}
          c={c}
          e={e}
        />

        {/* RADAR */}
        <RadarHabilidades missoesPorDisc={missoesPorDisc} c={c} e={e} />

        {/* PRÓXIMO DESAFIO */}
        {totalFeitas > 0 && desafio && (
          <div
            style={{
              background: e ? "#1A2633" : "#FFF9E6",
              border: `1.5px dashed ${e ? "#FFD70066" : "#FFD700"}`,
              borderRadius: 16,
              padding: "14px 16px",
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "1.6rem",
                animation: "edu-pulso-suave 2s ease-in-out infinite",
              }}
            >
              {DISC[desafio.id].icone}
            </span>
            <div>
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  color: c.texto,
                  margin: "0 0 2px",
                }}
              >
                Seu próximo desafio
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: c.textoSub,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {DISC[desafio.id].label} está esperando você desbravar. Grandes
                exploradores vão onde poucos foram! 🚀
              </p>
            </div>
          </div>
        )}

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
                animation: `edu-surgir 0.5s ease ${i * 0.12}s backwards`,
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

        {/* SECAO: MURAL DE CONQUISTAS */}
        <div
          style={{
            background: c.card,
            border: `1.5px solid ${c.borda}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <SecHeader
            titulo={`🏅 Mural de Conquistas · ${desbloqueadas}/${conquistas.length}`}
            chave="conquistas"
          />
          {exp.conquistas && (
            <div
              style={{
                padding: "12px 16px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
                gap: 8,
              }}
            >
              {conquistas.map((cq, i) => (
                <div
                  key={cq.id}
                  title={cq.ok ? cq.desc : cq.req}
                  style={{
                    background: cq.ok ? (e ? "#0F6E5622" : "#E1F5EE") : c.bg,
                    border: `1.5px solid ${cq.ok ? "#5DCAA5" : c.borda}`,
                    borderRadius: 12,
                    padding: "12px 6px",
                    textAlign: "center",
                    opacity: cq.ok ? 1 : 0.55,
                    animation: cq.ok
                      ? `edu-pop 0.4s ease ${i * 0.05}s backwards`
                      : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.5rem",
                      marginBottom: 4,
                      filter: cq.ok ? "none" : "grayscale(1)",
                    }}
                  >
                    {cq.ok ? cq.emoji : "🔒"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      color: c.texto,
                      marginBottom: 2,
                    }}
                  >
                    {cq.nome}
                  </div>
                  <div
                    style={{
                      fontSize: "0.6rem",
                      color: cq.ok ? "#0F6E56" : c.textoSub,
                      lineHeight: 1.3,
                    }}
                  >
                    {cq.ok ? cq.desc : cq.req}
                  </div>
                </div>
              ))}
            </div>
          )}
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
                  ? `Você está em ${dias} ${dias === 1 ? "dia" : "dias"} seguidos de estudo.`
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
                      animation: `edu-pop 0.3s ease ${i * 0.04}s backwards`,
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

        {/* SECAO: MISSOES POR DISCIPLINA */}
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

        {/* SECAO: ESTA SEMANA — corrigida para fuso de SP e semana corrente */}
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
                    const isHoje = i === idxHoje;
                    const feito = diasAtivos.includes(semanaDias[i]);
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
                            animation: isHoje
                              ? "edu-pulso-suave 2s ease-in-out infinite"
                              : "none",
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
        @keyframes edu-surgir{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes edu-pop{0%{opacity:0;transform:scale(0.6)}70%{transform:scale(1.08)}100%{opacity:1;transform:scale(1)}}
        @keyframes edu-pulso{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.15);opacity:0.2}}
        @keyframes edu-pulso-suave{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
        @keyframes edu-flutuar{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes edu-brilho{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes edu-trilha{to{stroke-dashoffset:0}}
      `}</style>
    </div>
  );
}
