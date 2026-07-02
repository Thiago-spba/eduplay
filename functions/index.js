const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { onSchedule } = require('firebase-functions/v2/scheduler')
const { defineSecret } = require('firebase-functions/params')
const Anthropic = require('@anthropic-ai/sdk')
const admin = require('firebase-admin')

const ANTHROPIC_KEY = defineSecret('ANTHROPIC_API_KEY')
const GOOGLE_TTS_KEY = defineSecret('GOOGLE_TTS_KEY')

admin.initializeApp()
const db = admin.firestore()

const DISCIPLINAS_PERMITIDAS = ['historia', 'geografia', 'matematica', 'ciencias', 'portugues']
const SERIES_PERMITIDAS     = ['6ano', '7ano', '8ano', '9ano']
const BIMESTRES_PERMITIDOS  = ['1bimestre', '2bimestre', '3bimestre', '4bimestre']
const TEMA_MAX_CHARS        = 120

const CURRICULO = {
  historia: {
    '6ano': {
      '1bimestre': 'Pré-História: origem da humanidade, nômades, domínio do fogo, pinturas rupestres, Homo sapiens',
      '2bimestre': 'Povos da Antiguidade: Mesopotâmia, Egito Antigo, escrita cuneiforme, hieróglifos, civilizações do Oriente',
      '3bimestre': 'Grécia Antiga: pólis, democracia ateniense, mitologia, filosofia, Olimpíadas',
      '4bimestre': 'Roma Antiga: República, Império, direito romano, cristianismo, queda do Império Romano',
    },
    '7ano': {
      '1bimestre': 'Idade Média: feudalismo, Igreja Católica, Cruzadas, vida no feudo, servos e senhores',
      '2bimestre': 'Povos da África e América antes da colonização: impérios africanos, astecas, maias, incas',
      '3bimestre': 'Grandes Navegações: Portugal, Espanha, rotas marítimas, chegada ao Brasil in 1500',
      '4bimestre': 'Colonização do Brasil: pau-brasil, capitanias hereditárias, escravidão indígena e africana',
    },
    '8ano': {
      '1bimestre': 'Iluminismo e Revoluções: Revolução Francesa, Revolução Industrial, direitos humanos',
      '2bimestre': 'Brasil Colônia e Independência: Dom João VI, Grito do Ipiranga, Dom Pedro I',
      '3bimestre': 'Brasil Império: abolição da escravidão, Lei Áurea, imigração europeia',
      '4bimestre': 'República Velha: Proclamação da República, café com leite, coronelismo',
    },
    '9ano': {
      '1bimestre': 'Primeira Guerra Mundial: causas, trincheiras, consequências, Tratado de Versalhes',
      '2bimestre': 'Era Vargas e Segunda Guerra Mundial: totalitarismo, nazismo, fascismo, Holocausto',
      '3bimestre': 'Guerra Fria: EUA vs URSS, corrida espacial, Cuba, Berlin',
      '4bimestre': 'Brasil Contemporâneo: ditadura militar, redemocratização, Constituição 1988',
    },
  },
  geografia: {
    '6ano': {
      '1bimestre': 'Orientação e localização: pontos cardeais, coordenadas geográficas, fusos horários, escalas',
      '2bimestre': 'Brasil: localização, fronteiras, território, estados, capitais, regiões brasileiras',
      '3bimestre': 'Relevo, clima e hidrografia do Brasil: biomas, bacias hidrográficas, Amazônia',
      '4bimestre': 'População brasileira: diversidade cultural, migrações internas, urbanização',
    },
    '7ano': {
      '1bimestre': 'América Latina: localização, países, relevo, clima, diversidade cultural',
      '2bimestre': 'América do Norte: EUA, Canadá, México, economia, urbanização',
      '3bimestre': 'Europa: localização, países, União Europeia, relevo, clima',
      '4bimestre': 'África: localização, diversidade, colonização, desafios contemporâneos',
    },
    '8ano': {
      '1bimestre': 'Ásia: localização, países, relevo, clima, tigres asiáticos, China, Índia',
      '2bimestre': 'Oceania e Antártida: localização, características físicas, povos originários',
      '3bimestre': 'Globalização: comércio mundial, blocos econômicos, multinacionais',
      '4bimestre': 'Geopolítica mundial: conflitos, refugiados, terrorismo, organismos internacionais',
    },
    '9ano': {
      '1bimestre': 'Urbanização brasileira: metrópoles, problemas urbanos, mobilidade, São Paulo',
      '2bimestre': 'Agropecuária e indústria no Brasil: agronegócio, desmatamento, desenvolvimento',
      '3bimestre': 'Energia e meio ambiente: fontes de energia, aquecimento global, sustentabilidade',
      '4bimestre': 'Brasil no contexto mundial: BRICS, desigualdade social, desafios do século XXI',
    },
  },
  matematica: {
    '6ano': {
      '1bimestre': 'Números naturais: sistema de numeração decimal, operações, potenciação, radiciação',
      '2bimestre': 'Números inteiros: representação, operações, situações-problema com temperaturas e dívidas',
      '3bimestre': 'Frações e números decimais: operações, porcentagem, razão e proporção',
      '4bimestre': 'Geometria: figuras planas, perímetro, área, ângulos, simetria',
    },
    '7ano': {
      '1bimestre': 'Números racionais: operações, potências de base 10, notação científica',
      '2bimestre': 'Expressões algébricas: variáveis, equações do 1º grau, inequações',
      '3bimestre': 'Proporcionalidade: regra de três simples e composta, grandezas proporcionais',
      '4bimestre': 'Geometria: círculo, circunferência, área, volume de prismas',
    },
    '8ano': {
      '1bimestre': 'Números reais: raízes quadradas, potências, produtos notáveis',
      '2bimestre': 'Equações do 2º grau: resolução, fórmula de Bhaskara, aplicações',
      '3bimestre': 'Sistemas de equações: métodos de resolução, aplicações práticas',
      '4bimestre': 'Teorema de Pitágoras: triângulos retângulos, trigonometria básica',
    },
    '9ano': {
      '1bimestre': 'Funções: definição, função afim, função quadrática, gráficos',
      '2bimestre': 'Geometria analítica: plano cartesiano, distância entre pontos, equação da reta',
      '3bimestre': 'Estatística e probabilidade: média, moda, mediana, gráficos, eventos',
      '4bimestre': 'Progressões aritméticas e geométricas: razão, soma dos termos',
    },
  },
  ciencias: {
    '6ano': {
      '1bimestre': 'Universo e Terra: sistema solar, planetas, satélites, movimentos da Terra, estações',
      '2bimestre': 'Matéria e energia: estados físicos, mudanças de estado, calor, temperatura',
      '3bimestre': 'Ser humano e saúde: células, tecidos, órgãos, sistemas do corpo humano',
      '4bimestre': 'Ecossistemas: cadeias alimentares, ciclos biogeoquímicos, biodiversidade',
    },
    '7ano': {
      '1bimestre': 'Vida e evolução: teorias da origem da vida, evolução, Darwin, seleção natural',
      '2bimestre': 'Classificação dos seres vivos: reinos, vírus, bactérias, fungos, protistas',
      '3bimestre': 'Plantas: estrutura, fotossíntese, reprodução, importância ecológica',
      '4bimestre': 'Animais: características, classificação, adaptações, biodiversidade brasileira',
    },
    '8ano': {
      '1bimestre': 'Reprodução humana: sistema reprodutor, puberdade, métodos contraceptivos, ISTs',
      '2bimestre': 'Genética: DNA, cromossomos, heredity, Mendel, biotecnologia',
      '3bimestre': 'Ondas: som, luz, espectro eletromagnético, óptica',
      '4bimestre': 'Eletricidade: cargas elétricas, circuitos, energia elétrica, segurança',
    },
    '9ano': {
      '1bimestre': 'Química: átomos, tabela periódica, ligações químicas, reações',
      '2bimestre': 'Substâncias e misturas: soluções, concentração, separação de misturas',
      '3bimestre': 'Tecnologia e sociedade: nanotecnologia, inteligência artificial, impactos ambientais',
      '4bimestre': 'Radioatividade e energia nuclear: fissão, fusão, aplicações e riscos',
    },
  },
  portugues: {
    '6ano': {
      '1bimestre': 'Leitura e interpretação: gêneros textuais, inferências, vocabulário em contexto',
      '2bimestre': 'Gramática: substantivo, adjetivo, artigo, pronome, classes gramaticais',
      '3bimestre': 'Produção textual: narração, descrição, coesão e coerência textual',
      '4bimestre': 'Verbo: conjugação, tempos verbais, concordância verbal e nominal',
    },
    '7ano': {
      '1bimestre': 'Gêneros argumentativos: artigo de opinião, carta de leitor, argumentação',
      '2bimestre': 'Sintaxe: sujeito, predicado, objeto direto e indireto, adjuntos',
      '3bimestre': 'Literatura brasileira: cordel, crônica, conto, autores brasileiros',
      '4bimestre': 'Ortografia e pontuação: regras ortográficas, uso da vírgula, ponto e vírgula',
    },
    '8ano': {
      '1bimestre': 'Variedades linguísticas: dialetos, registros formais e informais, preconceito linguístico',
      '2bimestre': 'Texto dissertativo-argumentativo: estrutura, tese, argumentos, conclusão',
      '3bimestre': 'Literatura: Romantismo, Realismo, principais autores brasileiros',
      '4bimestre': 'Período composto: orações coordenadas e subordinadas, conjunções',
    },
    '9ano': {
      '1bimestre': 'Redação: ENEM, estrutura, competências, repertório sociocultural',
      '2bimestre': 'Modernismo brasileiro: semana de 22, vanguardas europeias, autores',
      '3bimestre': 'Análise linguística: figuras de linguagem, intertextualidade, ironia',
      '4bimestre': 'Revisão geral: gramática, produção textual, literatura, preparação para o ensino médio',
    },
  },
}

const NOMES = {
  disciplina: { historia: 'História', geografia: 'Geografia', matematica: 'Matemática', ciencias: 'Ciências', portugues: 'Português' },
  serie: { '6ano': '6º ano', '7ano': '7º ano', '8ano': '8º ano', '9ano': '9º ano' },
  bimestre: { '1bimestre': '1º Bimestre', '2bimestre': '2º Bimestre', '3bimestre': '3º Bimestre', '4bimestre': '4º Bimestre' },
}

// ═══════════════════════════════════════════════════════════════════════
// gerarMissao
// ═══════════════════════════════════════════════════════════════════════
exports.gerarMissao = onCall(
  { secrets: [ANTHROPIC_KEY], region: 'us-central1', cors: true, invoker: 'public', timeoutSeconds: 60 },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Acesso Negado: Agente não identificado.')
    const { disciplina, serie, bimestre, tema, contextoTemporal, isDemo, titulosJaGerados } = request.data
    if (isDemo === true) {
      const uid = request.auth.uid
      const demoRef = db.collection('demos').doc(uid)
      const demoSnap = await demoRef.get()
      if (demoSnap.exists && demoSnap.data().usada === true) throw new HttpsError('already-exists', 'Demo já utilizada.')
    }
    if (!DISCIPLINAS_PERMITIDAS.includes(disciplina)) throw new HttpsError('invalid-argument', 'Disciplina inválida.')
    if (!SERIES_PERMITIDAS.includes(serie))           throw new HttpsError('invalid-argument', 'Série inválida.')
    if (!BIMESTRES_PERMITIDOS.includes(bimestre))     throw new HttpsError('invalid-argument', 'Bimestre inválido.')
    if (!tema || typeof tema !== 'string' || tema.length > TEMA_MAX_CHARS) throw new HttpsError('invalid-argument', 'Tema inválido.')
    
    // Sanitização contra caracteres de injeção direta de scripts
    const temaSanitizado = tema.replace(/[<>{}[\]\\\/]/g, '').trim()
    if (temaSanitizado.length < 3) throw new HttpsError('invalid-argument', 'Tema muito curto.')
const curriculoEspecifico = CURRICULO[disciplina]?.[serie]?.[bimestre] || ''
const antiRepeticao = titulosJaGerados && titulosJaGerados.length > 0
  ? `\n\nTÍTULOS JÁ GERADOS ANTERIORMENTE — NÃO REPITA ESTES ASSUNTOS:\n${titulosJaGerados.slice(0, 10).map(t => `- ${t}`).join('\n')}\nCrie um ângulo completamente diferente dentro do mesmo currículo.`
  : ''
      let infoTemporal = ''
    if (contextoTemporal) {
      infoTemporal = `\nINFORMAÇÃO DE TEMPO REAL: Hoje é dia ${parseInt(contextoTemporal.dia)}/${parseInt(contextoTemporal.mes)}/${parseInt(contextoTemporal.ano)}. Se houver algum feriado histórico, científico ou nacional próximo a esta data que tenha ligação com a matéria, insira uma menção sutil no roteiro do podcast para conectar o aluno com o mundo real.`
    }
    const prompt = `Você é um especialista em educação básica brasileira e psicologia do desenvolvimento infantil.
Crie uma missão educacional para o EduPlay — Instituto do Saber.

CONTEXTO PEDAGÓGICO:
- Faixa etária: 11-13 anos (Ensino Fundamental II)
- Fase do desenvolvimento: identidade em construção (Erikson)
- A criança é um "Agente Pesquisador" que investiga mistérios
- Tom: investigativo, desafiador, respeitoso — NÃO infantilizado
- Linguagem: direta, curiosa, que valoriza a inteligência da criança

DADOS DA MISSÃO:
- Disciplina: ${NOMES.disciplina[disciplina]}
- Série: ${NOMES.serie[serie]}
- Bimestre: ${NOMES.bimestre[bimestre]}
- Tema específico: ${temaSanitizado}
- Currículo SP/Paulista (${NOMES.serie[serie]} - ${NOMES.bimestre[bimestre]}): ${curriculoEspecifico}${infoTemporal}${antiRepeticao}

PRINCÍPIOS PSICOLÓGICOS A APLICAR:
1. Efeito Zeigarnik: termine com gancho — deixe o aluno querendo saber mais
2. Curiosidade epistêmica: a pergunta central deve ser genuinamente instigante
3. Zona de desenvolvimento proximal: desafiador mas alcançável
4. Autonomia: o aluno sente que está descobrindo, não memorizando

Gere EXATAMENTE este JSON, sem texto adicional, sem markdown:
{
  "titulo": "título investigativo da missão (max 50 chars)",
  "subtitulo": "subtítulo curto e direto (max 60 chars)",
  "perguntaCentral": "pergunta genuinamente intrigante que só é respondida ao completar a missão (max 100 chars)",
  "icone": "emoji único e representativo",
  "xp": número entre 80 e 200,
  "video": {
    "titulo": "título do podcast no estilo investigação (max 60 chars)",
    "duracao": "X min"
  },
  "atividades": {
    "quiz": [
      {
        "pergunta": "pergunta clara, contextualizada, sem pegadinha",
        "opcoes": ["opção A", "opção B", "opção C", "opção D"],
        "correta": índice_correto_entre_0_e_3,
        "explicacao": "explicação que revela o porquê, não só o quê — 1-2 frases instigantes"
      },
      {
        "pergunta": "segunda pergunta — nível ligeiramente maior",
        "opcoes": ["opção A", "opção B", "opção C", "opção D"],
        "correta": índice_correto_entre_0_e_3,
        "explicacao": "explicação com dado curioso ou conexão com o presente"
      },
      {
        "pergunta": "terceira pergunta — conexão com realidade do aluno",
        "opcoes": ["opção A", "opção B", "opção C", "opção D"],
        "correta": índice_correto_entre_0_e_3,
        "explicacao": "explicação que amplia a visão de mundo do aluno"
      }
    ],
    "forca": {
      "palavra": "PALAVRA_CHAVE_EM_MAIUSCULO_SEM_ACENTO_SEM_ESPACO",
      "dica": "dica que instiga sem entregar — max 60 chars"
    },
    "caca": {
      "palavras": ["PALAVRA1", "PALAVRA2", "PALAVRA3", "PALAVRA4", "PALAVRA5"]
    }
  },
  "resumo": "explicação do assunto in 3-4 frases simples e diretas, como um professor falaria para um aluno de 12 anos — sem termos técnicos, sem enrolação",
  "topicos": ["tópico 1 — conceito central", "tópico 2 — curiosidade real", "tópico 3 — conexão com o presente", "tópico 4 — impacto na vida", "tópico 5 — gancho para ir além"],
  "roteiroPodcast": "roteiro completo do podcast: 4-5 parágrafos, linguagem investigativa para 11-13 anos. Começa com situação intrigante, desenvolve o conteúdo com conexões reais. Última frase: 'Missão registrada, Agente!'"
}

REGRAS INVIOLÁVEIS:
- Conteúdo 100% alinhado ao currículo
- Palavras da forca: apenas letras maiúsculas A-Z, sem acentos, sem espaços
- 4 opções no quiz sempre, apenas uma correta
- Responda APENAS o JSON puro, sem marcação markdown como \`\`\`json`

    const client = new Anthropic({ apiKey: ANTHROPIC_KEY.value() })
    let resposta
    try {
      // 🛠️ CORREÇÃO DA REGRA INVIOLÁVEL: Modelo atualizado para a infraestrutura estável de 2026
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001', max_tokens: 2500, temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      })
      resposta = msg.content[0].text
    } catch (err) {
      console.error('[ERRO ANTHROPIC DETALHADO]:', err)
      throw new HttpsError('internal', `Falha de comunicação com a IA: ${err.message}`)
    }
    let missao
    try {
      const jsonStr = resposta.substring(resposta.indexOf('{'), resposta.lastIndexOf('}') + 1)
      missao = JSON.parse(jsonStr)
    } catch (err) {
      console.error('Erro parse JSON:', resposta)
      throw new HttpsError('internal', 'O arquivo recebido da inteligência estava corrompido.')
    }
    if (!missao.titulo || !missao.perguntaCentral || !Array.isArray(missao.atividades?.quiz) || missao.atividades.quiz.length < 3 || !missao.atividades?.forca?.palavra || !missao.roteiroPodcast) {
      throw new HttpsError('internal', 'A missão gerada não passou no controle de qualidade.')
    }
    if (isDemo === true) {
      const uid = request.auth.uid
      await db.collection('demos').doc(uid).set({ usada: true, disciplina: NOMES.disciplina[disciplina] || disciplina, assunto: missao.titulo || NOMES.disciplina[disciplina], timestamp: new Date().toISOString() })
    }
    return {
      ok: true,
      missao: { ...missao, id: `${disciplina}_${serie}_${bimestre}_${Date.now()}`, disciplina, serie, bimestre, tema: temaSanitizado, geradaPorIA: true, desbloqueada: true, criadaEm: new Date().toISOString() }
    }
  }
)

// ═══════════════════════════════════════════════════════════════════════
// gerarAudio — TTS feminina (leitura)
// ═══════════════════════════════════════════════════════════════════════
exports.gerarAudio = onCall(
  { secrets: [GOOGLE_TTS_KEY], region: 'us-central1', cors: true, invoker: 'public', timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Acesso negado.')
    const { texto } = request.data
    if (!texto || typeof texto !== 'string' || texto.length > 5000) throw new HttpsError('invalid-argument', 'Texto inválido.')
    try {
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY.value()}`,
        { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ 
            input: { text: texto.trim().slice(0, 5000) }, 
            voice: { languageCode: 'pt-BR', name: 'pt-BR-Wavenet-A', ssmlGender: 'FEMALE' }, 
            audioConfig: { audioEncoding: 'MP3', speakingRate: 0.92, pitch: 1.0 } 
          }) 
        }
      )
      if (!response.ok) throw new HttpsError('internal', 'Erro ao gerar áudio.')
      const data = await response.json()
      // Salva no Storage e retorna URL publica
      const buffer = Buffer.from(data.audioContent, 'base64')
      const bucket = admin.storage().bucket()
      const nomeArquivo = `audios/tts_${Date.now()}.mp3`
      const file = bucket.file(nomeArquivo)
      await file.save(buffer, { contentType: 'audio/mpeg', metadata: { cacheControl: 'public, max-age=3600' } })
      await file.makePublic()
      const audioUrl = `https://storage.googleapis.com/${bucket.name}/${nomeArquivo}`
      return { ok: true, audioUrl }
    } catch (err) {
      throw new HttpsError('internal', 'Falha ao gerar áudio.')
    }
  }
)

// ═══════════════════════════════════════════════════════════════════════
// gerarAudioAssistente — TTS masculina (assistente)
// ═══════════════════════════════════════════════════════════════════════
exports.gerarAudioAssistente = onCall(
  { secrets: [GOOGLE_TTS_KEY], region: 'us-central1', cors: true, invoker: 'public', timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Acesso negado.')
    const { texto } = request.data
    if (!texto || typeof texto !== 'string') throw new HttpsError('invalid-argument', 'Texto vazio.')
    try {
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY.value()}`,
        { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ 
            input: { text: texto.trim().slice(0, 1000) }, 
            voice: { languageCode: 'pt-BR', name: 'pt-BR-Wavenet-B', ssmlGender: 'MALE' }, 
            audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95, pitch: 0.5 } 
          }) 
        }
      )
      if (!response.ok) throw new HttpsError('internal', 'Erro ao sintetizar áudio.')
      const data = await response.json()
      return { ok: true, audioBase64: data.audioContent }
    } catch {
      throw new HttpsError('internal', 'Erro ao gerar áudio.')
    }
  }
)

// ═══════════════════════════════════════════════════════════════════════
// gerarMetadadosPodcast
// ═══════════════════════════════════════════════════════════════════════
exports.gerarMetadadosPodcast = onCall(
  { secrets: [ANTHROPIC_KEY], region: 'us-central1', cors: true, invoker: 'public', timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Acesso negado.')
    const { disciplina, bimestre, serie } = request.data
    if (!disciplina || !bimestre || !serie) throw new HttpsError('invalid-argument', 'Dados inválidos.')
    const curriculoEspecifico = CURRICULO[disciplina]?.[serie]?.[bimestre] || ''
    const nomeDisc = NOMES.disciplina[disciplina] || disciplina
    const nomeSerie = NOMES.serie[serie] || serie
    const nomeBim = NOMES.bimestre[bimestre] || bimestre
    const client = new Anthropic({ apiKey: ANTHROPIC_KEY.value() })
    
    // 🛠️ MODELO ATUALIZADO
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 300,
      messages: [{ role: 'user', content: `Crie um título e descrição curta para um podcast educacional.\nDisciplina: ${nomeDisc} | Série: ${nomeSerie} | ${nomeBim}\nConteúdo: ${curriculoEspecifico}\n\nRetorne APENAS este JSON sem markdown:\n{"titulo":"título criativo e investigativo (max 60 chars)","descricao":"descrição envolvente para crianças de 11-13 anos (max 120 chars)"}` }]
    })
    const text = msg.content[0].text
    const json = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1))
    return { titulo: json.titulo, descricao: json.descricao }
  }
)

// ═══════════════════════════════════════════════════════════════════════
// perguntarAssistente — Assistente de dúvidas pedagógico
// ═══════════════════════════════════════════════════════════════════════
exports.perguntarAssistente = onCall(
  { secrets: [ANTHROPIC_KEY], region: 'us-central1', cors: true, invoker: 'public', timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Acesso negado.')

    // Rate limit — mesma logica do orientacaoFamiliar, evita custo inesperado na API
    const uid = request.auth.uid
    const hoje = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const rateRef = db.collection('rateLimits').doc(`perguntarAssistente_${uid}_${hoje}`)
    const rateSnap = await rateRef.get()
    const totalHoje = rateSnap.exists ? (rateSnap.data().total || 0) : 0
    if (totalHoje >= 15) {
      throw new HttpsError('resource-exhausted', 'LIMITE_DIARIO')
    }

    const { pergunta, tema, disciplina, resumo } = request.data
    if (!pergunta || typeof pergunta !== 'string') throw new HttpsError('invalid-argument', 'Pergunta vazia.')
    if (pergunta.length > 500) throw new HttpsError('invalid-argument', 'Pergunta muito longa.')
    const client = new Anthropic({ apiKey: ANTHROPIC_KEY.value() })
    
    // 🛠️ MODELO ATUALIZADO
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 300,
      system: `Você é um assistente educacional para crianças de 11-12 anos. Responda APENAS sobre o tema: "${tema}" (${disciplina}). Contexto: ${resumo ? resumo.slice(0, 300) : ''}. Se a pergunta for sobre outro assunto, responda exatamente: "Essa dúvida está fora da nossa missão de hoje! Me pergunta sobre ${tema}." Use linguagem simples, direta e encorajadora. Máximo 3 frases.`,
      messages: [{ role: 'user', content: pergunta.slice(0, 500) }]
    })

    // Incrementa contador de rate limit
    await rateRef.set({
      total: totalHoje + 1,
      uid,
      data: hoje,
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })

    return { resposta: msg.content[0].text, restantes: 15 - (totalHoje + 1) }
  }
)

// ═══════════════════════════════════════════════════════════════════════
// gerarMensagemMotivacional — Mensagem + perguntas pedagógicas para o pai
// ═══════════════════════════════════════════════════════════════════════
exports.gerarMensagemMotivacional = onCall(
  { secrets: [ANTHROPIC_KEY], region: 'us-central1', cors: true, invoker: 'public', timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Acesso negado.')
    const { nomeFilho, serie, totalMissoes, ultimoPercentual, diasAtivos, tituloMissao, topicos } = request.data
    if (!nomeFilho || typeof nomeFilho !== 'string') throw new HttpsError('invalid-argument', 'Nome do filho obrigatorio.')

    let nivelDesempenho = 'sem_dados'
    if (ultimoPercentual !== null && ultimoPercentual !== undefined) {
      if (ultimoPercentual >= 70) nivelDesempenho = 'otimo'
      else if (ultimoPercentual >= 40) nivelDesempenho = 'bom'
      else nivelDesempenho = 'ruim'
    }

    const contexto = {
      sem_dados: nomeFilho + ' ainda nao completou nenhuma atividade.',
      otimo:     nomeFilho + ' acertou ' + ultimoPercentual + '% na ultima atividade — otimo desempenho.',
      bom:       nomeFilho + ' acertou ' + ultimoPercentual + '% na ultima atividade — desempenho regular, em evolucao.',
      ruim:      nomeFilho + ' acertou ' + ultimoPercentual + '% na ultima atividade — esta com dificuldades.',
    }[nivelDesempenho]

    const topicosTexto = topicos && topicos.length > 0 ? topicos.slice(0, 3).join(', ') : ''
    const missaoTexto = tituloMissao ? 'Titulo da missao: ' + tituloMissao + '. Topicos estudados: ' + topicosTexto : ''

    const prompt = 'Voce e um psicologo educacional especialista em motivacao parental.\n\nGere duas coisas para o responsavel de ' + nomeFilho + ', aluno do ' + (serie || '6 ano') + '.\n\nCONTEXTO:\n- ' + contexto + '\n- Total de missoes concluidas: ' + (totalMissoes || 0) + '\n- Dias ativos no app: ' + (diasAtivos || 0) + '\n- ' + missaoTexto + '\n\nRESPONDA APENAS WITH ESTE JSON SEM MARKDOWN:\n{\n  "mensagem": "mensagem de 2-3 frases para o responsavel. Honesto sobre o desempenho. Termina com uma acao concreta para hoje. Sem emojis. Sem saudacao.",\n  "perguntas": [\n    "pergunta 1 especifica sobre o conteudo de ' + (tituloMissao || 'a missao') + ' — que o filho possa responder",\n    "pergunta 2 conectando o conteudo com situacoes do dia a dia do filho",\n    "pergunta 3 que estimule o filho a explicar o conceito com suas proprias palavras"\n  ]\n}'

    const client = new Anthropic({ apiKey: ANTHROPIC_KEY.value() })
    
    // 🛠️ MODELO ATUALIZADO
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    let resultado
    try {
      const texto = msg.content[0].text.trim()
      const jsonStr = texto.substring(texto.indexOf('{'), texto.lastIndexOf('}') + 1)
      resultado = JSON.parse(jsonStr)
    } catch (err) {
      resultado = {
        mensagem: msg.content[0].text.trim(),
        perguntas: ['O que voce aprendeu hoje?', 'Como explicaria isso para um amigo?', 'Onde usamos isso no dia a dia?']
      }
    }

    return { ok: true, mensagem: resultado.mensagem, perguntas: resultado.perguntas || [] }
  }
)

// ═══════════════════════════════════════════════════════════════════════
// MERCADO PAGO — Assinaturas
// ═══════════════════════════════════════════════════════════════════════
const { onRequest } = require('firebase-functions/v2/https')
const MP_ACCESS_TOKEN = defineSecret('MP_ACCESS_TOKEN')
const MP_PUBLIC_KEY   = defineSecret('MP_PUBLIC_KEY')

/** Cria link de checkout de assinatura no Mercado Pago */
exports.criarAssinatura = onCall(
  { secrets: [MP_ACCESS_TOKEN], region: 'us-central1', cors: true, invoker: 'public', timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Acesso negado.')
    const { codigoAcesso, emailResponsavel, nomeResponsavel } = request.data
    
    // Sanitização e defesa NoSQL Injection contra o ID do documento Firestore
    if (!codigoAcesso || typeof codigoAcesso !== 'string' || codigoAcesso.includes('/') || codigoAcesso.trim() === '') {
      throw new HttpsError('invalid-argument', 'Código de acesso obrigatório e válido.')
    }

    try {
      const response = await fetch('https://api.mercadopago.com/preapproval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MP_ACCESS_TOKEN.value()}`,
        },
        body: JSON.stringify({
          reason: 'EduPlay — Plano Mensal',
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: 20.00,
            currency_id: 'BRL',
          },
          back_url: 'https://eduplay.olloapp.com.br/pais',
          payer_email: emailResponsavel || '',
          external_reference: codigoAcesso.trim(),
          status: 'pending',
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.init_point) {
        console.error('Erro MP:', data)
        throw new HttpsError('internal', 'Erro ao criar assinatura no Mercado Pago.')
      }

      // Salva referência no Firestore usando a string tratada
      await db.collection('criancas').doc(codigoAcesso.trim()).set({
        mpPreapprovalId: data.id,
        assinaturaStatus: 'pendente',
        atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true })

      return { ok: true, checkoutUrl: data.init_point, preapprovalId: data.id }
    } catch (err) {
      console.error('Erro criarAssinatura:', err)
      throw new HttpsError('internal', 'Falha ao criar assinatura.')
    }
  }
)


// ═══════════════════════════════════════════════════════════════════════
// criarPagamentoPix — Gera QR Code PIX para pagamento mensal
// ═══════════════════════════════════════════════════════════════════════
exports.criarPagamentoPix = onCall(
  { secrets: [MP_ACCESS_TOKEN], region: 'us-central1', cors: true, invoker: 'public', timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Acesso negado.')
    const { codigoAcesso, emailResponsavel, nomeResponsavel } = request.data

    if (!codigoAcesso || typeof codigoAcesso !== 'string' || codigoAcesso.includes('/') || codigoAcesso.trim() === '') {
      throw new HttpsError('invalid-argument', 'Código de acesso obrigatório e válido.')
    }

    try {
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MP_ACCESS_TOKEN.value()}`,
          'X-Idempotency-Key': `pix-${codigoAcesso.trim()}-${Date.now()}`,
        },
        body: JSON.stringify({
          transaction_amount: 20.00,
          description: 'EduPlay — Acesso Mensal',
          payment_method_id: 'pix',
          payer: {
            email: emailResponsavel || 'pagador@eduplay.com.br',
            first_name: nomeResponsavel || 'Responsavel',
          },
          external_reference: codigoAcesso.trim(),
          date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.point_of_interaction?.transaction_data) {
        console.error('Erro MP PIX:', data)
        throw new HttpsError('internal', 'Erro ao gerar PIX.')
      }

      await db.collection('criancas').doc(codigoAcesso.trim()).set({
        pixPaymentId: data.id,
        pixStatus: 'pendente',
        atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true })

      return {
        ok: true,
        pixId: data.id,
        qrCode: data.point_of_interaction.transaction_data.qr_code,
        qrCodeBase64: data.point_of_interaction.transaction_data.qr_code_base64,
        expiracao: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }
    } catch (err) {
      console.error('Erro criarPagamentoPix:', err)
      throw new HttpsError('internal', 'Falha ao gerar PIX.')
    }
  }
)

/** Webhook do Mercado Pago — chamado quando pagamento é confirmado */
exports.webhookMP = onRequest(
  { secrets: [MP_ACCESS_TOKEN], region: 'us-central1', cors: true },
  async (req, res) => {
    if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return; }

    try {
      const { type, data } = req.body

      // ── PIX: notificacao de pagamento avulso ──
      if (type === 'payment') {
        const paymentId = data?.id
        if (!paymentId) { res.status(200).send('OK'); return; }

        // Nunca confiar no corpo da notificacao — confere direto na API do MP
        const payResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN.value()}` },
        })
        if (!payResp.ok) { res.status(200).send('OK'); return; }
        const pagamento = await payResp.json()

        const codigoPix = pagamento.external_reference
        if (!codigoPix || typeof codigoPix !== 'string' || codigoPix.includes('/')) {
          res.status(200).send('OK'); return;
        }
        const cleanPix = codigoPix.trim()

        if (pagamento.status === 'approved') {
          await db.collection('criancas').doc(cleanPix).set({
            assinaturaAtiva: true,
            plano: 'pix',
            pixStatus: 'pago',
            pixPaymentId: pagamento.id,
            assinaturaInicio: admin.firestore.FieldValue.serverTimestamp(),
            atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true })
          console.log(`✅ PIX aprovado — acesso liberado: ${cleanPix}`)
        } else if (pagamento.status === 'cancelled' || pagamento.status === 'rejected' || pagamento.status === 'expired') {
          await db.collection('criancas').doc(cleanPix).set({
            pixStatus: pagamento.status,
            atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true })
          console.log(`[pix] ${pagamento.status}: ${cleanPix}`)
        }
        res.status(200).send('OK'); return;
      }

      // Assinatura recorrente (cartao) — preapproval
      if (type !== 'preapproval') { res.status(200).send('OK'); return; }

      const preapprovalId = data?.id
      if (!preapprovalId) { res.status(200).send('OK'); return; }

      // Busca detalhes da assinatura no MP
      const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN.value()}` },
      })
      
      if (!mpResponse.ok) { res.status(200).send('OK'); return; }
      const assinatura = await mpResponse.json()

      const codigoAcesso = assinatura.external_reference
      const status = assinatura.status // authorized | paused | cancelled

      // Defesa estrita: Garante que o ID de acesso seja uma string limpa antes do Firestore
      if (!codigoAcesso || typeof codigoAcesso !== 'string' || codigoAcesso.includes('/')) { 
        res.status(200).send('OK'); 
        return; 
      }

      const cleanCodigo = codigoAcesso.trim()

      if (status === 'authorized') {
        // Pagamento confirmado — ativa acesso
        await db.collection('criancas').doc(cleanCodigo).set({
          assinaturaAtiva: true,
          assinaturaStatus: 'ativa',
          mpPreapprovalId: preapprovalId,
          assinaturaInicio: admin.firestore.FieldValue.serverTimestamp(),
          atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true })
        console.log(`✅ Assinatura ativada: ${cleanCodigo}`)
      } else if (status === 'cancelled' || status === 'paused') {
        // Cancelado — desativa acesso
        await db.collection('criancas').doc(cleanCodigo).set({
          assinaturaAtiva: false,
          assinaturaStatus: status,
          atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true })
        console.log(`❌ Assinatura ${status}: ${cleanCodigo}`)
      }

      res.status(200).send('OK')
    } catch (err) {
      console.error('Erro webhook MP:', err)
      res.status(200).send('OK') // sempre retorna 200 para o MP não retentar
    }
  }
)


// ═══════════════════════════════════════════════════════════════════════
// orientacaoFamiliar — Assistente pedagógico para responsáveis
// ═══════════════════════════════════════════════════════════════════════
exports.orientacaoFamiliar = onCall(
  { secrets: [ANTHROPIC_KEY], region: 'us-central1', cors: true, invoker: 'public', timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Acesso negado.')

    const uid = request.auth.uid
    const hoje = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const rateRef = db.collection('rateLimits').doc(`orientacao_${uid}_${hoje}`)
    const rateSnap = await rateRef.get()
    const totalHoje = rateSnap.exists ? (rateSnap.data().total || 0) : 0

    if (totalHoje >= 10) {
      throw new HttpsError('resource-exhausted', 'LIMITE_DIARIO')
    }

    const { messages } = request.data

    // Validacao do input
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 10) {
      throw new HttpsError('invalid-argument', 'Formato de mensagens invalido.')
    }
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== 'string') {
        throw new HttpsError('invalid-argument', 'Mensagem com formato invalido.')
      }
      if (!['user', 'assistant'].includes(msg.role)) {
        throw new HttpsError('invalid-argument', 'Role invalido.')
      }
      if (msg.content.length > 2000) {
        throw new HttpsError('invalid-argument', 'Mensagem muito longa.')
      }
    }

    // Sanitizacao — remove caracteres de controle
    const messagesSanitizadas = messages.map(msg => ({
      role: msg.role,
      content: msg.content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim().slice(0, 2000),
    }))

    const client = new Anthropic({ apiKey: ANTHROPIC_KEY.value() })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: 'Voce e um assistente educacional do EduPlay, com formacao em pedagogia e psicologia educacional. Seu papel e orientar responsaveis sobre como apoiar o desenvolvimento escolar e emocional de criancas e adolescentes do 6 ao 9 ano do Ensino Fundamental. Responda em portugues brasileiro de forma empatica e pratica. Use linguagem acessivel. De orientacoes concretas com exemplos do dia a dia. Nunca faca diagnosticos clinicos. Nunca substitua a avaliacao de um profissional. Se o assunto for grave oriente a buscar profissional especializado. Seja objetivo com respostas entre 3 e 6 paragrafos curtos. Finalize com uma dica pratica e acolhedora. IMPORTANTE: nao use markdown, asteriscos, hashtags, negrito, italico ou qualquer formatacao especial. Escreva apenas texto simples e corrido.',
      messages: messagesSanitizadas,
    })

    // Incrementa contador de rate limit
    await rateRef.set({
      total: totalHoje + 1,
      uid,
      data: hoje,
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })

    const restantes = 10 - (totalHoje + 1)

    return {
      ok: true,
      resposta: msg.content[0].text,
      restantes,
    }
  }
)

// deploy-202606040403

// security-202606040516


// ═══════════════════════════════════════════════════════════════════════
// autoGerarMissoes — roda todo dia util as 07h (America/Sao_Paulo)
// ═══════════════════════════════════════════════════════════════════════
exports.autoGerarMissoes = onSchedule(
  { schedule: '0 7 * * 1-5', timeZone: 'America/Sao_Paulo', region: 'us-central1', secrets: [ANTHROPIC_KEY] },
  async () => {
    const db = admin.firestore()
    const _agora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
    const hoje = _agora.getFullYear() + '-' + String(_agora.getMonth()+1).padStart(2,'0') + '-' + String(_agora.getDate()).padStart(2,'0')
    const diaSemana = _agora.getDay() // 1-5 = seg-sex

    if (diaSemana === 0 || diaSemana === 6) return

    // Busca todos os responsaveis com autoMissoes=true
    const respSnap = await db.collection('responsaveis')
      .where('autoMissoes', '==', true)
      .get()

    if (respSnap.empty) return
    console.log(`[autoGerarMissoes] ${respSnap.size} responsaveis com auto ativo`)

    for (const respDoc of respSnap.docs) {
      try {
        const resp = respDoc.data()
        const paiId = respDoc.id
        const limiteDia = resp.limiteMissoes || 3
        const serie = resp.serie || '6ano'
        const bimestre = resp.bimestre || '1bimestre'

        // Busca crianca vinculada
        const criancaSnap = await db.collection('criancas')
          .where('parentId', '==', paiId)
          .where('status', '==', 'ativo')
          .limit(1)
          .get()

        if (criancaSnap.empty) continue
        const crianca = criancaSnap.docs[0]
        const criancaId = crianca.id
        const criancaData = crianca.data()

        // Verifica se tem acesso ativo (assinante ou trial valido)
        if (criancaData.plano === 'expirado') {
          console.log(`[auto] pulando ${criancaId} — trial expirado`)
          continue
        }
        if (!criancaData.assinaturaAtiva) {
          // Verifica dias uteis do trial
          if (!criancaData.trialInicio) { console.log(`[auto] pulando ${criancaId} — sem trial`); continue }
          const inicio = criancaData.trialInicio.toDate ? criancaData.trialInicio.toDate() : new Date(criancaData.trialInicio)
          const agora = new Date()
          let diasUteis = 0
          const cursor = new Date(inicio)
          cursor.setHours(0, 0, 0, 0)
          const hoje2 = new Date(agora)
          hoje2.setHours(0, 0, 0, 0)
          while (cursor < hoje2) {
            const dia = cursor.getDay()
            if (dia !== 0 && dia !== 6) diasUteis++
            cursor.setDate(cursor.getDate() + 1)
          }
          if (diasUteis >= 5) { console.log(`[auto] pulando ${criancaId} — trial expirado (${diasUteis} dias)`); continue }
        }

        // Respeita a pausa manual do responsavel (recurso "Pausar missoes")
        if (criancaData.missoesPausadas) {
          console.log(`[auto] pulando ${criancaId} — missoes pausadas manualmente pelo responsavel`)
          continue
        }

        // Ja pausado automaticamente por inatividade — so volta quando o responsavel reativar
        if (criancaData.autoPausadaPorInatividade) {
          console.log(`[auto] pulando ${criancaId} — pausado por inatividade, aguardando reativacao manual`)
          continue
        }

        // Pausa automatica: 3+ dias sem completar nenhuma missao
        const ultimaFeitaSnap = await db.collection('missoes').doc(criancaId).collection('geradas')
          .where('feita', '==', true)
          .orderBy('feitaEm', 'desc')
          .limit(1)
          .get()

        const referenciaAtividade = !ultimaFeitaSnap.empty
          ? ultimaFeitaSnap.docs[0].data().feitaEm?.toDate?.()
          : (criancaData.criadoEm?.toDate ? criancaData.criadoEm.toDate() : null)

        if (referenciaAtividade) {
          const diasSemAtividade = Math.floor((_agora - referenciaAtividade) / (1000 * 60 * 60 * 24))
          if (diasSemAtividade >= 3) {
            await db.collection('criancas').doc(criancaId).set({
              autoPausadaPorInatividade: true,
              autoPausadaEm: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true })
            console.log(`[auto] ${criancaId} pausado automaticamente — ${diasSemAtividade} dias sem completar missao`)
            continue
          }
        }


        // Conta missoes geradas hoje (subcolecao geradas/{criancaId})
        const missoesHoje = await db.collection('missoes').doc(criancaId).collection('geradas')
          .where('data', '==', hoje)
          .get()

        const qtdHoje = missoesHoje.size
        if (qtdHoje >= limiteDia) {
          console.log(`[auto] ${criancaId} ja tem ${qtdHoje} missoes hoje`)
          continue
        }

        const faltam = limiteDia - qtdHoje
        const disciplinas = ['matematica', 'portugues', 'geografia', 'ciencias']

        // Busca titulos ja gerados para evitar repeticao
        const titulosSnap = await db.collection('missoes').doc(criancaId).collection('geradas')
          .orderBy('criadoEm', 'desc')
          .limit(20)
          .get()
        const titulosJaGerados = titulosSnap.docs.map(d => d.data().titulo || '').filter(Boolean)

        for (let i = 0; i < faltam; i++) {
          const disciplina = disciplinas[i % disciplinas.length]
          const tema = CURRICULO[disciplina]?.[serie]?.[bimestre] || disciplina
          try {
            // Gera missao via Anthropic com prompt completo
            const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY.value() })
            const curriculoTema = CURRICULO[disciplina]?.[serie]?.[bimestre] || tema
            const antiRep = titulosJaGerados.length > 0
              ? '\nTITULOS JA GERADOS — NAO REPITA: ' + titulosJaGerados.slice(0,5).join(', ') + '. Crie um angulo diferente.'
              : ''
            const prompt = `Voce e um especialista em educacao basica brasileira.
Crie uma missao educacional gamificada para o EduPlay.

DADOS:
- Disciplina: ${NOMES.disciplina[disciplina] || disciplina}
- Serie: ${NOMES.serie[serie] || serie}
- Bimestre: ${NOMES.bimestre[bimestre] || bimestre}
- Curriculo: ${curriculoTema}${antiRep}

Faixa etaria: 11-13 anos. Tom: investigativo, desafiador, NAO infantilizado.
A crianca e um "Agente Pesquisador" que investiga misterios.

Gere EXATAMENTE este JSON, sem texto adicional, sem markdown:
{
  "titulo": "titulo investigativo max 50 chars",
  "subtitulo": "subtitulo curto max 60 chars",
  "perguntaCentral": "pergunta intrigante max 100 chars",
  "icone": "emoji unico",
  "xp": numero entre 80 e 200,
  "video": {
    "titulo": "titulo do podcast estilo investigacao max 60 chars",
    "duracao": "X min"
  },
  "atividades": {
    "quiz": [
      {
        "pergunta": "pergunta clara e contextualizada",
        "opcoes": ["opcao A", "opcao B", "opcao C", "opcao D"],
        "correta": indice_correto_entre_0_e_3,
        "explicacao": "explicacao de 1-2 frases"
      },
      {
        "pergunta": "segunda pergunta nivel medio",
        "opcoes": ["opcao A", "opcao B", "opcao C", "opcao D"],
        "correta": indice_correto_entre_0_e_3,
        "explicacao": "explicacao com dado curioso"
      },
      {
        "pergunta": "terceira pergunta conexao com realidade",
        "opcoes": ["opcao A", "opcao B", "opcao C", "opcao D"],
        "correta": indice_correto_entre_0_e_3,
        "explicacao": "explicacao que amplia visao"
      }
    ],
    "forca": {
      "palavra": "PALAVRA_MAIUSCULO_SEM_ACENTO_SEM_ESPACO",
      "dicas": ["dica facil e generica max 40 chars", "dica media mais especifica max 50 chars", "dica forte quase entrega max 60 chars"]
    }
  },
  "resumo": "explicacao do assunto em 3-4 frases simples para crianca de 12 anos",
  "topicos": ["topico 1", "topico 2", "topico 3", "topico 4", "topico 5"],
  "roteiroPodcast": "roteiro completo: 4-5 paragrafos, linguagem investigativa. Ultima frase: Missao registrada, Agente!"
}

REGRAS: quiz 4 opcoes reais apenas uma correta indice 0-3. Perguntas com resposta verificavel sobre fatos reais. Forca letras A-Z sem acentos sem espacos. dicas e array com 3 strings progressivas. Responda APENAS JSON puro sem markdown.`
            
            const msg = await anthropic.messages.create({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 2500,
              temperature: 0.7,
              messages: [{ role: 'user', content: prompt }]
            })

            let missao
            try {
              const texto = msg.content[0].text
              const json = texto.substring(texto.indexOf('{'), texto.lastIndexOf('}') + 1)
              missao = JSON.parse(json)
            } catch {
              console.warn('[auto] parse falhou para', disciplina)
              continue
            }

            // Validacao de conteudo — garante que o quiz gerado faz sentido
            // antes de mostrar pra crianca (a IA pode "alucinar" um indice invalido)
            const quiz = missao?.atividades?.quiz
            const quizValido = Array.isArray(quiz) && quiz.length > 0 && quiz.every(q =>
              q && typeof q.pergunta === 'string' && q.pergunta.trim() &&
              Array.isArray(q.opcoes) && q.opcoes.length === 4 &&
              q.opcoes.every(o => typeof o === 'string' && o.trim()) &&
              Number.isInteger(q.correta) && q.correta >= 0 && q.correta <= 3
            )
            const forca = missao?.atividades?.forca
            const forcaValida = forca && typeof forca.palavra === 'string' &&
              /^[A-Z0-9]+$/.test(forca.palavra) &&
              Array.isArray(forca.dicas) && forca.dicas.length === 3

            if (!missao?.titulo || !quizValido || !forcaValida) {
              console.warn(`[auto] missao invalida gerada para ${disciplina} (${criancaId}) — descartada`, {
                temTitulo: !!missao?.titulo, quizValido, forcaValida,
              })
              continue
            }

            await db.collection('missoes').doc(criancaId).collection('geradas').add({
              disciplina,
              serie,
              bimestre,
              titulo: missao.titulo || 'Missão do Dia',
              perguntaCentral: missao.perguntaCentral || '',
              resumo: missao.resumo || '',
              topicos: missao.topicos || [],
              roteiroPodcast: missao.roteiroPodcast || '',
              video: missao.video || {},
              atividades: missao.atividades || {},
              feita: false,
              autoGerada: true,
              data: hoje,
              criadoEm: admin.firestore.FieldValue.serverTimestamp()
            })
            console.log(`[auto] missao gerada: ${disciplina} para ${criancaId}`)
          } catch (err) {
            console.error(`[auto] erro gerando ${disciplina}:`, err.message)
          }
        }
      } catch (err) {
        console.error('[auto] erro no responsavel', respDoc.id, err.message)
      }
    }
  }
)


// ═══════════════════════════════════════════════════════════════════════
// verificarTrialExpirado — roda todo dia meia-noite, marca trial expirado
// ═══════════════════════════════════════════════════════════════════════
exports.verificarTrialExpirado = onSchedule(
  { schedule: '0 0 * * *', timeZone: 'America/Sao_Paulo', region: 'us-central1'},
  async () => {
    const agora = new Date()
    let expirados = 0

    // 1. Verifica trials gratuitos
    const snapTrial = await db.collection('criancas')
      .get()

    for (const doc of snapTrial.docs) {
      try {
        const dados = doc.data()
        if (dados.plano === 'expirado') continue
        if (dados.assinaturaAtiva === true) continue
        if (!dados.trialInicio) {
          await db.collection('criancas').doc(doc.id).set({
            trialInicio: admin.firestore.FieldValue.serverTimestamp(),
            atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true })
          console.log(`[trial] iniciado retroativamente: ${doc.id}`)
          continue
        }

        const inicio = dados.trialInicio.toDate
          ? dados.trialInicio.toDate()
          : new Date(dados.trialInicio)

        let diasUteis = 0
        const cursor = new Date(inicio)
        cursor.setHours(0, 0, 0, 0)
        const hoje = new Date(agora)
        hoje.setHours(0, 0, 0, 0)

        while (cursor < hoje) {
          const dia = cursor.getDay()
          if (dia !== 0 && dia !== 6) diasUteis++
          cursor.setDate(cursor.getDate() + 1)
        }

        if (diasUteis >= 5) {
          await db.collection('criancas').doc(doc.id).set({
            plano: 'expirado',
            trialExpiradoEm: admin.firestore.FieldValue.serverTimestamp(),
            atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true })
          expirados++
          console.log(`[trial] expirado: ${doc.id}`)
        } else {
          console.log(`[trial] ativo: ${doc.id} — ${5 - diasUteis} restantes`)
        }
      } catch (err) {
        console.error('[trial] erro:', doc.id, err.message)
      }
    }

    // 2. Verifica assinantes PIX — expira em 30 dias
    const snapPix = await db.collection('criancas')
      .where('assinaturaAtiva', '==', true)
      .get()

    for (const doc of snapPix.docs) {
      try {
        const dados = doc.data()
        if (!dados.pixPaymentId) continue
        if (!dados.assinaturaInicio) continue

        const inicio = dados.assinaturaInicio.toDate
          ? dados.assinaturaInicio.toDate()
          : new Date(dados.assinaturaInicio)

        const diffDias = Math.floor((agora - inicio) / (1000 * 60 * 60 * 24))
        const diasRestantes = 30 - diffDias

        if (diasRestantes <= 0) {
          await db.collection('criancas').doc(doc.id).set({
            assinaturaAtiva: false,
            plano: 'pix_expirado',
            pixExpiradoEm: admin.firestore.FieldValue.serverTimestamp(),
            atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true })
          expirados++
          console.log(`[pix] expirado: ${doc.id}`)
        } else if (diasRestantes <= 5) {
          await db.collection('criancas').doc(doc.id).set({
            pixDiasRestantes: diasRestantes,
            pixAvisoEnviado: true,
            atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true })
          console.log(`[pix] aviso: ${doc.id} — ${diasRestantes} dias restantes`)
        } else {
          await db.collection('criancas').doc(doc.id).set({
            pixDiasRestantes: diasRestantes,
            atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true })
          console.log(`[pix] ativo: ${doc.id} — ${diasRestantes} dias restantes`)
        }
      } catch (err) {
        console.error('[pix] erro:', doc.id, err.message)
      }
    }

    console.log(`[verificar] concluido — ${expirados} expiracao(s)`)
  }
)


// ═══════════════════════════════════════════════════════════════════════
// gerarArquivoSecreto — gera titulo, mensagem e curiosidade apos missao
// ═══════════════════════════════════════════════════════════════════════
exports.gerarArquivoSecreto = onCall(
  { secrets: [ANTHROPIC_KEY], region: 'us-central1', cors: true, invoker: 'public', timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Acesso negado.')

    const { disciplina, tituloMissao, topicos, serie, percentual } = request.data

    if (!disciplina || !tituloMissao) throw new HttpsError('invalid-argument', 'Dados invalidos.')

    const nomeDisc = { historia: 'Historia', geografia: 'Geografia', matematica: 'Matematica', ciencias: 'Ciencias', portugues: 'Portugues' }[disciplina] || disciplina
    const topicosTexto = Array.isArray(topicos) && topicos.length > 0 ? topicos.slice(0, 3).join(', ') : tituloMissao
    const desempenho = percentual >= 80 ? 'excelente' : percentual >= 50 ? 'bom' : 'dedicado'

    const prompt = `Voce e um educador especialista em motivacao infantil para criancas de 11-13 anos.

Uma crianca acabou de concluir uma missao de ${nomeDisc} sobre "${tituloMissao}".
Topicos estudados: ${topicosTexto}
Serie: ${serie || '6ano'}
Desempenho: ${desempenho} (${percentual || 0}% de acertos)

Gere um "Arquivo Secreto" motivacional.

REGRAS OBRIGATORIAS:
- Portugues brasileiro correto sem erros de conjugacao verbal
- NUNCA escreva domino quando deve ser dominou
- NUNCA mencione escolas de excelencia Pedro II Singapura ou rankings
- Foque no crescimento pessoal nao em competicao

Responda APENAS com este JSON sem markdown:
{
  "titulo": "titulo misterioso e intrigante relacionado ao assunto — max 50 chars — nao use numeracao nem codigos",
  "mensagem": "mensagem motivacional de 3-4 linhas para a crianca. Tom: direto, que valoriza a inteligencia dela. Sem elogios vazios. Conecta o que ela aprendeu com o mundo real.",
  "curiosidade": "fato genuinamente surpreendente sobre o assunto — algo que a crianca vai querer contar para os amigos. Max 2 linhas.",
  }`

    const client = new Anthropic({ apiKey: ANTHROPIC_KEY.value() })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    })

    let resultado
    try {
      const texto = msg.content[0].text.trim()
      const json = texto.substring(texto.indexOf('{'), texto.lastIndexOf('}') + 1)
      resultado = JSON.parse(json)
    } catch {
      resultado = {
        titulo: 'O Segredo dos Que Chegaram Longe',
        mensagem: 'Voce acaba de aprender algo que poucos dominam na sua idade. Cada missao concluida e um tijolo na construcao do seu futuro.',
        curiosidade: 'Os alunos que mais se destacam nas melhores escolas do Brasil comecaram exatamente assim — uma missao de cada vez.',
        escola: ''
      }
    }

    return { ok: true, ...resultado }
  }
)