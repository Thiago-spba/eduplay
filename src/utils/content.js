// ═══════════════════════════════════════════════════════════
// INSTITUTO DO SABER — Conteúdo 6º Ano
// Baseado no Currículo Paulista / BNCC
// ═══════════════════════════════════════════════════════════

export const disciplinas = {

  geografia: {
    id: 'geografia',
    depto: 'Depto. de Geografia',
    missao: 'Mapear o mundo',
    icone: '🗺️',
    cor: '#5A8F8C',
    corClara: '#D4E5E4',
    corEscura: '#3D6B6A',
    bloqueada: false,
    modulos: [
      {
        id: 'brasil-localizacao',
        titulo: 'Onde fica o Brasil?',
        subtitulo: 'Missão 01 — Localização e Território',
        perguntaCentral: 'Por que o Brasil é tão grande?',
        icone: '🌎',
        desbloqueada: false,
        video: {
          titulo: 'O Brasil no Mapa-Múndi',
          youtubeId: 'https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ',
          duracao: '5 min',
        },
        atividades: {
          quiz: [
            {
              pergunta: 'Em qual continente fica o Brasil?',
              opcoes: ['América do Norte', 'América do Sul', 'Europa', 'África'],
              correta: 1,
              explicacao: 'O Brasil está na América do Sul e é o maior país do continente, ocupando quase metade dele!',
            },
            {
              pergunta: 'O Brasil faz fronteira com quantos países?',
              opcoes: ['5', '7', '10', '12'],
              correta: 2,
              explicacao: 'O Brasil faz fronteira com 10 países! Só não faz fronteira com Chile e Equador.',
            },
            {
              pergunta: 'Qual é a capital do Brasil?',
              opcoes: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
              correta: 2,
              explicacao: 'Brasília é a capital federal desde 1960, quando foi inaugurada pelo presidente Juscelino Kubitschek.',
            },
          ],
          forca: { palavra: 'BRASILIA', dica: 'Capital do Brasil, construída do zero' },
          caca: { palavras: ['BRASIL', 'AMERICA', 'CAPITAL', 'OCEANO', 'MAPA'] },
        },
        xp: 100,
      },
      {
        id: 'regioes-brasil',
        titulo: 'As 5 Regiões do Brasil',
        subtitulo: 'Missão 02 — Norte, Sul, Leste, Oeste e Centro',
        perguntaCentral: 'Por que cada região é tão diferente?',
        icone: '🧭',
        desbloqueada: false,
        video: {
          titulo: 'As Regiões Brasileiras',
          youtubeId: 'https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ',
          duracao: '6 min',
        },
        atividades: {
          quiz: [
            {
              pergunta: 'Quantas regiões tem o Brasil?',
              opcoes: ['3', '4', '5', '6'],
              correta: 2,
              explicacao: 'O Brasil é dividido em 5 regiões: Norte, Nordeste, Centro-Oeste, Sudeste e Sul.',
            },
            {
              pergunta: 'Qual é a maior região do Brasil em território?',
              opcoes: ['Sudeste', 'Nordeste', 'Norte', 'Centro-Oeste'],
              correta: 2,
              explicacao: 'A região Norte é a maior do Brasil, ocupando cerca de 45% do território nacional. Abriga a maior parte da Amazônia!',
            },
            {
              pergunta: 'Em qual região fica São Paulo?',
              opcoes: ['Norte', 'Nordeste', 'Sul', 'Sudeste'],
              correta: 3,
              explicacao: 'São Paulo fica na região Sudeste, junto com Minas Gerais, Rio de Janeiro e Espírito Santo.',
            },
          ],
          forca: { palavra: 'NORDESTE', dica: 'Região conhecida pelo forró e pela seca' },
          caca: { palavras: ['NORTE', 'SUL', 'SUDESTE', 'CENTRO', 'NORDESTE'] },
        },
        xp: 120,
      },
      {
        id: 'estados-capitais',
        titulo: 'Estados e Capitais',
        subtitulo: 'Missão 03 — Os 26 estados + Distrito Federal',
        perguntaCentral: 'Você conhece todos os estados do Brasil?',
        icone: '📍',
        desbloqueada: false,
        video: {
          titulo: 'Estados e Capitais do Brasil',
          youtubeId: 'https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ',
          duracao: '8 min',
        },
        atividades: {
          quiz: [
            {
              pergunta: 'Quantos estados tem o Brasil?',
              opcoes: ['24', '25', '26', '27'],
              correta: 2,
              explicacao: 'O Brasil tem 26 estados + 1 Distrito Federal, totalizando 27 unidades federativas!',
            },
            {
              pergunta: 'O que é o Distrito Federal?',
              opcoes: [
                'Um estado como os outros',
                'Onde fica a capital Brasília, com governo próprio',
                'Uma cidade do estado de Goiás',
                'O estado mais rico do Brasil',
              ],
              correta: 1,
              explicacao: 'O Distrito Federal é uma unidade especial onde fica Brasília. Não é um estado, tem um governo próprio chamado GDF.',
            },
            {
              pergunta: 'Qual é a capital do estado de São Paulo?',
              opcoes: ['Campinas', 'Santos', 'São Paulo', 'Guarulhos'],
              correta: 2,
              explicacao: 'A cidade de São Paulo é tanto o nome do estado quanto da sua capital — a maior cidade do Brasil!',
            },
            {
              pergunta: 'Qual é a capital do Amazonas?',
              opcoes: ['Belém', 'Manaus', 'Porto Velho', 'Macapá'],
              correta: 1,
              explicacao: 'Manaus é a capital do Amazonas, famosa pela sua localização no meio da floresta amazônica.',
            },
            {
              pergunta: 'Qual é a capital da Bahia?',
              opcoes: ['Feira de Santana', 'Ilhéus', 'Salvador', 'Vitória da Conquista'],
              correta: 2,
              explicacao: 'Salvador é a capital da Bahia e foi a primeira capital do Brasil colonial!',
            },
            {
              pergunta: 'Qual é a capital do Rio Grande do Sul?',
              opcoes: ['Caxias do Sul', 'Porto Alegre', 'Pelotas', 'Santa Maria'],
              correta: 1,
              explicacao: 'Porto Alegre é a capital do Rio Grande do Sul, o estado mais ao sul do Brasil.',
            },
          ],
          forca: { palavra: 'FEDERATIVO', dica: 'O Brasil é uma república...' },
          caca: { palavras: ['ESTADO', 'CAPITAL', 'BRASILIA', 'GOVERNADOR', 'MAPA'] },
        },
        xp: 150,
      },
    ],
  },

  historia: {
    id: 'historia',
    depto: 'Depto. de História',
    missao: 'Investigar o passado',
    icone: '📜',
    cor: '#D4A574',
    corClara: '#F5EDE3',
    corEscura: '#8B5E3C',
    bloqueada: false,
    modulos: [
      {
        id: 'pre-historia',
        titulo: 'A Pré-História',
        subtitulo: 'Missão 01 — Os primeiros seres humanos',
        perguntaCentral: 'Como viviam os primeiros humanos?',
        icone: '🦴',
        desbloqueada: false,
        video: {
          titulo: 'Pré-História: Como tudo começou',
          youtubeId: 'https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ',
          duracao: '6 min',
        },
        atividades: {
          quiz: [
            {
              pergunta: 'O que define a Pré-História?',
              opcoes: [
                'Período antes dos dinossauros',
                'Período antes da escrita',
                'Período antes do fogo',
                'Período antes dos humanos',
              ],
              correta: 1,
              explicacao: 'A Pré-História é o período antes da invenção da escrita, que ocorreu por volta de 3.500 a.C.',
            },
            {
              pergunta: 'Como os humanos pré-históricos conseguiam comida?',
              opcoes: [
                'Plantando e colhendo',
                'Comprando em mercados',
                'Caçando e coletando',
                'Criando animais',
              ],
              correta: 2,
              explicacao: 'Os primeiros humanos eram nômades — caçavam animais e coletavam frutas e raízes para sobreviver.',
            },
            {
              pergunta: 'Qual foi uma das primeiras grandes descobertas da humanidade?',
              opcoes: ['A roda', 'O fogo', 'A escrita', 'A agricultura'],
              correta: 1,
              explicacao: 'O domínio do fogo foi revolucionário! Permitiu aquecer, cozinhar alimentos e se proteger de animais.',
            },
          ],
          forca: { palavra: 'NOMADE', dica: 'Povo que não tem lugar fixo para morar' },
          caca: { palavras: ['FOGO', 'CACA', 'PEDRA', 'CAVERNA', 'NOMADE'] },
        },
        xp: 100,
      },
      {
        id: 'indigenas-brasil',
        titulo: 'Os Povos Originários do Brasil',
        subtitulo: 'Missão 02 — Quem estava aqui antes',
        perguntaCentral: 'Quem realmente descobriu o Brasil?',
        icone: '🏹',
        desbloqueada: false,
        video: {
          titulo: 'Povos Indígenas: Os primeiros brasileiros',
          youtubeId: 'https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ',
          duracao: '7 min',
        },
        atividades: {
          quiz: [
            {
              pergunta: 'Há quantos anos os povos indígenas já viviam no Brasil quando os portugueses chegaram?',
              opcoes: ['500 anos', '2.000 anos', 'Mais de 12.000 anos', '100 anos'],
              correta: 2,
              explicacao: 'Os povos indígenas habitam o território brasileiro há mais de 12.000 anos! Muito antes da chegada dos europeus.',
            },
            {
              pergunta: 'Quantos povos indígenas existem no Brasil hoje?',
              opcoes: ['Menos de 10', 'Cerca de 50', 'Mais de 300', 'Apenas 5'],
              correta: 2,
              explicacao: 'Hoje existem mais de 300 povos indígenas no Brasil, com línguas e culturas diferentes!',
            },
            {
              pergunta: 'Qual palavra de origem indígena usamos no dia a dia?',
              opcoes: ['Mesa', 'Abacaxi', 'Janela', 'Escola'],
              correta: 1,
              explicacao: 'Abacaxi vem do tupi "nanas", que significa "fruta perfumada". Muitas palavras do português brasileiro têm origem indígena!',
            },
          ],
          forca: { palavra: 'INDIGENA', dica: 'Primeiros habitantes do Brasil' },
          caca: { palavras: ['TRIBO', 'ALDEIA', 'FLORESTA', 'RITUAL', 'TERRA'] },
        },
        xp: 120,
      },
      {
        id: 'chegada-portugueses',
        titulo: 'A Chegada dos Portugueses',
        subtitulo: 'Missão 03 — 1500 e o início de tudo',
        perguntaCentral: 'O que mudou com a chegada dos portugueses?',
        icone: '⛵',
        desbloqueada: false,
        video: {
          titulo: '1500: O dia que o Brasil mudou',
          youtubeId: 'https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ',
          duracao: '6 min',
        },
        atividades: {
          quiz: [
            {
              pergunta: 'Em que ano Pedro Álvares Cabral chegou ao Brasil?',
              opcoes: ['1492', '1500', '1532', '1550'],
              correta: 1,
              explicacao: 'Em 22 de abril de 1500, a frota de Cabral avistou a terra que seria chamada de Brasil.',
            },
            {
              pergunta: 'Por que o Brasil se chama Brasil?',
              opcoes: [
                'Nome de um rio',
                'Por causa do pau-brasil, árvore encontrada aqui',
                'Nome de um índio famoso',
                'Nome do navegador que chegou primeiro',
              ],
              correta: 1,
              explicacao: 'O nome vem do pau-brasil, uma árvore de madeira avermelhada muito valorizada pelos portugueses para fazer corante.',
            },
            {
              pergunta: 'O que os portugueses encontraram primeiro no Brasil?',
              opcoes: ['Ouro', 'Petróleo', 'Pau-brasil', 'Diamantes'],
              correta: 2,
              explicacao: 'O pau-brasil foi o primeiro produto explorado pelos portugueses, usado para fazer tinta vermelha na Europa.',
            },
          ],
          forca: { palavra: 'CABRAL', dica: 'Navegador português que chegou ao Brasil em 1500' },
          caca: { palavras: ['CABRAL', 'NAVIO', 'BAHIA', 'PORTUGAL', 'PAUBRASIL'] },
        },
        xp: 120,
      },
    ],
  },

  matematica: {
    id: 'matematica',
    depto: 'Depto. de Matemática',
    missao: 'Decifrar padrões',
    icone: '🔢',
    cor: '#6B5EA8',
    corClara: '#E8E4F5',
    corEscura: '#4A3D8C',
    bloqueada: false,
    modulos: [],
  },

  ciencias: {
    id: 'ciencias',
    depto: 'Depto. de Ciências',
    missao: 'Explorar a natureza',
    icone: '🔬',
    cor: '#2E8B57',
    corClara: '#D4F0E4',
    corEscura: '#1A5C38',
    bloqueada: false,
    modulos: [],
  },

  portugues: {
    id: 'portugues',
    depto: 'Depto. de Português',
    missao: 'Dominar a comunicação',
    icone: '✍️',
    cor: '#C0392B',
    corClara: '#FADBD8',
    corEscura: '#922B21',
    bloqueada: false,
    modulos: [],
  },
}

export const ordemDisciplinas = ['historia', 'geografia', 'matematica', 'ciencias', 'portugues']

export const NIVEIS = [
  { nivel: 1, titulo: 'Pesquisador Júnior',    xpNecessario: 0    },
  { nivel: 2, titulo: 'Analista de Campo',     xpNecessario: 200  },
  { nivel: 3, titulo: 'Investigador',          xpNecessario: 500  },
  { nivel: 4, titulo: 'Especialista',          xpNecessario: 1000 },
  { nivel: 5, titulo: 'Pesquisador Sênior',    xpNecessario: 2000 },
  { nivel: 6, titulo: 'Diretor do Instituto',  xpNecessario: 4000 },
]

// Alias para compatibilidade
export const niveis = NIVEIS

export const conquistas = [
  { id: 'primeiro_passo', icone: '🌱', titulo: 'Primeiro Passo',      descricao: 'Complete sua primeira missão',          xpBonus: 50  },
  { id: 'historiador',    icone: '📜', titulo: 'Historiador',         descricao: 'Complete todas as missões de História',  xpBonus: 200 },
  { id: 'geografo',       icone: '🗺️', titulo: 'Geógrafo',            descricao: 'Complete todas as missões de Geografia', xpBonus: 200 },
  { id: 'curioso',        icone: '🔍', titulo: 'Curioso',             descricao: 'Assista 5 vídeos',                       xpBonus: 100 },
  { id: 'dedicado',       icone: '🔥', titulo: 'Dedicado',            descricao: 'Estude 7 dias seguidos',                 xpBonus: 300 },
  { id: 'mestre',         icone: '🏆', titulo: 'Mestre do Instituto', descricao: 'Complete todas as disciplinas',          xpBonus: 500 },
]
