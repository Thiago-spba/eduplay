import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTema } from "../context/ThemeContext";
import { logout } from "../services/auth";
import { gerarMissaoIA } from "../services/ia";
import {
  getResponsavel,
  getResponsavelPorEmail,
  migrarResponsavel,
  salvarResponsavel,
  getCriancaPorPai,
  criarCrianca,
  salvarMissao,
  getTodasMissoes,
  contarMissoesHoje,
  registrarConsentimentoECA,
  getSessoesQuiz,
} from "../services/db";

// ── Constantes ──
const MAX_MISSOES_DIA = 3;
const VERSAO_TERMOS = "1.0";

const SERIES = [
  { id: "6ano", label: "6º ano" },
  { id: "7ano", label: "7º ano" },
  { id: "8ano", label: "8º ano" },
  { id: "9ano", label: "9º ano" },
];

const BIMESTRES = [
  { id: "1bimestre", label: "1º Bim" },
  { id: "2bimestre", label: "2º Bim" },
  { id: "3bimestre", label: "3º Bim" },
  { id: "4bimestre", label: "4º Bim" },
];

const DISCIPLINAS = [
  { id: "historia", label: "História", icone: "📜", cor: "#C4A882" },
  { id: "geografia", label: "Geografia", icone: "🗺️", cor: "#5A8F8C" },
  { id: "matematica", label: "Matemática", icone: "📐", cor: "#6B5B95" },
  { id: "ciencias", label: "Ciências", icone: "🔬", cor: "#2E8B57" },
  { id: "portugues", label: "Português", icone: "✍️", cor: "#C0392B" },
];

const FRASES_LOADING = [
  "Analisando o currículo escolar do seu filho...",
  "Preparando um plano pedagógico personalizado...",
  "Construindo atividades que desafiam e ensinam...",
  "Cada missão é única — feita sob medida para ele...",
  "Transformando conhecimento em aventura...",
  "Quase pronto — seu filho vai se surpreender...",
  "Calibrando o conteúdo com precisão pedagógica...",
  "Criando perguntas que estimulam o raciocínio...",
];

const INSIGHTS = [
  "Consistência é mais poderosa que intensidade. 20 minutos por dia superam 2 horas no fim de semana.",
  "Cada missão concluída fortalece conexões neurais reais — seu filho está literalmente crescendo.",
  "A gamificação aumenta em até 48% a retenção de conteúdo em crianças de 10 a 14 anos.",
  "Missões variadas entre disciplinas desenvolvem pensamento interdisciplinar desde cedo.",
];

// ── Perguntas para o pai testar o filho por disciplina ──
const PERGUNTAS_PAI = {
  historia: [
    "O que você aprendeu sobre esse período?",
    "Quem foram as pessoas mais importantes dessa época?",
    "Como isso afetou o Brasil ou o mundo?",
  ],
  geografia: [
    "Me mostra onde fica isso no mapa?",
    "Por que esse lugar é importante?",
    "Como isso afeta nossa vida hoje?",
  ],
  matematica: [
    "Me explica como você resolve isso?",
    "Onde usamos isso no dia a dia?",
    "Consegue me dar um exemplo com dinheiro?",
  ],
  ciencias: [
    "Como você explicaria isso para um amigo?",
    "Por que isso acontece na natureza?",
    "Você consegue ver isso em alguma coisa ao seu redor?",
  ],
  portugues: [
    "Me conta o que você leu com suas palavras?",
    "Qual parte você achou mais interessante?",
    "Você consegue escrever uma frase usando o que aprendeu?",
  ],
};

const ESCOLAS_PUBLICAS = {
  "6ano": [
    {
      nome: "Colégio Militar de SP",
      info: "Prova no 5º ano para entrar no 6º — foco em Mat. e Port.",
      custo: "Gratuito",
      icone: "🪖",
    },
    {
      nome: "ISMART",
      info: "Inscrições a partir do 7º ano — comece a preparar agora",
      custo: "Bolsa Integral",
      icone: "🌟",
    },
    {
      nome: "Bandeirantes",
      info: "Exame de admissão no 6º ano — alto rendimento acadêmico",
      custo: "Mensalidade",
      icone: "🏛️",
    },
  ],
  "7ano": [
    {
      nome: "ISMART",
      info: "Inscrição no 7º ano — escola, transporte e alimentação pagos",
      custo: "Bolsa Integral",
      icone: "🌟",
    },
    {
      nome: "ETEC (Vestibulinho)",
      info: "Entrada no 9º ano — prepare com 2 anos de antecedência",
      custo: "Gratuito",
      icone: "⚙️",
    },
    {
      nome: "IFSP",
      info: "Entrada no 9º ano — Ensino Médio Integrado ao Técnico",
      custo: "Gratuito",
      icone: "🔬",
    },
  ],
  "8ano": [
    {
      nome: "ETEC (Vestibulinho)",
      info: "Entrada no próximo ano — melhor ensino técnico gratuito de SP",
      custo: "Gratuito",
      icone: "⚙️",
    },
    {
      nome: "IFSP",
      info: "Entrada no próximo ano — nível de ensino superior",
      custo: "Gratuito",
      icone: "🔬",
    },
    {
      nome: "ISMART",
      info: "Última chance de inscrição no 9º ano — comece agora",
      custo: "Bolsa Integral",
      icone: "🌟",
    },
  ],
  "9ano": [
    {
      nome: "ETEC (Vestibulinho)",
      info: "Agora é a hora — porta do melhor técnico gratuito de SP",
      custo: "Gratuito",
      icone: "⚙️",
    },
    {
      nome: "IFSP",
      info: "Agora é a hora — Ensino Médio Integrado ao Técnico",
      custo: "Gratuito",
      icone: "🔬",
    },
    {
      nome: "Liceu de Artes e Ofícios",
      info: "Ensino médio técnico via prova — gratuito para baixa renda",
      custo: "Gratuito",
      icone: "🎨",
    },
    {
      nome: "ISMART",
      info: "Última chance — processo seletivo rigoroso e transformador",
      custo: "Bolsa Integral",
      icone: "🌟",
    },
  ],
};

const ESCOLAS_BOLSAS = {
  "6ano": [
    {
      nome: "Bandeirantes",
      info: "Exame de admissão no 6º ano — seleciona alto rendimento",
      custo: "Mensalidade",
      icone: "🏛️",
    },
    {
      nome: "ISMART",
      info: "Paga escola de elite + transporte + alimentação até o Médio",
      custo: "Bolsa Integral",
      icone: "🌟",
    },
    {
      nome: "Fundação Estudar",
      info: "Bolsas para alunos talentosos de baixa renda",
      custo: "Bolsa Integral",
      icone: "📚",
    },
  ],
  "7ano": [
    {
      nome: "ISMART",
      info: "Inscrição no 7º ano — bolsa integral completa em escola de elite",
      custo: "Bolsa Integral",
      icone: "🌟",
    },
    {
      nome: "Etapa / Objetivo",
      info: "Concurso de Bolsas — quanto melhor a nota, maior o desconto",
      custo: "Até 100%",
      icone: "🎓",
    },
    {
      nome: "Santo Américo / Porto Seguro",
      info: "Fundações próprias para alunos talentosos de baixa renda",
      custo: "Bolsa Integral",
      icone: "🤝",
    },
  ],
  "8ano": [
    {
      nome: "Etapa / Objetivo",
      info: "Concurso de Bolsas aberto — desconto por desempenho",
      custo: "Até 100%",
      icone: "🎓",
    },
    {
      nome: "Santo Américo / Porto Seguro",
      info: "Fundações próprias — bolsas para alunos de baixa renda",
      custo: "Bolsa Integral",
      icone: "🤝",
    },
    {
      nome: "ISMART",
      info: "Prepare para o 9º ano — última chance de bolsa integral",
      custo: "Bolsa Integral",
      icone: "🌟",
    },
  ],
  "9ano": [
    {
      nome: "ISMART",
      info: "Última chance — bolsa integral em Móbile, Santa Cruz ou Bandeirantes",
      custo: "Bolsa Integral",
      icone: "🌟",
    },
    {
      nome: "Etapa / Objetivo",
      info: "Concurso de Bolsas — até 100% de desconto por alto desempenho",
      custo: "Até 100%",
      icone: "🎓",
    },
    {
      nome: "Fundação Estudar",
      info: "Bolsas para alunos talentosos de baixa renda",
      custo: "Bolsa Integral",
      icone: "📚",
    },
    {
      nome: "Santo Américo / Porto Seguro",
      info: "Fundações próprias — bolsas integrais para alunos de destaque",
      custo: "Bolsa Integral",
      icone: "🤝",
    },
  ],
};

async function gerarHash(texto) {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function gerarCodigo() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

function formatarHora(timestamp) {
  if (!timestamp) return "";
  const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const agora = new Date();
  const diff = agora - data;
  if (diff < 60000) return "agora mesmo";
  if (diff < 3600000) return `há ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000)
    return `hoje às ${data.getHours()}h${String(data.getMinutes()).padStart(2, "0")}`;
  if (diff < 172800000) return "ontem";
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// ══════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════
export default function PaisPage({ userPai, timer }) {
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();
  const e = tema === "escuro";

  const [etapa, setEtapa] = useState("verificando");
  const [filho, setFilho] = useState(null);
  const [missoesPorDisc, setMissoesPorDisc] = useState({});
  const [missoesHoje, setMissoesHoje] = useState(0);
  const [sessoesQuiz, setSessoesQuiz] = useState([]);

  const [aceitouECA, setAceitouECA] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [mostrarECA, setMostrarECA] = useState(false);
  const [salvandoECA, setSalvandoECA] = useState(false);
  const [erroECA, setErroECA] = useState("");

  const [nomeFilho, setNomeFilho] = useState("");
  const [serieFilho, setSerieFilho] = useState("6ano");
  const [salvandoFilho, setSalvandoFilho] = useState(false);
  const [erroFilho, setErroFilho] = useState("");

  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);

  const [secao, setSecao] = useState("visao");
  const [config, setConfig] = useState({
    serie: "6ano",
    bimestre: "1bimestre",
    tempoEstudo: 45,
  });
  const [gerando, setGerando] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [fraseLoading, setFraseLoading] = useState(0);
  const [premio, setPremio] = useState("");
  const [insightIdx] = useState(() =>
    Math.floor(Math.random() * INSIGHTS.length),
  );

  const limiteAtingido = missoesHoje >= MAX_MISSOES_DIA;

  const c = {
    bg: e ? "#0F1923" : "#F0F7FF",
    card: e ? "#1A2B3C" : "#FFFFFF",
    card2: e ? "#0D1820" : "#F8FBFF",
    texto: e ? "#E8F4F8" : "#1A2B3C",
    textoSub: e ? "#6B8A9A" : "#7A9AAA",
    borda: e ? "#1A3347" : "#EEF5FF",
    accent: "#00D4AA",
    azul: "#3B82F6",
  };

  useEffect(() => {
    if (!userPai) return;
    const iniciar = async () => {
      try {
        let resp = await getResponsavel(userPai.uid);
        if (!resp && userPai.email) {
          const respAntigo = await getResponsavelPorEmail(userPai.email);
          if (respAntigo && respAntigo.id !== userPai.uid) {
            await migrarResponsavel(respAntigo.id, userPai.uid, userPai);
            resp = await getResponsavel(userPai.uid);
          }
        }
        if (!resp) {
          setEtapa("eca");
          return;
        }
        const crianca = await getCriancaPorPai(userPai.uid);
        if (!crianca) {
          setEtapa("cadastro");
          return;
        }
        setFilho(crianca);
        setConfig((prev) => ({ ...prev, serie: crianca.serie || "6ano" }));
        const [missoes, qtdHoje, sessoes] = await Promise.all([
          getTodasMissoes(crianca.id),
          contarMissoesHoje(crianca.id),
          getSessoesQuiz(crianca.id),
        ]);
        setMissoesPorDisc(missoes);
        setMissoesHoje(qtdHoje);
        setSessoesQuiz(sessoes);
        setEtapa("painel");
      } catch (err) {
        console.error("Erro ao iniciar PaisPage:", err);
        setEtapa("eca");
      }
    };
    iniciar();
  }, [userPai]);

  useEffect(() => {
    if (!gerando) return;
    const iv = setInterval(
      () => setFraseLoading((f) => (f + 1) % FRASES_LOADING.length),
      3000,
    );
    return () => clearInterval(iv);
  }, [gerando]);

  useEffect(() => {
    if (timer?.ajustarTempo) timer.ajustarTempo(config.tempoEstudo);
  }, [config.tempoEstudo, timer]);

  const handleAceitarECA = async () => {
    if (!aceitouECA || !aceitouTermos) {
      setErroECA("Você precisa aceitar os dois termos para continuar.");
      return;
    }
    setSalvandoECA(true);
    setErroECA("");
    try {
      const emailHash = await gerarHash(userPai.email);
      const ipHash = await gerarHash(userPai.uid + Date.now());
      await salvarResponsavel(userPai.uid, {
        email: userPai.email,
        nomeResponsavel: userPai.displayName || userPai.email,
        photoURL: userPai.photoURL || "",
        aceitouTermos: true,
        aceitouECA: true,
        plano: "trial",
      });
      await registrarConsentimentoECA(userPai.uid, {
        userId: userPai.uid,
        emailHash,
        ipHash,
        aceitouECA: true,
        versaoTermos: VERSAO_TERMOS,
      });
      setEtapa("cadastro");
    } catch (err) {
      console.error("Erro ao salvar ECA:", err);
      setErroECA("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvandoECA(false);
    }
  };

  const handleCadastrarFilho = async () => {
    if (!nomeFilho.trim()) {
      setErroFilho("Digite o nome do seu filho.");
      return;
    }
    setSalvandoFilho(true);
    setErroFilho("");
    try {
      const codigo = gerarCodigo();
      const dados = {
        parentId: userPai.uid,
        nome: nomeFilho.trim(),
        avatar: "🧑‍🚀",
        serie: serieFilho,
        consentimentoECA: true,
      };
      await criarCrianca(codigo, dados);
      setFilho({ id: codigo, ...dados });
      setConfig((prev) => ({ ...prev, serie: serieFilho }));
      setEtapa("codigo");
    } catch (err) {
      console.error("Erro ao cadastrar filho:", err);
      setErroFilho("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvandoFilho(false);
    }
  };

  const gerarMissao = async (disciplinaId) => {
    if (limiteAtingido || !filho) return;
    setGerando(disciplinaId);
    setMensagem(null);
    try {
      const serie = filho.serie || config.serie;
      const temaAtual = `Conteúdo do ${SERIES.find((s) => s.id === serie)?.label} - ${BIMESTRES.find((b) => b.id === config.bimestre)?.label}`;
      const missao = await gerarMissaoIA({
        disciplina: disciplinaId,
        serie,
        bimestre: config.bimestre,
        tema: temaAtual,
      });
      await salvarMissao(filho.id, disciplinaId, missao);
      setMissoesPorDisc((prev) => ({
        ...prev,
        [disciplinaId]: [
          { disciplina: disciplinaId, ...missao },
          ...(prev[disciplinaId] || []),
        ],
      }));
      setMissoesHoje((m) => m + 1);
      const topicos =
        missao.atividades?.quiz?.map((q) => q.pergunta).slice(0, 3) || [];
      setMensagem({
        tipo: "sucesso",
        titulo: `${DISCIPLINAS.find((d) => d.id === disciplinaId)?.label}: "${missao.titulo}"`,
        topicos,
      });
    } catch (err) {
      console.error(err);
      setMensagem({
        tipo: "erro",
        titulo: "Erro ao gerar missão.",
        topicos: [],
      });
    } finally {
      setGerando(null);
    }
  };

  const gerarSlug = (nome, id) => {
    const base = (nome || "agente")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 20);
    return base + "-" + id;
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(
      `https://eduplay.olloapp.com.br/agente/${gerarSlug(filho?.nome, filho?.id)}`,
    );
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2500);
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(filho?.id || "");
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2500);
  };

  const compartilharWhatsApp = () => {
    const link = `https://eduplay.olloapp.com.br/agente/${gerarSlug(filho?.nome, filho?.id)}`;
    const nome = filho?.nome?.split(" ")[0] || "Agente";
    const opcoes = [
      `${nome}, sua missão de hoje está pronta.\n\nVocê tem dado o melhor de si — continue assim.\n\n${link}`,
      `${nome}, o EduPlay preparou algo especial para você hoje.\n\nTopa o desafio?\n\n${link}`,
      `${nome}, separei sua missão de hoje.\n\nEstou aqui torcendo por você.\n\n${link}`,
    ];
    window.open(
      `https://wa.me/?text=${encodeURIComponent(opcoes[Math.floor(Math.random() * opcoes.length)])}`,
      "_blank",
    );
  };

  const compartilharCodigoWhatsApp = () => {
    const nome = filho?.nome?.split(" ")[0] || "Agente";
    const link = `https://eduplay.olloapp.com.br/agente/${gerarSlug(filho?.nome, filho?.id)}`;
    const msg = encodeURIComponent(
      `${nome}, criei sua conta no EduPlay! 🎉\n\nSeu link exclusivo:\n${link}\n\nOu acesse o app e use o código: *${filho?.id}*\n\nSua jornada começa agora, Agente! 🚀`,
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const totalMissoes = Object.values(missoesPorDisc).reduce(
    (acc, arr) => acc + (arr?.length || 0),
    0,
  );
  const serieAtual = filho?.serie || config.serie;

  // ── Última sessão de quiz concluída ──
  const ultimaSessao = sessoesQuiz?.[0] || null;
  const discUltima = ultimaSessao
    ? DISCIPLINAS.find((d) => d.id === ultimaSessao.disciplina)
    : null;
  const perguntasPai = ultimaSessao
    ? PERGUNTAS_PAI[ultimaSessao.disciplina] || []
    : [];

  // ══════════════════════════════════════════
  // RENDERIZAÇÃO POR ETAPA
  // ══════════════════════════════════════════

  if (etapa === "verificando") {
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
            🔬
          </div>
          <p style={{ color: c.textoSub, fontWeight: 700 }}>Carregando...</p>
        </div>
        <style>{`@keyframes girar { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (etapa === "eca") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: c.bg,
          fontFamily: "'Nunito', sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 16, right: 16 }}>
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
        </div>
        <div style={{ position: "absolute", top: 20, left: 16 }}>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: c.textoSub,
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            ← Sair
          </button>
        </div>
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            animation: "fadeIn 0.4s ease",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: "3rem", marginBottom: 8 }}>🛡️</div>
            <h1
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "1.6rem",
                color: c.accent,
                margin: "0 0 6px",
              }}
            >
              Bem-vindo ao EduPlay
            </h1>
            <p style={{ fontSize: "0.85rem", color: c.textoSub, margin: 0 }}>
              Olá,{" "}
              <strong style={{ color: c.texto }}>
                {userPai?.displayName || userPai?.email || "Responsável"}
              </strong>
              !<br />
              Antes de começar, precisamos do seu consentimento.
            </p>
          </div>
          <div
            style={{
              background: c.card,
              borderRadius: 24,
              padding: "24px",
              border: `2px solid ${c.borda}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: c.card2,
                borderRadius: 14,
                marginBottom: 20,
                border: `1.5px solid ${c.borda}`,
              }}
            >
              {userPai?.photoURL ? (
                <img
                  src={userPai.photoURL}
                  style={{ width: 40, height: 40, borderRadius: "50%" }}
                  alt=""
                />
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: `${c.azul}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                  }}
                >
                  👤
                </div>
              )}
              <div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: c.texto,
                    margin: 0,
                  }}
                >
                  {userPai?.displayName || "Responsável"}
                </p>
                <p
                  style={{ fontSize: "0.75rem", color: c.textoSub, margin: 0 }}
                >
                  {userPai?.email}
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={aceitouECA}
                  onChange={(ev) => setAceitouECA(ev.target.checked)}
                  style={{
                    width: 20,
                    height: 20,
                    marginTop: 2,
                    accentColor: c.accent,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: c.texto,
                    lineHeight: 1.5,
                  }}
                >
                  Declaro que sou <strong>responsável legal</strong> pelo menor
                  e autorizo o uso do EduPlay em conformidade com o{" "}
                  <button
                    onClick={() => setMostrarECA(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: c.accent,
                      fontWeight: 800,
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: "0.85rem",
                      padding: 0,
                    }}
                  >
                    ECA Digital (Lei 14.155/2021)
                  </button>
                </span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={aceitouTermos}
                  onChange={(ev) => setAceitouTermos(ev.target.checked)}
                  style={{
                    width: 20,
                    height: 20,
                    marginTop: 2,
                    accentColor: c.accent,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: c.texto,
                    lineHeight: 1.5,
                  }}
                >
                  Li e aceito os{" "}
                  <button
                    onClick={() => navigate("/termos")}
                    style={{
                      background: "none",
                      border: "none",
                      color: c.azul,
                      fontWeight: 800,
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: "0.85rem",
                      padding: 0,
                    }}
                  >
                    Termos de Uso
                  </button>{" "}
                  e a{" "}
                  <button
                    onClick={() => navigate("/privacidade")}
                    style={{
                      background: "none",
                      border: "none",
                      color: c.azul,
                      fontWeight: 800,
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: "0.85rem",
                      padding: 0,
                    }}
                  >
                    Política de Privacidade
                  </button>
                </span>
              </label>
            </div>
            {erroECA && (
              <div
                style={{
                  background: "#EF444415",
                  border: "1.5px solid #EF444440",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 14,
                  fontSize: "0.82rem",
                  color: "#EF4444",
                  fontWeight: 700,
                }}
              >
                ⚠️ {erroECA}
              </div>
            )}
            <button
              onClick={handleAceitarECA}
              disabled={salvandoECA || !aceitouECA || !aceitouTermos}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 14,
                border: "none",
                background:
                  !aceitouECA || !aceitouTermos || salvandoECA
                    ? c.borda
                    : `linear-gradient(135deg, ${c.accent}, #0099FF)`,
                color: !aceitouECA || !aceitouTermos ? c.textoSub : "#fff",
                fontWeight: 900,
                fontSize: "1rem",
                cursor:
                  !aceitouECA || !aceitouTermos || salvandoECA
                    ? "not-allowed"
                    : "pointer",
                fontFamily: "'Nunito', sans-serif",
                transition: "all 0.2s",
              }}
            >
              {salvandoECA ? "Salvando..." : "Confirmar e Continuar →"}
            </button>
          </div>
        </div>
        {mostrarECA && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
              padding: 20,
            }}
          >
            <div
              style={{
                background: c.card,
                borderRadius: 24,
                padding: 28,
                maxWidth: 440,
                width: "100%",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: "1.3rem",
                  color: c.accent,
                  margin: "0 0 16px",
                }}
              >
                🛡️ ECA Digital — Lei 14.155/2021
              </h2>
              {[
                [
                  "Proteção de menores",
                  "Crianças e adolescentes não criam contas próprias. O responsável legal é o titular.",
                ],
                [
                  "Dados mínimos",
                  "Coletamos apenas nome e série do aluno. Nenhum dado sensível é armazenado.",
                ],
                [
                  "Consentimento registrado",
                  "Seu aceite é registrado de forma imutável com data, hora e identificador criptografado.",
                ],
                [
                  "Direito ao esquecimento",
                  "Você pode solicitar a exclusão total dos dados do seu filho a qualquer momento.",
                ],
                [
                  "Sem publicidade",
                  "O EduPlay não exibe anúncios nem compartilha dados com terceiros.",
                ],
              ].map(([titulo, texto]) => (
                <div
                  key={titulo}
                  style={{
                    marginBottom: 14,
                    padding: "12px 16px",
                    background: c.card2,
                    borderRadius: 12,
                    borderLeft: `4px solid ${c.accent}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      color: c.texto,
                      margin: "0 0 4px",
                    }}
                  >
                    {titulo}
                  </p>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: c.textoSub,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {texto}
                  </p>
                </div>
              ))}
              <button
                onClick={() => setMostrarECA(false)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 12,
                  border: "none",
                  background: c.accent,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  marginTop: 8,
                }}
              >
                Entendido ✓
              </button>
            </div>
          </div>
        )}
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap'); @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
      </div>
    );
  }

  if (etapa === "cadastro") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: c.bg,
          fontFamily: "'Nunito', sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 16, right: 16 }}>
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
        </div>
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            animation: "fadeIn 0.4s ease",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: "3rem", marginBottom: 8 }}>🧑‍🚀</div>
            <h1
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "1.6rem",
                color: c.accent,
                margin: "0 0 6px",
              }}
            >
              Cadastre seu filho
            </h1>
            <p style={{ fontSize: "0.85rem", color: c.textoSub, margin: 0 }}>
              Ele receberá um link exclusivo para acessar as missões
            </p>
          </div>
          <div
            style={{
              background: c.card,
              borderRadius: 24,
              padding: "28px 24px",
              border: `2px solid ${c.borda}`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    color: c.textoSub,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Nome do seu filho
                </label>
                <input
                  type="text"
                  placeholder="Ex: João Pedro"
                  value={nomeFilho}
                  onChange={(ev) => setNomeFilho(ev.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: `2px solid ${c.borda}`,
                    background: c.card2,
                    color: c.texto,
                    fontSize: "1rem",
                    fontFamily: "'Nunito', sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    color: c.textoSub,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Série escolar
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 8,
                  }}
                >
                  {SERIES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSerieFilho(s.id)}
                      style={{
                        padding: "10px",
                        borderRadius: 12,
                        border: `2px solid ${serieFilho === s.id ? c.accent : c.borda}`,
                        background:
                          serieFilho === s.id ? `${c.accent}15` : "transparent",
                        color: serieFilho === s.id ? c.accent : c.textoSub,
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        fontFamily: "'Nunito', sans-serif",
                        transition: "all 0.2s",
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              {erroFilho && (
                <div
                  style={{
                    background: "#EF444415",
                    border: "1.5px solid #EF444440",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: "0.82rem",
                    color: "#EF4444",
                    fontWeight: 700,
                  }}
                >
                  ⚠️ {erroFilho}
                </div>
              )}
              <button
                onClick={handleCadastrarFilho}
                disabled={salvandoFilho}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 14,
                  border: "none",
                  background: salvandoFilho
                    ? c.borda
                    : `linear-gradient(135deg, ${c.accent}, #0099FF)`,
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: "1rem",
                  cursor: salvandoFilho ? "not-allowed" : "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {salvandoFilho ? "Salvando..." : "Criar perfil do filho →"}
              </button>
            </div>
          </div>
          <p
            style={{
              fontSize: "0.72rem",
              color: c.textoSub,
              textAlign: "center",
              marginTop: 16,
              lineHeight: 1.5,
            }}
          >
            🔒 Dados mínimos coletados. Seu filho não cria conta própria.
            <br />
            Em conformidade com o ECA Digital (Lei 14.155/2021).
          </p>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap'); @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
      </div>
    );
  }

  if (etapa === "codigo") {
    const nomeFirst = filho?.nome?.split(" ")[0] || "Agente";
    const slug = gerarSlug(filho?.nome, filho?.id);
    const linkCompleto = `https://eduplay.olloapp.com.br/agente/${slug}`;
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: c.bg,
          fontFamily: "'Nunito', sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            animation: "fadeIn 0.4s ease",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 8 }}>🎉</div>
            <h1
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "1.7rem",
                color: c.accent,
                margin: "0 0 6px",
              }}
            >
              {nomeFirst} está pronto!
            </h1>
            <p
              style={{
                fontSize: "0.85rem",
                color: c.textoSub,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Envie o link ou código para seu filho acessar as missões.
            </p>
          </div>
          <div
            style={{
              background: c.card,
              borderRadius: 24,
              padding: "24px",
              border: `2px solid ${c.accent}44`,
              marginBottom: 14,
            }}
          >
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                color: c.textoSub,
                textTransform: "uppercase",
                letterSpacing: 1,
                margin: "0 0 8px",
              }}
            >
              🔗 Link exclusivo do agente
            </p>
            <div
              style={{
                background: c.card2,
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: "0.78rem",
                color: c.textoSub,
                fontFamily: "monospace",
                marginBottom: 14,
                wordBreak: "break-all",
                border: `1.5px solid ${c.borda}`,
              }}
            >
              {linkCompleto}
            </div>
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                color: c.textoSub,
                textTransform: "uppercase",
                letterSpacing: 1,
                margin: "0 0 8px",
              }}
            >
              🔑 Ou use o código manual
            </p>
            <div
              style={{
                background: `${c.accent}12`,
                borderRadius: 14,
                padding: "16px",
                textAlign: "center",
                marginBottom: 16,
                border: `2px dashed ${c.accent}44`,
              }}
            >
              <span
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: "2.2rem",
                  color: c.accent,
                  letterSpacing: 6,
                  fontWeight: 700,
                }}
              >
                {filho?.id}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={compartilharCodigoWhatsApp}
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
                📲 Enviar para {nomeFirst} pelo WhatsApp
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={copiarLink}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: 12,
                    border: `2px solid ${c.borda}`,
                    background: linkCopiado ? `${c.accent}15` : "transparent",
                    color: linkCopiado ? c.accent : c.textoSub,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  {linkCopiado ? "✅ Link copiado!" : "📋 Copiar link"}
                </button>
                <button
                  onClick={copiarCodigo}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: 12,
                    border: `2px solid ${c.borda}`,
                    background: codigoCopiado ? `${c.accent}15` : "transparent",
                    color: codigoCopiado ? c.accent : c.textoSub,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  {codigoCopiado ? "✅ Código copiado!" : "🔑 Copiar código"}
                </button>
              </div>
            </div>
          </div>
          <div
            style={{
              background: e ? "#0D1820" : "#F0FFF8",
              borderRadius: 16,
              padding: "14px 18px",
              marginBottom: 16,
              border: `1.5px solid ${c.accent}22`,
            }}
          >
            <p
              style={{
                fontSize: "0.82rem",
                color: c.texto,
                margin: 0,
                lineHeight: 1.6,
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              "A maior vantagem que você pode dar ao seu filho não é dinheiro —
              é o hábito de aprender. Você acabou de plantar essa semente."
            </p>
          </div>
          <button
            onClick={() => setEtapa("painel")}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              border: "none",
              background: `linear-gradient(135deg, ${c.accent}, #0099FF)`,
              color: "#fff",
              fontWeight: 900,
              fontSize: "1rem",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
              boxShadow: "0 6px 20px rgba(0,212,170,0.3)",
            }}
          >
            Ir para o painel →
          </button>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap'); @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // PAINEL PRINCIPAL
  // ══════════════════════════════════════════
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: c.bg,
        fontFamily: "'Nunito', sans-serif",
        paddingBottom: 100,
        transition: "background 0.3s",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: `2px solid ${c.borda}`,
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: c.bg,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
              color: c.texto,
              padding: "4px 8px",
              borderRadius: 8,
            }}
          >
            ←
          </button>
          <span
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: c.accent,
            }}
          >
            Painel do Responsável
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {userPai?.email === "thiago.rpba@gmail.com" && (
            <button
              onClick={() => navigate("/admin")}
              title="Painel Admin"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: `2px solid ${c.borda}`,
                background: e ? "#1A2B3C" : "#fff",
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🛠️
            </button>
          )}
          <button
            onClick={alternarTema}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: `2px solid ${c.borda}`,
              background: e ? "#1A2B3C" : "#fff",
              fontSize: "1rem",
              cursor: "pointer",
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
          maxWidth: 480,
          margin: "0 auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* ABAS */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "visao", label: "Visão Geral", icone: "📊" },
            { id: "missoes", label: "Missões", icone: "🤖" },
            { id: "config", label: "Config", icone: "⚙️" },
          ].map((aba) => (
            <button
              key={aba.id}
              onClick={() => setSecao(aba.id)}
              style={{
                flex: 1,
                padding: "10px 4px",
                borderRadius: 12,
                border: `2px solid ${secao === aba.id ? c.accent : c.borda}`,
                background: secao === aba.id ? `${c.accent}15` : "transparent",
                color: secao === aba.id ? c.accent : c.textoSub,
                fontWeight: 800,
                fontSize: "0.78rem",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{aba.icone}</span>
              {aba.label}
            </button>
          ))}
        </div>

        {/* ABA VISÃO GERAL */}
        {secao === "visao" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              animation: "fadeIn 0.3s ease",
            }}
          >
            {/* Card filho */}
            <div
              style={{
                background: `linear-gradient(135deg, ${e ? "#0D2137" : "#E8F7FF"}, ${e ? "#1A3A52" : "#F0FFF8"})`,
                borderRadius: 20,
                padding: "20px",
                border: `2px solid ${c.accent}33`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: `${c.accent}22`,
                    border: `2px solid ${c.accent}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                  }}
                >
                  {filho?.avatar || "🧑‍🚀"}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: c.accent,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      margin: 0,
                    }}
                  >
                    Agente Ativo
                  </p>
                  <h2
                    style={{
                      fontFamily: "'Fredoka', sans-serif",
                      fontSize: "1.4rem",
                      color: c.texto,
                      margin: "2px 0 0",
                    }}
                  >
                    {filho?.nome || "Agente"}
                  </h2>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: c.textoSub,
                      margin: 0,
                    }}
                  >
                    {SERIES.find((s) => s.id === filho?.serie)?.label}
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 10,
                }}
              >
                {[
                  {
                    label: "Missões geradas",
                    valor: totalMissoes,
                    icone: "🎯",
                  },
                  { label: "Hoje", valor: missoesHoje, icone: "📅" },
                ].map((m) => (
                  <div
                    key={m.label}
                    style={{
                      background: c.card,
                      borderRadius: 14,
                      padding: "12px 10px",
                      textAlign: "center",
                      border: `1.5px solid ${c.borda}`,
                    }}
                  >
                    <div style={{ fontSize: "1.3rem", marginBottom: 4 }}>
                      {m.icone}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Fredoka', sans-serif",
                        fontSize: "1.4rem",
                        color: c.accent,
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      {m.valor}
                    </div>
                    <div
                      style={{
                        fontSize: "0.68rem",
                        color: c.textoSub,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        marginTop: 2,
                      }}
                    >
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ══ CARD RELATÓRIO — O QUE O FILHO ESTUDOU ══ */}
            {ultimaSessao ? (
              <div
                style={{
                  background: c.card,
                  border: `2px solid ${discUltima?.cor || c.accent}44`,
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
                {/* Cabeçalho verde */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${discUltima?.cor || c.accent}22, ${discUltima?.cor || c.accent}08)`,
                    padding: "14px 18px",
                    borderBottom: `1.5px solid ${discUltima?.cor || c.accent}22`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ fontSize: "1.4rem" }}>
                        {discUltima?.icone || "📚"}
                      </span>
                      <div>
                        <p
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            color: discUltima?.cor || c.accent,
                            margin: 0,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                        >
                          Última atividade
                        </p>
                        <p
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 800,
                            color: c.texto,
                            margin: 0,
                          }}
                        >
                          {ultimaSessao.tituloMissao || discUltima?.label}
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: c.textoSub,
                        fontWeight: 600,
                      }}
                    >
                      {formatarHora(ultimaSessao.criadoEm)}
                    </span>
                  </div>
                </div>

                {/* Aproveitamento */}
                <div
                  style={{
                    padding: "14px 18px",
                    borderBottom: `1.5px solid ${c.borda}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: c.textoSub,
                      }}
                    >
                      Aproveitamento no quiz
                    </span>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 800,
                        color:
                          ultimaSessao.percentual >= 70
                            ? "#00D4AA"
                            : ultimaSessao.percentual >= 40
                              ? "#F59E0B"
                              : "#EF4444",
                      }}
                    >
                      {ultimaSessao.acertos}/{ultimaSessao.total} —{" "}
                      {ultimaSessao.percentual}%
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
                        width: `${ultimaSessao.percentual}%`,
                        background:
                          ultimaSessao.percentual >= 70
                            ? "#00D4AA"
                            : ultimaSessao.percentual >= 40
                              ? "#F59E0B"
                              : "#EF4444",
                        borderRadius: 4,
                        transition: "width 1s ease",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: c.textoSub,
                      margin: "6px 0 0",
                    }}
                  >
                    {ultimaSessao.percentual >= 70
                      ? "✅ Ótimo desempenho! Seu filho entendeu bem o conteúdo."
                      : ultimaSessao.percentual >= 40
                        ? "📚 Desempenho regular. Vale reforçar o conteúdo."
                        : "💪 Precisa de atenção. Converse sobre o tema com ele."}
                  </p>
                </div>

                {/* Perguntas para testar */}
                <div style={{ padding: "14px 18px" }}>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: c.textoSub,
                      margin: "0 0 10px",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    💬 Pergunte ao {filho?.nome?.split(" ")[0] || "seu filho"}{" "}
                    hoje:
                  </p>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {perguntasPai.map((q, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          padding: "10px 12px",
                          background: c.card2,
                          borderRadius: 10,
                          border: `1.5px solid ${c.borda}`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: discUltima?.cor || c.accent,
                            fontWeight: 800,
                            flexShrink: 0,
                            marginTop: 1,
                          }}
                        >
                          {i + 1}.
                        </span>
                        <p
                          style={{
                            fontSize: "0.82rem",
                            color: c.texto,
                            margin: 0,
                            lineHeight: 1.4,
                          }}
                        >
                          {q}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: c.textoSub,
                      margin: "10px 0 0",
                      fontStyle: "italic",
                      textAlign: "center",
                    }}
                  >
                    Conversar sobre o conteúdo na hora do jantar fixa 2x mais do
                    que só estudar.
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: c.card,
                  border: `1.5px dashed ${c.borda}`,
                  borderRadius: 20,
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>📋</div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: c.texto,
                    margin: "0 0 6px",
                  }}
                >
                  Nenhuma atividade ainda
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: c.textoSub,
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Quando {filho?.nome?.split(" ")[0] || "seu filho"} concluir
                  uma missão, você verá aqui o que ele estudou e seu
                  aproveitamento.
                </p>
              </div>
            )}

            {/* Insight */}
            <div
              style={{
                background: c.card,
                border: `1.5px solid #6B5B9530`,
                borderRadius: 16,
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6B5B95, #9B82D6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                  }}
                >
                  🧠
                </div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    color: "#6B5B95",
                    margin: 0,
                    textTransform: "uppercase",
                  }}
                >
                  Insight Pedagógico
                </p>
              </div>
              <p
                style={{
                  fontSize: "0.88rem",
                  color: c.texto,
                  margin: 0,
                  lineHeight: 1.6,
                  fontStyle: "italic",
                }}
              >
                "{INSIGHTS[insightIdx]}"
              </p>
            </div>

            {/* Escolas públicas */}
            <div
              style={{
                background: c.card,
                border: `2px solid #3B82F633`,
                borderRadius: 20,
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    flexShrink: 0,
                  }}
                >
                  🏫
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      color: c.azul,
                      margin: 0,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Portas abertas —{" "}
                    {SERIES.find((s) => s.id === serieAtual)?.label}
                  </p>
                  <p
                    style={{ fontSize: "0.7rem", color: c.textoSub, margin: 0 }}
                  >
                    Escolas públicas e técnicas de excelência em SP
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(ESCOLAS_PUBLICAS[serieAtual] || []).map((escola, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      background: c.card2,
                      borderRadius: 12,
                      border: `1.5px solid ${c.borda}`,
                    }}
                  >
                    <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>
                      {escola.icone}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 800,
                          color: c.texto,
                          margin: 0,
                        }}
                      >
                        {escola.nome}
                      </p>
                      <p
                        style={{
                          fontSize: "0.72rem",
                          color: c.textoSub,
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        {escola.info}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: 6,
                        flexShrink: 0,
                        textAlign: "center",
                        lineHeight: 1.3,
                        whiteSpace: "nowrap",
                        color:
                          escola.custo === "Gratuito"
                            ? "#00D4AA"
                            : escola.custo === "Bolsa Integral"
                              ? "#F59E0B"
                              : c.textoSub,
                        background:
                          escola.custo === "Gratuito"
                            ? "#00D4AA15"
                            : escola.custo === "Bolsa Integral"
                              ? "#F59E0B15"
                              : c.borda,
                      }}
                    >
                      {escola.custo}
                    </span>
                  </div>
                ))}
              </div>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: c.textoSub,
                  margin: "12px 0 0",
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                Cada missão concluída hoje é um passo real para essas portas.
              </p>
            </div>

            {/* Escolas bolsa */}
            <div
              style={{
                background: `linear-gradient(135deg, ${e ? "#1A1A2E" : "#FFF8E8"}, ${e ? "#2D1B4E" : "#FFF0D4"})`,
                border: `2px solid #F59E0B33`,
                borderRadius: 20,
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #D97706, #F59E0B)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    flexShrink: 0,
                  }}
                >
                  🏆
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      color: e ? "#F59E0B" : "#B45309",
                      margin: 0,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Colégios de prestígio com bolsa
                  </p>
                  <p
                    style={{ fontSize: "0.7rem", color: c.textoSub, margin: 0 }}
                  >
                    Oportunidades reais para alunos dedicados
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(ESCOLAS_BOLSAS[serieAtual] || []).map((escola, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      background: e
                        ? "rgba(0,0,0,0.2)"
                        : "rgba(255,255,255,0.7)",
                      borderRadius: 12,
                      border: `1.5px solid ${e ? "#F59E0B22" : "#F59E0B33"}`,
                    }}
                  >
                    <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>
                      {escola.icone}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 800,
                          color: c.texto,
                          margin: 0,
                        }}
                      >
                        {escola.nome}
                      </p>
                      <p
                        style={{
                          fontSize: "0.72rem",
                          color: c.textoSub,
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        {escola.info}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: 6,
                        flexShrink: 0,
                        textAlign: "center",
                        lineHeight: 1.3,
                        whiteSpace: "nowrap",
                        color:
                          escola.custo === "Bolsa Integral"
                            ? "#F59E0B"
                            : escola.custo === "Até 100%"
                              ? "#00D4AA"
                              : c.textoSub,
                        background:
                          escola.custo === "Bolsa Integral"
                            ? "#F59E0B15"
                            : escola.custo === "Até 100%"
                              ? "#00D4AA15"
                              : c.borda,
                      }}
                    >
                      {escola.custo}
                    </span>
                  </div>
                ))}
              </div>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: c.textoSub,
                  margin: "12px 0 0",
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                Talento + consistência abre essas portas. O EduPlay cuida da
                consistência.
              </p>
            </div>

            {/* Progresso disciplinas */}
            <div
              style={{
                background: c.card,
                border: `1.5px solid ${c.borda}`,
                borderRadius: 16,
                padding: "20px",
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: c.textoSub,
                  margin: "0 0 16px",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Progresso por Disciplina
              </p>
              {DISCIPLINAS.map((d) => {
                const total = (missoesPorDisc[d.id] || []).length;
                return (
                  <div key={d.id} style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                        color: c.texto,
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      <span>
                        {d.icone} {d.label}
                      </span>
                      <span style={{ color: total > 0 ? d.cor : c.textoSub }}>
                        {total > 0 ? `${total} missão(ões)` : "Pendente"}
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 8,
                        background: c.borda,
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(total * 20, 100)}%`,
                          height: "100%",
                          background: d.cor,
                          transition: "width 0.8s ease",
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Link do filho */}
            <div
              style={{
                background: c.card,
                border: `2px solid ${c.azul}33`,
                borderRadius: 16,
                padding: "16px",
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  color: c.azul,
                  margin: "0 0 10px",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                🔗 Link do Agente
              </p>
              <div
                style={{
                  background: c.card2,
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: "0.8rem",
                  color: c.textoSub,
                  fontFamily: "monospace",
                  marginBottom: 12,
                  wordBreak: "break-all",
                }}
              >
                eduplay.olloapp.com.br/agente/
                {gerarSlug(filho?.nome, filho?.id)}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={copiarLink}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 10,
                    border: `2px solid ${c.borda}`,
                    background: linkCopiado ? `${c.accent}15` : "transparent",
                    color: linkCopiado ? c.accent : c.textoSub,
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  {linkCopiado ? "✅ Copiado!" : "📋 Copiar"}
                </button>
                <button
                  onClick={compartilharWhatsApp}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 10,
                    border: "none",
                    background: "#25D366",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  WhatsApp 📲
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA MISSÕES */}
        {secao === "missoes" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div
              style={{
                background: c.card,
                border: `1.5px solid ${c.borda}`,
                borderRadius: 16,
                padding: "16px",
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  color: c.textoSub,
                  margin: "0 0 10px",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Série
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 6,
                  marginBottom: 14,
                }}
              >
                {SERIES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setConfig({ ...config, serie: s.id })}
                    style={{
                      padding: "8px 4px",
                      borderRadius: 10,
                      border: `2px solid ${config.serie === s.id ? c.accent : c.borda}`,
                      background:
                        config.serie === s.id ? `${c.accent}15` : "transparent",
                      color: config.serie === s.id ? c.accent : c.textoSub,
                      fontWeight: 800,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      fontFamily: "'Nunito', sans-serif",
                      transition: "all 0.2s",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  color: c.textoSub,
                  margin: "0 0 10px",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Bimestre
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 6,
                }}
              >
                {BIMESTRES.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setConfig({ ...config, bimestre: b.id })}
                    style={{
                      padding: "8px 4px",
                      borderRadius: 10,
                      border: `2px solid ${config.bimestre === b.id ? c.azul : c.borda}`,
                      background:
                        config.bimestre === b.id
                          ? `${c.azul}15`
                          : "transparent",
                      color: config.bimestre === b.id ? c.azul : c.textoSub,
                      fontWeight: 800,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      fontFamily: "'Nunito', sans-serif",
                      transition: "all 0.2s",
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                background: limiteAtingido ? "#F59E0B12" : `${c.accent}10`,
                border: `1.5px solid ${limiteAtingido ? "#F59E0B40" : `${c.accent}30`}`,
                borderRadius: 14,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: limiteAtingido ? "#F59E0B" : c.accent,
                    margin: 0,
                  }}
                >
                  {limiteAtingido
                    ? "Limite diário atingido"
                    : `${MAX_MISSOES_DIA - missoesHoje} missão(ões) disponível(is) hoje`}
                </p>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: c.textoSub,
                    margin: "2px 0 0",
                  }}
                >
                  {limiteAtingido
                    ? "Volte amanhã."
                    : "Cada missão é única e personalizada."}
                </p>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background:
                        i < missoesHoje
                          ? limiteAtingido
                            ? "#F59E0B"
                            : c.accent
                          : "transparent",
                      border: `2px solid ${i < missoesHoje ? (limiteAtingido ? "#F59E0B" : c.accent) : c.borda}`,
                      transition: "all 0.3s",
                    }}
                  />
                ))}
              </div>
            </div>

            {gerando && (
              <div
                style={{
                  background: `${c.accent}10`,
                  border: `2px solid ${c.accent}30`,
                  borderRadius: 16,
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "2.2rem",
                    marginBottom: 10,
                    animation: "girarIA 2s linear infinite",
                  }}
                >
                  🧠
                </div>
                <p
                  style={{
                    fontSize: "0.92rem",
                    fontWeight: 700,
                    color: c.accent,
                    margin: "0 0 6px",
                    minHeight: "2.8em",
                  }}
                >
                  {FRASES_LOADING[fraseLoading]}
                </p>
                <p
                  style={{ fontSize: "0.72rem", color: c.textoSub, margin: 0 }}
                >
                  Isso pode levar alguns segundos...
                </p>
              </div>
            )}

            {mensagem && !gerando && (
              <div
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  border: `1.5px solid ${mensagem.tipo === "sucesso" ? `${c.accent}40` : "#E0555540"}`,
                }}
              >
                <div
                  style={{
                    background:
                      mensagem.tipo === "sucesso"
                        ? `${c.accent}15`
                        : "#E0555515",
                    padding: "14px 18px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 800,
                      color: mensagem.tipo === "sucesso" ? c.accent : "#E05555",
                      margin: 0,
                    }}
                  >
                    {mensagem.tipo === "sucesso"
                      ? `✅ ${mensagem.titulo}`
                      : "❌ Erro ao gerar missão."}
                  </p>
                </div>
                {mensagem.tipo === "sucesso" && mensagem.topicos.length > 0 && (
                  <div style={{ background: c.card, padding: "14px 18px" }}>
                    {mensagem.topicos.map((t, i) => (
                      <div
                        key={i}
                        style={{ display: "flex", gap: 8, marginBottom: 6 }}
                      >
                        <span style={{ color: c.accent, fontSize: "0.8rem" }}>
                          ▸
                        </span>
                        <p
                          style={{
                            fontSize: "0.82rem",
                            color: c.texto,
                            margin: 0,
                            lineHeight: 1.4,
                          }}
                        >
                          {t}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!gerando && !limiteAtingido && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {DISCIPLINAS.map((d) => {
                  const total = (missoesPorDisc[d.id] || []).length;
                  return (
                    <button
                      key={d.id}
                      onClick={() => gerarMissao(d.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "16px 18px",
                        background: c.card,
                        border: `2px solid ${d.cor}44`,
                        borderRadius: 16,
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          background: `${d.cor}22`,
                          border: `2px solid ${d.cor}44`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                        }}
                      >
                        {d.icone}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontFamily: "'Fredoka', sans-serif",
                            fontSize: "1rem",
                            color: c.texto,
                            fontWeight: 600,
                          }}
                        >
                          {d.label}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: c.textoSub }}>
                          {total > 0
                            ? `${total} missão(ões) gerada(s)`
                            : "Toque para gerar uma missão"}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: d.cor,
                          fontWeight: 700,
                          background: `${d.cor}18`,
                          padding: "4px 10px",
                          borderRadius: 8,
                        }}
                      >
                        🤖 Gerar
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ABA CONFIG */}
        {secao === "config" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div
              style={{
                background: c.card,
                border: `1.5px solid ${c.borda}`,
                borderRadius: 16,
                padding: "16px 18px",
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: c.textoSub,
                  margin: "0 0 12px",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                ⏱️ Limite de Tempo Diário
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  color: c.texto,
                  fontWeight: 700,
                }}
              >
                <span>{config.tempoEstudo} minutos</span>
                <span style={{ fontSize: "0.75rem", color: c.textoSub }}>
                  mín. 30min
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="120"
                step="15"
                value={config.tempoEstudo}
                onChange={(ev) =>
                  setConfig({ ...config, tempoEstudo: Number(ev.target.value) })
                }
                style={{ width: "100%", accentColor: c.accent }}
              />
              <p
                style={{
                  fontSize: "0.7rem",
                  color: c.textoSub,
                  margin: "8px 0 0",
                }}
              >
                O app avisará seu filho antes do tempo esgotar.
              </p>
            </div>

            <div
              style={{
                background: `linear-gradient(135deg, ${e ? "#1A1A2E" : "#FFF8E8"}, ${e ? "#2D1B4E" : "#FFF0D4"})`,
                border: "2px solid #FFB83044",
                borderRadius: 16,
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>🎁</span>
                <p
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 800,
                    color: e ? "#FFB830" : "#B07D00",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Contrato de Premiação
                </p>
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: e ? "#A0B8C8" : "#8A6D3B",
                  margin: "0 0 12px",
                }}
              >
                O que seu filho ganhará ao concluir 5 missões?
              </p>
              <textarea
                value={premio}
                onChange={(ev) => setPremio(ev.target.value)}
                placeholder="Ex: Uma noite da pizza, um passeio especial..."
                style={{
                  width: "100%",
                  height: "70px",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #FFB83066",
                  background: e ? "rgba(0,0,0,0.2)" : "#FFFFFF",
                  color: c.texto,
                  outline: "none",
                  resize: "none",
                  fontSize: "0.85rem",
                  fontFamily: "'Nunito', sans-serif",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                background: c.card,
                border: `1.5px solid ${c.borda}`,
                borderRadius: 16,
                padding: "16px 18px",
              }}
            >
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: c.textoSub,
                  margin: "0 0 12px",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                👤 Conta
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                {userPai?.photoURL ? (
                  <img
                    src={userPai.photoURL}
                    style={{ width: 40, height: 40, borderRadius: "50%" }}
                    alt=""
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: `${c.azul}22`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                    }}
                  >
                    👤
                  </div>
                )}
                <div>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: c.texto,
                      margin: 0,
                    }}
                  >
                    {userPai?.displayName || "Responsável"}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: c.textoSub,
                      margin: 0,
                    }}
                  >
                    {userPai?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 12,
                  border: `1.5px solid #EF444440`,
                  background: "#EF444410",
                  color: "#EF4444",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                Sair da conta
              </button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes fadeIn  { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes girarIA { 0%{transform:rotateY(0deg)} 100%{transform:rotateY(360deg)} }
      `}</style>
    </div>
  );
}
