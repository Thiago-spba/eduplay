content = open('functions/index.js', 'r', encoding='utf-8').read()

# ── 1. Adiciona MP_WEBHOOK_SECRET nos secrets declarados ──
content = content.replace(
    "const MP_ACCESS_TOKEN = defineSecret('MP_ACCESS_TOKEN')\nconst MP_PUBLIC_KEY   = defineSecret('MP_PUBLIC_KEY')",
    "const MP_ACCESS_TOKEN  = defineSecret('MP_ACCESS_TOKEN')\nconst MP_PUBLIC_KEY    = defineSecret('MP_PUBLIC_KEY')\nconst MP_WEBHOOK_SECRET = defineSecret('MP_WEBHOOK_SECRET')"
)

# ── 2. Adiciona secret no webhookMP ──
content = content.replace(
    "exports.webhookMP = onRequest(\n  { secrets: [MP_ACCESS_TOKEN], region: 'us-central1', cors: true },",
    "exports.webhookMP = onRequest(\n  { secrets: [MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET], region: 'us-central1', cors: true },"
)

# ── 3. Substitui corpo do webhookMP para validar HMAC ──
antigo_webhook = """  if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return; }

    try {
      const { type, data } = req.body"""

novo_webhook = """  if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return; }

    // ── Validação HMAC da assinatura do Mercado Pago ──
    try {
      const crypto = require('crypto')
      const secret = MP_WEBHOOK_SECRET.value()
      const xSignature = req.headers['x-signature'] || ''
      const xRequestId = req.headers['x-request-id'] || ''
      const dataId = req.query?.data?.id || req.body?.data?.id || ''

      const parts = xSignature.split(',')
      let ts = '', v1 = ''
      for (const part of parts) {
        const [k, v] = part.trim().split('=')
        if (k === 'ts') ts = v
        if (k === 'v1') v1 = v
      }

      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
      const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

      if (v1 && v1 !== expected) {
        console.warn('Webhook MP: assinatura inválida')
        res.status(401).send('Unauthorized')
        return
      }
    } catch (hmacErr) {
      console.error('Erro validação HMAC:', hmacErr)
    }

    try {
      const { type, data } = req.body"""

content = content.replace(antigo_webhook, novo_webhook)

# ── 4. Adiciona rate limit server-side no gerarMissao ──
antigo_rate = """    if (!request.auth) throw new HttpsError('unauthenticated', 'Acesso Negado: Agente não identificado.')
    const { disciplina, serie, bimestre, tema, contextoTemporal, isDemo } = request.data"""

novo_rate = """    if (!request.auth) throw new HttpsError('unauthenticated', 'Acesso Negado: Agente não identificado.')
    const { disciplina, serie, bimestre, tema, contextoTemporal, isDemo } = request.data

    // ── Rate limit server-side: máx 3 missões por criança por dia ──
    if (!isDemo) {
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      const criancaId = request.data.criancaId || null
      const uid = request.auth.uid
      const rateLimitRef = db.collection('rateLimits').doc(uid)
      const rateLimitSnap = await rateLimitRef.get()
      const rateData = rateLimitSnap.exists ? rateLimitSnap.data() : {}
      const dataUltima = rateData.data ? new Date(rateData.data) : null
      const mesmaData = dataUltima && dataUltima >= hoje
      const count = mesmaData ? (rateData.count || 0) : 0
      if (count >= 3) throw new HttpsError('resource-exhausted', 'Limite diário de 3 missões atingido.')
      await rateLimitRef.set({ count: count + 1, data: new Date().toISOString() }, { merge: true })
    }"""

content = content.replace(antigo_rate, novo_rate)

open('functions/index.js', 'w', encoding='utf-8').write(content)
print('OK - segurança aplicada')