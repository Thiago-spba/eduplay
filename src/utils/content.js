// ═══════════════════════════════════════════════════════════
// EduPlay — Conteúdo e estrutura das disciplinas
// Currículo Paulista / BNCC — Ensino Fundamental II
// ═══════════════════════════════════════════════════════════

export const disciplinas = {

  historia: {
    id:       "historia",
    label:    "História",
    depto:    "Depto. de História",
    missao:   "Investigar o passado",
    icone:    "📜",
    cor:      "#C4A882",
    corClara: "#F5EDE3",
    corEscura:"#8B5E3C",
    bloqueada: false,
    modulos: [
      {
        id: "pre-historia",
        titulo: "A Pré-História",
        subtitulo: "Missão 01 — Os primeiros seres humanos",
        perguntaCentral: "Como viviam os primeiros humanos?",
        icone: "🦴",
        desbloqueada: true,
        video: {
          titulo: "Pré-História: Como tudo começou",
          youtubeId: "https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ",
          duracao: "6 min",
        },
        atividades: {
          quiz: [
            { pergunta: "O que define a Pré-História?", opcoes: ["Período antes dos dinossauros","Período antes da escrita","Período antes do fogo","Período antes dos humanos"], correta: 1, explicacao: "A Pré-História é o período antes da invenção da escrita, que ocorreu por volta de 3.500 a.C." },
            { pergunta: "Como os humanos pré-históricos conseguiam comida?", opcoes: ["Plantando e colhendo","Comprando em mercados","Caçando e coletando","Criando animais"], correta: 2, explicacao: "Os primeiros humanos eram nômades — caçavam animais e coletavam frutas e raízes para sobreviver." },
            { pergunta: "Qual foi uma das primeiras grandes descobertas da humanidade?", opcoes: ["A roda","O fogo","A escrita","A agricultura"], correta: 1, explicacao: "O domínio do fogo foi revolucionário! Permitiu aquecer, cozinhar alimentos e se proteger de animais." },
          ],
          forca: { palavra: "NOMADE", dica: "Povo que não tem lugar fixo para morar" },
        },
      },
      {
        id: "indigenas-brasil",
        titulo: "Os Povos Originários do Brasil",
        subtitulo: "Missão 02 — Quem estava aqui antes",
        perguntaCentral: "Quem realmente descobriu o Brasil?",
        icone: "🏹",
        desbloqueada: true,
        video: {
          titulo: "Povos Indígenas: Os primeiros brasileiros",
          youtubeId: "https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ",
          duracao: "7 min",
        },
        atividades: {
          quiz: [
            { pergunta: "Há quantos anos os povos indígenas já viviam no Brasil quando os portugueses chegaram?", opcoes: ["500 anos","2.000 anos","Mais de 12.000 anos","100 anos"], correta: 2, explicacao: "Os povos indígenas habitam o território brasileiro há mais de 12.000 anos! Muito antes da chegada dos europeus." },
            { pergunta: "Quantos povos indígenas existem no Brasil hoje?", opcoes: ["Menos de 10","Cerca de 50","Mais de 300","Apenas 5"], correta: 2, explicacao: "Hoje existem mais de 300 povos indígenas no Brasil, com línguas e culturas diferentes!" },
            { pergunta: "Qual palavra de origem indígena usamos no dia a dia?", opcoes: ["Mesa","Abacaxi","Janela","Escola"], correta: 1, explicacao: "Abacaxi vem do tupi 'nanas', que significa 'fruta perfumada'. Muitas palavras do português brasileiro têm origem indígena!" },
          ],
          forca: { palavra: "INDIGENA", dica: "Primeiros habitantes do Brasil" },
        },
      },
      {
        id: "chegada-portugueses",
        titulo: "A Chegada dos Portugueses",
        subtitulo: "Missão 03 — 1500 e o início de tudo",
        perguntaCentral: "O que mudou com a chegada dos portugueses?",
        icone: "⛵",
        desbloqueada: true,
        video: {
          titulo: "1500: O dia que o Brasil mudou",
          youtubeId: "https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ",
          duracao: "6 min",
        },
        atividades: {
          quiz: [
            { pergunta: "Em que ano Pedro Álvares Cabral chegou ao Brasil?", opcoes: ["1492","1500","1532","1550"], correta: 1, explicacao: "Em 22 de abril de 1500, a frota de Cabral avistou a terra que seria chamada de Brasil." },
            { pergunta: "Por que o Brasil se chama Brasil?", opcoes: ["Nome de um rio","Por causa do pau-brasil, árvore encontrada aqui","Nome de um índio famoso","Nome do navegador que chegou primeiro"], correta: 1, explicacao: "O nome vem do pau-brasil, uma árvore de madeira avermelhada muito valorizada pelos portugueses para fazer corante." },
            { pergunta: "O que os portugueses encontraram primeiro no Brasil?", opcoes: ["Ouro","Petróleo","Pau-brasil","Diamantes"], correta: 2, explicacao: "O pau-brasil foi o primeiro produto explorado pelos portugueses, usado para fazer tinta vermelha na Europa." },
          ],
          forca: { palavra: "CABRAL", dica: "Navegador português que chegou ao Brasil em 1500" },
        },
      },
    ],
  },

  geografia: {
    id:       "geografia",
    label:    "Geografia",
    depto:    "Depto. de Geografia",
    missao:   "Mapear o mundo",
    icone:    "🗺️",
    cor:      "#5A8F8C",
    corClara: "#D4E5E4",
    corEscura:"#3D6B6A",
    bloqueada: false,
    modulos: [
      {
        id: "brasil-localizacao",
        titulo: "Onde fica o Brasil?",
        subtitulo: "Missão 01 — Localização e Território",
        perguntaCentral: "Por que o Brasil é tão grande?",
        icone: "🌎",
        desbloqueada: true,
        video: {
          titulo: "O Brasil no Mapa-Múndi",
          youtubeId: "https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ",
          duracao: "5 min",
        },
        atividades: {
          quiz: [
            { pergunta: "Em qual continente fica o Brasil?", opcoes: ["América do Norte","América do Sul","Europa","África"], correta: 1, explicacao: "O Brasil está na América do Sul e é o maior país do continente, ocupando quase metade dele!" },
            { pergunta: "O Brasil faz fronteira com quantos países?", opcoes: ["5","7","10","12"], correta: 2, explicacao: "O Brasil faz fronteira com 10 países! Só não faz fronteira com Chile e Equador." },
            { pergunta: "Qual é a capital do Brasil?", opcoes: ["São Paulo","Rio de Janeiro","Brasília","Salvador"], correta: 2, explicacao: "Brasília é a capital federal desde 1960, quando foi inaugurada pelo presidente Juscelino Kubitschek." },
          ],
          forca: { palavra: "BRASILIA", dica: "Capital do Brasil, construída do zero" },
        },
      },
      {
        id: "regioes-brasil",
        titulo: "As 5 Regiões do Brasil",
        subtitulo: "Missão 02 — Norte, Sul, Leste, Oeste e Centro",
        perguntaCentral: "Por que cada região é tão diferente?",
        icone: "🧭",
        desbloqueada: true,
        video: {
          titulo: "As Regiões Brasileiras",
          youtubeId: "https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ",
          duracao: "6 min",
        },
        atividades: {
          quiz: [
            { pergunta: "Quantas regiões tem o Brasil?", opcoes: ["3","4","5","6"], correta: 2, explicacao: "O Brasil é dividido em 5 regiões: Norte, Nordeste, Centro-Oeste, Sudeste e Sul." },
            { pergunta: "Qual é a maior região do Brasil em território?", opcoes: ["Sudeste","Nordeste","Norte","Centro-Oeste"], correta: 2, explicacao: "A região Norte é a maior do Brasil, ocupando cerca de 45% do território nacional. Abriga a maior parte da Amazônia!" },
            { pergunta: "Em qual região fica São Paulo?", opcoes: ["Norte","Nordeste","Sul","Sudeste"], correta: 3, explicacao: "São Paulo fica na região Sudeste, junto com Minas Gerais, Rio de Janeiro e Espírito Santo." },
          ],
          forca: { palavra: "NORDESTE", dica: "Região conhecida pelo forró e pela seca" },
        },
      },
      {
        id: "relevo-clima-brasil",
        titulo: "O Relevo e o Clima do Brasil",
        subtitulo: "Missão 03 — Terra, água e tempo",
        perguntaCentral: "Por que faz calor no Norte e frio no Sul?",
        icone: "🏔️",
        desbloqueada: true,
        video: {
          titulo: "Relevo e Clima: Como a natureza moldou o Brasil",
          youtubeId: "https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ",
          duracao: "6 min",
        },
        atividades: {
          quiz: [
            { pergunta: "Qual é o maior bioma do Brasil?", opcoes: ["Cerrado","Mata Atlântica","Amazônia","Caatinga"], correta: 2, explicacao: "A Amazônia é o maior bioma do Brasil, cobrindo cerca de 49% do território nacional e abrigando a maior biodiversidade do planeta." },
            { pergunta: "Qual é o maior rio do Brasil em volume de água?", opcoes: ["Rio São Francisco","Rio Paraná","Rio Amazonas","Rio Negro"], correta: 2, explicacao: "O Rio Amazonas carrega 20% de toda a água doce do mundo e é o maior rio do planeta em volume!" },
            { pergunta: "Por que o Sul do Brasil tem invernos mais frios?", opcoes: ["Por ser mais perto do mar","Por estar mais longe do Equador","Por ter mais montanhas","Por ter menos árvores"], correta: 1, explicacao: "Quanto mais longe do Equador, mais frio. O Sul do Brasil está mais próximo do Polo Sul, recebendo menos sol direto no inverno." },
          ],
          forca: { palavra: "AMAZONIA", dica: "Maior floresta tropical do mundo" },
        },
      },
    ],
  },

  matematica: {
    id:       "matematica",
    label:    "Matemática",
    depto:    "Depto. de Matemática",
    missao:   "Decifrar padrões",
    icone:    "📐",
    cor:      "#6B5B95",
    corClara: "#E8E4F5",
    corEscura:"#4A3D8C",
    bloqueada: false,
    modulos: [
      {
        id: "numeros-inteiros",
        titulo: "O Mundo dos Números Inteiros",
        subtitulo: "Missão 01 — Positivos, negativos e zero",
        perguntaCentral: "Como números negativos explicam dívidas e temperaturas?",
        icone: "🌡️",
        desbloqueada: true,
        video: {
          titulo: "Números Inteiros: Além do zero",
          youtubeId: "https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ",
          duracao: "6 min",
        },
        atividades: {
          quiz: [
            { pergunta: "A temperatura em uma cidade é -3°C. Qual número representa essa temperatura?", opcoes: ["3","0","-3","30"], correta: 2, explicacao: "Números negativos representam valores abaixo de zero — como temperaturas abaixo do ponto de congelamento da água!" },
            { pergunta: "Qual é o resultado de (-5) + 8?", opcoes: ["-13","13","3","-3"], correta: 2, explicacao: "Partindo de -5 e andando 8 casas para a direita na reta numérica, chegamos ao 3. Pense numa dívida de R$5 e um pagamento de R$8!" },
            { pergunta: "Qual número é maior: -10 ou -2?", opcoes: ["-10","-2","São iguais","Impossível comparar"], correta: 1, explicacao: "-2 é maior que -10! Na reta numérica, números mais à direita são maiores. -2 está mais perto do zero que -10." },
          ],
          forca: { palavra: "NEGATIVO", dica: "Número menor que zero" },
        },
      },
      {
        id: "fracoes",
        titulo: "O Segredo das Frações",
        subtitulo: "Missão 02 — Partes do todo",
        perguntaCentral: "Como dividir pizza de forma justa usando matemática?",
        icone: "🍕",
        desbloqueada: true,
        video: {
          titulo: "Frações: A matemática do dia a dia",
          youtubeId: "https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ",
          duracao: "7 min",
        },
        atividades: {
          quiz: [
            { pergunta: "Uma pizza foi dividida em 8 fatias e você comeu 3. Que fração representa o que você comeu?", opcoes: ["3/5","8/3","3/8","5/8"], correta: 2, explicacao: "Fração = partes que você pegou ÷ total de partes. Você comeu 3 das 8 fatias = 3/8 da pizza!" },
            { pergunta: "Qual fração é equivalente a 1/2?", opcoes: ["2/6","2/4","3/8","1/3"], correta: 1, explicacao: "2/4 = 1/2 porque podemos simplificar dividindo numerador e denominador por 2. Metade é metade, não importa como você divide!" },
            { pergunta: "Quanto é 1/4 + 1/4?", opcoes: ["2/8","1/2","2/4","1 e 2/4"], correta: 1, explicacao: "Quando os denominadores são iguais, somamos só os numeradores: 1/4 + 1/4 = 2/4 = 1/2. Duas quartas partes formam metade!" },
          ],
          forca: { palavra: "FRACAO", dica: "Representa partes de um todo" },
        },
      },
      {
        id: "porcentagem",
        titulo: "O Poder da Porcentagem",
        subtitulo: "Missão 03 — Desconto, juros e proporção",
        perguntaCentral: "Como as lojas usam % para te fazer gastar mais?",
        icone: "💰",
        desbloqueada: true,
        video: {
          titulo: "Porcentagem: A matemática do dinheiro",
          youtubeId: "https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ",
          duracao: "6 min",
        },
        atividades: {
          quiz: [
            { pergunta: "Um tênis custa R$200 e está com 10% de desconto. Quanto você paga?", opcoes: ["R$210","R$190","R$180","R$100"], correta: 1, explicacao: "10% de R$200 = R$20 de desconto. R$200 - R$20 = R$180. Saber calcular desconto é essencial para não cair em armadilhas de marketing!" },
            { pergunta: "O que significa dizer que 50% dos alunos passaram?", opcoes: ["Todos passaram","Nenhum passou","Metade passou","Um quarto passou"], correta: 2, explicacao: "50% = metade. Por cento significa 'por cem' — 50/100 = 1/2. Metade dos alunos passou!" },
            { pergunta: "Como se escreve 25% em fração simplificada?", opcoes: ["25/10","1/4","1/2","5/20"], correta: 1, explicacao: "25% = 25/100. Simplificando por 25: 1/4. Por isso 25% é um quarto — como um quarto de pizza!" },
          ],
          forca: { palavra: "DESCONTO", dica: "Redução no preço de um produto" },
        },
      },
    ],
  },

  ciencias: {
    id:       "ciencias",
    label:    "Ciências",
    depto:    "Depto. de Ciências",
    missao:   "Explorar a natureza",
    icone:    "🔬",
    cor:      "#2E8B57",
    corClara: "#D4F0E4",
    corEscura:"#1A5C38",
    bloqueada: false,
    modulos: [
      {
        id: "sistema-solar",
        titulo: "O Sistema Solar",
        subtitulo: "Missão 01 — Nossa vizinhança cósmica",
        perguntaCentral: "Por que não caímos no Sol se ele nos atrai?",
        icone: "🪐",
        desbloqueada: true,
        video: {
          titulo: "Sistema Solar: A dança dos planetas",
          youtubeId: "https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ",
          duracao: "7 min",
        },
        atividades: {
          quiz: [
            { pergunta: "Quantos planetas existem no Sistema Solar?", opcoes: ["7","8","9","10"], correta: 1, explicacao: "São 8 planetas: Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno. Plutão foi reclassificado como planeta anão em 2006!" },
            { pergunta: "O que causa o dia e a noite na Terra?", opcoes: ["A Terra girando ao redor do Sol","A Terra girando em torno de si mesma","A Lua bloqueando o Sol","As nuvens cobrindo o Sol"], correta: 1, explicacao: "A rotação da Terra — o giro em torno do próprio eixo — cria o ciclo dia e noite. Uma volta completa dura 24 horas!" },
            { pergunta: "Qual planeta tem os anéis mais famosos?", opcoes: ["Júpiter","Urano","Netuno","Saturno"], correta: 3, explicacao: "Saturno tem os anéis mais espetaculares do Sistema Solar, formados por gelo e rochas. Mas curiosidade: Júpiter, Urano e Netuno também têm anéis!" },
          ],
          forca: { palavra: "ROTACAO", dica: "Movimento da Terra em torno de si mesma" },
        },
      },
      {
        id: "materia-estados",
        titulo: "A Matéria e seus Estados",
        subtitulo: "Missão 02 — Sólido, líquido e gasoso",
        perguntaCentral: "Por que a água pode ser gelo, líquido e vapor ao mesmo tempo?",
        icone: "💧",
        desbloqueada: true,
        video: {
          titulo: "Estados da Matéria: A transformação da água",
          youtubeId: "https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ",
          duracao: "6 min",
        },
        atividades: {
          quiz: [
            { pergunta: "A que temperatura a água líquida congela e vira gelo?", opcoes: ["100°C","50°C","0°C","-10°C"], correta: 2, explicacao: "A 0°C a água congela — é o ponto de fusão/solidificação. A 100°C ela ferve e vira vapor. Entre esses valores, permanece líquida!" },
            { pergunta: "Como se chama o processo de sólido virando líquido?", opcoes: ["Evaporação","Condensação","Fusão","Solidificação"], correta: 2, explicacao: "Fusão é quando um sólido aquece e vira líquido — como o gelo derretendo. O processo inverso, líquido virando sólido, é a solidificação!" },
            { pergunta: "O que acontece com as moléculas de um gás comparado a um sólido?", opcoes: ["Ficam mais juntas e organizadas","Ficam mais afastadas e se movem livremente","Param de se mover completamente","Ficam coladas umas nas outras"], correta: 1, explicacao: "No estado gasoso as moléculas têm muita energia e se movem rapidamente em todas as direções — por isso o gás não tem forma nem volume fixo!" },
          ],
          forca: { palavra: "EVAPORACAO", dica: "Quando líquido vira gás pelo calor" },
        },
      },
      {
        id: "corpo-humano",
        titulo: "O Corpo Humano por Dentro",
        subtitulo: "Missão 03 — Células, tecidos e órgãos",
        perguntaCentral: "Como trilhões de células trabalham juntas para você existir?",
        icone: "🫀",
        desbloqueada: true,
        video: {
          titulo: "Corpo Humano: A máquina mais complexa do mundo",
          youtubeId: "https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ",
          duracao: "7 min",
        },
        atividades: {
          quiz: [
            { pergunta: "Qual é a unidade básica de todos os seres vivos?", opcoes: ["O átomo","O tecido","A célula","O órgão"], correta: 2, explicacao: "A célula é a menor unidade viva! Seu corpo tem cerca de 37 trilhões delas, cada uma com uma função específica trabalhando em equipe." },
            { pergunta: "O que é um tecido no corpo humano?", opcoes: ["Um pano que cobre os órgãos","Um conjunto de células com a mesma função","Um tipo de músculo","Uma camada de gordura"], correta: 1, explicacao: "Tecido = grupo de células iguais com a mesma função. Tecido muscular contrai, tecido nervoso transmite sinais, tecido epitelial protege!" },
            { pergunta: "Qual sistema é responsável por bombear sangue pelo corpo?", opcoes: ["Sistema digestório","Sistema nervoso","Sistema respiratório","Sistema circulatório"], correta: 3, explicacao: "O sistema circulatório, comandado pelo coração, bombeia sangue 24 horas por dia levando oxigênio e nutrientes para todas as células!" },
          ],
          forca: { palavra: "CELULA", dica: "Menor unidade de vida do seu corpo" },
        },
      },
    ],
  },

  portugues: {
    id:       "portugues",
    label:    "Português",
    depto:    "Depto. de Português",
    missao:   "Dominar a comunicação",
    icone:    "✍️",
    cor:      "#C0392B",
    corClara: "#FADBD8",
    corEscura:"#922B21",
    bloqueada: false,
    modulos: [
      {
        id: "generos-textuais",
        titulo: "O Mundo dos Gêneros Textuais",
        subtitulo: "Missão 01 — Cada texto tem seu jeito",
        perguntaCentral: "Por que uma notícia é diferente de um conto?",
        icone: "📰",
        desbloqueada: true,
        video: {
          titulo: "Gêneros Textuais: A linguagem em diferentes formas",
          youtubeId: "https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ",
          duracao: "6 min",
        },
        atividades: {
          quiz: [
            { pergunta: "Qual gênero textual tem como objetivo informar sobre fatos recentes?", opcoes: ["Conto","Notícia","Poema","Receita"], correta: 1, explicacao: "A notícia informa sobre fatos reais e recentes, respondendo às perguntas: O quê? Quem? Quando? Onde? Por quê? Como?" },
            { pergunta: "O que caracteriza um texto narrativo?", opcoes: ["Apresenta argumentos para convencer","Conta uma história com personagens e enredo","Descreve como fazer algo","Lista informações sobre um tema"], correta: 1, explicacao: "Texto narrativo conta uma história — tem narrador, personagens, tempo, espaço e enredo. Contos, crônicas e romances são exemplos!" },
            { pergunta: "Para que serve uma bula de remédio?", opcoes: ["Entreter o leitor","Convencer a comprar o produto","Informar sobre uso, doses e efeitos do medicamento","Contar a história do remédio"], correta: 2, explicacao: "A bula é um texto instrucional e informativo — explica como usar o remédio, dosagem, contraindicações e efeitos colaterais. Sempre leia antes de tomar!" },
          ],
          forca: { palavra: "NARRATIVA", dica: "Texto que conta uma história" },
        },
      },
      {
        id: "classes-gramaticais",
        titulo: "As Classes Gramaticais",
        subtitulo: "Missão 02 — As peças da linguagem",
        perguntaCentral: "Como as palavras se organizam para criar sentido?",
        icone: "🔤",
        desbloqueada: true,
        video: {
          titulo: "Classes Gramaticais: Os blocos da linguagem",
          youtubeId: "https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ",
          duracao: "6 min",
        },
        atividades: {
          quiz: [
            { pergunta: "Na frase 'O gato preto dormiu', qual é o substantivo?", opcoes: ["O","preto","gato","dormiu"], correta: 2, explicacao: "Substantivo é a palavra que nomeia seres, objetos, lugares ou sentimentos. 'Gato' nomeia o animal — é o substantivo da frase!" },
            { pergunta: "Qual é o adjetivo na frase 'A menina inteligente resolveu o problema difícil'?", opcoes: ["menina","resolveu","inteligente","problema"], correta: 2, explicacao: "Adjetivos caracterizam ou qualificam substantivos. 'Inteligente' qualifica a menina e 'difícil' qualifica o problema — ambos são adjetivos!" },
            { pergunta: "O que faz um verbo em uma frase?", opcoes: ["Nomeia objetos e seres","Indica ação, estado ou fenômeno","Qualifica o substantivo","Substitui o substantivo"], correta: 1, explicacao: "Verbos indicam ação (correr, estudar), estado (ser, estar, parecer) ou fenômeno (chover, nevar). São o coração da frase!" },
          ],
          forca: { palavra: "SUBSTANTIVO", dica: "Palavra que dá nome aos seres e objetos" },
        },
      },
      {
        id: "interpretacao-texto",
        titulo: "Decifrando Textos",
        subtitulo: "Missão 03 — Ler nas entrelinhas",
        perguntaCentral: "Como descobrir o que o autor quis dizer sem escrever?",
        icone: "🔍",
        desbloqueada: true,
        video: {
          titulo: "Interpretação: O que está escrito e o que está escondido",
          youtubeId: "https://www.youtube.com/embed/videoseries?list=PLHz_AreHm4dmGuLII3tsvryMMD7VYh3vJ",
          duracao: "7 min",
        },
        atividades: {
          quiz: [
            { pergunta: "O que é uma inferência em um texto?", opcoes: ["Uma informação explícita no texto","Uma conclusão que tiramos a partir de pistas do texto","Um erro de interpretação","Uma opinião do autor"], correta: 1, explicacao: "Inferir é descobrir informações que não estão escritas diretamente, usando pistas do texto e seu conhecimento de mundo. É ser detetive da leitura!" },
            { pergunta: "Ao ler 'João chegou encharcado em casa', o que podemos inferir?", opcoes: ["João tomou banho","Estava chovendo lá fora","João caiu em uma piscina","João estava suando muito"], correta: 1, explicacao: "O texto não diz que estava chovendo, mas 'encharcado' é uma pista forte. Inferência é usar as pistas para chegar a uma conclusão lógica!" },
            { pergunta: "Qual é o objetivo principal de um texto argumentativo?", opcoes: ["Contar uma história emocionante","Descrever um lugar bonito","Convencer o leitor sobre um ponto de vista","Ensinar como fazer algo"], correta: 2, explicacao: "Textos argumentativos como artigos de opinião e editoriais têm o objetivo de convencer o leitor usando argumentos, dados e exemplos!" },
          ],
          forca: { palavra: "INFERENCIA", dica: "Descobrir o que não está escrito explicitamente" },
        },
      },
    ],
  },
};

export const ordemDisciplinas = [
  "historia", "geografia", "matematica", "ciencias", "portugues",
];

// Conquistas baseadas em esforço — não em pontuação
export const conquistas = [
  { id: "primeiro_passo", icone: "🌱", titulo: "Primeiro Passo",       descricao: "Complete sua primeira missão"              },
  { id: "historiador",    icone: "📜", titulo: "Historiador",          descricao: "Complete missões de História"              },
  { id: "geografo",       icone: "🗺️", titulo: "Geógrafo",             descricao: "Complete missões de Geografia"             },
  { id: "curioso",        icone: "🔍", titulo: "Curioso",              descricao: "Explore 3 disciplinas diferentes"          },
  { id: "dedicado",       icone: "🔥", titulo: "Dedicado",             descricao: "Estude 7 dias seguidos"                    },
  { id: "persistente",    icone: "💪", titulo: "Persistente",          descricao: "Tentou de novo depois de errar"            },
  { id: "explorador",     icone: "🧭", titulo: "Explorador",           descricao: "Complete missões de 5 disciplinas"         },
  { id: "mestre",         icone: "🏆", titulo: "Mestre do EduPlay",    descricao: "Complete 20 missões no total"              },
];

// Mantido para compatibilidade com componentes que ainda referenciam niveis
export const niveis = [
  { nivel: 1, titulo: "Iniciante",    xpNecessario: 0    },
  { nivel: 2, titulo: "Explorador",   xpNecessario: 200  },
  { nivel: 3, titulo: "Investigador", xpNecessario: 500  },
  { nivel: 4, titulo: "Especialista", xpNecessario: 1000 },
  { nivel: 5, titulo: "Mestre",       xpNecessario: 2000 },
];

export const NIVEIS = niveis;