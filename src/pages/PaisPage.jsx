import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTema } from "../context/ThemeContext";
import ModalPremiacao from "../components/ModalPremiacao";
import { logout } from "../services/auth";
import { gerarMissaoIA } from "../services/ia";
import { httpsCallable } from "firebase/functions";
import { functions, auth } from "../services/firebase";
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
  getMissoesConcluidas,
  getProgresso,
  desativarConta,
  reativarConta,
  verificarTrial,
} from "../services/db";

const MAX_MISSOES_DIA_DEFAULT = 3;
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
];
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

const CATEGORIAS_ESCOLAS = [
  {
    id: "militares",
    icone: "🎖️",
    titulo: "Militares e técnicas gratuitas",
    cor: "#1D4ED8",
    escolas: {
      "6ano": [
        {
          nome: "Colégio Militar de SP",
          info: "Prova no 5º ano — foco em Matemática e Português",
          custo: "Gratuito",
          detalhe:
            "Uma das melhores estruturas de ensino do país. Disciplina, esporte e excelência acadêmica.",
        },
        {
          nome: "Colégio Tiradentes (PM)",
          info: "Seleção via processo seletivo aberto",
          custo: "Gratuito",
          detalhe:
            "Rede de colégios da Polícia Militar com ensino de qualidade e ênfase em valores.",
        },
      ],
      "7ano": [
        {
          nome: "Colégio Militar de SP",
          info: "Vagas por transferência interna ou concurso",
          custo: "Gratuito",
          detalhe: "Ambiente disciplinado com alto nível acadêmico.",
        },
        {
          nome: "Colégio Tiradentes (PM)",
          info: "Processo seletivo anual",
          custo: "Gratuito",
          detalhe: "Ensino sólido com foco em cidadania e disciplina.",
        },
      ],
      "8ano": [
        {
          nome: "Colégio Tiradentes (PM)",
          info: "Processo seletivo — vagas limitadas",
          custo: "Gratuito",
          detalhe: "Prepare seu filho com um ano de antecedência.",
        },
        {
          nome: "ETEC (Vestibulinho)",
          info: "Entrada no 9º ano — prepare agora",
          custo: "Gratuito",
          detalhe: "Melhor ensino técnico público de SP. Altamente concorrido.",
        },
      ],
      "9ano": [
        {
          nome: "ETEC (Vestibulinho)",
          info: "Inscrições anuais — alta concorrência",
          custo: "Gratuito",
          detalhe:
            "Ensino Médio + formação técnica. Porta para o mercado de trabalho.",
        },
        {
          nome: "Liceu de Artes e Ofícios",
          info: "Prova de admissão para Ensino Médio técnico",
          custo: "Gratuito",
          detalhe:
            "Tradição de 150 anos em SP. Técnico em artes, design e tecnologia.",
        },
      ],
    },
  },
  {
    id: "bolsas",
    icone: "🏆",
    titulo: "Bolsas integrais em escolas de elite",
    cor: "#D97706",
    escolas: {
      "6ano": [
        {
          nome: "ISMART",
          info: "Inscrições a partir do 7º ano — prepare agora",
          custo: "Bolsa Integral",
          detalhe:
            "Paga escola + transporte + alimentação em colégios como Bandeirantes e Santa Cruz.",
        },
        {
          nome: "Etapa / Objetivo",
          info: "Concurso de bolsas anual",
          custo: "Até 100%",
          detalhe:
            "Quanto melhor a nota, maior o desconto. Inclui cursinho preparatório.",
        },
        {
          nome: "Colégio Bandeirantes",
          info: "Exame de admissão — alto rendimento",
          custo: "Mensalidade",
          detalhe:
            "Um dos melhores índices de aprovação no vestibular do Brasil.",
        },
      ],
      "7ano": [
        {
          nome: "ISMART",
          info: "Inscrições abertas para o 7º ano",
          custo: "Bolsa Integral",
          detalhe:
            "Processo seletivo rigoroso. Bolsa cobre escola + moradia + alimentação.",
        },
        {
          nome: "Etapa / Objetivo",
          info: "Concurso de bolsas — inscrições anuais",
          custo: "Até 100%",
          detalhe: "Avalia Português, Matemática e Raciocínio Lógico.",
        },
        {
          nome: "Santo Américo / Porto Seguro",
          info: "Fundações próprias para talentos",
          custo: "Bolsa Integral",
          detalhe:
            "Fundações filantrópicas que financiam alunos de baixa renda com alto potencial.",
        },
      ],
      "8ano": [
        {
          nome: "ISMART",
          info: "Última chance antes do 9º ano",
          custo: "Bolsa Integral",
          detalhe: "Não deixe passar. Processo seletivo em novembro/dezembro.",
        },
        {
          nome: "Etapa / Objetivo",
          info: "Concurso de bolsas — desconto por mérito",
          custo: "Até 100%",
          detalhe: "Estude um ano antes para garantir o melhor desconto.",
        },
        {
          nome: "Colégio Santa Cruz",
          info: "Programa de bolsas socioeconômicas",
          custo: "Bolsa Parcial",
          detalhe:
            "Um dos colégios mais conceituados de SP com programa de inclusão.",
        },
      ],
      "9ano": [
        {
          nome: "ISMART",
          info: "Última oportunidade — processo seletivo agora",
          custo: "Bolsa Integral",
          detalhe: "Se não tentou ainda, é a última chance. Não deixe passar.",
        },
        {
          nome: "Etapa / Objetivo",
          info: "Concurso de bolsas para o Ensino Médio",
          custo: "Até 100%",
          detalhe: "Prova em dezembro para início no ano seguinte.",
        },
        {
          nome: "Colégio Móbile",
          info: "Programa de bolsas por mérito",
          custo: "Bolsa Parcial",
          detalhe: "Alto índice de aprovação em medicina e engenharia.",
        },
      ],
    },
  },
  {
    id: "federais",
    icone: "🔬",
    titulo: "Institutos federais (IFSP, ETEC)",
    cor: "#2E8B57",
    escolas: {
      "6ano": [
        {
          nome: "IFSP",
          info: "Entrada no Ensino Médio — prepare com antecedência",
          custo: "Gratuito",
          detalhe:
            "Instituto Federal de SP. Nível de ensino equivalente ao universitário. Altamente disputado.",
        },
        {
          nome: "ETEC",
          info: "Vestibulinho anual — múltiplas unidades em SP",
          custo: "Gratuito",
          detalhe:
            "Mais de 70 unidades em SP. Ensino técnico + médio integrado.",
        },
      ],
      "7ano": [
        {
          nome: "IFSP",
          info: "Comece a preparar para a prova de admissão",
          custo: "Gratuito",
          detalhe:
            "Prova seletiva com Matemática, Português e Ciências. Concorrência alta.",
        },
        {
          nome: "ETEC",
          info: "Vestibulinho — prepare-se com 2 anos de antecedência",
          custo: "Gratuito",
          detalhe:
            "Cursos técnicos em tecnologia, saúde, administração e mais.",
        },
      ],
      "8ano": [
        {
          nome: "IFSP",
          info: "Prova seletiva no próximo ano — hora de preparar",
          custo: "Gratuito",
          detalhe: "Estude Matemática e Ciências com foco. Alta concorrência.",
        },
        {
          nome: "ETEC",
          info: "Vestibulinho — inscrições abertas em outubro/novembro",
          custo: "Gratuito",
          detalhe: "Escolha o curso técnico ideal para o futuro do seu filho.",
        },
      ],
      "9ano": [
        {
          nome: "IFSP",
          info: "Agora é a hora — prova seletiva este ano",
          custo: "Gratuito",
          detalhe: "Uma das melhores opções de ensino público do Brasil.",
        },
        {
          nome: "ETEC",
          info: "Vestibulinho — inscreva agora",
          custo: "Gratuito",
          detalhe:
            "Formação técnica + médio em uma única instituição gratuita.",
        },
      ],
    },
  },
  {
    id: "olimpiadas",
    icone: "🥇",
    titulo: "Olimpíadas científicas",
    cor: "#7C3AED",
    escolas: {
      "6ano": [
        {
          nome: "OBMEP",
          info: "Olimpíada Brasileira de Matemática — aplicada em agosto",
          custo: "Gratuito",
          detalhe:
            "Medalhas abrem portas para bolsas, viagens e reconhecimento nacional.",
        },
        {
          nome: "OBA",
          info: "Olimpíada Brasileira de Astronomia — aplicada em abril",
          custo: "Gratuito",
          detalhe:
            "Participar já destaca o aluno. Medalha de ouro = bolsa ISMART automática.",
        },
        {
          nome: "OBPC",
          info: "Olimpíada de Português — inscrições pela escola",
          custo: "Gratuito",
          detalhe: "Reconhecimento nacional em produção de texto.",
        },
      ],
      "7ano": [
        {
          nome: "OBMEP",
          info: "Nível 1 — alunos do 6º e 7º ano",
          custo: "Gratuito",
          detalhe:
            "Medalha de ouro garante bolsa de iniciação científica pelo CNPq.",
        },
        {
          nome: "OBF",
          info: "Olimpíada Brasileira de Física",
          custo: "Gratuito",
          detalhe: "Começa no 7º ano. Preparação para física do Ensino Médio.",
        },
        {
          nome: "ONC",
          info: "Olimpíada Nacional de Ciências",
          custo: "Gratuito",
          detalhe:
            "Biologia, Química e Física integradas. Nível acessível para iniciar.",
        },
      ],
      "8ano": [
        {
          nome: "OBMEP",
          info: "Nível 2 — alunos do 8º e 9º ano",
          custo: "Gratuito",
          detalhe:
            "Alta dificuldade. Medalha = destaque para qualquer processo seletivo.",
        },
        {
          nome: "OBF",
          info: "Fase regional disponível no 8º ano",
          custo: "Gratuito",
          detalhe: "Preparação que vale para vestibular e ENEM.",
        },
        {
          nome: "OBIJ",
          info: "Olimpíada Brasileira de Informática Juvenil",
          custo: "Gratuito",
          detalhe: "Lógica e programação. Porta para carreiras de tecnologia.",
        },
      ],
      "9ano": [
        {
          nome: "OBMEP",
          info: "Nível 2 — última chance nesta categoria",
          custo: "Gratuito",
          detalhe: "Medalha abre portas para IFSP, bolsas e universidades.",
        },
        {
          nome: "OBIJ",
          info: "Olimpíada de Informática Juvenil",
          custo: "Gratuito",
          detalhe:
            "Base para entrar em programas de tecnologia no Ensino Médio.",
        },
        {
          nome: "OBA",
          info: "Olimpíada de Astronomia — nível avançado",
          custo: "Gratuito",
          detalhe:
            "Resultado influencia bolsas ISMART e programas de iniciação científica.",
        },
      ],
    },
  },
  {
    id: "fundacoes",
    icone: "🤝",
    titulo: "Fundações e programas sociais",
    cor: "#C0392B",
    escolas: {
      "6ano": [
        {
          nome: "Fundação Bradesco",
          info: "Escolas gratuitas em todo o Brasil",
          custo: "Gratuito",
          detalhe:
            "Ensino de qualidade com foco em tecnologia e inovação. Verificar unidade mais próxima.",
        },
        {
          nome: "Instituto Ayrton Senna",
          info: "Programas em parceria com escolas públicas",
          custo: "Gratuito",
          detalhe:
            "Desenvolvimento de habilidades socioemocionais e acadêmicas.",
        },
        {
          nome: "Programa Comunidade Escola (SP)",
          info: "Atividades no contraturno em escolas municipais",
          custo: "Gratuito",
          detalhe: "Reforço escolar, esporte e cultura no contraturno.",
        },
      ],
      "7ano": [
        {
          nome: "Fundação Estudar",
          info: "Bolsas para talentos de baixa renda",
          custo: "Bolsa Integral",
          detalhe:
            "Financia estudos no Brasil e no exterior para alunos excepcionais.",
        },
        {
          nome: "Instituto Unibanco",
          info: "Jovem de Futuro — parceria com escolas públicas",
          custo: "Gratuito",
          detalhe:
            "Programa de aceleração da aprendizagem em escolas estaduais.",
        },
        {
          nome: "Gerdau Próxima",
          info: "Reforço e mentoria em SP",
          custo: "Gratuito",
          detalhe:
            "Foco em Matemática e Leitura para alunos de escolas públicas.",
        },
      ],
      "8ano": [
        {
          nome: "Fundação Estudar",
          info: "Programa de bolsas — inscrições anuais",
          custo: "Bolsa Integral",
          detalhe: "Um dos programas mais completos de bolsa do Brasil.",
        },
        {
          nome: "Itaú Social",
          info: "Programas de reforço e leitura",
          custo: "Gratuito",
          detalhe:
            "Parcerias com escolas públicas para acelerar a aprendizagem.",
        },
        {
          nome: "Centro Paula Souza",
          info: "Cursos técnicos gratuitos",
          custo: "Gratuito",
          detalhe:
            "Habilitações técnicas gratuitas para preparar o mercado de trabalho.",
        },
      ],
      "9ano": [
        {
          nome: "Fundação Estudar",
          info: "Última chance de bolsa para o Ensino Médio",
          custo: "Bolsa Integral",
          detalhe:
            "Invista agora. Essa bolsa pode mudar o futuro do seu filho.",
        },
        {
          nome: "Programa Jovem Aprendiz",
          info: "Qualificação + renda a partir dos 14 anos",
          custo: "Gratuito",
          detalhe: "Formação profissional com contrato de trabalho e salário.",
        },
        {
          nome: "SENAI / SENAC",
          info: "Cursos técnicos gratuitos ou subsidiados",
          custo: "Gratuito",
          detalhe:
            "Alta empregabilidade. Cursos em tecnologia, gastronomia, design e mais.",
        },
      ],
    },
  },
];

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

// ── Card escolas expansível ──
function CardCategoriaEscolas({ categoria, serie, c, e }) {
  const [expandido, setExpandido] = useState(false);
  const escolas = categoria.escolas[serie] || categoria.escolas["6ano"] || [];
  return (
    <div
      style={{
        background: c.card,
        border: `1.5px solid ${categoria.cor}33`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "all 0.3s",
      }}
    >
      <button
        onClick={() => setExpandido(!expandido)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: `${categoria.cor}22`,
              border: `2px solid ${categoria.cor}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              flexShrink: 0,
            }}
          >
            {categoria.icone}
          </div>
          <div>
            <p
              style={{
                fontSize: "0.85rem",
                fontWeight: 800,
                color: categoria.cor,
                margin: 0,
              }}
            >
              {categoria.titulo}
            </p>
            <p style={{ fontSize: "0.7rem", color: c.textoSub, margin: 0 }}>
              {escolas.length} opções para o {serie?.replace("ano", "º ano")}
            </p>
          </div>
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: `${categoria.cor}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
            flexShrink: 0,
            transition: "transform 0.3s",
            transform: expandido ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </div>
      </button>
      {expandido && (
        <div
          style={{
            padding: "0 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            animation: "fadeIn 0.2s ease",
          }}
        >
          {escolas.map((escola, i) => (
            <div
              key={i}
              style={{
                background: c.card2,
                borderRadius: 12,
                padding: "12px 14px",
                border: `1.5px solid ${categoria.cor}22`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <p
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 800,
                    color: c.texto,
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {escola.nome}
                </p>
                <span
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 6,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    color:
                      escola.custo === "Gratuito"
                        ? "#00D4AA"
                        : escola.custo === "Bolsa Integral"
                          ? "#F59E0B"
                          : escola.custo === "Até 100%"
                            ? "#00D4AA"
                            : c.textoSub,
                    background:
                      escola.custo === "Gratuito"
                        ? "#00D4AA15"
                        : escola.custo === "Bolsa Integral"
                          ? "#F59E0B15"
                          : escola.custo === "Até 100%"
                            ? "#00D4AA15"
                            : c.borda,
                  }}
                >
                  {escola.custo}
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: categoria.cor,
                  fontWeight: 700,
                  margin: "0 0 4px",
                }}
              >
                {escola.info}
              </p>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: c.textoSub,
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {escola.detalhe}
              </p>
            </div>
          ))}
          <p
            style={{
              fontSize: "0.7rem",
              color: c.textoSub,
              margin: "4px 0 0",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            Cada missão concluída hoje é um passo real para essas portas.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Card Assinatura ──
// ── Card Assinatura ──
function CardAssinatura({ c, e, filho, functions, userPai }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [emailAlternativo, setEmailAlternativo] = useState("");
  const [usarEmailAlternativo, setUsarEmailAlternativo] = useState(false);
  const [metodoPag, setMetodoPag] = useState("credito");
  const [pixData, setPixData] = useState(null);
  const [pixCopiado, setPixCopiado] = useState(false);
  const [depoimentoAtivo, setDepoimentoAtivo] = useState(0);

  const DEPOIMENTOS = [
    {
      nome: "Camila Ferreira Santos",
      texto:
        "Meu filho ficava o dia todo no celular jogando. Agora ele ainda joga, mas tem o tempo dele de estudo pelo celular também. Pelo menos o celular tá servindo pra algo a mais.",
    },
    {
      nome: "Rosana Oliveira Martins",
      texto:
        "Minha filha chegava da escola e jogava o caderno no canto. Hoje ela abre o app sozinha antes de eu pedir. Ainda não acredito que foi tão rápido.",
    },
    {
      nome: "Patrícia Lima Souza",
      texto:
        "Sempre briguei com meu filho por causa do celular. Agora uso o próprio celular pra ele estudar. Ele não percebe que tá aprendendo, acha que tá só jogando.",
    },
    {
      nome: "Marcos Andrade Costa",
      texto:
        "Meu filho me falou que as missões parecem um jogo. Pra mim tanto faz, o que importa é que ele para de reclamar quando chega a hora de estudar.",
    },
  ];

  const emailFinal =
    usarEmailAlternativo && emailAlternativo.trim()
      ? emailAlternativo.trim()
      : userPai?.email || auth.currentUser?.email || "";

  const assinar = async () => {
    if (!filho?.id) return;
    if (!emailFinal) {
      setErro("Informe um email para continuar.");
      return;
    }
    setCarregando(true);
    setErro("");
    try {
      if (metodoPag === "pix") {
        const criarPix = httpsCallable(functions, "criarPagamentoPix");
        const res = await criarPix({
          codigoAcesso: filho.id,
          emailResponsavel: emailFinal,
          nomeResponsavel: userPai?.displayName || "Responsavel",
        });
        if (res.data?.qrCode) {
          setPixData(res.data);
        } else {
          setErro("Nao foi possivel gerar o PIX. Tente novamente.");
        }
      } else {
        const criarAssinatura = httpsCallable(functions, "criarAssinatura");
        const res = await criarAssinatura({
          codigoAcesso: filho.id,
          emailResponsavel: emailFinal,
          nomeResponsavel: userPai?.displayName || "Responsavel",
        });
        if (res.data?.checkoutUrl) {
          window.open(res.data.checkoutUrl, "_blank");
        } else {
          setErro("Nao foi possivel gerar o link. Tente novamente.");
        }
      }
    } catch (err) {
      setErro("Erro ao conectar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const dep = DEPOIMENTOS[depoimentoAtivo];
  const verde = e ? "#00e0b3" : "#0F6E56";
  const verdeBg = e ? "rgba(0,224,179,0.08)" : "rgba(15,110,86,0.06)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hero emocional */}
      <div
        style={{
          background: e
            ? "linear-gradient(135deg, #0D1F2D, #0A2E1F)"
            : "linear-gradient(135deg, #E8FFF5, #F0FFF8)",
          border: `2px solid ${e ? "rgba(0,196,122,0.3)" : "rgba(15,110,86,0.2)"}`,
          borderRadius: 20,
          padding: "24px 20px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🚀</div>
        <p
          style={{
            fontSize: "0.72rem",
            fontWeight: 800,
            color: verde,
            textTransform: "uppercase",
            letterSpacing: 1,
            margin: "0 0 6px",
          }}
        >
          Plano Mensal
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: 4,
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: "1rem", fontWeight: 700, color: verde }}>
            R$
          </span>
          <span
            style={{
              fontSize: "3.5rem",
              fontWeight: 900,
              color: verde,
              lineHeight: 1,
            }}
          >
            20
          </span>
          <span style={{ fontSize: "1rem", fontWeight: 700, color: verde }}>
            /mês
          </span>
        </div>
        <p
          style={{ fontSize: "0.75rem", color: c.textoSub, margin: "0 0 16px" }}
        >
          Menos que R$1 por dia • Cancele quando quiser
        </p>
        <p
          style={{
            fontSize: "0.95rem",
            fontWeight: 800,
            color: c.texto,
            margin: "0 0 4px",
            lineHeight: 1.5,
          }}
        >
          O futuro do seu filho começa nas escolhas de hoje.
        </p>
        <p
          style={{
            fontSize: "0.82rem",
            color: c.textoSub,
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Cada missão concluída é um passo real em direção à ETEC, ao IFSP e às
          melhores escolas de SP.
        </p>
      </div>

      {/* Beneficios */}
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
            fontSize: "0.72rem",
            fontWeight: 800,
            color: c.textoSub,
            textTransform: "uppercase",
            letterSpacing: 1,
            margin: "0 0 12px",
          }}
        >
          O que está incluído
        </p>
        {[
          {
            icone: "🎯",
            titulo: "Missões pelo Currículo Paulista e BNCC",
            sub: "Conteúdo alinhado ao que a escola cobra",
          },
          {
            icone: "🏫",
            titulo: "Preparação para ETEC, IFSP e colégios federais",
            sub: "Desde o 6º ano, no ritmo certo",
          },
          {
            icone: "📊",
            titulo: "Relatório completo de progresso",
            sub: "Você acompanha tudo que seu filho aprende",
          },
          {
            icone: "💡",
            titulo: "Orientação Familiar com IA",
            sub: "Apoio para conversar com seu filho sobre escola — não substitui profissional de saúde",
          },
          {
            icone: "🔄",
            titulo: "Missões únicas, nunca repetidas",
            sub: "A IA cria atividades diferentes a cada vez",
          },
        ].map((b, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: i < 4 ? 12 : 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${verde}15`,
                border: `1.5px solid ${verde}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                flexShrink: 0,
              }}
            >
              {b.icone}
            </div>
            <div>
              <p
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  color: c.texto,
                  margin: "0 0 2px",
                }}
              >
                {b.titulo}
              </p>
              <p style={{ fontSize: "0.72rem", color: c.textoSub, margin: 0 }}>
                {b.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Depoimentos */}
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
            fontSize: "0.72rem",
            fontWeight: 800,
            color: c.textoSub,
            textTransform: "uppercase",
            letterSpacing: 1,
            margin: "0 0 12px",
          }}
        >
          O que os pais dizem
        </p>
        <div
          style={{
            background: verdeBg,
            border: `1.5px solid ${verde}22`,
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 12,
          }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              color: c.texto,
              margin: "0 0 10px",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            "{dep.texto}"
          </p>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              color: verde,
              margin: 0,
            }}
          >
            — {dep.nome}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {DEPOIMENTOS.map((_, i) => (
            <button
              key={i}
              onClick={() => setDepoimentoAtivo(i)}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                background: i === depoimentoAtivo ? verde : c.borda,
                transform: i === depoimentoAtivo ? "scale(1.4)" : "scale(1)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Email */}
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
            fontSize: "0.72rem",
            fontWeight: 800,
            color: c.textoSub,
            textTransform: "uppercase",
            letterSpacing: 1,
            margin: "0 0 8px",
          }}
        >
          Email para o Mercado Pago
        </p>
        <div
          style={{
            background: e ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            borderRadius: 10,
            padding: "10px 14px",
            border: `1.5px solid ${c.borda}`,
            fontSize: "0.85rem",
            color: c.textoSub,
            marginBottom: 8,
          }}
        >
          {userPai?.email || "—"}
        </div>
        <button
          onClick={() => setUsarEmailAlternativo(!usarEmailAlternativo)}
          style={{
            background: "none",
            border: "none",
            color: verde,
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
            padding: 0,
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          {usarEmailAlternativo ? "▲ Usar meu email" : "▼ Usar outro email"}
        </button>
        {usarEmailAlternativo && (
          <input
            type="email"
            placeholder="outro@email.com"
            value={emailAlternativo}
            onChange={(ev) => setEmailAlternativo(ev.target.value)}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "10px 14px",
              borderRadius: 10,
              border: `1.5px solid ${c.borda}`,
              background: e ? "rgba(255,255,255,0.06)" : "#fff",
              color: c.texto,
              fontSize: "0.85rem",
              fontFamily: "'Nunito', sans-serif",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        )}
      </div>

      {/* Metodo de pagamento */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { id: "credito", label: "💳 Cartão de crédito" },
          { id: "pix", label: "⚡ PIX" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMetodoPag(m.id);
              setPixData(null);
              setErro("");
            }}
            style={{
              flex: 1,
              padding: "10px 6px",
              borderRadius: 12,
              border: `2px solid ${metodoPag === m.id ? verde : c.borda}`,
              background: metodoPag === m.id ? `${verde}15` : "transparent",
              color: metodoPag === m.id ? verde : c.textoSub,
              fontWeight: 800,
              fontSize: "0.8rem",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* PIX QR */}
      {pixData && (
        <div
          style={{
            background: e ? "rgba(0,212,170,0.08)" : "rgba(0,212,170,0.06)",
            border: "2px solid #00D4AA44",
            borderRadius: 16,
            padding: "16px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              fontWeight: 800,
              color: "#00D4AA",
              margin: "0 0 10px",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            ⚡ PIX gerado — pague agora
          </p>
          {pixData.qrCodeBase64 && (
            <img
              src={`data:image/png;base64,${pixData.qrCodeBase64}`}
              alt="QR Code PIX"
              style={{
                width: 180,
                height: 180,
                borderRadius: 12,
                marginBottom: 10,
              }}
            />
          )}
          <p
            style={{
              fontSize: "0.72rem",
              color: c.textoSub,
              margin: "0 0 10px",
            }}
          >
            Válido por 30 minutos. Acesso liberado automaticamente após
            pagamento.
            <p
              style={{
                fontSize: "0.72rem",
                color: "#F59E0B",
                fontWeight: 700,
                margin: "4px 0 10px",
                lineHeight: 1.5,
              }}
            >
              ⚠️ PIX garante 30 dias de acesso. Renove manualmente todo mês.
            </p>
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(pixData.qrCode);
            }}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 12,
              border: "2px solid #00D4AA44",
              background: "transparent",
              color: "#00D4AA",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            📋 Copiar código PIX
          </button>
        </div>
      )}

      {erro && (
        <div
          style={{
            background: "#EF444415",
            border: "1.5px solid #EF444430",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: "0.8rem",
            color: "#EF4444",
            fontWeight: 700,
          }}
        >
          ⚠️ {erro}
        </div>
      )}

      {/* Botao CTA */}
      <button
        onClick={assinar}
        disabled={carregando || !!pixData}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: 30,
          border: "none",
          fontSize: "1rem",
          fontWeight: 900,
          cursor: carregando ? "not-allowed" : "pointer",
          background: carregando ? c.borda : e ? "#00c47a" : "#0F6E56",
          color: "#fff",
          boxShadow: carregando ? "none" : "0 4px 24px rgba(0,196,122,0.35)",
          fontFamily: "'Nunito', sans-serif",
          letterSpacing: 0.5,
        }}
      >
        {carregando
          ? "Aguarde..."
          : metodoPag === "pix"
            ? "⚡ Gerar QR Code PIX — R$20"
            : "🚀 Garantir acesso agora — R$20/mês"}
      </button>

      <p
        style={{
          fontSize: "0.7rem",
          color: c.textoSub,
          textAlign: "center",
          margin: 0,
        }}
      >
        🔒 Pagamento seguro via Mercado Pago • Cancele quando quiser
      </p>
    </div>
  );
}

// ── Modal Excluir Conta ──
function ModalExcluirConta({ c, e, onConfirmar, onCancelar, carregando }) {
  const [emailMarketing, setEmailMarketing] = useState(true);
  const [confirmado, setConfirmado] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: c.card,
          borderRadius: 24,
          padding: "28px 24px",
          maxWidth: 420,
          width: "100%",
          border: `2px solid #EF444430`,
          animation: "fadeIn 0.2s ease",
        }}
      >
        {/* Ícone e título */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>⚠️</div>
          <h2
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.4rem",
              color: "#EF4444",
              margin: "0 0 8px",
            }}
          >
            Desativar conta
          </h2>
          <p
            style={{
              fontSize: "0.85rem",
              color: c.textoSub,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Seu acesso e o do seu filho serão pausados. Todos os dados, missões
            e progresso ficam salvos. Se quiser voltar, é só fazer login
            novamente.
          </p>
        </div>

        {/* Preferência de e-mail marketing */}
        <div
          style={{
            background: e ? "rgba(255,255,255,0.04)" : "#F8FBFF",
            border: `1.5px solid ${c.borda}`,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 16,
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
              checked={emailMarketing}
              onChange={(ev) => setEmailMarketing(ev.target.checked)}
              style={{
                width: 20,
                height: 20,
                marginTop: 2,
                accentColor: "#00D4AA",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "0.84rem",
                color: c.texto,
                lineHeight: 1.5,
              }}
            >
              Quero receber dicas para o desenvolvimento do meu filho e ofertas
              exclusivas do EduPlay por e-mail
            </span>
          </label>
        </div>

        {/* Confirmação */}
        <div
          style={{
            background: "#EF444410",
            border: "1.5px solid #EF444430",
            borderRadius: 14,
            padding: "14px 16px",
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
              checked={confirmado}
              onChange={(ev) => setConfirmado(ev.target.checked)}
              style={{
                width: 20,
                height: 20,
                marginTop: 2,
                accentColor: "#EF4444",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "0.84rem",
                color: "#EF4444",
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              Entendo que meu acesso e o do meu filho serão pausados
            </span>
          </label>
        </div>

        {/* Botões */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => onConfirmar(emailMarketing)}
            disabled={!confirmado || carregando}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 14,
              border: "none",
              background: !confirmado || carregando ? c.borda : "#EF4444",
              color: !confirmado || carregando ? c.textoSub : "#fff",
              fontWeight: 900,
              fontSize: "0.95rem",
              cursor: !confirmado || carregando ? "not-allowed" : "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {carregando ? "Desativando..." : "Confirmar desativação"}
          </button>
          <button
            onClick={onCancelar}
            disabled={carregando}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 14,
              border: `1.5px solid ${c.borda}`,
              background: "transparent",
              color: c.textoSub,
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: carregando ? "not-allowed" : "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════
// RELATÓRIO — componente interno do PaisPage
// ═══════════════════════════════════════════════
const DISC_INFO = {
  historia: { label: "História", icone: "📜", cor: "#C4A882" },
  geografia: { label: "Geografia", icone: "🗺️", cor: "#5A8F8C" },
  matematica: { label: "Matemática", icone: "📐", cor: "#6B5B95" },
  ciencias: { label: "Ciências", icone: "🔬", cor: "#2E8B57" },
  portugues: { label: "Português", icone: "✍️", cor: "#C0392B" },
};
function RelatorioTab({ c, e, filho, getMissoesConcluidas, getProgresso }) {
  const [sessoes, setSessoes] = useState([]);
  const [progresso, setProgresso] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [periodo, setPeriodo] = useState("30dias"); // "7dias", "30dias", "todo"

  // Função para filtrar por período
  const filtrarPorPeriodo = (sessoesList) => {
    if (!Array.isArray(sessoesList)) return [];
    if (periodo === "todo") return sessoesList;

    const agora = new Date();
    const dias = periodo === "7dias" ? 7 : 30;
    const dataLimite = new Date(agora.setDate(agora.getDate() - dias));

    return sessoesList.filter((sessao) => {
      const dataSessao = sessao.criadoEm?.toDate
        ? sessao.criadoEm.toDate()
        : new Date(sessao.criadoEm);
      return dataSessao >= dataLimite;
    });
  };

  useEffect(() => {
    if (!filho?.id) return;

    Promise.all([getMissoesConcluidas(filho.id), getProgresso(filho.id)])
      .then(([s, p]) => {
        setSessoes(s || []);
        setProgresso(p);
        setCarregando(false);
      })
      .catch((err) => {
        console.error("Erro:", err);
        setCarregando(false);
      });
  }, [filho?.id, getMissoesConcluidas, getProgresso]);

  const sessoesFiltradas = filtrarPorPeriodo(sessoes);

  // Recalcular estatísticas com base no filtro
  const totalMissoes = sessoesFiltradas.length;
  const media =
    totalMissoes > 0
      ? Math.round(
          sessoesFiltradas.reduce((a, s) => a + (s.percentual || 0), 0) /
            totalMissoes,
        )
      : 0;

  // Agrupa por disciplina para o resumo
  const porDisc = sessoesFiltradas.reduce((acc, s) => {
    if (!acc[s.disciplina]) acc[s.disciplina] = [];
    acc[s.disciplina].push(s);
    return acc;
  }, {});

  if (carregando) {
    return (
      <div
        style={{ textAlign: "center", padding: "40px 0", color: c.textoSub }}
      >
        <div style={{ fontSize: "2rem", marginBottom: 12 }}>📋</div>
        <p style={{ margin: 0, fontWeight: 700 }}>Carregando relatório...</p>
      </div>
    );
  }

  const exportarPDF = () => {
    const nomeFilho = filho?.nome || "Agente";
    const dataHoje = new Date().toLocaleDateString("pt-BR");
    const periodoTexto =
      periodo === "7dias"
        ? "Últimos 7 dias"
        : periodo === "30dias"
          ? "Últimos 30 dias"
          : "Todo histórico";

    const linhas = sessoesFiltradas
      .map((s, i) => {
        const disc = DISC_INFO[s.disciplina] || {
          label: s.disciplina,
          icone: "📚",
        };
        const data = s.criadoEm?.toDate
          ? s.criadoEm.toDate().toLocaleDateString("pt-BR")
          : "—";
        const nota =
          s.total > 0 ? `${s.acertos}/${s.total} (${s.percentual}%)` : "—";
        const topicos = Array.isArray(s.topicos) ? s.topicos.join(", ") : "—";
        return `
        <tr style="background:${i % 2 === 0 ? "#f9f9f9" : "#ffffff"}">
          <td style="padding:8px 10px;border-bottom:1px solid #eee">${data}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee">${disc.icone} ${disc.label}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;font-weight:600">${s.tituloMissao || "—"}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:0.82em;color:#555">${topicos}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center;font-weight:700;color:${s.percentual >= 70 ? "#2E8B57" : "#C0392B"}">${nota}</td>
        </tr>`;
      })
      .join("");

    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8"/>
      <title>Relatório EduPlay — ${nomeFilho}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 32px; color: #1A2B3C; }
        .header { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; padding-bottom:16px; border-bottom:3px solid #4F46E5; }
        .logo { font-size:1.5rem; font-weight:900; color:#4F46E5; }
        .logo span { color:#1A2B3C; }
        .subtitulo { font-size:0.85rem; color:#666; margin-top:4px; }
        .periodo { display:inline-block; background:#E0E7FF; padding:4px 12px; border-radius:20px; font-size:0.75rem; }
        .stats { display:flex; gap:16px; margin-bottom:24px; }
        .stat { background:#F5F3FF; border-radius:12px; padding:14px 20px; flex:1; text-align:center; border:1px solid #E0D9FF; }
        .stat-num { font-size:1.8rem; font-weight:900; color:#4F46E5; }
        .stat-label { font-size:0.78rem; color:#666; margin-top:2px; }
        table { width:100%; border-collapse:collapse; font-size:0.88rem; }
        thead tr { background:#4F46E5; color:#fff; }
        thead td { padding:10px; font-weight:700; }
        .footer { margin-top:28px; font-size:0.7rem; color:#999; text-align:center; border-top:1px solid #eee; padding-top:12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">EduPlay <span>Instituto do Saber</span></div>
          <div class="subtitulo">Relatório de Desempenho — gerado em ${dataHoje}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:1.1rem;font-weight:800">${nomeFilho}</div>
          <div style="font-size:0.8rem;color:#666">${filho?.serie ? filho.serie.replace("ano", "º ano") : ""}</div>
          <div class="periodo">${periodoTexto}</div>
        </div>
      </div>
      <div class="stats">
        <div class="stat"><div class="stat-num">${totalMissoes}</div><div class="stat-label">Missões concluídas</div></div>
        <div class="stat"><div class="stat-num">${media}%</div><div class="stat-label">Média de acertos</div></div>
        <div class="stat"><div class="stat-num">${progresso?.diasSeguidos || 0}</div><div class="stat-label">Dias seguidos</div></div>
        <div class="stat"><div class="stat-num">${progresso?.diasAtivos?.length || 0}</div><div class="stat-label">Dias ativos</div></div>
      </div>
      <table>
        <thead><tr><td>Data</td><td>Disciplina</td><td>Missão</td><td>Tópicos</td><td style="text-align:center">Resultado</td></tr></thead>
        <tbody>${linhas || '<tr><td colspan="5" style="text-align:center;padding:20px;color:#999">Nenhuma missão no período selecionado</td></tr>'}</tbody>
      </table>
      <div class="footer">EduPlay — Instituto do Saber | Relatório gerado automaticamente | ${dataHoje}</div>
    </body>
    </html>`;

    const janela = window.open("", "_blank");
    janela.document.write(html);
    janela.document.close();
    setTimeout(() => janela.print(), 600);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* Seletor de período */}
      <div
        style={{
          display: "flex",
          gap: 8,
          background: c.card,
          borderRadius: 16,
          padding: "8px",
          border: `1.5px solid ${c.borda}`,
        }}
      >
        {[
          { id: "7dias", label: "📅 Últimos 7 dias", dias: 7 },
          { id: "30dias", label: "📆 Últimos 30 dias", dias: 30 },
          { id: "todo", label: "📚 Todo histórico", dias: "todo" },
        ].map((opcao) => (
          <button
            key={opcao.id}
            onClick={() => setPeriodo(opcao.id)}
            style={{
              flex: 1,
              padding: "8px 6px",
              borderRadius: 12,
              border: `2px solid ${periodo === opcao.id ? c.accent : c.borda}`,
              background:
                periodo === opcao.id ? `${c.accent}15` : "transparent",
              color: periodo === opcao.id ? c.accent : c.textoSub,
              fontWeight: 700,
              fontSize: "0.72rem",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {opcao.label}
          </button>
        ))}
      </div>

      {/* Cards de resumo (já filtrados) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Missões feitas", valor: totalMissoes, icone: "🏆" },
          { label: "Média de acertos", valor: `${media}%`, icone: "🎯" },
          {
            label: "Dias seguidos",
            valor: progresso?.diasSeguidos || 0,
            icone: "🔥",
          },
          {
            label: "Dias ativos",
            valor: progresso?.diasAtivos?.length || 0,
            icone: "📅",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: c.card,
              border: `1.5px solid ${c.borda}`,
              borderRadius: 14,
              padding: "14px 12px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>
              {stat.icone}
            </div>
            <div
              style={{
                fontSize: "1.4rem",
                fontWeight: 900,
                color: c.accent || "#4F46E5",
              }}
            >
              {stat.valor}
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                color: c.textoSub,
                fontWeight: 700,
                marginTop: 2,
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Resumo por disciplina (filtrado) */}
      {Object.keys(porDisc).length > 0 && (
        <div
          style={{
            background: c.card,
            border: `1.5px solid ${c.borda}`,
            borderRadius: 16,
            padding: "16px 14px",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              color: c.textoSub,
              textTransform: "uppercase",
              letterSpacing: 1,
              margin: "0 0 12px",
            }}
          >
            Por disciplina (
            {periodo === "7dias"
              ? "últimos 7 dias"
              : periodo === "30dias"
                ? "últimos 30 dias"
                : "todo histórico"}
            )
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(porDisc).map(([disc, lista]) => {
              if (!Array.isArray(lista) || lista.length === 0) return null;
              const info = DISC_INFO[disc] || {
                label: disc,
                icone: "📚",
                cor: "#888",
              };
              const mediaDisc = Math.round(
                lista.reduce((a, s) => a + (s.percentual || 0), 0) /
                  lista.length,
              );
              return (
                <div
                  key={disc}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <div
                    style={{
                      fontSize: "1.2rem",
                      width: 28,
                      textAlign: "center",
                    }}
                  >
                    {info.icone}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: c.texto,
                        }}
                      >
                        {info.label}
                      </span>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 800,
                          color: info.cor,
                        }}
                      >
                        {mediaDisc}% · {lista.length}{" "}
                        {lista.length === 1 ? "missão" : "missões"}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: e ? "#1E3347" : "#EEF2F7",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${mediaDisc}%`,
                          background: info.cor,
                          borderRadius: 99,
                          transition: "width 0.8s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabela de histórico (filtrada) */}
      <div
        style={{
          background: c.card,
          border: `1.5px solid ${c.borda}`,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: `1.5px solid ${c.borda}`,
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              color: c.textoSub,
              textTransform: "uppercase",
              letterSpacing: 1,
              margin: 0,
            }}
          >
            Histórico de missões{" "}
            {periodo !== "todo" &&
              `(${periodo === "7dias" ? "últimos 7 dias" : "últimos 30 dias"})`}
          </p>
        </div>
        {sessoesFiltradas.length === 0 ? (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: c.textoSub,
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>📭</div>
            <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700 }}>
              Nenhuma missão no período selecionado
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            {sessoesFiltradas.map((s, i) => {
              const disc = DISC_INFO[s.disciplina] || {
                label: s.disciplina,
                icone: "📚",
                cor: "#888",
              };
              const data = s.criadoEm?.toDate
                ? s.criadoEm.toDate().toLocaleDateString("pt-BR")
                : "—";
              const aprovado = (s.percentual || 0) >= 70;
              return (
                <div
                  key={s.id || i}
                  style={{
                    padding: "12px 16px",
                    borderBottom:
                      i < sessoesFiltradas.length - 1
                        ? `1px solid ${c.borda}`
                        : "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
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
                      <span style={{ fontSize: "1.1rem" }}>{disc.icone}</span>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: c.texto,
                        }}
                      >
                        {s.tituloMissao || disc.label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        color: aprovado ? "#2E8B57" : "#C0392B",
                        background: aprovado ? "#2E8B5715" : "#C0392B15",
                        padding: "3px 8px",
                        borderRadius: 8,
                      }}
                    >
                      {s.acertos}/{s.total} — {s.percentual}%
                    </span>
                  </div>
                  {Array.isArray(s.topicos) && s.topicos.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        marginTop: 4,
                      }}
                    >
                      {s.topicos.map((t, ti) => (
                        <div
                          key={ti}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.65rem",
                              color: disc.cor,
                              fontWeight: 800,
                              flexShrink: 0,
                              marginTop: 2,
                            }}
                          >
                            •
                          </span>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: c.textoSub,
                              fontWeight: 600,
                              lineHeight: 1.4,
                            }}
                          >
                            {typeof t === "object"
                              ? t.nome || t.descricao || ""
                              : t}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: "0.7rem", color: c.textoSub }}>
                    {data}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botão exportar PDF */}
      <button
        onClick={exportarPDF}
        disabled={sessoesFiltradas.length === 0}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 14,
          border: "none",
          background:
            sessoesFiltradas.length === 0
              ? e
                ? "#1E3347"
                : "#EEF2F7"
              : "linear-gradient(135deg, #4F46E5, #7C3AED)",
          color: sessoesFiltradas.length === 0 ? c.textoSub : "#fff",
          fontWeight: 800,
          fontSize: "0.95rem",
          cursor: sessoesFiltradas.length === 0 ? "not-allowed" : "pointer",
          fontFamily: "'Nunito', sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        🖨️ Imprimir / Salvar como PDF ({totalMissoes} missões)
      </button>
    </div>
  );
}
// ── Componente principal ──

// ═══════════════════════════════════════════════
// ORIENTACAO FAMILIAR
// ═══════════════════════════════════════════════
const SUGESTOES_ORIENTACAO = [
  "Como criar uma rotina de estudos em casa?",
  "Meu filho nao quer fazer dever de casa. O que faco?",
  "Como lidar com notas baixas sem criar conflito?",
  "Como saber se meu filho tem dificuldade de aprendizagem?",
  "Como equilibrar tempo de tela e estudos?",
  "Como conversar com meu filho sobre a escola sem que ele feche?",
];

function OrientacaoTab({ c, e }) {
  const [mensagens, setMensagens] = useState([]);
  const [input, setInput] = useState("");
  const [carregando, setCarregando] = useState(false);
  const fimRef = useRef(null);
  const respostaRef = useRef(null);

  const rolarParaBaixo = () => {
    setTimeout(
      () =>
        respostaRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      100,
    );
  };

  const [restantes, setRestantes] = useState(10);
  const [limiteEsgotado, setLimiteEsgotado] = useState(false);

  const enviar = async (texto) => {
    const pergunta = texto || input.trim();
    if (!pergunta || carregando || limiteEsgotado) return;
    setInput("");
    const novas = [...mensagens, { role: "user", content: pergunta }];
    setMensagens(novas);
    setCarregando(true);
    rolarParaBaixo();
    try {
      const fn = httpsCallable(functions, "orientacaoFamiliar");
      const res = await fn({ messages: novas });
      setMensagens([
        ...novas,
        { role: "assistant", content: res.data.resposta },
      ]);
      setRestantes(res.data.restantes);
      if (res.data.restantes <= 0) setLimiteEsgotado(true);
    } catch (err) {
      const code = err?.code || "";
      if (
        code.includes("resource-exhausted") ||
        err?.message?.includes("LIMITE_DIARIO")
      ) {
        setLimiteEsgotado(true);
        setMensagens([
          ...novas,
          {
            role: "assistant",
            content:
              "Voce atingiu o limite de 10 orientacoes por dia. Isso nos ajuda a manter o servico sempre disponivel para todas as familias. Volte amanha com novas duvidas — estamos aqui para ajudar! 💙",
          },
        ]);
      } else {
        setMensagens([
          ...novas,
          {
            role: "assistant",
            content:
              "Erro de conexao. Verifique sua internet e tente novamente.",
          },
        ]);
      }
    } finally {
      setCarregando(false);
      rolarParaBaixo();
    }
  };

  const compartilharWhatsApp = () => {
    if (mensagens.length < 2) return;
    const partes = ["📚 *Orientação EduPlay*", "━━━━━━━━━━━━━━━━"];
    mensagens.forEach((msg) => {
      if (msg.role === "user") {
        partes.push("");
        partes.push("💬 *Você perguntou:*");
        partes.push(msg.content);
      } else {
        partes.push("");
        partes.push("💡 *Orientação:*");
        partes.push(
          msg.content.slice(0, 800) + (msg.content.length > 800 ? "..." : ""),
        );
        partes.push("━━━━━━━━━━━━━━━━");
      }
    });
    partes.push("");
    partes.push("⚠️ Estas orientações não substituem avaliação profissional.");
    partes.push(
      "🪴 Salve ou compartilhe essa conversa — ela não fica guardada no app.",
    );
    partes.push("🔗 eduplay.olloapp.com.br");
    const txt = partes.join("\n");
    window.open("https://wa.me/?text=" + encodeURIComponent(txt), "_blank");
  };

  const temResposta =
    mensagens.length >= 2 &&
    mensagens[mensagens.length - 1].role === "assistant";

  return (
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
          background: e ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.07)",
          border: "1.5px solid rgba(245,158,11,0.35)",
          borderRadius: 14,
          padding: "12px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: 1 }}>
          ⚠️
        </span>
        <p
          style={{
            fontSize: "0.78rem",
            color: e ? "#F59E0B" : "#92610A",
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Este espaço oferece orientações gerais de apoio educacional.{" "}
          <strong>Não realiza diagnósticos</strong> e não substitui a avaliação
          de um profissional de saúde, psicólogo ou professor. Em caso de
          dúvidas sérias, converse com a escola ou um especialista.
        </p>
      </div>

      {mensagens.length === 0 && (
        <div
          style={{
            background: c.card,
            border: `1.5px solid ${c.borda}`,
            borderRadius: 16,
            padding: "18px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: e ? "rgba(0,212,170,0.12)" : "rgba(0,212,170,0.1)",
                border: "2px solid rgba(0,212,170,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                flexShrink: 0,
              }}
            >
              💡
            </div>
            <div>
              <p
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 800,
                  color: c.texto,
                  margin: 0,
                }}
              >
                Assistente Educacional
              </p>
              <p style={{ fontSize: "0.72rem", color: c.textoSub, margin: 0 }}>
                Orientacoes para apoiar seu filho em casa
              </p>
            </div>
          </div>
          <p
            style={{
              fontSize: "0.82rem",
              color: c.textoSub,
              margin: "0 0 14px",
              lineHeight: 1.6,
            }}
          >
            Tire duvidas sobre rotina de estudos, convivencia, motivacao e como
            participar do dia a dia escolar do seu filho.
          </p>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              color: c.textoSub,
              textTransform: "uppercase",
              letterSpacing: 1,
              margin: "0 0 10px",
            }}
          >
            Sugestoes de perguntas
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SUGESTOES_ORIENTACAO.map((s, i) => (
              <button
                key={i}
                onClick={() => enviar(s)}
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${c.borda}`,
                  background: e ? "rgba(255,255,255,0.03)" : "#F8FBFF",
                  color: c.texto,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  lineHeight: 1.4,
                }}
              >
                💬 {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {mensagens.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mensagens.map((msg, i) => (
            <div
              key={i}
              ref={
                i === mensagens.length - 1 && msg.role === "assistant"
                  ? respostaRef
                  : null
              }
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "88%",
                  padding: "12px 16px",
                  borderRadius:
                    msg.role === "user"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                  background:
                    msg.role === "user"
                      ? e
                        ? "#00D4AA22"
                        : "#E8FFF9"
                      : c.card,
                  border: `1.5px solid ${msg.role === "user" ? "#00D4AA44" : c.borda}`,
                  fontSize: "0.85rem",
                  color: c.texto,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.role === "assistant" && (
                  <p
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      color: "#00D4AA",
                      margin: "0 0 6px",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    💡 Assistente Educacional
                  </p>
                )}
                {msg.content}
              </div>
            </div>
          ))}
          {carregando && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "8px",
                  borderRadius: "18px 18px 18px 4px",
                  background: c.card,
                  border: `1.5px solid ${c.borda}`,
                  overflow: "hidden",
                  width: "100%",
                  maxWidth: 340,
                }}
              >
                <svg
                  viewBox="0 0 680 320"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: "100%", height: "auto", display: "block" }}
                  role="img"
                  aria-label="Assistente elaborando orientação"
                >
                  <defs>
                    <style>{`.edu-s1{animation:edu-f1 2.4s ease-in-out infinite;transform-origin:290px 130px}.edu-s2{animation:edu-f2 2.0s ease-in-out infinite .4s;transform-origin:330px 100px}.edu-s3{animation:edu-f3 2.6s ease-in-out infinite .7s;transform-origin:370px 120px}.edu-s4{animation:edu-f4 2.1s ease-in-out infinite 1.0s;transform-origin:310px 85px}.edu-s5{animation:edu-f5 2.3s ease-in-out infinite .2s;transform-origin:355px 78px}.edu-s6{animation:edu-f6 1.9s ease-in-out infinite .9s;transform-origin:275px 108px}.edu-s7{animation:edu-f1 2.7s ease-in-out infinite .5s;transform-origin:390px 95px}.edu-s8{animation:edu-f3 2.2s ease-in-out infinite 1.3s;transform-origin:350px 65px}@keyframes edu-f1{0%,100%{transform:translateY(0) scale(1);opacity:1}50%{transform:translateY(-42px) scale(.3);opacity:0}}@keyframes edu-f2{0%,100%{transform:translateY(0) scale(1);opacity:.9}50%{transform:translateY(-50px) scale(.2);opacity:0}}@keyframes edu-f3{0%,100%{transform:translateY(0) scale(1);opacity:1}50%{transform:translateY(-38px) scale(.3);opacity:0}}@keyframes edu-f4{0%,100%{transform:translateY(0) scale(.9);opacity:.85}50%{transform:translateY(-46px) scale(.2);opacity:0}}@keyframes edu-f5{0%,100%{transform:translateY(0) scale(1);opacity:1}50%{transform:translateY(-44px) scale(.25);opacity:0}}@keyframes edu-f6{0%,100%{transform:translateY(0) scale(.8);opacity:.8}50%{transform:translateY(-36px) scale(.2);opacity:0}}.edu-pencil{animation:edu-write 1.6s cubic-bezier(.4,0,.6,1) infinite;transform-origin:340px 220px}@keyframes edu-write{0%{transform:translateX(-55px) rotate(-15deg)}45%{transform:translateX(55px) rotate(-15deg)}50%{transform:translateX(55px) rotate(-15deg)}95%{transform:translateX(-55px) rotate(-15deg)}100%{transform:translateX(-55px) rotate(-15deg)}}.edu-l1{animation:edu-el1 1.6s linear infinite;stroke-dasharray:110;stroke-dashoffset:110}.edu-l2{animation:edu-el2 1.6s linear infinite .2s;stroke-dasharray:90;stroke-dashoffset:90}.edu-l3{animation:edu-el3 1.6s linear infinite .4s;stroke-dasharray:70;stroke-dashoffset:70}@keyframes edu-el1{0%{stroke-dashoffset:110;opacity:1}60%{stroke-dashoffset:0;opacity:1}80%{stroke-dashoffset:0;opacity:.5}100%{stroke-dashoffset:0;opacity:0}}@keyframes edu-el2{0%{stroke-dashoffset:90;opacity:0}20%{stroke-dashoffset:90;opacity:0}70%{stroke-dashoffset:0;opacity:1}90%{stroke-dashoffset:0;opacity:.4}100%{stroke-dashoffset:0;opacity:0}}@keyframes edu-el3{0%{stroke-dashoffset:70;opacity:0}40%{stroke-dashoffset:70;opacity:0}85%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:.3}}.edu-d1{animation:edu-dot 1.6s ease-in-out infinite}.edu-d2{animation:edu-dot 1.6s ease-in-out infinite .3s}.edu-d3{animation:edu-dot 1.6s ease-in-out infinite .6s}@keyframes edu-dot{0%,100%{opacity:.2}50%{opacity:1}}.edu-livro{animation:edu-pulse 3s ease-in-out infinite;transform-origin:340px 210px}@keyframes edu-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}.edu-glow{animation:edu-glow 3s ease-in-out infinite}@keyframes edu-glow{0%,100%{opacity:.08}50%{opacity:.18}}`}</style>
                  </defs>
                  <rect
                    x="80"
                    y="15"
                    width="520"
                    height="290"
                    rx="28"
                    fill="#4F46E5"
                    className="edu-glow"
                  />
                  <rect
                    x="90"
                    y="22"
                    width="500"
                    height="276"
                    rx="22"
                    fill="#7C3AED"
                    className="edu-glow"
                    style={{ animationDelay: ".8s" }}
                  />
                  <g className="edu-livro">
                    <ellipse
                      cx="340"
                      cy="282"
                      rx="100"
                      ry="10"
                      fill="#4F46E5"
                      opacity="0.2"
                    />
                    <rect
                      x="210"
                      y="155"
                      width="130"
                      height="118"
                      rx="6"
                      fill="#4F46E5"
                    />
                    <rect
                      x="210"
                      y="155"
                      width="130"
                      height="118"
                      rx="6"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="2"
                    />
                    <rect
                      x="218"
                      y="163"
                      width="114"
                      height="102"
                      rx="4"
                      fill="#5B52F0"
                      opacity=".5"
                    />
                    <rect
                      x="340"
                      y="155"
                      width="130"
                      height="118"
                      rx="6"
                      fill="#7C3AED"
                    />
                    <rect
                      x="340"
                      y="155"
                      width="130"
                      height="118"
                      rx="6"
                      fill="none"
                      stroke="#9F7AEA"
                      strokeWidth="2"
                    />
                    <rect
                      x="348"
                      y="163"
                      width="114"
                      height="102"
                      rx="4"
                      fill="#8B5CF6"
                      opacity=".5"
                    />
                    <rect
                      x="332"
                      y="153"
                      width="16"
                      height="122"
                      rx="4"
                      fill="#312E81"
                    />
                    <line
                      x1="340"
                      y1="153"
                      x2="340"
                      y2="275"
                      stroke="#4F46E5"
                      strokeWidth="1.5"
                      opacity=".6"
                    />
                    <rect
                      x="214"
                      y="159"
                      width="122"
                      height="110"
                      rx="3"
                      fill="#F0F4FF"
                    />
                    <line
                      x1="222"
                      y1="175"
                      x2="328"
                      y2="175"
                      stroke="#4F46E5"
                      strokeWidth="2"
                      opacity=".35"
                    />
                    <line
                      x1="222"
                      y1="186"
                      x2="328"
                      y2="186"
                      stroke="#7C3AED"
                      strokeWidth="1.5"
                      opacity=".3"
                    />
                    <line
                      x1="222"
                      y1="197"
                      x2="320"
                      y2="197"
                      stroke="#00D4AA"
                      strokeWidth="2"
                      opacity=".4"
                    />
                    <line
                      x1="222"
                      y1="208"
                      x2="324"
                      y2="208"
                      stroke="#4F46E5"
                      strokeWidth="1.5"
                      opacity=".3"
                    />
                    <line
                      x1="222"
                      y1="219"
                      x2="318"
                      y2="219"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      opacity=".4"
                    />
                    <line
                      x1="222"
                      y1="230"
                      x2="322"
                      y2="230"
                      stroke="#7C3AED"
                      strokeWidth="1.5"
                      opacity=".3"
                    />
                    <line
                      x1="222"
                      y1="241"
                      x2="310"
                      y2="241"
                      stroke="#00D4AA"
                      strokeWidth="2"
                      opacity=".35"
                    />
                    <line
                      x1="222"
                      y1="252"
                      x2="315"
                      y2="252"
                      stroke="#4F46E5"
                      strokeWidth="1.5"
                      opacity=".25"
                    />
                    <rect
                      x="344"
                      y="159"
                      width="122"
                      height="110"
                      rx="3"
                      fill="#F5F0FF"
                    />
                    <line
                      x1="352"
                      y1="175"
                      x2="458"
                      y2="175"
                      stroke="#7C3AED"
                      strokeWidth="2"
                      opacity=".35"
                    />
                    <line
                      x1="352"
                      y1="186"
                      x2="458"
                      y2="186"
                      stroke="#00D4AA"
                      strokeWidth="1.5"
                      opacity=".3"
                    />
                    <line
                      x1="352"
                      y1="197"
                      x2="450"
                      y2="197"
                      stroke="#4F46E5"
                      strokeWidth="2"
                      opacity=".4"
                    />
                    <line
                      x1="352"
                      y1="208"
                      x2="454"
                      y2="208"
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      opacity=".3"
                    />
                    <line
                      x1="352"
                      y1="219"
                      x2="448"
                      y2="219"
                      stroke="#7C3AED"
                      strokeWidth="2"
                      opacity=".4"
                    />
                    <line
                      x1="352"
                      y1="230"
                      x2="452"
                      y2="230"
                      stroke="#00D4AA"
                      strokeWidth="1.5"
                      opacity=".3"
                    />
                    <line
                      x1="352"
                      y1="241"
                      x2="444"
                      y2="241"
                      stroke="#4F46E5"
                      strokeWidth="2"
                      opacity=".35"
                    />
                    <line
                      x1="352"
                      y1="252"
                      x2="446"
                      y2="252"
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      opacity=".25"
                    />
                  </g>
                  <line
                    x1="232"
                    y1="270"
                    x2="342"
                    y2="270"
                    stroke="#00D4AA"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="edu-l1"
                  />
                  <line
                    x1="352"
                    y1="270"
                    x2="452"
                    y2="270"
                    stroke="#FFD700"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="edu-l2"
                  />
                  <line
                    x1="232"
                    y1="278"
                    x2="302"
                    y2="278"
                    stroke="#F472B6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="edu-l3"
                  />
                  <g className="edu-pencil">
                    <ellipse
                      cx="340"
                      cy="278"
                      rx="18"
                      ry="4"
                      fill="#000"
                      opacity="0.15"
                    />
                    <rect
                      x="318"
                      y="218"
                      width="18"
                      height="52"
                      rx="3"
                      fill="#FFD700"
                    />
                    <rect
                      x="318"
                      y="224"
                      width="18"
                      height="3"
                      fill="#F59E0B"
                      opacity=".6"
                    />
                    <rect
                      x="318"
                      y="231"
                      width="18"
                      height="3"
                      fill="#F59E0B"
                      opacity=".4"
                    />
                    <rect
                      x="318"
                      y="212"
                      width="18"
                      height="9"
                      rx="2"
                      fill="#F472B6"
                    />
                    <rect
                      x="318"
                      y="218"
                      width="18"
                      height="4"
                      rx="0"
                      fill="#E5E7EB"
                    />
                    <rect
                      x="318"
                      y="270"
                      width="18"
                      height="6"
                      fill="#DEB887"
                    />
                    <polygon points="318,276 336,276 327,292" fill="#D97706" />
                    <polygon points="323,282 331,282 327,292" fill="#374151" />
                    <rect
                      x="322"
                      y="220"
                      width="4"
                      height="44"
                      rx="2"
                      fill="#FFF"
                      opacity=".25"
                    />
                  </g>
                  <g className="edu-s1">
                    <polygon
                      points="290,118 293,127 303,127 295,133 298,142 290,136 282,142 285,133 277,127 287,127"
                      fill="#FFD700"
                    />
                  </g>
                  <g className="edu-s2">
                    <polygon
                      points="330,88 332.5,96 341,96 334.5,101 337,109 330,104 323,109 325.5,101 319,96 327.5,96"
                      fill="#F472B6"
                    />
                  </g>
                  <g className="edu-s3">
                    <polygon
                      points="372,108 374,115 381,115 376,119 378,126 372,122 366,126 368,119 363,115 370,115"
                      fill="#00D4AA"
                    />
                  </g>
                  <g className="edu-s4">
                    <polygon
                      points="310,73 312,80 319,80 314,84 316,91 310,87 304,91 306,84 301,80 308,80"
                      fill="#A78BFA"
                    />
                  </g>
                  <g className="edu-s5">
                    <polygon
                      points="356,66 357.5,72 364,72 359,76 361,82 356,78 351,82 353,76 348,72 354.5,72"
                      fill="#FFD700"
                    />
                  </g>
                  <g className="edu-s6">
                    <polygon
                      points="275,96 277,103 284,103 279,107 281,114 275,110 269,114 271,107 266,103 273,103"
                      fill="#34D399"
                    />
                  </g>
                  <g className="edu-s7">
                    <polygon
                      points="392,83 393.5,89 400,89 395,93 397,99 392,95 387,99 389,93 384,89 390.5,89"
                      fill="#F472B6"
                    />
                  </g>
                  <g className="edu-s8">
                    <polygon
                      points="352,53 353.5,59 360,59 355,63 357,69 352,65 347,69 349,63 344,59 350.5,59"
                      fill="#00D4AA"
                    />
                  </g>
                  <circle
                    cx="305"
                    cy="305"
                    r="5"
                    fill="#00D4AA"
                    className="edu-d1"
                  />
                  <circle
                    cx="325"
                    cy="305"
                    r="5"
                    fill="#A78BFA"
                    className="edu-d2"
                  />
                  <circle
                    cx="345"
                    cy="305"
                    r="5"
                    fill="#F472B6"
                    className="edu-d3"
                  />
                  <text
                    x="340"
                    y="300"
                    textAnchor="middle"
                    fontFamily="'Nunito',sans-serif"
                    fontSize="15"
                    fontWeight="800"
                    fill="#00D4AA"
                    letterSpacing="1"
                  >
                    Elaborando orientação...
                  </text>
                </svg>
              </div>
            </div>
          )}
          <div ref={fimRef} />
        </div>
      )}

      <div
        style={{
          background: c.card,
          border: `1.5px solid ${c.borda}`,
          borderRadius: 16,
          padding: "12px 14px",
          display: "flex",
          gap: 10,
          alignItems: "flex-end",
        }}
      >
        <textarea
          value={input}
          onChange={(ev) => setInput(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter" && !ev.shiftKey) {
              ev.preventDefault();
              enviar();
            }
          }}
          placeholder="Digite sua dúvida aqui..."
          rows={2}
          style={{
            flex: 1,
            resize: "none",
            border: "none",
            background: "transparent",
            color: c.texto,
            fontSize: "0.88rem",
            fontFamily: "'Nunito', sans-serif",
            outline: "none",
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={() => enviar()}
          disabled={!input.trim() || carregando}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: "none",
            background: !input.trim() || carregando ? c.borda : "#00D4AA",
            color: "#fff",
            fontSize: "1.1rem",
            cursor: !input.trim() || carregando ? "not-allowed" : "pointer",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ➤
        </button>
      </div>

      {temResposta && (
        <button
          onClick={compartilharWhatsApp}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 14,
            border: "none",
            background: "#25D366",
            color: "#fff",
            fontWeight: 800,
            fontSize: "0.9rem",
            cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          📲 Compartilhar orientação no WhatsApp
        </button>
      )}

      <p
        style={{
          fontSize: "0.7rem",
          color: c.textoSub,
          textAlign: "center",
          margin: "0 0 8px",
          lineHeight: 1.5,
        }}
      >
        ⚠️ Este assistente não realiza diagnósticos. Para situações delicadas,
        procure um profissional ou converse com o professor da sua criança.
      </p>
    </div>
  );
}
function CardAssinaturaCompacto({ c, e, filho, functions, userPai }) {
  const [metodo, setMetodo] = useState("cartao");
  const [carregando, setCarregando] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [pixCopiado, setPixCopiado] = useState(false);

  const pagar = async () => {
    if (!filho?.id) return;
    setCarregando(true);
    try {
      if (metodo === "pix") {
        const fn = httpsCallable(functions, "criarPagamentoPix");
        const r = await fn({
          codigoAcesso: filho.id,
          emailResponsavel: userPai?.email,
          nomeResponsavel: userPai?.displayName || "Responsavel",
        });
        if (r.data?.qrCode) setPixData(r.data);
      } else {
        const fn = httpsCallable(functions, "criarAssinatura");
        const r = await fn({
          codigoAcesso: filho.id,
          emailResponsavel: userPai?.email,
          nomeResponsavel: userPai?.displayName || "Responsavel",
        });
        if (r.data?.checkoutUrl) window.open(r.data.checkoutUrl, "_blank");
      }
    } catch (_) {
    } finally {
      setCarregando(false);
    }
  };

  const verde = "#0F6E56";
  const verdeBg = "#E1F5EE";

  return (
    <div
      style={{
        background: c.card,
        border: "2px solid #5DCAA5",
        borderRadius: 16,
        padding: 20,
      }}
    >
      {/* Topo — preco + checks */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.65rem",
              color: c.textoSub,
              letterSpacing: 1,
              margin: "0 0 6px",
              textTransform: "uppercase",
            }}
          >
            Plano Mensal
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: verde }}>
              R$
            </span>
            <span
              style={{
                fontSize: "2.2rem",
                fontWeight: 900,
                color: verde,
                lineHeight: 1,
              }}
            >
              20
            </span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: verde }}>
              /mês
            </span>
          </div>
          <p
            style={{
              fontSize: "0.72rem",
              color: c.textoSub,
              margin: "4px 0 0",
            }}
          >
            Menos que R$1 por dia
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            alignItems: "flex-end",
          }}
        >
          {["Cancele quando quiser", "Sem fidelidade", "Acesso imediato"].map(
            (t) => (
              <span
                key={t}
                style={{
                  fontSize: "0.68rem",
                  color: verde,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontWeight: 700,
                }}
              >
                ✓ {t}
              </span>
            ),
          )}
        </div>
      </div>

      {/* Seletor metodo */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[
          { id: "cartao", label: "💳 Cartão de crédito" },
          { id: "pix", label: "⚡ PIX" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMetodo(m.id);
              setPixData(null);
            }}
            style={{
              flex: 1,
              padding: "10px 8px",
              borderRadius: 10,
              border: `1.5px solid ${metodo === m.id ? "#5DCAA5" : c.borda}`,
              background: metodo === m.id ? verdeBg : "transparent",
              color: metodo === m.id ? "#085041" : c.textoSub,
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
              transition: "all 0.2s",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* PIX QR */}
      {pixData && (
        <div
          style={{
            textAlign: "center",
            marginBottom: 14,
            padding: 14,
            background: e ? "rgba(0,212,170,0.08)" : "#F0FFF8",
            borderRadius: 12,
            border: "1.5px solid #5DCAA5",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              color: verde,
              margin: "0 0 10px",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            ⚡ PIX gerado — pague agora
          </p>
          {pixData.qrCodeBase64 && (
            <img
              src={`data:image/png;base64,${pixData.qrCodeBase64}`}
              alt="QR Code PIX"
              style={{
                width: 160,
                height: 160,
                borderRadius: 10,
                marginBottom: 10,
              }}
            />
          )}
          <p
            style={{
              fontSize: "0.7rem",
              color: c.textoSub,
              margin: "0 0 10px",
            }}
          >
            Válido por 30 minutos. Acesso liberado automaticamente após
            pagamento.
            <p
              style={{
                fontSize: "0.72rem",
                color: "#F59E0B",
                fontWeight: 700,
                margin: "4px 0 10px",
                lineHeight: 1.5,
              }}
            >
              ⚠️ PIX garante 30 dias de acesso. Renove manualmente todo mês.
            </p>
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(pixData.qrCode);
              setPixCopiado(true);
              setTimeout(() => setPixCopiado(false), 2500);
            }}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 10,
              border: "1.5px solid #5DCAA5",
              background: "transparent",
              color: verde,
              fontWeight: 800,
              fontSize: "0.82rem",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {pixCopiado ? "✅ Copiado!" : "📋 Copiar código PIX"}
          </button>
        </div>
      )}

      {/* Botao CTA */}
      <button
        onClick={pagar}
        disabled={carregando || !!pixData}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 30,
          border: "none",
          background: carregando ? c.borda : verde,
          color: "#E1F5EE",
          fontSize: "0.95rem",
          fontWeight: 900,
          cursor: carregando || !!pixData ? "not-allowed" : "pointer",
          fontFamily: "'Nunito', sans-serif",
          letterSpacing: 0.5,
        }}
      >
        {carregando
          ? "Aguarde..."
          : metodo === "pix"
            ? "⚡ Gerar QR Code PIX — R$20"
            : "🚀 Garantir acesso — R$20/mês"}
      </button>

      <p
        style={{
          fontSize: "0.68rem",
          color: c.textoSub,
          textAlign: "center",
          margin: "10px 0 0",
        }}
      >
        🔒 Pagamento seguro via Mercado Pago
      </p>
    </div>
  );
}

function DepoimentoCard({ d, i, c, e }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div style={{ marginBottom: i < 3 ? 10 : 0 }}>
      <button
        onClick={() => setAberto(!aberto)}
        style={{
          width: "100%",
          background: e ? "rgba(255,255,255,0.04)" : "#F8FBFF",
          border: `1.5px solid ${aberto ? "#5DCAA5" : c.borda}`,
          borderRadius: aberto ? "12px 12px 0 0" : 12,
          padding: "12px 16px",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "'Nunito', sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          transition: "all 0.2s",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: 800,
              color: "#0F6E56",
              margin: 0,
            }}
          >
            {d.nome}
          </p>
          <p
            style={{
              fontSize: "0.72rem",
              color: c.textoSub,
              margin: "2px 0 0",
            }}
          >
            {d.detalhe}
          </p>
        </div>
        <span
          style={{
            fontSize: "0.8rem",
            color: c.textoSub,
            transition: "transform 0.3s",
            display: "inline-block",
            transform: aberto ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </button>
      {aberto && (
        <div
          style={{
            background: e ? "rgba(0,212,170,0.06)" : "#F0FFF8",
            border: "1.5px solid #5DCAA5",
            borderTop: "none",
            borderRadius: "0 0 12px 12px",
            padding: "14px 16px",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              color: e ? "#E8F4F8" : "#1A2B3C",
              lineHeight: 1.6,
              margin: "0 0 8px",
              fontStyle: "italic",
            }}
          >
            "{d.txt}"
          </p>
          <span
            style={{ fontSize: "0.72rem", color: "#0F6E56", fontWeight: 700 }}
          >
            — {d.nome}, {d.detalhe}
          </span>
        </div>
      )}
    </div>
  );
}

export default function PaisPage({ userPai, timer }) {
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();
  const e = tema === "escuro";

  const [etapa, setEtapa] = useState("verificando");
  const [filho, setFilho] = useState(null);
  const [diasTrial, setDiasTrial] = useState(null);
  const [autoMissoes, setAutoMissoes] = useState(false);
  const [pixDiasRestantes, setPixDiasRestantes] = useState(null);
  const [pixExpirado, setPixExpirado] = useState(false);
  const [frasesIdx, setFrasesIdx] = useState(0);
  const FRASES_ASSINAR = [
    {
      t: "O EduPlay é um ",
      accent: "professor particular no celular",
      end: " — todos os dias, no horário que seu filho quiser.",
    },
    {
      t: "Uma vaga na ETEC custa zero reais. ",
      accent: "O preparo custa R$20/mês.",
      end: "",
    },
    {
      t: "Enquanto outros pais pagam R$400 em cursinho, ",
      accent: "você investe menos de R$1 por dia.",
      end: "",
    },
    {
      t: "Você sabe o que seu filho estudou hoje? ",
      accent: "Com o EduPlay, você sabe.",
      end: "",
    },
    {
      t: "Um ",
      accent: "orientador especializado em comportamento educacional",
      end: " no seu celular, a qualquer hora.",
    },
    {
      t: "O hábito de estudar leva 21 dias para se formar. ",
      accent: "Não pare agora.",
      end: "",
    },
    {
      t: "Consistência é o que separa ",
      accent: "quem sonha de quem conquista a vaga.",
      end: "",
    },
  ];
  const [missoesPorDisc, setMissoesPorDisc] = useState({});
  const [missoesHoje, setMissoesHoje] = useState(0);
  const [limiteMissoes, setLimiteMissoes] = useState(MAX_MISSOES_DIA_DEFAULT);
  const [sessoesQuiz, setSessoesQuiz] = useState([]);
  const [progresso, setProgresso] = useState(null);
  const [mensagemIA, setMensagemIA] = useState("");
  const [carregandoMsg, setCarregandoMsg] = useState(false);
  const [nivelDesempenho, setNivelDesempenho] = useState("sem_dados");
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
  const [avatarFilho, setAvatarFilho] = useState("🧑‍🚀");
  const [mostrarAvatares, setMostrarAvatares] = useState(false);

  const [secao, setSecao] = useState("visao");
  const [config, setConfig] = useState({
    serie: localStorage.getItem("eduplay_config_serie") || "6ano",
    bimestre: localStorage.getItem("eduplay_config_bimestre") || "1bimestre",
    tempoEstudo: 45,
  });
  const [gerando, setGerando] = useState(null);
  const gerandoRef = useRef(null);
  const [mensagem, setMensagem] = useState(null);
  const [fraseLoading, setFraseLoading] = useState(0);
  const [premio, setPremio] = useState("");
  const [premioImagemUrl, setPremioImagemUrl] = useState(null);
  const [premioEditando, setPremioEditando] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [mostrarPreviewPremio, setMostrarPreviewPremio] = useState(false);
  const [perguntasIA, setPerguntasIA] = useState([]);

  // ── Estados para excluir conta ──
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);
  const [desativando, setDesativando] = useState(false);

  const limiteAtingido = missoesHoje >= limiteMissoes;

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

  const gerarMensagemIA = async (crianca, sessoes, prog) => {
    setCarregandoMsg(true);
    try {
      const ultimaSessao = sessoes?.[0];
      const percentual = ultimaSessao?.percentual ?? null;
      let nivel = "sem_dados";
      if (percentual !== null) {
        if (percentual >= 70) nivel = "otimo";
        else if (percentual >= 40) nivel = "bom";
        else nivel = "ruim";
      }
      setNivelDesempenho(nivel);
      const fn = httpsCallable(functions, "gerarMensagemMotivacional");
      const res = await fn({
        nomeFilho: crianca.nome,
        serie: SERIES.find((s) => s.id === crianca.serie)?.label || "6º ano",
        totalMissoes: prog?.missoesFeitas || 0,
        ultimoPercentual: percentual,
        diasAtivos: prog?.diasAtivos?.length || 0,
        tituloMissao: ultimaSessao?.tituloMissao || "",
        topicos: ultimaSessao?.topicos || [],
      });
      if (res.data?.ok) {
        setMensagemIA(res.data.mensagem);
        if (res.data.perguntas?.length > 0) setPerguntasIA(res.data.perguntas);
      }
    } catch (err) {
      console.warn("Mensagem IA indisponível:", err);
      setMensagemIA(
        "Acompanhe o desenvolvimento do seu filho e converse com ele sobre o que aprendeu hoje.",
      );
    } finally {
      setCarregandoMsg(false);
    }
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

        // ── Reativação automática se conta estava inativa ──
        if (resp.status === "inativo") {
          const criancaInativa = await getCriancaPorPai(userPai.uid);
          await reativarConta(userPai.uid, criancaInativa?.id || null);
          resp = await getResponsavel(userPai.uid);
        }

        const crianca = await getCriancaPorPai(userPai.uid);
        if (!crianca) {
          setEtapa("cadastro");
          return;
        }
        setFilho(crianca);
        if (crianca.pixDiasRestantes !== undefined)
          setPixDiasRestantes(crianca.pixDiasRestantes);
        if (crianca.plano === "pix_expirado") setPixExpirado(true);
        if (crianca.avatar) setAvatarFilho(crianca.avatar);
        if (crianca.avatar) setAvatarFilho(crianca.avatar);
        if (crianca.avatar) setAvatarFilho(crianca.avatar);
        if (resp.premio) setPremio(resp.premio);
        if (resp.premioImagemUrl) setPremioImagemUrl(resp.premioImagemUrl);
        if (resp.limiteMissoes) setLimiteMissoes(resp.limiteMissoes);
        if (resp.tempoEstudo)
          setConfig((prev) => ({ ...prev, tempoEstudo: resp.tempoEstudo }));
        if (resp.autoMissoes !== undefined) setAutoMissoes(resp.autoMissoes);
        if (resp.serie) {
          setConfig((prev) => ({ ...prev, serie: resp.serie }));
          localStorage.setItem("eduplay_config_serie", resp.serie);
        }
        if (resp.bimestre) {
          setConfig((prev) => ({ ...prev, bimestre: resp.bimestre }));
          localStorage.setItem("eduplay_config_bimestre", resp.bimestre);
        }
        if (resp.tempoEstudo)
          setConfig((prev) => ({ ...prev, tempoEstudo: resp.tempoEstudo }));
        if (resp.autoMissoes !== undefined) setAutoMissoes(resp.autoMissoes);
        if (resp.serie) {
          setConfig((prev) => ({ ...prev, serie: resp.serie }));
          localStorage.setItem("eduplay_config_serie", resp.serie);
        }
        if (resp.bimestre) {
          setConfig((prev) => ({ ...prev, bimestre: resp.bimestre }));
          localStorage.setItem("eduplay_config_bimestre", resp.bimestre);
        }
        if (resp.premioImagemUrl) setPremioImagemUrl(resp.premioImagemUrl);
        setConfig((prev) => ({
          ...prev,
          serie:
            localStorage.getItem("eduplay_config_serie") ||
            crianca.serie ||
            "6ano",
        }));
        const [missoes, qtdHoje] = await Promise.all([
          getTodasMissoes(crianca.id),
          contarMissoesHoje(crianca.id),
        ]);
        setMissoesPorDisc(missoes);
        setMissoesHoje(qtdHoje);
        let sessoes = [];
        let prog = null;
        try {
          sessoes = await getMissoesConcluidas(crianca.id);
          setSessoesQuiz(sessoes);
        } catch (err) {
          console.warn("Sessões quiz:", err);
        }
        try {
          prog = await getProgresso(crianca.id);
          setProgresso(prog);
        } catch (err) {
          console.warn("Progresso:", err);
        }
        // Verifica trial
        try {
          const trial = await verificarTrial(crianca.id);
          if (trial.diasRestantes !== undefined)
            setDiasTrial(trial.diasRestantes);
        } catch (_) {}

        setEtapa("painel");
        gerarMensagemIA(crianca, sessoes, prog);
        // Listener tempo real para sessoes de quiz
        const {
          collection: col,
          query: qry,
          where: whr,
          orderBy: oby,
          onSnapshot: ons,
        } = await import("firebase/firestore");
        const { db: dbFs } = await import("../services/firebase");
        const qSessoes = qry(
          col(dbFs, "quizSessions"),
          whr("codigoAcesso", "==", crianca.id),
          oby("criadoEm", "desc"),
        );
        ons(qSessoes, (snap) => {
          const novas = snap.docs.map((d) => {
            const dt = d.data();
            const obj = { id: d.id };
            Object.keys(dt).forEach((k) => {
              obj[k] = dt[k]?.toDate ? dt[k].toDate().toISOString() : dt[k];
            });
            return obj;
          });
          setSessoesQuiz(novas);
        });

        // Listener tempo real para missoes — atualiza painel quando pai gera nova missao
        const qMissoes = qry(
          col(dbFs, "missoes", crianca.id, "geradas"),
          oby("criadoEm", "desc"),
        );
        ons(qMissoes, (snap) => {
          const todas = snap.docs.map((d) => {
            const dt = d.data();
            const obj = { id: d.id };
            Object.keys(dt).forEach((k) => {
              obj[k] = dt[k]?.toDate ? dt[k].toDate().toISOString() : dt[k];
            });
            return obj;
          });
          const porDisc = {};
          todas.forEach((m) => {
            if (!porDisc[m.disciplina]) porDisc[m.disciplina] = [];
            porDisc[m.disciplina].push(m);
          });
          setMissoesPorDisc(porDisc);
          const hoje = new Date().toLocaleDateString("pt-BR");
          const qtdHoje = todas.filter((m) => {
            const data = m.criadoEm?.toDate
              ? m.criadoEm.toDate().toLocaleDateString("pt-BR")
              : null;
            return data === hoje;
          }).length;
          setMissoesHoje(qtdHoje);
        });
      } catch (err) {
        console.error("Erro ao iniciar PaisPage:", err);
        setEtapa("eca");
      }
    };
    iniciar();
  }, [userPai]);

  useEffect(() => {
    if (!filho?.id) return;
    getTodasMissoes(filho.id, config.serie, config.bimestre).then(
      setMissoesPorDisc,
    );
    contarMissoesHoje(filho.id).then(setMissoesHoje);
  }, [filho?.id, config.serie, config.bimestre]);

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

  useEffect(() => {
    if (secao !== "assinar") return;
    const t = setInterval(() => setFrasesIdx((i) => (i + 1) % 7), 4000);
    return () => clearInterval(t);
  }, [secao]);

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
        status: "ativo",
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
        status: "ativo",
      };
      await criarCrianca(codigo, dados);
      setFilho({ id: codigo, ...dados });
      setConfig((prev) => ({ ...prev, serie: serieFilho }));
      setEtapa("codigo");
    } catch (err) {
      setErroFilho("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvandoFilho(false);
    }
  };

  // ── Handler desativar conta ──
  const handleDesativarConta = async (emailMarketing) => {
    setDesativando(true);
    try {
      await desativarConta(userPai.uid, filho?.id || null, emailMarketing);
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Erro ao desativar conta:", err);
      setDesativando(false);
      setMostrarModalExcluir(false);
    }
  };

  const gerarMissao = async (disciplinaId) => {
    if (limiteAtingido || !filho) return;
    setGerando(disciplinaId);
    setMensagem(null);
    setTimeout(
      () =>
        gerandoRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        }),
      100,
    );
    try {
      const serie = filho.serie || config.serie;
      const temaAtual = `Conteudo do ${SERIES.find((s) => s.id === serie)?.label} - ${BIMESTRES.find((b) => b.id === config.bimestre)?.label}`;
      const titulosJaGerados = (missoesPorDisc[disciplinaId] || [])
        .map((m) => m.titulo)
        .filter(Boolean);
      const missao = await gerarMissaoIA({
        disciplina: disciplinaId,
        serie,
        bimestre: config.bimestre,
        tema: temaAtual,
        titulosJaGerados,
      });
      await salvarMissao(
        filho.id,
        disciplinaId,
        missao,
        config.serie,
        config.bimestre,
      );
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
      setMensagem({
        tipo: "erro",
        titulo: "Erro ao gerar missao.",
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
      `${nome}, sua missão de hoje está pronta.\n\n${link}`,
      `${nome}, o EduPlay preparou algo especial para você hoje.\n\n${link}`,
    ];
    window.open(
      `https://wa.me/?text=${encodeURIComponent(opcoes[Math.floor(Math.random() * opcoes.length)])}`,
      "_blank",
    );
  };
  const compartilharCodigoWhatsApp = () => {
    const nome = filho?.nome?.split(" ")[0] || "Agente";
    const link = `https://eduplay.olloapp.com.br/agente/${gerarSlug(filho?.nome, filho?.id)}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${nome}, criei sua conta no EduPlay! 🎉\n\n${link}\n\nCódigo: *${filho?.id}*`)}`,
      "_blank",
    );
  };
  const compartilharOrgulhoWhatsApp = () => {
    const nome = filho?.nome?.split(" ")[0] || "meu filho";
    const dias = progresso?.diasAtivos?.length || 0;
    const total = Object.values(missoesPorDisc).reduce((a, arr) => a + (arr?.length || 0), 0);
    const link = `https://eduplay.olloapp.com.br/agente/${gerarSlug(filho?.nome, filho?.id)}`;
    const msg = dias >= 3
      ? `${nome} esta estudando ha ${dias} dias seguidos com o EduPlay! Juntos ja completamos ${total} missoes. Experimenta gratis: ${link}`
      : `Descobri um app que faz meu filho estudar sem reclamar. ${nome} acabou de concluir as missoes de hoje pelo EduPlay. Experimenta gratis: eduplay.olloapp.com.br`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
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
  const ultimaSessao = sessoesQuiz?.[0] || null;
  const ultimasSessoes = sessoesQuiz?.slice(0, 3) || [];
  const discUltima = ultimaSessao
    ? DISCIPLINAS.find((d) => d.id === ultimaSessao.disciplina)
    : null;
  const perguntasPai = ultimaSessao
    ? PERGUNTAS_PAI[ultimaSessao.disciplina] || []
    : [];
  const corNivel = {
    sem_dados: c.azul,
    otimo: "#00D4AA",
    bom: "#F59E0B",
    ruim: "#EF4444",
  }[nivelDesempenho];
  const emojiNivel = { sem_dados: "📋", otimo: "🌟", bom: "📈", ruim: "💪" }[
    nivelDesempenho
  ];

  if (etapa === "verificando")
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

  if (etapa === "eca")
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
                  "Crianças e adolescentes não criam contas próprias.",
                ],
                ["Dados mínimos", "Coletamos apenas nome e série do aluno."],
                [
                  "Consentimento registrado",
                  "Seu aceite é registrado de forma imutável.",
                ],
                [
                  "Direito ao esquecimento",
                  "Você pode solicitar exclusão dos dados a qualquer momento.",
                ],
                [
                  "Sem publicidade",
                  "O EduPlay não exibe anúncios nem compartilha dados.",
                ],
              ].map(([t, txt]) => (
                <div
                  key={t}
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
                    {t}
                  </p>
                  <p
                    style={{ fontSize: "0.8rem", color: c.textoSub, margin: 0 }}
                  >
                    {txt}
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
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
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

  if (etapa === "cadastro")
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
                }}
              >
                {salvandoFilho ? "Salvando..." : "Criar perfil do filho →"}
              </button>
            </div>
          </div>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap'); @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
      </div>
    );

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
              🔗 Link exclusivo
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
                  {linkCopiado ? "✅ Copiado!" : "📋 Copiar link"}
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
                  {codigoCopiado ? "✅ Copiado!" : "🔑 Copiar código"}
                </button>
              </div>
            </div>
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
            }}
          >
            Ir para o painel →
          </button>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap'); @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: c.bg,
        fontFamily: "'Nunito', sans-serif",
        paddingBottom: 100,
      }}
    >
      {/* Modal excluir conta */}
      {mostrarModalExcluir && (
        <ModalExcluirConta
          c={c}
          e={e}
          onConfirmar={handleDesativarConta}
          onCancelar={() => setMostrarModalExcluir(false)}
          carregando={desativando}
        />
      )}

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
        {/* Banner trial dia 4 — 1 dia restante */}
        {diasTrial === 1 && (
          <div
            style={{
              background: "#E1F5EE",
              border: "1px solid #5DCAA5",
              borderRadius: 16,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>🌱</span>
              <div>
                <p
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 800,
                    color: "#085041",
                    margin: "0 0 4px",
                    lineHeight: 1.4,
                  }}
                >
                  {filho?.nome?.split(" ")[0]} tem 1 dia de estudo gratuito
                  restante.
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#0F6E56",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  O hábito que vocês construíram juntos pode continuar — por
                  menos de R$1 por dia.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSecao("assinar")}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 30,
                border: "none",
                background: "#0F6E56",
                color: "#E1F5EE",
                fontWeight: 800,
                fontSize: "0.88rem",
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Garantir acesso agora
            </button>
          </div>
        )}

        {/* Banner trial dia 5 — ultimo dia */}
        {diasTrial === 0 && (
          <div
            style={{
              background: "#FAEEDA",
              border: "1px solid #EF9F27",
              borderRadius: 16,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>🕯️</span>
              <div>
                <p
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 800,
                    color: "#633806",
                    margin: "0 0 4px",
                    lineHeight: 1.4,
                  }}
                >
                  Hoje é o último dia gratuito de {filho?.nome?.split(" ")[0]}.
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#854F0B",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Ele estudou, se dedicou, cresceu. Não deixe esse momento ser o
                  fim — é só o começo para vocês.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSecao("assinar")}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 30,
                border: "none",
                background: "#BA7517",
                color: "#FAEEDA",
                fontWeight: 800,
                fontSize: "0.88rem",
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Continuar a jornada
            </button>
          </div>
        )}

        {/* Banner PIX prestes a expirar — 5 dias ou menos */}
        {pixDiasRestantes !== null &&
          pixDiasRestantes <= 5 &&
          pixDiasRestantes > 0 &&
          !pixExpirado && (
            <div
              style={{
                background: "#FAEEDA",
                border: "1px solid #EF9F27",
                borderRadius: 16,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                animation: "fadeIn 0.3s ease",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>⚡</span>
                <div>
                  <p
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 800,
                      color: "#633806",
                      margin: "0 0 4px",
                      lineHeight: 1.4,
                    }}
                  >
                    Seu PIX vence em {pixDiasRestantes}{" "}
                    {pixDiasRestantes === 1 ? "dia" : "dias"}.
                  </p>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#854F0B",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    Migre para o cartão e nunca mais se preocupe — o acesso de{" "}
                    {filho?.nome?.split(" ")[0]} é renovado automaticamente todo
                    mês, sem precisar lembrar de pagar. Cancele no Mercado Pago
                    quando quiser, sem burocracia.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSecao("assinar")}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: 30,
                  border: "none",
                  background: "#BA7517",
                  color: "#FAEEDA",
                  fontWeight: 800,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                💳 Migrar para cartão — R$20/mês
              </button>
            </div>
          )}

        {/* Banner PIX expirado */}
        {pixExpirado && (
          <div
            style={{
              background: "#E6F1FB",
              border: "1px solid #85B7EB",
              borderRadius: 16,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>💙</span>
              <div>
                <p
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 800,
                    color: "#042C53",
                    margin: "0 0 4px",
                    lineHeight: 1.4,
                  }}
                >
                  O acesso de {filho?.nome?.split(" ")[0]} foi pausado.
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#185FA5",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Tudo que ele aprendeu está salvo, esperando por ele. Migre
                  para o cartão e garanta acesso automático todo mês — cancele
                  no Mercado Pago quando quiser, sem burocracia.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSecao("assinar")}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 30,
                border: "none",
                background: "#185FA5",
                color: "#E6F1FB",
                fontWeight: 800,
                fontSize: "0.88rem",
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              💳 Reativar com cartão — R$20/mês
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "visao", label: "Visão", icone: "📊" },
            { id: "missoes", label: "Missões", icone: "🤖" },
            { id: "relatorio", label: "Relatório", icone: "📋" },
            { id: "orientacao", label: "Família", icone: "💡" },
            { id: "config", label: "Config", icone: "⚙️" },
            { id: "assinar", label: "Assinar", icone: "🚀" },
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
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{aba.icone}</span>
              {aba.label}
            </button>
          ))}
        </div>

        {secao === "visao" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              animation: "fadeIn 0.3s ease",
            }}
          >
            {/* Card link acesso - TOPO */}
            <div
              style={{
                background: e
                  ? "linear-gradient(135deg,#0F2027,#1A3A4A)"
                  : "linear-gradient(135deg,#E8F8FF,#F0FFF8)",
                border: `2px solid ${c.azul}55`,
                borderRadius: 18,
                padding: "18px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  fontSize: "5rem",
                  opacity: 0.06,
                  pointerEvents: "none",
                }}
              >
                📱
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: "1.4rem" }}>📲</span>
                <div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 900,
                      color: c.azul,
                      margin: 0,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Acesso do seu filho
                  </p>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: c.textoSub,
                      margin: "2px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    Envie este link para{" "}
                    {filho?.nome?.split(" ")[0] || "seu filho"} acessar as
                    missões
                  </p>
                </div>
              </div>
              <div
                style={{
                  background: e ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  marginBottom: 12,
                }}
              >
                <p
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    color: e ? "#7DD3FC" : "#0369A1",
                    margin: "0 0 8px",
                  }}
                >
                  Como funciona?
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {[
                    {
                      n: "1",
                      txt: "Copie o link abaixo ou envie pelo WhatsApp",
                    },
                    {
                      n: "2",
                      txt: `${filho?.nome?.split(" ")[0] || "Seu filho"} abre o link no celular ou computador`,
                    },
                    {
                      n: "3",
                      txt: "As missões do dia já estarão esperando por ele!",
                    },
                  ].map(({ n, txt }) => (
                    <div
                      key={n}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          minWidth: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: c.azul,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.65rem",
                          fontWeight: 900,
                          flexShrink: 0,
                        }}
                      >
                        {n}
                      </div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: c.textoSub,
                          margin: 0,
                          lineHeight: 1.4,
                          fontWeight: 600,
                        }}
                      >
                        {txt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  background: c.card2,
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: "0.78rem",
                  color: c.textoSub,
                  fontFamily: "monospace",
                  marginBottom: 12,
                  wordBreak: "break-all",
                  border: `1px solid ${c.borda}`,
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
                  }}
                >
                  {linkCopiado ? "Copiado!" : "Copiar"}
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
                    fontWeight: 900,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Banner motivacional - filho inativo hoje */}
            {missoesHoje === 0 && totalMissoes === 0 && (
              <div
                style={{
                  background: e ? "rgba(0,212,170,0.08)" : "#F0FFF8",
                  border: `1.5px solid ${c.accent}33`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: "1.8rem" }}>👋</span>
                <div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      color: c.accent,
                      margin: 0,
                    }}
                  >
                    {filho?.nome?.split(" ")[0]} ainda não começou hoje!
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: c.textoSub,
                      margin: "2px 0 0",
                    }}
                  >
                    Envie o link agora e inicie a primeira missão do dia juntos.
                  </p>
                </div>
                <button
                  onClick={copiarLink}
                  style={{
                    marginLeft: "auto",
                    padding: "8px 12px",
                    background: c.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  Enviar link
                </button>
              </div>
            )}

            {/* Card do agente */}
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
                <div style={{ position: "relative" }}>
                  <div
                    onClick={() => setMostrarAvatares(!mostrarAvatares)}
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
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    {avatarFilho}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        background: c.accent,
                        borderRadius: "50%",
                        width: 18,
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.6rem",
                      }}
                    >
                      ✏️
                    </div>
                  </div>
                  {mostrarAvatares && (
                    <div
                      style={{
                        position: "absolute",
                        top: 64,
                        left: 0,
                        zIndex: 99,
                        background: c.card,
                        border: `1.5px solid ${c.borda}`,
                        borderRadius: 16,
                        padding: 12,
                        display: "grid",
                        gridTemplateColumns: "repeat(4,1fr)",
                        gap: 8,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                        width: 200,
                      }}
                    >
                      {[
                        "🧑‍🚀",
                        "🦸",
                        "🧙",
                        "🐉",
                        "🦊",
                        "🐼",
                        "🤖",
                        "👨‍💻",
                        "🧒",
                        "👧",
                        "🦁",
                        "🐯",
                        "🦋",
                        "🌟",
                        "⚡",
                        "🔥",
                      ].map((em) => (
                        <div
                          key={em}
                          onClick={async () => {
                            setAvatarFilho(em);
                            setMostrarAvatares(false);
                            try {
                              const { db } =
                                await import("../services/firebase");
                              const { doc, setDoc } =
                                await import("firebase/firestore");
                              await setDoc(
                                doc(db, "criancas", filho.id),
                                { avatar: em },
                                { merge: true },
                              );
                            } catch (_) {}
                          }}
                          style={{
                            fontSize: "1.5rem",
                            textAlign: "center",
                            cursor: "pointer",
                            padding: 4,
                            borderRadius: 8,
                            background:
                              avatarFilho === em
                                ? `${c.accent}22`
                                : "transparent",
                            border:
                              avatarFilho === em
                                ? `1.5px solid ${c.accent}`
                                : "1.5px solid transparent",
                          }}
                        >
                          {em}
                        </div>
                      ))}
                    </div>
                  )}
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
                    {(progresso?.diasAtivos?.length || 0) >= 2 ? `${progresso.diasAtivos.length}  dias seguidos! 🔥` : "Agente Ativo"}
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
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                }}
              >
                {[
                  { label: "Missões", valor: totalMissoes, icone: "🎯" },
                  { label: "Hoje", valor: missoesHoje, icone: "📅" },
                  {
                    label: "Dias ativos",
                    valor: progresso?.diasAtivos?.length || 0,
                    icone: "🔥",
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    style={{
                      background: c.card,
                      borderRadius: 14,
                      padding: "10px 8px",
                      textAlign: "center",
                      border: `1.5px solid ${c.borda}`,
                    }}
                  >
                    <div style={{ fontSize: "1.1rem", marginBottom: 3 }}>
                      {m.icone}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Fredoka', sans-serif",
                        fontSize: "1.3rem",
                        color: c.accent,
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      {m.valor}
                    </div>
                    <div
                      style={{
                        fontSize: "0.62rem",
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

            {totalMissoes > 0 && (
              <button
                onClick={compartilharOrgulhoWhatsApp}
                style={{
                  width: "100%", padding: "13px 16px", borderRadius: 14,
                  border: "none", background: "linear-gradient(135deg, #25D366, #128C7E)",
                  color: "#fff", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 14px rgba(37,211,102,0.35)",
                }}
              >
                📲 Compartilhar progresso com outro pai
              </button>
            )}

            {/* Missoes pendentes */}
            {(() => {
              const todasMissoes = Object.values(missoesPorDisc).flat();
              const pendentes = todasMissoes.filter((m) => !m.feita);
              const hoje = new Date().toLocaleDateString("pt-BR");
              const hojeStr = new Date().toLocaleDateString("pt-BR");
              const feitasHoje = todasMissoes.filter((m) => {
                if (!m.feita) return false;
                const dataMissao = m.criadoEm?.toDate
                  ? m.criadoEm.toDate().toLocaleDateString("pt-BR")
                  : m.criadoEm
                    ? new Date(m.criadoEm).toLocaleDateString("pt-BR")
                    : null;
                return dataMissao === hojeStr;
              });
              const sessoesOrdenadas = [
                ...(Array.isArray(sessoesQuiz) ? sessoesQuiz : []),
              ].sort((a, b) => {
                const dataA = a.criadoEm?.toDate
                  ? a.criadoEm.toDate().getTime()
                  : new Date(a.criadoEm).getTime();
                const dataB = b.criadoEm?.toDate
                  ? b.criadoEm.toDate().getTime()
                  : new Date(b.criadoEm).getTime();
                return dataB - dataA;
              });

              const media7 =
                sessoesOrdenadas.slice(0, 7).length > 0
                  ? Math.round(
                      sessoesOrdenadas
                        .slice(0, 7)
                        .reduce((a, s) => a + (s.percentual || 0), 0) /
                        sessoesOrdenadas.slice(0, 7).length,
                    )
                  : null;
              const media7ant =
                sessoesOrdenadas.slice(7, 14).length > 0
                  ? Math.round(
                      sessoesOrdenadas
                        .slice(7, 14)
                        .reduce((a, s) => a + (s.percentual || 0), 0) /
                        sessoesOrdenadas.slice(7, 14).length,
                    )
                  : null;
              const tendencia =
                media7 !== null && media7ant !== null
                  ? media7 > media7ant
                    ? "subindo"
                    : media7 < media7ant
                      ? "caindo"
                      : "estavel"
                  : null;

              return (
                <>
                  {/* Pendentes */}
                  <div
                    style={{
                      background: c.card,
                      border: `1.5px solid ${c.borda}`,
                      borderRadius: 16,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: `1.5px solid ${c.borda}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          color: c.textoSub,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          margin: 0,
                        }}
                      >
                        📋 Missões Pendentes
                      </p>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          color: "#F59E0B",
                          background: "#F59E0B15",
                          padding: "3px 10px",
                          borderRadius: 8,
                        }}
                      >
                        {pendentes.length} pendente
                        {pendentes.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {pendentes.length === 0 ? (
                      <div
                        style={{ padding: "20px 16px", textAlign: "center" }}
                      >
                        {totalMissoes === 0 ? (
                          <>
                            <p
                              style={{ fontSize: "1.5rem", margin: "0 0 6px" }}
                            >
                              📋
                            </p>
                            <p
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color: c.texto,
                                margin: "0 0 4px",
                              }}
                            >
                              Nenhuma missão gerada ainda.
                            </p>
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: c.textoSub,
                                margin: "0 0 12px",
                              }}
                            >
                              Vá na aba Missões e gere a primeira missão do dia
                              para seu filho.
                            </p>
                            <button
                              onClick={() => setSecao("missoes")}
                              style={{
                                padding: "9px 18px",
                                borderRadius: 10,
                                border: "none",
                                background: c.accent,
                                color: "#fff",
                                fontWeight: 800,
                                fontSize: "0.82rem",
                                cursor: "pointer",
                                fontFamily: "'Nunito', sans-serif",
                              }}
                            >
                              Ir para Missões →
                            </button>
                          </>
                        ) : (
                          <>
                            <p
                              style={{ fontSize: "1.5rem", margin: "0 0 6px" }}
                            >
                              🎉
                            </p>
                            <p
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color: c.texto,
                                margin: "0 0 4px",
                              }}
                            >
                              Tudo em dia!
                            </p>
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: c.textoSub,
                                margin: 0,
                              }}
                            >
                              Todas as missões foram concluídas.
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      pendentes.map((m, i) => {
                        const d = DISCIPLINAS.find(
                          (dd) => dd.id === m.disciplina,
                        );
                        return (
                          <div
                            key={m.id || i}
                            style={{
                              padding: "12px 16px",
                              borderBottom:
                                i < pendentes.length - 1
                                  ? `1px solid ${c.borda}`
                                  : "none",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <span style={{ fontSize: "1.2rem" }}>
                              {d?.icone || "📚"}
                            </span>
                            <div style={{ flex: 1 }}>
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  fontWeight: 800,
                                  color: c.texto,
                                  margin: 0,
                                }}
                              >
                                {m.titulo || d?.label}
                              </p>
                              <p
                                style={{
                                  fontSize: "0.72rem",
                                  color: d?.cor || c.textoSub,
                                  margin: 0,
                                  fontWeight: 700,
                                }}
                              >
                                {d?.label}
                              </p>
                            </div>
                            <span
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 800,
                                color: "#F59E0B",
                                background: "#F59E0B15",
                                padding: "3px 8px",
                                borderRadius: 6,
                              }}
                            >
                              ⏳ Pendente
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Feitas hoje */}
                  <div
                    style={{
                      background: c.card,
                      border: `1.5px solid ${c.borda}`,
                      borderRadius: 16,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: `1.5px solid ${c.borda}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          color: c.textoSub,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          margin: 0,
                        }}
                      >
                        ✅ Feitas Hoje
                      </p>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          color: "#00D4AA",
                          background: "#00D4AA15",
                          padding: "3px 10px",
                          borderRadius: 8,
                        }}
                      >
                        {feitasHoje.length}{" "}
                        {feitasHoje.length === 1 ? "missão" : "missões"}
                      </span>
                    </div>
                    {feitasHoje.length === 0 ? (
                      <div
                        style={{ padding: "20px 16px", textAlign: "center" }}
                      >
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: c.textoSub,
                            margin: 0,
                          }}
                        >
                          Nenhuma missão concluída hoje ainda.
                        </p>
                      </div>
                    ) : (
                      feitasHoje.map((s, i) => {
                        const d = DISCIPLINAS.find(
                          (dd) => dd.id === s.disciplina,
                        );
                        const aprovado = (s.percentual || 0) >= 70;
                        return (
                          <div
                            key={s.id || i}
                            style={{
                              padding: "12px 16px",
                              borderBottom:
                                i < feitasHoje.length - 1
                                  ? `1px solid ${c.borda}`
                                  : "none",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <span style={{ fontSize: "1.2rem" }}>
                              {d?.icone || "📚"}
                            </span>
                            <div style={{ flex: 1 }}>
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  fontWeight: 800,
                                  color: c.texto,
                                  margin: 0,
                                }}
                              >
                                {s.tituloMissao || d?.label}
                              </p>
                              <p
                                style={{
                                  fontSize: "0.72rem",
                                  color: d?.cor || c.textoSub,
                                  margin: 0,
                                  fontWeight: 700,
                                }}
                              >
                                {d?.label}
                              </p>
                            </div>
                            {s.percentual !== undefined &&
                            s.percentual !== null ? (
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: 800,
                                  color: aprovado ? "#00D4AA" : "#F59E0B",
                                  background: aprovado
                                    ? "#00D4AA15"
                                    : "#F59E0B15",
                                  padding: "3px 10px",
                                  borderRadius: 8,
                                }}
                              >
                                {s.percentual}%
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: 800,
                                  color: "#00D4AA",
                                  background: "#00D4AA15",
                                  padding: "3px 10px",
                                  borderRadius: 8,
                                }}
                              >
                                ✅ Concluída
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Tendencia 7 dias */}
                  {media7 !== null && (
                    <div
                      style={{
                        background: c.card,
                        border: `1.5px solid ${c.borda}`,
                        borderRadius: 16,
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div style={{ fontSize: "1.8rem" }}>
                        {tendencia === "subindo"
                          ? "📈"
                          : tendencia === "caindo"
                            ? "📉"
                            : "➡️"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            color: c.textoSub,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            margin: "0 0 2px",
                          }}
                        >
                          Tendência — últimos 7 dias
                        </p>
                        <p
                          style={{
                            fontSize: "0.88rem",
                            fontWeight: 700,
                            color: c.texto,
                            margin: 0,
                          }}
                        >
                          Média de{" "}
                          <span
                            style={{
                              color:
                                tendencia === "subindo"
                                  ? "#00D4AA"
                                  : tendencia === "caindo"
                                    ? "#EF4444"
                                    : c.accent,
                              fontWeight: 900,
                            }}
                          >
                            {media7}%
                          </span>
                          {tendencia === "subindo" && (
                            <span style={{ color: "#00D4AA" }}>
                              {" "}
                              — evoluindo ↑
                            </span>
                          )}
                          {tendencia === "caindo" && (
                            <span style={{ color: "#EF4444" }}>
                              {" "}
                              — precisa de atenção ↓
                            </span>
                          )}
                          {tendencia === "estavel" && (
                            <span style={{ color: c.textoSub }}>
                              {" "}
                              — estável
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            <div
              style={{
                background: carregandoMsg
                  ? c.card
                  : `linear-gradient(135deg, ${corNivel}12, ${corNivel}06)`,
                border: `2px solid ${corNivel}33`,
                borderRadius: 18,
                padding: "16px 18px",
                minHeight: 80,
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "all 0.5s",
              }}
            >
              {carregandoMsg ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.6rem",
                      animation: "pulsar 1.5s ease-in-out infinite",
                    }}
                  >
                    🧠
                  </div>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: c.textoSub,
                      margin: 0,
                      fontStyle: "italic",
                    }}
                  >
                    Analisando o desenvolvimento de {filho?.nome?.split(" ")[0]}
                    ...
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>
                    {emojiNivel}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        color: corNivel,
                        margin: "0 0 4px",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {nivelDesempenho === "otimo"
                        ? "Ótimo desempenho"
                        : nivelDesempenho === "bom"
                          ? "Em desenvolvimento"
                          : nivelDesempenho === "ruim"
                            ? "Precisa de atenção"
                            : "Acompanhamento pedagógico"}
                    </p>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: c.texto,
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {mensagemIA ||
                        "Acompanhe o desenvolvimento do seu filho e converse com ele sobre o que aprendeu hoje."}
                    </p>
                  </div>
                </>
              )}
            </div>

            {ultimaSessao ? (
              <div
                style={{
                  background: c.card,
                  border: `2px solid ${discUltima?.cor || c.accent}44`,
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
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
                </div>
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
                    💬 Conversa do dia com {filho?.nome?.split(" ")[0]}
                  </p>
                  {(() => {
                    const sessao = ultimasSessoes[0];
                    if (!sessao) return null;
                    const discSessao = DISCIPLINAS.find(d => d.id === sessao.disciplina);
                    const pergsSessao = PERGUNTAS_PAI[sessao.disciplina] || [];
                    const perguntas = perguntasIA.length > 0 ? perguntasIA : pergsSessao;
                    const perguntaEscolhida = perguntas[0] || null;
                    if (!perguntaEscolhida) return null;
                    return (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                          <span style={{ fontSize: "1rem" }}>{discSessao?.icone || "📚"}</span>
                          <span style={{ fontSize: "0.78rem", fontWeight: 800, color: discSessao?.cor || c.accent }}>
                            {sessao.tituloMissao || discSessao?.label}
                          </span>
                          <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: c.textoSub }}>
                            {sessao.percentual}% acertos
                          </span>
                        </div>
                        <div style={{
                          padding: "14px 16px", background: e ? "rgba(0,212,170,0.06)" : "#F0FFF8",
                          borderRadius: 12, border: `1.5px solid ${c.accent}33`, position: "relative",
                        }}>
                          <span style={{
                            position: "absolute", top: -10, left: 14, background: c.accent, color: "#fff",
                            fontSize: "0.62rem", fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                          }}>
                            PERGUNTA DO DIA
                          </span>
                          <p style={{ fontSize: "0.88rem", color: c.texto, margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
                            "{perguntaEscolhida}"
                          </p>
                        </div>
                      </div>
                    );
                  })()}
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
                  Quando {filho?.nome?.split(" ")[0]} concluir uma missão, você
                  verá aqui o que ele estudou.
                </p>
              </div>
            )}

            <div style={{
              background: e ? "linear-gradient(135deg, #0D1F2D, #0A1F1A)" : "linear-gradient(135deg, #F0FFF8, #E8F4FF)",
              border: `1.5px solid ${c.accent}33`, borderRadius: 18, overflow: "hidden",
            }}>
              <div style={{ padding: "16px 18px", borderBottom: `1px solid ${c.accent}22` }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 800, color: c.accent, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>
                  Após cada missão concluída
                </p>
                <p style={{ fontSize: "0.88rem", fontWeight: 700, color: c.texto, margin: 0, lineHeight: 1.4 }}>
                  {filho?.nome?.split(" ")[0]} encontra 3 recursos para ir mais fundo no que aprendeu 📚
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  { icone: "🤖", titulo: "Assistente de dúvidas", desc: "IA especializada no assunto — ele pergunta do jeito dele, sem julgamento.", cor: c.accent },
                  { icone: "🎬", titulo: "Vídeos selecionados", desc: "Links para vídeos educacionais sobre o tema — filtrados, geralmente sem propagandas.", cor: "#FF4444" },
                  { icone: premio && premio.length > 0 ? "🏆" : "🎁", titulo: premio && premio.length > 0 ? "Premiação combinada" : "Premiação opcional", desc: premio && premio.length > 0 ? "O prêmio que você combinou aparece como motivação extra após a missão." : "Defina uma premiação em Configurações. Aparece como surpresa após a missão.", cor: "#F59E0B" },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px",
                    borderBottom: i < 2 ? `1px solid ${c.borda}` : "none",
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                      background: `${item.cor}18`, border: `1.5px solid ${item.cor}33`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
                    }}>{item.icone}</div>
                    <div>
                      <p style={{ fontSize: "0.82rem", fontWeight: 800, color: c.texto, margin: "0 0 3px" }}>{item.titulo}</p>
                      <p style={{ fontSize: "0.72rem", color: c.textoSub, margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {(!premio || premio.length === 0) && (
                <div style={{ padding: "12px 18px", borderTop: `1px solid ${c.borda}` }}>
                  <button onClick={() => setSecao("config")} style={{
                    width: "100%", padding: "10px", borderRadius: 10,
                    border: `1.5px solid #F59E0B44`,
                    background: e ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.06)",
                    color: "#F59E0B", fontWeight: 800, fontSize: "0.8rem",
                    cursor: "pointer", fontFamily: "'Nunito', sans-serif",
                  }}>
                    Definir premiação para {filho?.nome?.split(" ")[0]}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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
                    onClick={async () => {
                      setConfig({ ...config, serie: s.id });
                      localStorage.setItem("eduplay_config_serie", s.id);
                      try {
                        const { db } = await import("../services/firebase");
                        const { doc, setDoc } =
                          await import("firebase/firestore");
                        await setDoc(
                          doc(db, "responsaveis", userPai.uid),
                          { serie: s.id },
                          { merge: true },
                        );
                      } catch (_) {}
                    }}
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
                    onClick={async () => {
                      setConfig({ ...config, bimestre: b.id });
                      localStorage.setItem("eduplay_config_bimestre", b.id);
                      try {
                        const { db } = await import("../services/firebase");
                        const { doc, setDoc } =
                          await import("firebase/firestore");
                        await setDoc(
                          doc(db, "responsaveis", userPai.uid),
                          { bimestre: b.id },
                          { merge: true },
                        );
                      } catch (_) {}
                    }}
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
                    : `${limiteMissoes - missoesHoje} missões disponíveis hoje`}
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
                {Array.from({ length: limiteMissoes }, (_, i) => i).map((i) => (
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
                    }}
                  />
                ))}
              </div>
            </div>
            {gerando && (
              <div
                ref={gerandoRef}
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
                  }}
                >
                  {FRASES_LOADING[fraseLoading]}
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
              </div>
            )}
            {/* Lista de missoes ja geradas */}
            {Object.values(missoesPorDisc).flat().length > 0 && (
              <div
                style={{
                  background: c.card,
                  border: `1.5px solid ${c.borda}`,
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: `1.5px solid ${c.borda}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: c.textoSub,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      margin: 0,
                    }}
                  >
                    📚 Missões —{" "}
                    {SERIES.find((s) => s.id === config.serie)?.label}{" "}
                    {BIMESTRES.find((b) => b.id === config.bimestre)?.label}
                  </p>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      color: c.accent,
                      background: `${c.accent}15`,
                      padding: "3px 10px",
                      borderRadius: 8,
                    }}
                  >
                    {Object.values(missoesPorDisc).flat().length} missões
                  </span>
                </div>
                {DISCIPLINAS.map((d) => {
                  const lista = missoesPorDisc[d.id] || [];
                  if (lista.length === 0) return null;
                  return (
                    <div key={d.id}>
                      <div
                        style={{
                          padding: "10px 16px",
                          background: `${d.cor}10`,
                          borderBottom: `1px solid ${c.borda}`,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: "1rem" }}>{d.icone}</span>
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 800,
                            color: d.cor,
                          }}
                        >
                          {d.label}
                        </span>
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "0.7rem",
                            color: c.textoSub,
                            fontWeight: 700,
                          }}
                        >
                          {lista.length}{" "}
                          {lista.length === 1 ? "missão" : "missões"}
                        </span>
                      </div>
                      <style>{`details[open] .seta-missao{transform:rotate(90deg)}`}</style>
                      {lista.map((m, i) => (
                        <details
                          key={m.id || i}
                          style={{
                            borderBottom:
                              i < lista.length - 1
                                ? `1px solid ${c.borda}`
                                : "none",
                          }}
                        >
                          <summary
                            style={{
                              padding: "12px 16px",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              cursor: "pointer",
                              listStyle: "none",
                            }}
                          >
                            <span
                              className="seta-missao"
                              style={{
                                fontSize: "0.7rem",
                                color: c.textoSub,
                                transition: "transform 0.25s",
                                flexShrink: 0,
                              }}
                            >
                              ▶
                            </span>
                            <p
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: 800,
                                color: c.texto,
                                margin: 0,
                                lineHeight: 1.3,
                                flex: 1,
                              }}
                            >
                              {m.titulo || "Missão sem título"}
                            </p>
                            <span
                              style={{
                                fontSize: "0.62rem",
                                color: c.textoSub,
                                fontWeight: 600,
                                flexShrink: 0,
                              }}
                            >
                              {m.criadoEm?.toDate
                                ? m.criadoEm
                                    .toDate()
                                    .toLocaleDateString("pt-BR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                    })
                                : ""}
                            </span>
                            <span
                              style={{
                                fontSize: "0.65rem",
                                fontWeight: 800,
                                padding: "3px 8px",
                                borderRadius: 6,
                                flexShrink: 0,
                                color: m.feita ? "#2E8B57" : "#F59E0B",
                                background: m.feita ? "#2E8B5715" : "#F59E0B15",
                              }}
                            >
                              {m.feita ? "✅" : "⏳"}
                            </span>
                          </summary>
                          <div
                            style={{
                              padding: "0 16px 12px 38px",
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                            }}
                          >
                            {m.perguntaCentral && (
                              <p
                                style={{
                                  fontSize: "0.78rem",
                                  color: d.cor,
                                  fontWeight: 700,
                                  margin: 0,
                                  fontStyle: "italic",
                                }}
                              >
                                "{m.perguntaCentral}"
                              </p>
                            )}
                            {Array.isArray(m.topicos) &&
                              m.topicos.length > 0 && (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 3,
                                  }}
                                >
                                  {m.topicos.slice(0, 3).map((t, ti) => (
                                    <div
                                      key={ti}
                                      style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 6,
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontSize: "0.65rem",
                                          color: d.cor,
                                          fontWeight: 800,
                                          flexShrink: 0,
                                        }}
                                      >
                                        •
                                      </span>
                                      <span
                                        style={{
                                          fontSize: "0.72rem",
                                          color: c.textoSub,
                                          fontWeight: 600,
                                          lineHeight: 1.4,
                                        }}
                                      >
                                        {typeof t === "object"
                                          ? t.nome || t.descricao || ""
                                          : t}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            <p
                              style={{
                                fontSize: "0.68rem",
                                color: c.textoSub,
                                margin: 0,
                              }}
                            >
                              {m.feita ? "✅ Concluída em" : "⏳ Criada em"}{" "}
                              {m.criadoEm?.toDate
                                ? m.criadoEm
                                    .toDate()
                                    .toLocaleDateString("pt-BR")
                                : "—"}
                            </p>
                          </div>
                        </details>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Botoes de gerar */}
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
                            ? `${total} missões — gerar mais`
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

        {secao === "relatorio" && (
          <RelatorioTab
            key={secao}
            c={c}
            e={e}
            filho={filho}
            getMissoesConcluidas={getMissoesConcluidas}
            getProgresso={getProgresso}
          />
        )}
        {secao === "orientacao" && <OrientacaoTab c={c} e={e} />}

        {secao === "assinar" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              animation: "fadeIn 0.3s ease",
            }}
          >
            {/* Badge */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#E1F5EE",
                  color: "#085041",
                  border: "0.5px solid #5DCAA5",
                  borderRadius: 20,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "4px 14px",
                }}
              >
                🚀 plano mensal — R$20/mês
              </div>
            </div>

            {/* Hero */}
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: c.texto,
                  lineHeight: 1.4,
                  margin: "0 0 8px",
                }}
              >
                Seu filho provou que consegue.
                <br />
                Agora é a sua vez.
              </p>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: c.textoSub,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Garanta o acesso completo e acompanhe cada passo do
                desenvolvimento dele.
              </p>
            </div>

            {/* Card compacto pagamento — topo */}
            <CardAssinaturaCompacto
              c={c}
              e={e}
              filho={filho}
              functions={functions}
              userPai={userPai}
            />

            {/* Frases rotativas */}
            {/* Frases rotativas */}
            <div
              style={{
                background: c.card,
                border: `0.5px solid ${c.borda}`,
                borderRadius: 16,
                padding: 20,
                minHeight: 88,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <p
                key={frasesIdx}
                style={{
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  color: c.texto,
                  lineHeight: 1.6,
                  margin: 0,
                  animation: "fadeIn 0.5s ease",
                }}
              >
                {FRASES_ASSINAR[frasesIdx].t}
                <span style={{ color: "#0F6E56" }}>
                  {FRASES_ASSINAR[frasesIdx].accent}
                </span>
                {FRASES_ASSINAR[frasesIdx].end}
              </p>
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
              {FRASES_ASSINAR.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setFrasesIdx(i)}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: i === frasesIdx ? "#0F6E56" : c.borda,
                    transform: i === frasesIdx ? "scale(1.4)" : "scale(1)",
                    transition: "all 0.3s",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>

            {/* Preco */}
            <div
              style={{
                background: c.card,
                border: "2px solid #5DCAA5",
                borderRadius: 16,
                padding: "24px 20px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "0.72rem",
                  color: c.textoSub,
                  letterSpacing: 1,
                  margin: "0 0 8px",
                }}
              >
                PLANO MENSAL
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 4,
                  justifyContent: "center",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#0F6E56",
                  }}
                >
                  R$
                </span>
                <span
                  style={{
                    fontSize: "3.2rem",
                    fontWeight: 900,
                    color: "#0F6E56",
                    lineHeight: 1,
                  }}
                >
                  20
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#0F6E56",
                  }}
                >
                  /mês
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: c.textoSub,
                  margin: "6px 0 12px",
                }}
              >
                Menos que R$1 por dia
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                {[
                  "✓ Cancele quando quiser",
                  "✓ Sem fidelidade",
                  "✓ Acesso imediato",
                ].map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: "0.72rem",
                      color: "#0F6E56",
                      fontWeight: 700,
                    }}
                  >
                    {typeof t === "object" ? t.nome || t.descricao || "" : t}
                  </span>
                ))}
              </div>
            </div>

            {/* Beneficios */}
            <div
              style={{
                background: c.card,
                border: `0.5px solid ${c.borda}`,
                borderRadius: 16,
                padding: 20,
              }}
            >
              <p
                style={{
                  fontSize: "0.72rem",
                  color: c.textoSub,
                  letterSpacing: 1,
                  margin: "0 0 16px",
                  textTransform: "uppercase",
                }}
              >
                O que está incluído
              </p>
              {[
                {
                  icone: "🏫",
                  titulo: "Professor particular no celular",
                  sub: "Missões diárias alinhadas ao currículo da escola — sem precisar sair de casa.",
                },
                {
                  icone: "📱",
                  titulo: "O controle nas suas mãos",
                  sub: "Você acompanha tudo — matérias, acertos, progresso e dias de estudo.",
                },
                {
                  icone: "🧠",
                  titulo: "Orientador educacional no seu celular",
                  sub: "Tire dúvidas sobre rotina, comportamento e aprendizado — a qualquer hora.",
                },
                {
                  icone: "🏆",
                  titulo: "Preparação para ETEC, IFSP e colégios federais",
                  sub: "Uma vaga na ETEC custa zero reais. O preparo custa R$20/mês.",
                },
                {
                  icone: "📊",
                  titulo: "Relatório completo de progresso",
                  sub: "Veja exatamente o que seu filho aprendeu, com histórico e PDF para guardar.",
                },
                {
                  icone: "🔄",
                  titulo: "Missões únicas, nunca repetidas",
                  sub: "A IA cria atividades diferentes a cada vez — sempre alinhadas ao currículo.",
                },
              ].map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: i < 5 ? 14 : 0,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      minWidth: 40,
                      borderRadius: 10,
                      background: "#E1F5EE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                    }}
                  >
                    {b.icone}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 800,
                        color: c.texto,
                        margin: "0 0 2px",
                      }}
                    >
                      {b.titulo}
                    </p>
                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: c.textoSub,
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {b.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Urgencia */}
            <div
              style={{
                background: "#E1F5EE",
                border: "0.5px solid #5DCAA5",
                borderRadius: 16,
                padding: 16,
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>⏰</span>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  color: "#085041",
                  lineHeight: 1.5,
                  fontWeight: 600,
                }}
              >
                Enquanto outros pais pagam{" "}
                <strong style={{ color: "#0F6E56" }}>
                  R$400/mês em cursinho
                </strong>
                , você investe menos de R$1 por dia com o mesmo resultado
                pedagógico.
              </p>
            </div>

            {/* Depoimentos expansiveis */}
            <div
              style={{
                background: c.card,
                border: `0.5px solid ${c.borda}`,
                borderRadius: 16,
                padding: 20,
              }}
            >
              <p
                style={{
                  fontSize: "0.72rem",
                  color: c.textoSub,
                  letterSpacing: 1,
                  margin: "0 0 14px",
                  textTransform: "uppercase",
                }}
              >
                O que os pais dizem
              </p>
              {[
                {
                  txt: "Meu filho nao percebe que esta aprendendo. Acha que esta so jogando. Pra mim tanto faz — o que importa e que ele para de reclamar quando chega a hora de estudar.",
                  nome: "Marcos Andrade",
                  detalhe: "Pai de aluno do 7º ano",
                },
                {
                  txt: "Minha filha chegava da escola e jogava o caderno no canto. Hoje ela abre o app sozinha antes de eu pedir. Ainda nao acredito que foi tao rapido.",
                  nome: "Rosana Oliveira",
                  detalhe: "Mae de aluna do 6º ano",
                },
                {
                  txt: "Menos que uma pizza por mes. E o impacto e de professor particular, todos os dias.",
                  nome: "Patricia Lima",
                  detalhe: "Mae de aluno do 8º ano",
                },
                {
                  txt: "Meu filho me falou que as missoes parecem um jogo. Pra mim tanto faz, o que importa e que ele para de reclamar quando chega a hora de estudar.",
                  nome: "Camila Ferreira",
                  detalhe: "Mae de aluno do 6º ano",
                },
              ].map((d, i) => (
                <DepoimentoCard key={i} d={d} i={i} c={c} e={e} />
              ))}
            </div>

            {/* Botoes de pagamento */}
            <button
              onClick={() => {
                const fn = httpsCallable(functions, "criarAssinatura");
                fn({
                  codigoAcesso: filho?.id,
                  emailResponsavel: userPai?.email,
                  nomeResponsavel: userPai?.displayName || "Responsavel",
                }).then((r) => {
                  if (r.data?.checkoutUrl)
                    window.open(r.data.checkoutUrl, "_blank");
                });
              }}
              style={{
                width: "100%",
                padding: 16,
                borderRadius: 30,
                border: "none",
                background: "#0F6E56",
                color: "#E1F5EE",
                fontSize: "1rem",
                fontWeight: 900,
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
                letterSpacing: 0.5,
              }}
            >
              🚀 Garantir acesso agora — R$20/mês
            </button>
            <p
              style={{
                fontSize: "0.7rem",
                color: c.textoSub,
                textAlign: "center",
                margin: 0,
              }}
            >
              🔒 Pagamento seguro via Mercado Pago • Cancele quando quiser
            </p>

            {/* Contato */}
            <div
              style={{
                borderTop: `0.5px solid ${c.borda}`,
                paddingTop: 16,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "0.78rem",
                  color: c.textoSub,
                  margin: "0 0 10px",
                  lineHeight: 1.5,
                }}
              >
                Dúvidas, sugestões ou precisa de ajuda?
                <br />
                Nossa equipe responde em até 24h.
              </p>
              <a
                href="mailto:contato@olloapp.com.br?subject=Dúvida%20EduPlay&body=Olá%2C%20tenho%20uma%20dúvida%20sobre%20o%20EduPlay%3A%0A%0A"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "13px 16px",
                  borderRadius: 14,
                  border: `0.5px solid ${c.borda}`,
                  background: "transparent",
                  color: c.textoSub,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                ✉️ Falar com a equipe — contato@olloapp.com.br
              </a>
            </div>
          </div>
        )}

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
                ⏱️ Rotina do Filho
              </p>

              {/* Dials — Tempo e Missoes */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    background: e ? "rgba(255,255,255,0.04)" : "#F8FBFF",
                    border: `1px solid ${c.borda}`,
                    borderRadius: 14,
                    padding: "16px 12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.65rem",
                      color: c.textoSub,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    Tempo/dia
                  </p>
                  <div
                    style={{ position: "relative", width: 120, height: 120 }}
                  >
                    <svg
                      width="120"
                      height="120"
                      viewBox="0 0 120 120"
                      style={{ position: "absolute", top: 0, left: 0 }}
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="46"
                        fill="none"
                        stroke={e ? "#1A3347" : "#EEF2F7"}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="242"
                        strokeDashoffset="0"
                        transform="rotate(135 60 60)"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="46"
                        fill="none"
                        stroke="#00D4AA"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="242"
                        strokeDashoffset={Math.round(
                          242 - ((config.tempoEstudo - 30) / 90) * 242,
                        )}
                        transform="rotate(135 60 60)"
                        style={{ transition: "stroke-dashoffset 0.3s ease" }}
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%,-50%)",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.4rem",
                          fontWeight: 900,
                          color: c.accent,
                          lineHeight: 1,
                        }}
                      >
                        {config.tempoEstudo}
                      </div>
                      <div
                        style={{
                          fontSize: "0.6rem",
                          color: c.textoSub,
                          marginTop: 2,
                        }}
                      >
                        min
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={async () => {
                        const novo = Math.max(30, config.tempoEstudo - 15);
                        setConfig((p) => ({ ...p, tempoEstudo: novo }));
                        try {
                          const { db } = await import("../services/firebase");
                          const { doc, setDoc } =
                            await import("firebase/firestore");
                          await setDoc(
                            doc(db, "responsaveis", userPai.uid),
                            { tempoEstudo: novo },
                            { merge: true },
                          );
                        } catch (_) {}
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: `1px solid ${c.borda}`,
                        background: "transparent",
                        color: c.texto,
                        fontSize: "1.1rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      −
                    </button>
                    <button
                      onClick={async () => {
                        const novo = Math.min(120, config.tempoEstudo + 15);
                        setConfig((p) => ({ ...p, tempoEstudo: novo }));
                        try {
                          const { db } = await import("../services/firebase");
                          const { doc, setDoc } =
                            await import("firebase/firestore");
                          await setDoc(
                            doc(db, "responsaveis", userPai.uid),
                            { tempoEstudo: novo },
                            { merge: true },
                          );
                        } catch (_) {}
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: `1px solid ${c.borda}`,
                        background: "transparent",
                        color: c.texto,
                        fontSize: "1.1rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    background: e ? "rgba(255,255,255,0.04)" : "#F8FBFF",
                    border: `1px solid ${c.borda}`,
                    borderRadius: 14,
                    padding: "16px 12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.65rem",
                      color: c.textoSub,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    Missões/dia
                  </p>
                  <div
                    style={{ position: "relative", width: 120, height: 120 }}
                  >
                    <svg
                      width="120"
                      height="120"
                      viewBox="0 0 120 120"
                      style={{ position: "absolute", top: 0, left: 0 }}
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="46"
                        fill="none"
                        stroke={e ? "#1A3347" : "#EEF2F7"}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="242"
                        strokeDashoffset="0"
                        transform="rotate(135 60 60)"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="46"
                        fill="none"
                        stroke="#5DCAA5"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="242"
                        strokeDashoffset={Math.round(
                          242 - ((limiteMissoes - 3) / 4) * 242,
                        )}
                        transform="rotate(135 60 60)"
                        style={{ transition: "stroke-dashoffset 0.3s ease" }}
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%,-50%)",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.4rem",
                          fontWeight: 900,
                          color: "#5DCAA5",
                          lineHeight: 1,
                        }}
                      >
                        {limiteMissoes}
                      </div>
                      <div
                        style={{
                          fontSize: "0.6rem",
                          color: c.textoSub,
                          marginTop: 2,
                        }}
                      >
                        missões
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={async () => {
                        const novo = Math.max(3, limiteMissoes - 1);
                        setLimiteMissoes(novo);
                        try {
                          const { db } = await import("../services/firebase");
                          const { doc, setDoc } =
                            await import("firebase/firestore");
                          await setDoc(
                            doc(db, "responsaveis", userPai.uid),
                            { limiteMissoes: novo },
                            { merge: true },
                          );
                        } catch (_) {}
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: `1px solid ${c.borda}`,
                        background: "transparent",
                        color: c.texto,
                        fontSize: "1.1rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      −
                    </button>
                    <button
                      onClick={async () => {
                        const novo = Math.min(7, limiteMissoes + 1);
                        setLimiteMissoes(novo);
                        try {
                          const { db } = await import("../services/firebase");
                          const { doc, setDoc } =
                            await import("firebase/firestore");
                          await setDoc(
                            doc(db, "responsaveis", userPai.uid),
                            { limiteMissoes: novo },
                            { merge: true },
                          );
                        } catch (_) {}
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: `1px solid ${c.borda}`,
                        background: "transparent",
                        color: c.texto,
                        fontSize: "1.1rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: e
                    ? "rgba(0,212,170,0.06)"
                    : "rgba(0,212,170,0.05)",
                  border: `1px solid ${c.accent}22`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.9rem" }}>🗓️</span>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: c.texto,
                      fontWeight: 700,
                    }}
                  >
                    {config.tempoEstudo} min/dia · {limiteMissoes} missões · ~
                    {Math.round(config.tempoEstudo / limiteMissoes)} min cada
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.9rem" }}>📅</span>
                  <span style={{ fontSize: "0.75rem", color: c.textoSub }}>
                    5 dias úteis = {limiteMissoes * 5} missões/semana · ~
                    {limiteMissoes * 20} missões/mês
                  </span>
                </div>
              </div>
            </div>
            {/* Toggle missoes automaticas */}
            <div
              style={{
                background: c.card,
                border: `1.5px solid ${c.borda}`,
                borderRadius: 16,
                padding: "18px 18px",
              }}
            >
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: c.textoSub,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  margin: "0 0 14px",
                }}
              >
                🤖 Missões Automáticas
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 800,
                      color: c.texto,
                      margin: "0 0 4px",
                    }}
                  >
                    Gerar missões automaticamente
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: c.textoSub,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    Se você não gerar missões, o sistema cria automaticamente
                    toda manhã de dias úteis.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const novo = !autoMissoes;
                    setAutoMissoes(novo);
                    try {
                      const { db } = await import("../services/firebase");
                      const { doc, setDoc } =
                        await import("firebase/firestore");
                      await setDoc(
                        doc(db, "responsaveis", userPai.uid),
                        { autoMissoes: novo },
                        { merge: true },
                      );
                    } catch (_) {}
                  }}
                  style={{
                    width: 50,
                    height: 28,
                    borderRadius: 14,
                    border: "none",
                    background: autoMissoes ? "#0F6E56" : c.borda,
                    cursor: "pointer",
                    position: "relative",
                    flexShrink: 0,
                    transition: "background 0.25s",
                  }}
                  aria-label="ativar missões automáticas"
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 4,
                      left: autoMissoes ? 26 : 4,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left 0.25s",
                    }}
                  />
                </button>
              </div>
              <div
                style={{
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: "0.78rem",
                  lineHeight: 1.6,
                  fontWeight: 600,
                  background: autoMissoes
                    ? "#E1F5EE"
                    : e
                      ? "rgba(255,255,255,0.04)"
                      : "#F8FBFF",
                  color: autoMissoes ? "#085041" : c.textoSub,
                  border: `1px solid ${autoMissoes ? "#5DCAA5" : c.borda}`,
                  transition: "all 0.3s",
                }}
              >
                {autoMissoes
                  ? "✅ Ativado — Todo dia útil às 7h o sistema gera missões automaticamente para seu filho."
                  : "⏸️ Desativado — Você gera as missões manualmente pela aba Missões."}
              </div>
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

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <p
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    color: e ? "#A0B8C8" : "#8A6D3B",
                    margin: 0,
                  }}
                >
                  HABILITAR PREMIAÇÃO
                </p>
                <input
                  type="checkbox"
                  checked={premio.length > 0}
                  onChange={(ev) =>
                    setPremio(ev.target.checked ? "Semanal| " : "")
                  }
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                    accentColor: "#00D4AA",
                  }}
                />
              </div>

              {premio.length > 0 && (
                <div style={{ marginBottom: "14px" }}>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: e ? "#A0B8C8" : "#8A6D3B",
                      margin: "0 0 8px",
                    }}
                  >
                    Frequência da Meta:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {["Semanal", "Quinzenal", "Mensal", "Bimestral"].map(
                      (f) => {
                        const atual = premio.includes("|")
                          ? premio.split("|")[0]
                          : "Semanal";
                        const rotulos = {
                          Semanal: "Semanal",
                          Quinzenal: "Quinzenal",
                          Mensal: "Fim do mês",
                          Bimestral: "Fim do bimestre",
                        };
                        const sel = atual === f;
                        return (
                          <button
                            key={f}
                            onClick={() => {
                              const textoAtual = premio.includes("|")
                                ? premio.split("|")[1]
                                : premio;
                              setPremio(f + "|" + textoAtual);
                            }}
                            style={{
                              flex: "1 1 calc(50% - 8px)",
                              minWidth: 120,
                              padding: "11px 8px",
                              borderRadius: 12,
                              border: `2px solid ${sel ? "#00D4AA" : e ? "#334155" : "#E2E8F0"}`,
                              background: sel ? "#00D4AA18" : "transparent",
                              color: sel
                                ? "#00D4AA"
                                : e
                                  ? "#A0B8C8"
                                  : "#64748B",
                              fontWeight: 800,
                              fontSize: "0.8rem",
                              cursor: "pointer",
                              fontFamily: "'Nunito', sans-serif",
                              transition: "all 0.15s",
                            }}
                          >
                            {sel ? "✓ " : ""}
                            {rotulos[f]}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

              <p
                style={{
                  fontSize: "0.75rem",
                  color: e ? "#A0B8C8" : "#8A6D3B",
                  margin: "0 0 12px",
                  display: premio.length > 0 ? "block" : "none",
                }}
              >
                Qual será o prêmio?
              </p>
              <textarea
                value={
                  premio.includes("|")
                    ? premio.split("|")[1]?.trimStart()
                    : premio
                }
                onChange={(ev) => {
                  const freq = premio.includes("|")
                    ? premio.split("|")[0]
                    : "Semanal";
                  setPremio(freq + "| " + ev.target.value);
                }}
                placeholder="Ex: Uma noite da pizza, um passeio especial..."
                style={{
                  display: premio.length > 0 ? "block" : "none",
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
              {premio.length > 0 && (
                <button
                  onClick={async () => {
                    try {
                      const { db } = await import("../services/firebase");
                      const { doc, setDoc } =
                        await import("firebase/firestore");
                      if (!userPai?.uid) {
                        alert("Erro de autenticação.");
                        return;
                      }
                      await setDoc(
                        doc(db, "responsaveis", userPai.uid),
                        {
                          premio: premio,
                          premioImagemUrl: premioImagemUrl || null,
                        },
                        { merge: true },
                      );
                      if (filho?.id) {
                        try {
                          await setDoc(
                            doc(db, "criancas", filho.id),
                            {
                              premio: premio,
                              premioImagemUrl: premioImagemUrl || null,
                            },
                            { merge: true },
                          );
                        } catch (errEspelho) {
                          console.error(
                            "Espelhamento do premio falhou:",
                            errEspelho.code,
                            errEspelho.message,
                          );
                        }
                      }
                      setPremioEditando(false);
                      alert("Prêmio e regras salvos com sucesso!");
                    } catch (err) {
                      alert("Erro ao salvar.");
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "13px",
                    marginTop: "10px",
                    background: "#00D4AA",
                    color: "#1E293B",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  💾 Salvar Regras do Prêmio
                </button>
              )}
            </div>

            {/* Card visualizacao premio salvo */}
            {premio.length > 0 && !premioEditando && (
              <div
                style={{ animation: "fadeIn 0.3s ease", marginBottom: "14px" }}
              >
                <div
                  style={{
                    borderRadius: "16px",
                    border: "1.5px solid #FFB83044",
                    background: e ? "rgba(0,0,0,0.2)" : "#FFFBF0",
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 14, alignItems: "center" }}
                  >
                    {premioImagemUrl && (
                      <img
                        src={premioImagemUrl}
                        alt="Premio"
                        style={{
                          width: 74,
                          height: 74,
                          objectFit: "cover",
                          borderRadius: "14px",
                          flexShrink: 0,
                          boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
                        }}
                        onError={(ev) => {
                          ev.target.style.display = "none";
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          color: "#FFB830",
                          margin: "0 0 4px",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        🏆 Prêmio configurado
                      </p>
                      <p
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 800,
                          color: e ? "#F8FAFC" : "#1E293B",
                          margin: "0 0 4px",
                          lineHeight: 1.35,
                        }}
                      >
                        {premio.includes("|")
                          ? premio.split("|")[1]?.trim()
                          : premio}
                      </p>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          color: "#00D4AA",
                          background: "#00D4AA18",
                          border: "1px solid #00D4AA44",
                          borderRadius: 8,
                          padding: "2px 8px",
                        }}
                      >
                        {premio.includes("|")
                          ? premio.split("|")[0]
                          : "Semanal"}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      onClick={() => setPremioEditando(true)}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1.5px solid #00D4AA44",
                        background: "#00D4AA15",
                        color: "#00D4AA",
                        fontWeight: 800,
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Excluir o prêmio salvo?")) return;
                        try {
                          const { db, storage } =
                            await import("../services/firebase");
                          const { doc, setDoc } =
                            await import("firebase/firestore");
                          const { ref, deleteObject } =
                            await import("firebase/storage");
                          if (premioImagemUrl) {
                            try {
                              await deleteObject(ref(storage, premioImagemUrl));
                            } catch (_) {}
                          }
                          await setDoc(
                            doc(db, "responsaveis", userPai.uid),
                            { premio: "", premioImagemUrl: null },
                            { merge: true },
                          );
                          if (filho?.id) {
                            try {
                              await setDoc(
                                doc(db, "criancas", filho.id),
                                { premio: "", premioImagemUrl: null },
                                { merge: true },
                              );
                            } catch (_) {}
                          }
                          setPremio("");
                          setPremioImagemUrl(null);
                          setPremioEditando(false);
                        } catch (err) {
                          alert("Erro ao excluir o prêmio.");
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1.5px solid #EF444440",
                        background: "#EF444410",
                        color: "#EF4444",
                        fontWeight: 800,
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario premio - so mostra se editando ou novo */}
            {premio.length > 0 && premioEditando && (
              <div style={{ marginBottom: "14px" }}>
                {/* Upload foto */}
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "14px",
                    border: "1.5px solid #A0B8C833",
                    background: e ? "rgba(255,255,255,0.05)" : "#F8FAFC",
                    textAlign: "center",
                    marginBottom: "12px",
                  }}
                >
                  {premioImagemUrl ? (
                    <div
                      style={{
                        position: "relative",
                        display: "inline-block",
                        width: "100%",
                      }}
                    >
                      <img
                        src={premioImagemUrl}
                        alt="Premio"
                        style={{
                          width: "100%",
                          height: "170px",
                          objectFit: "cover",
                          borderRadius: "14px",
                          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                        }}
                      />
                      <button
                        onClick={() => setPremioImagemUrl(null)}
                        style={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          background: "#EF4444",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: 24,
                          height: 24,
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: c.textoSub,
                          margin: "0 0 8px",
                        }}
                      >
                        Adicionar foto do prêmio (Opcional)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        id="fotoPremioInput"
                        style={{ display: "none" }}
                        onChange={async (ev) => {
                          const file = ev.target.files[0];
                          if (!file) return;
                          setUploadingFoto(true);
                          try {
                            const { storage } =
                              await import("../services/firebase");
                            const { ref, uploadBytes, getDownloadURL } =
                              await import("firebase/storage");
                            const storageRef = ref(
                              storage,
                              `premios/${userPai.uid}_${Date.now()}`,
                            );
                            await uploadBytes(storageRef, file);
                            const url = await getDownloadURL(storageRef);
                            setPremioImagemUrl(url);
                          } catch (err) {
                            alert("Erro ao enviar imagem.");
                          }
                          setUploadingFoto(false);
                        }}
                      />
                      <button
                        onClick={() =>
                          document.getElementById("fotoPremioInput").click()
                        }
                        disabled={uploadingFoto}
                        style={{
                          padding: "8px 16px",
                          background: "#00D4AA20",
                          color: "#00D4AA",
                          border: "1.5px solid #00D4AA",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                        }}
                      >
                        {uploadingFoto ? "Enviando..." : "Escolher Foto"}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setPremioEditando(false)}
                  style={{
                    width: "100%",
                    padding: "9px",
                    marginTop: "6px",
                    background: "transparent",
                    color: c.textoSub,
                    border: `1px solid ${c.borda}`,
                    borderRadius: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}

            {/* Preview modal premiacao */}
            {premio.length > 0 && (
              <div
                style={{
                  background: e ? "#0F1F0F" : "#FFFBEB",
                  border: "2px solid #FFD70066",
                  borderRadius: 16,
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: "1.4rem" }}>🎆</span>
                  <div>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        color: "#FFD700",
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Visualizar Card da Criança
                    </p>
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: c.textoSub,
                        margin: "2px 0 0",
                      }}
                    >
                      Veja exatamente como seu filho verá a tela de premiação
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarPreviewPremio(true)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "linear-gradient(135deg,#00D4AA,#00B894)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    fontWeight: 900,
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  Visualizar como a Criança Vê
                </button>
              </div>
            )}

            <ModalPremiacao
              isOpen={mostrarPreviewPremio}
              fechar={() => setMostrarPreviewPremio(false)}
              premioTexto={
                premio.includes("|") ? premio.split("|")[1]?.trim() : premio
              }
              premioImagemUrl={premioImagemUrl}
              premioFreq={
                premio.includes("|") ? premio.split("|")[0] : "Semanal"
              }
              e={e}
            />

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
                  border: "1.5px solid #EF444440",
                  background: "#EF444410",
                  color: "#EF4444",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  marginBottom: 10,
                }}
              >
                Sair da conta
              </button>

              {/* ── Botão desativar conta ── */}
              <button
                onClick={() => setMostrarModalExcluir(true)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 12,
                  border: `1.5px solid ${c.borda}`,
                  background: "transparent",
                  color: c.textoSub,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                Desativar conta
              </button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes fadeIn  { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes girarIA { 0%{transform:rotateY(0deg)} 100%{transform:rotateY(360deg)} }
        @keyframes pulsar  { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.2);opacity:1} }
      `}</style>
    </div>
  );
}
