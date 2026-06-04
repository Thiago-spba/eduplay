content = open('functions/index.js', 'r', encoding='utf-8').read()

novo_pix = '''
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
'''

# Adiciona antes do final do arquivo
marker = '/** Webhook do Mercado Pago'
if marker in content:
    content = content.replace(marker, novo_pix + '\n' + marker)
    open('functions/index.js', 'w', encoding='utf-8').write(content)
    print('OK - PIX adicionado')
else:
    print('MARKER NAO ENCONTRADO')