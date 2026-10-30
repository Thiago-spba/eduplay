import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTema } from "../context/ThemeContext";
import BottomNav from "../components/BottomNav";
import { signInAnonymously, signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  getTodasMissoes,
  getProgresso,
  verificarTrial,
getCrianca, getResponsavel,
  sequenciaAtual, diasDesdeUltimoEstudo, dataConclusaoSP, inicioSemanaSP, ehFimDeSemanaSP, ehFeriadoNacionalSP,
  xpBonusDaSemana} from "../services/db";
import ModalPremiacao from '../components/ModalPremiacao';
import FimDeSemana from '../components/FimDeSemana';
import DesafioRelampago, { escolherDesafio } from '../components/DesafioRelampago';

// ── Utilitários ──
function obterSaudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia,";
  if (h < 18) return "Boa tarde,";
  return "Boa noite,";
}

// Missões concluídas: diz QUANDO vem a próxima. Na sexta (ou antes de feriado) não promete
// "amanhã", e convida a aproveitar o descanso com a família.
const NOMES_DIA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
function mensagemProximaMissao(hoje = new Date()) {
  const dia = new Date(hoje.getTime());
  let temFeriado = false;
  let pausa = 0; // dias sem missão antes da próxima
  for (;;) {
    dia.setDate(dia.getDate() + 1);
    if (ehFimDeSemanaSP(dia)) { pausa++; continue; }
    if (ehFeriadoNacionalSP(dia)) { pausa++; temFeriado = true; continue; }
    break;
  }
  if (pausa === 0) return "Mandou bem! Amanhã tem missão nova esperando por você.";
  const proxima = NOMES_DIA[new Date(fmtDataSPLocal(dia) + "T12:00:00").getDay()];
  const descanso = temFeriado
    ? pausa === 1 ? "Amanhã é feriado" : "Vem aí um feriadão"
    : "Agora é fim de semana";
  return `Mandou bem! ${descanso}: aproveite para brincar, descansar e curtir a família. Na ${proxima} tem missão nova esperando por você.`;
}
const fmtDataSPLocal = (d) => d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

function obterDiasSemana(diasAtivos = []) {
  const nomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  // Datas no fuso de São Paulo (toISOString usa UTC e desloca o dia à noite)
  const fmtSP = (d) => d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const hojeISO = fmtSP(new Date());
  const inicio = new Date(inicioSemanaSP() + "T12:00:00");
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + i);
    const iso = fmtSP(d);
    return {
      label: nomes[d.getDay()],
      iso,
      feito: diasAtivos.includes(iso),
      hoje: iso === hojeISO,
    };
  });
}

const DISCIPLINAS_META = {
  historia: { label: "História", icone: "📜", cor: "#F5A623" },
  geografia: { label: "Geografia", icone: "🗺️", cor: "#1FC1B0" },
  matematica: { label: "Matemática", icone: "📐", cor: "#9B7BFF" },
  ciencias: { label: "Ciências", icone: "🔬", cor: "#3DDC84" },
  portugues: { label: "Português", icone: "✍️", cor: "#FF6B7A" },
};

// Meta da semana usada na barra de XP (10 XP por missão)
const META_SEMANA = 5;
const XP_POR_MISSAO = 10;

const ORDEM_DISCIPLINAS = [
  "historia",
  "geografia",
  "matematica",
  "ciencias",
  "portugues",
];

// ── Componente principal ──
export default function HomePage({ playerName }) {
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();
  const e = tema === "escuro";

  const [carregando, setCarregando] = useState(true);
  const [missoes, setMissoes] = useState({});
  const [progresso, setProgresso] = useState(null);
  const [diasSemana, setDiasSemana] = useState([]);
  const [premioConfig, setPremioConfig] = useState(null);
  const [mostrarFesta, setMostrarFesta] = useState(false);
  const [festaVista, setFestaVista] = useState(() => sessionStorage.getItem("festaVista") === "1");

  const c = {
    bg: e ? "#0D141C" : "#F0F4F8",
    card: e ? "#1A2633" : "#FFFFFF",
    texto: e ? "#E2E8F0" : "#1E293B",
    textoSub: e ? "#94A3B8" : "#64748B",
    borda: e ? "#2D3D50" : "#E2E8F0",
    verde: "#0F6E56",
    verdeClaro: "#E1F5EE",
    verdeSub: "#9FE1CB",
  };

  const codigoAcesso = localStorage.getItem("eduplay_codigo_acesso");
  const nomeExibido = playerName?.split(" ")[0] || "Agente";

  // ── Carrega dados do Firestore ──
  useEffect(() => {
    if (!codigoAcesso) {
      setCarregando(false);
      return;
    }
    const carregar = async () => {
      try {
        // Garante autenticação anônima antes de qualquer leitura do Firestore
        await signInAnonymously(auth).catch(() => {});

        // ── Portao de acesso: trial expirado redireciona para a tela de bloqueio ──
        try {
          const trial = await verificarTrial(codigoAcesso);
          if (!trial.ativo) {
            window.location.replace("/agente/" + codigoAcesso);
            return;
          }
        } catch (_) { /* falha de rede nao trava a home */ }

        const [missoesFB, progressoFB] = await Promise.all([
          getTodasMissoes(codigoAcesso),
          getProgresso(codigoAcesso),
        ]);

        // 1. PRIORIDADE: Renderiza as missões imediatamente, independente de falhas secundárias
        setMissoes(missoesFB);

        // 2. Tenta buscar o prêmio de forma isolada e silenciosa
        try {
          // Premio agora e lido direto do doc da crianca (espelhado pelo painel do pai)
          const criancaFB = await getCrianca(codigoAcesso);
          if (criancaFB && criancaFB.premio && criancaFB.premio.length > 0) {
            setPremioConfig({
              texto: criancaFB.premio.includes("|") ? criancaFB.premio.split("|")[1] : criancaFB.premio,
              imagemUrl: criancaFB.premioImagemUrl || null,
              freq: criancaFB.premio.includes("|") ? criancaFB.premio.split("|")[0] : "Semanal"
            });
          }
        } catch (errSeguranca) {
          console.warn("Aviso: leitura do prêmio indisponível.", errSeguranca.message);
        }
        setProgresso(progressoFB);
        setDiasSemana(obterDiasSemana(progressoFB?.diasAtivos || []));
      } catch (err) {
        console.error("Erro ao carregar HomePage:", err);
        try {
          const prog = await getProgresso(codigoAcesso);
          setProgresso(prog);
          setDiasSemana(obterDiasSemana(prog?.diasAtivos || []));
        } catch {
          /* silencia */
        }
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [codigoAcesso]);

  // ── Missão principal ──
  const missaoPrincipal = (() => {
    for (const id of ORDEM_DISCIPLINAS) {
      const lista = missoes[id] || [];
      const pendentes = lista.filter((m) => !m.feita);
      if (pendentes.length > 0)
        return { id, missao: pendentes[0], ...DISCIPLINAS_META[id] };
    }
    return null;
  })();

  // ── Outras disciplinas com missões pendentes ──
  // ── Demais missoes pendentes (todas, de todas as disciplinas) ──
  const missoesPendentesResto = ORDEM_DISCIPLINAS.flatMap((id) => {
    const lista = missoes[id] || [];
    return lista
      .filter((m) => !m.feita)
      .map((m) => ({ id, missao: m, ...DISCIPLINAS_META[id] }));
  });


  // ── Badges de esforço (só o que foi feito hoje / nesta semana) ──
  const diasSeguidos = sequenciaAtual(progresso);
  const diasSemEstudar = diasDesdeUltimoEstudo(progresso);
  const hojeSPData = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const segundaSP = inicioSemanaSP();
  const datasConclusao = Object.values(missoes).flat().map(dataConclusaoSP).filter(Boolean);
  const feitasHoje = datasConclusao.filter((d) => d === hojeSPData).length;
  const feitasSemana = datasConclusao.filter((d) => d >= segundaSP).length;
  // Sábado e domingo: sem missões, só o convite para descansar
  const fimDeSemana = ehFimDeSemanaSP();
  // Feriado nacional: o desafio aparece como opcional (pular não quebra a sequência)
  const feriado = !fimDeSemana && ehFeriadoNacionalSP();
  // Dia só fica completo quando não sobra nenhuma missão pendente
  const restamHoje = fimDeSemana ? 0 : missoesPendentesResto.length;
  // Voltou depois de 2+ dias úteis sem concluir missão e ainda não fez nenhuma hoje
  const voltouDepoisDeDias = !fimDeSemana && diasSemEstudar !== null && diasSemEstudar >= 2 && feitasHoje === 0;
  // Desafio relâmpago: 1 pergunta de uma missão de dia anterior (só em dia útil)
  const desafioDoDia = !fimDeSemana ? escolherDesafio(Object.values(missoes).flat(), hojeSPData) : null;
  const desafioFeitoHoje = !!progresso?.desafios?.[hojeSPData];
  const badges = [];
  if (feitasHoje > 0)
    badges.push({ icone: "✅", label: `${feitasHoje} ${feitasHoje === 1 ? "missão" : "missões"} hoje` });
  if (feitasSemana > 0)
    badges.push({ icone: "📅", label: `${feitasSemana} nesta semana` });
  if (diasSeguidos >= 3)
    badges.push({ icone: "🔥", label: `${diasSeguidos} dias seguidos` });

  // ── Observador de Missões (Gatilho da Festa) ──
  useEffect(() => {
    if (!missoes || Object.keys(missoes).length === 0 || !premioConfig) return;

    const fmtSP = (d) => d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
    const hojeSP = fmtSP(new Date());
    const missoesArray = Object.values(missoes).flat();
    const missoesHoje = missoesArray.filter(m => m.data === hojeSP);
    const totalHoje = missoesHoje.length;
    const pendentesHoje = missoesHoje.filter(m => !m.feita).length;

    const chaveFesta = "festaVista_" + hojeSP;

    // Se ha missoes pendentes hoje, libera a festa para quando concluir
    if (pendentesHoje > 0 && localStorage.getItem(chaveFesta)) {
      localStorage.removeItem(chaveFesta);
      setFestaVista(false);
    }

    // Festa so dispara se HOJE houve missoes e TODAS foram concluidas
    if (totalHoje > 0 && pendentesHoje === 0 && !festaVista && !localStorage.getItem(chaveFesta)) {
      setMostrarFesta(true);
    }
  }, [missoes, premioConfig, festaVista]);

  // ── Trocar usuário (Correção de Importação) ──
  const trocarUsuario = () => {
    const confirmou = window.confirm(
      "Trocar de usuario? O progresso fica salvo pelo codigo de acesso -- quando quiser voltar, e so entrar de novo com o mesmo codigo."
    );
    if (!confirmou) return;
    localStorage.removeItem("eduplay_player_name");
    localStorage.removeItem("eduplay_codigo_acesso");
    window.location.replace("/");
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
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: c.verde,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              fontSize: "1.6rem",
              animation: "pulsar 1.4s ease-in-out infinite",
            }}
          >
            🎮
          </div>
          <p
            style={{ color: c.textoSub, fontWeight: 700, fontSize: "0.88rem" }}
          >
            Carregando suas missões...
          </p>
        </div>
        <style>{`@keyframes pulsar{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: c.bg,
        fontFamily: "'Nunito', sans-serif",
        paddingBottom: 90,
      }}
    >
      {/* ── HEADER VERDE ── */}
      <div style={{ background: "linear-gradient(135deg,#0F6E56 0%,#13A07C 60%,#1FC1B0 100%)", padding: "18px 20px 22px", borderRadius: "0 0 26px 26px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
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
              🎮
            </div>
            <span
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#E1F5EE",
              }}
            >
              EduPlay
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={trocarUsuario}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "none",
                borderRadius: 9,
                padding: "5px 10px",
                color: "#9FE1CB",
                fontSize: "0.72rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Trocar usuário
            </button>
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

        <p
          style={{ margin: "0 0 2px", fontSize: "0.82rem", color: c.verdeSub }}
        >
          {obterSaudacao()}
        </p>
        <p
          style={{
            margin: "0 0 16px",
            fontSize: "1.6rem",
            fontWeight: 600,
            color: "#E1F5EE",
            fontFamily: "'Fredoka', sans-serif",
          }}
        >
          {nomeExibido}!
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          {[
            {
              icone: "🔥",
              label: "dias seguidos",
              valor: `${diasSeguidos} ${diasSeguidos === 1 ? "dia" : "dias"}`,
              aceso: diasSeguidos > 0,
            },
            {
              icone: "⚡",
              label: "XP da semana",
              // 10 XP por missão + bônus (acertar de primeira, boa explicação, desafio relâmpago)
              valor: `${feitasSemana * XP_POR_MISSAO + xpBonusDaSemana(progresso)} XP`,
              barra: Math.min(100, (feitasSemana / META_SEMANA) * 100),
              sub: `${Math.min(feitasSemana, META_SEMANA)}/${META_SEMANA} missões`,
            },
          ].map((p) => (
            <div
              key={p.label}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.16)",
                borderRadius: 16,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: "1.5rem",
                  filter: p.aceso === false ? "grayscale(1) opacity(0.5)" : "none",
                  animation: p.aceso ? "edu-chama 1.6s ease-in-out infinite" : "none",
                }}
              >
                {p.icone}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: c.verdeSub,
                    lineHeight: 1.2,
                  }}
                >
                  {p.label}
                </div>
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#E1F5EE",
                    fontFamily: "'Fredoka', sans-serif",
                  }}
                >
                  {p.valor}
                </div>
                {p.barra !== undefined && (
                  <>
                    <div style={{ height: 7, background: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden", marginTop: 4 }}>
                      <div style={{ height: "100%", width: `${p.barra}%`, background: "linear-gradient(90deg,#FFD700,#FF8A3D)", borderRadius: 4, transition: "width 1s ease" }} />
                    </div>
                    <div style={{ fontSize: "0.62rem", color: "#E1F5EE", marginTop: 3 }}>{p.sub}</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTEÚDO ── */}
      <main style={{ padding: "20px 16px", maxWidth: 600, margin: "0 auto" }}>
        {desafioDoDia && codigoAcesso && (
          <DesafioRelampago
            key={desafioDoDia.missao.id}
            desafio={desafioDoDia}
            codigoAcesso={codigoAcesso}
            jaFeitoHoje={desafioFeitoHoje}
            opcional={feriado}
            c={c}
            onXp={(xp) =>
              setProgresso((p) => ({
                ...p,
                xpBonusLog: [...(p?.xpBonusLog || []), { data: hojeSPData, xp, motivo: "desafio" }],
              }))
            }
          />
        )}
        {voltouDepoisDeDias && (
          <div
            style={{
              background: c.card,
              borderRadius: 20,
              padding: "14px 16px",
              border: "2px solid #FFD70088",
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
              animation: "edu-pop 0.45s ease",
            }}
          >
            <span style={{ fontSize: "2.4rem", display: "inline-block", animation: "edu-acenar 1.8s ease-in-out infinite" }}>👋</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 8px", fontSize: "0.9rem", fontWeight: 700, color: c.texto, lineHeight: 1.4 }}>
                Que bom te ver de novo! Vamos retomar com uma missão rápida?
              </p>
              <button
                onClick={() => navigate(missaoPrincipal ? `/${missaoPrincipal.id}` : "/mapa")}
                style={{ background: "linear-gradient(90deg,#FFD700,#FF8A3D)", color: "#3A2500", border: "none", borderRadius: 12, padding: "8px 16px", fontSize: "0.85rem", fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}
              >
                ▶ Bora!
              </button>
            </div>
          </div>
        )}
        <p
          style={{
            fontSize: "0.66rem",
            fontWeight: 700,
            color: c.textoSub,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: "0 0 10px",
          }}
        >
          {fimDeSemana ? "Hoje" : "Missão de hoje"}
        </p>

        {fimDeSemana ? (
          <FimDeSemana c={c} />
        ) : missaoPrincipal ? (
          <>
          {missoesPendentesResto.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              <style>{`details[open] .seta-home{transform:rotate(90deg)} summary::-webkit-details-marker{display:none}`}</style>
              {missoesPendentesResto.map((item, idx) => (
                <details key={idx} style={{ background: c.card, borderRadius: 20, border: `1.5px solid ${item.cor}55`, borderLeft: `5px solid ${item.cor}`, overflow: "hidden", animation: `edu-surgir 0.4s ease ${idx * 0.06}s backwards` }}>
                  <summary style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", listStyle: "none" }}>
                    <span className="seta-home" style={{ fontSize: "0.7rem", color: c.textoSub, transition: "transform 0.25s", flexShrink: 0 }}>▶</span>
                    <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{item.icone}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: c.textoSub, margin: "0 0 2px" }}>{item.label}</p>
                      <p style={{ fontSize: "0.85rem", fontWeight: 700, color: c.texto, margin: 0, lineHeight: 1.3 }}>
                        {item.missao?.titulo || `Missão de ${item.label}`}
                      </p>
                    </div>
                  </summary>
                  <div style={{ padding: "0 16px 14px 42px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {item.missao?.perguntaCentral && (
                      <p style={{ fontSize: "0.78rem", color: c.textoSub, margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>
                        "{item.missao.perguntaCentral}"
                      </p>
                    )}
                    <button
                      onClick={() => navigate(`/${item.id}`)}
                      style={{ alignSelf: "flex-end", background: item.cor, color: "#0D141C", border: "none", borderRadius: 14, padding: "9px 20px", fontSize: "0.9rem", fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: `0 4px 12px ${item.cor}55` }}
                    >
                      ▶ Jogar
                    </button>
                  </div>
                </details>
              ))}
            </div>
          )}
          </>
        ) : (
          <div
            style={{
              background: c.card,
              borderRadius: 20,
              padding: "24px",
              textAlign: "center",
              border: `1.5px dashed ${c.borda}`,
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: "4rem", display: "inline-block", animation: "edu-flutuar 3s ease-in-out infinite" }}>{feitasHoje > 0 ? "🏆" : "🦉"}</span>
            <p
              style={{
                color: feitasHoje > 0 ? c.texto : c.textoSub,
                fontSize: "0.88rem",
                fontWeight: feitasHoje > 0 ? 800 : 600,
                margin: "10px 0 4px",
              }}
            >
              {feitasHoje > 0 ? "Missões de hoje concluídas! 🎉" : "Nenhuma missão disponível ainda."}
            </p>
            <p
              style={{
                color: c.texto,
                fontSize: "0.82rem",
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {feitasHoje > 0
                ? mensagemProximaMissao()
                : "Peça para o responsável gerar missões no Painel."}
            </p>
          </div>
        )}

        {/* Semana */}
        <p
          style={{
            fontSize: "0.66rem",
            fontWeight: 700,
            color: c.textoSub,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: "0 0 10px",
          }}
        >
          Semana
        </p>
        <div
          style={{
            background: c.card,
            borderRadius: 16,
            padding: "14px 16px",
            border: `1.5px solid ${c.borda}`,
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          {diasSemana
            .map((d) => (d.hoje && d.feito && restamHoje > 0 ? { ...d, feito: false, incompleto: true } : d))
            .map((d) => (
            <div
              key={d.iso}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: d.feito
                    ? c.verdeClaro
                    : d.hoje
                      ? "#E6F1FB"
                      : "transparent",
                  border: d.feito
                    ? "1.5px solid #5DCAA5"
                    : d.hoje
                      ? "1.5px solid #378ADD"
                      : `1.5px solid ${c.borda}`,
                }}
              >
                {d.feito ? (
                  <span
                    style={{
                      color: c.verde,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                ) : d.hoje ? (
                  <span
                    style={{
                      color: "#185FA5",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                    }}
                  >
                    {d.incompleto ? "☆" : "•"}
                  </span>
                ) : (
                  <span style={{ color: c.borda, fontSize: "0.9rem" }}>·</span>
                )}
              </div>
              <span
                style={{
                  fontSize: "0.6rem",
                  color: d.hoje ? c.texto : c.textoSub,
                  fontWeight: d.hoje ? 700 : 400,
                }}
              >
                {d.label}
              </span>
            </div>
          ))}
        </div>
        {restamHoje > 0 && feitasHoje > 0 && (
          <p style={{ margin: "-12px 0 20px", fontSize: "0.8rem", fontWeight: 700, color: "#185FA5", textAlign: "center" }}>
            Falta pouco! Ainda {restamHoje === 1 ? "resta 1 missão" : `restam ${restamHoje} missões`} hoje 🚀
          </p>
        )}

        {/* Badges (no fim de semana, sem convite para fazer missão) */}
        {(badges.length > 0 || !fimDeSemana) && (<>
            <p
              style={{
                fontSize: "0.66rem",
                fontWeight: 700,
                color: c.textoSub,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "0 0 10px",
              }}
            >
              Conquistado
            </p>
            {badges.length === 0 ? (
              <button
                onClick={() => navigate(missaoPrincipal ? `/${missaoPrincipal.id}` : "/mapa")}
                style={{
                  width: "100%",
                  background: c.card,
                  borderRadius: 20,
                  padding: "16px",
                  border: "2px dashed #1FC1B088",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                <span style={{ fontSize: "2.6rem", display: "inline-block", animation: "edu-flutuar 3s ease-in-out infinite", fontFamily: "'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif" }}>🚀</span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: "0.85rem", color: c.texto, fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>
                    Nenhuma missão nesta semana ainda. Faça uma agora e ganhe sua primeira conquista!
                  </span>
                  <span style={{ display: "inline-block", background: "linear-gradient(90deg,#1FC1B0,#3DDC84)", color: "#0D141C", borderRadius: 12, padding: "7px 16px", fontSize: "0.85rem", fontWeight: 800 }}>
                    ▶ Começar
                  </span>
                </span>
              </button>
            ) : (
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              {badges.map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: c.card,
                    borderRadius: 16,
                    padding: "8px 12px",
                    border: "1.5px solid #FFD70088",
                    animation: `edu-pop 0.45s ease ${i * 0.1}s backwards`,
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{b.icone}</span>
                  <span
                    style={{
                      fontSize: "0.76rem",
                      color: c.texto,
                      fontWeight: 600,
                    }}
                  >
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
            )}
        </>)}


        {/* Palco da Premiação */}
        <ModalPremiacao 
          isOpen={mostrarFesta} 
          fechar={() => { setMostrarFesta(false); setFestaVista(true); const hojeSP = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }); localStorage.setItem("festaVista_" + hojeSP, "1"); }} 
          premioTexto={premioConfig?.texto} 
          premioImagemUrl={premioConfig?.imagemUrl}
          premioFreq={premioConfig?.freq}
          e={e} 
        />
      </main>

      <BottomNav />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes pulsar { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        @keyframes edu-flutuar { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes edu-pop { 0%{opacity:0;transform:scale(0.6)} 70%{transform:scale(1.08)} 100%{opacity:1;transform:scale(1)} }
        @keyframes edu-surgir { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes edu-chama { 0%,100%{transform:scale(1) rotate(-4deg)} 50%{transform:scale(1.15) rotate(4deg)} }
        @keyframes edu-acenar { 0%,60%,100%{transform:rotate(0)} 15%,45%{transform:rotate(18deg)} 30%{transform:rotate(-10deg)} }
      `}</style>
    </div>
  );
}
