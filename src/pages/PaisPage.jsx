import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTema } from "../context/ThemeContext";
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
} from "../services/db";

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
function CardAssinatura({ c, e, filho, functions, userPai }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [emailAlternativo, setEmailAlternativo] = useState("");
  const [usarEmailAlternativo, setUsarEmailAlternativo] = useState(false);

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
const criarAssinatura = httpsCallable(functions, "criarAssinatura");`n      const res = await criarAssinatura({
  codigoAcesso: filho.id, // ← correto        emailResponsavel: emailFinal,
  nomeResponsavel: userPai?.displayName || "Responsável",
});
      if (res.data?.checkoutUrl) {
        window.open(res.data.checkoutUrl, "_blank");
      } else {
        setErro("Não foi possível gerar o link. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao criar assinatura:", err);
      setErro("Erro ao conectar com o Mercado Pago. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      style={{
        background: e
          ? "linear-gradient(135deg, #0D1F2D, #0A2E1F)"
          : "linear-gradient(135deg, #E8FFF5, #F0FFF8)",
        border: `2px solid ${e ? "rgba(0,196,122,0.3)" : "rgba(15,110,86,0.2)"}`,
        borderRadius: 16,
        padding: "20px 18px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: e ? "rgba(0,196,122,0.15)" : "rgba(15,110,86,0.12)",
            border: `2px solid ${e ? "rgba(0,196,122,0.4)" : "rgba(15,110,86,0.25)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
          }}
        >
          🚀
        </div>
        <div>
          <p
            style={{
              fontSize: "0.8rem",
              fontWeight: 800,
              color: e ? "#00e0b3" : "#0F6E56",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Plano Mensal
          </p>
          <p style={{ fontSize: "0.72rem", color: c.textoSub, margin: 0 }}>
            Acesso ilimitado para {filho?.nome?.split(" ")[0] || "seu filho"}
          </p>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <span
            style={{
              fontSize: "1.6rem",
              fontWeight: 900,
              color: e ? "#00e0b3" : "#0F6E56",
              lineHeight: 1,
            }}
          >
            R$20
          </span>
          <p style={{ fontSize: "0.7rem", color: c.textoSub, margin: 0 }}>
            /mês
          </p>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 7,
          marginBottom: 16,
        }}
      >
        {[
          "🎯 Missões pelo Currículo Paulista e BNCC",
          "🏫 Preparação para Etec, Fatec e colégios federais",
          "📊 Relatório mensal de progresso",
          "💡 Cancele quando quiser • Sem fidelidade",
        ].map((b, i) => (
          <p
            key={i}
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: c.textoSub,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {b}
          </p>
        ))}
      </div>
      <div style={{ marginBottom: 14 }}>
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: c.textoSub,
            margin: "0 0 6px",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Email para o Mercado Pago
        </p>
        <div
          style={{
            background: e ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            borderRadius: 10,
            padding: "10px 14px",
            border: `1.5px solid ${e ? "#2D3D50" : "#E2E8F0"}`,
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
            color: e ? "#00e0b3" : "#0F6E56",
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
              border: `1.5px solid ${e ? "#2D3D50" : "#E2E8F0"}`,
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
      {erro && (
        <div
          style={{
            background: "#EF444415",
            border: "1.5px solid #EF444430",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 12,
            fontSize: "0.8rem",
            color: "#EF4444",
            fontWeight: 700,
          }}
        >
          ⚠️ {erro}
        </div>
      )}
      <button
        onClick={assinar}
        disabled={carregando}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 30,
          border: "none",
          fontSize: "0.95rem",
          fontWeight: 900,
          cursor: carregando ? "not-allowed" : "pointer",
          background: carregando ? c.borda : e ? "#00c47a" : "#0F6E56",
          color: "#fff",
          boxShadow: carregando ? "none" : "0 4px 20px rgba(0,196,122,0.3)",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        {carregando ? "Aguarde..." : "🚀 Assinar agora — R$20/mês"}
      </button>
      <p
        style={{
          fontSize: "0.7rem",
          color: c.textoSub,
          textAlign: "center",
          marginTop: 10,
          marginBottom: 0,
        }}
      >
        🔒 Pagamento seguro via Mercado Pago
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
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {s.topicos.map((t, ti) => (
                        <span
                          key={ti}
                          style={{
                            fontSize: "0.68rem",
                            color: disc.cor,
                            fontWeight: 700,
                            background: `${disc.cor}15`,
                            padding: "2px 7px",
                            borderRadius: 6,
                          }}
                        >
                          {t}
                        </span>
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
export default function PaisPage({ userPai, timer }) {
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();
  const e = tema === "escuro";

  const [etapa, setEtapa] = useState("verificando");
  const [filho, setFilho] = useState(null);
  const [missoesPorDisc, setMissoesPorDisc] = useState({});
  const [missoesHoje, setMissoesHoje] = useState(0);
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
  const [secao, setSecao] = useState("visao");
  const [config, setConfig] = useState({
    serie: localStorage.getItem("eduplay_config_serie") || "6ano",
    bimestre: localStorage.getItem("eduplay_config_bimestre") || "1bimestre",
    tempoEstudo: 45,
  });
  const [gerando, setGerando] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [fraseLoading, setFraseLoading] = useState(0);
  const [premio, setPremio] = useState("");
  const [perguntasIA, setPerguntasIA] = useState([]);

  // ── Estados para excluir conta ──
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);
  const [desativando, setDesativando] = useState(false);

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
        setConfig((prev) => ({ ...prev, serie: crianca.serie || "6ano" }));
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
        setEtapa("painel");
        gerarMensagemIA(crianca, sessoes, prog);
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
    try {
      const serie = filho.serie || config.serie;
      const temaAtual = `Conteudo do ${SERIES.find((s) => s.id === serie)?.label} - ${BIMESTRES.find((b) => b.id === config.bimestre)?.label}`;
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
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "visao", label: "Visão Geral", icone: "📊" },
            { id: "missoes", label: "Missões", icone: "🤖" },
            { id: "relatorio", label: "Relatório", icone: "📋" },
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
                    💬 Pergunte ao {filho?.nome?.split(" ")[0]} hoje:
                  </p>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {(perguntasIA.length > 0 ? perguntasIA : perguntasPai).map(
                      (q, i) => (
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
                      ),
                    )}
                  </div>
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

            <div
              style={{
                background: c.card,
                border: `1.5px solid ${c.borda}`,
                borderRadius: 16,
                padding: "16px",
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
                    background: "linear-gradient(135deg, #00D4AA, #0099FF)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                  }}
                >
                  🚀
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      color: c.accent,
                      margin: 0,
                    }}
                  >
                    Sonhe com o futuro de {filho?.nome?.split(" ")[0]}
                  </p>
                  <p
                    style={{ fontSize: "0.7rem", color: c.textoSub, margin: 0 }}
                  >
                    Toque para ver as oportunidades disponíveis agora
                  </p>
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {CATEGORIAS_ESCOLAS.map((cat) => (
                  <CardCategoriaEscolas
                    key={cat.id}
                    categoria={cat}
                    serie={serieAtual}
                    c={c}
                    e={e}
                  />
                ))}
              </div>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: c.textoSub,
                  margin: "14px 0 0",
                  textAlign: "center",
                  fontStyle: "italic",
                  lineHeight: 1.5,
                }}
              >
                Cada missão concluída hoje é um passo real para essas portas. O
                EduPlay cuida da consistência.
              </p>
            </div>

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
                    onClick={() => {
                      setConfig({ ...config, serie: s.id });
                      localStorage.setItem("eduplay_config_serie", s.id);
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
                    onClick={() => {
                      setConfig({ ...config, bimestre: b.id });
                      localStorage.setItem("eduplay_config_bimestre", b.id);
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

        {secao === "relatorio" && (
          <RelatorioTab
            c={c}
            e={e}
            filho={filho}
            getMissoesConcluidas={getMissoesConcluidas}
            getProgresso={getProgresso}
          />
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

            <CardAssinatura
              c={c}
              e={e}
              filho={filho}
              functions={functions}
              userPai={userPai}
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
