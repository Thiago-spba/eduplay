content = open('src/pages/PaisPage.jsx', 'r', encoding='utf-8').read()

# Adiciona import do httpsCallable para criarPagamentoPix (já importado)
# Substitui o CardAssinatura inteiro pelo novo com PIX

antigo = '''  const assinar = async () => {
    if (!filho?.id) return;
    if (!emailFinal) {
      setErro("Informe um email para continuar.");
      return;
    }
    setCarregando(true);
    setErro("");
    try {
      const criarAssinatura = httpsCallable(functions, "criarAssinatura");
      const res = await criarAssinatura({
        codigoAcesso: filho.id,
        emailResponsavel: emailFinal,
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
  };'''

novo = '''  const [metodoPag, setMetodoPag] = useState("credito");
  const [pixData, setPixData] = useState(null);
  const [pixCopiado, setPixCopiado] = useState(false);

  const assinar = async () => {
    if (!filho?.id) return;
    if (!emailFinal) {
      setErro("Informe um email para continuar.");
      return;
    }
    setCarregando(true);
    setErro("");
    try {
      if (metodoPag === "credito") {
        const criarAssinatura = httpsCallable(functions, "criarAssinatura");
        const res = await criarAssinatura({
          codigoAcesso: filho.id,
          emailResponsavel: emailFinal,
          nomeResponsavel: userPai?.displayName || "Responsável",
        });
        if (res.data?.checkoutUrl) {
          window.open(res.data.checkoutUrl, "_blank");
        } else {
          setErro("Não foi possível gerar o link. Tente novamente.");
        }
      } else {
        const criarPix = httpsCallable(functions, "criarPagamentoPix");
        const res = await criarPix({
          codigoAcesso: filho.id,
          emailResponsavel: emailFinal,
          nomeResponsavel: userPai?.displayName || "Responsável",
        });
        if (res.data?.ok) {
          setPixData(res.data);
        } else {
          setErro("Erro ao gerar PIX. Tente novamente.");
        }
      }
    } catch (err) {
      console.error("Erro ao criar assinatura:", err);
      setErro("Erro ao conectar com o Mercado Pago. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };'''

if antigo in content:
    content = content.replace(antigo, novo)
    print("assinar OK")
else:
    print("ASSINAR NAO ENCONTRADO")

# Adiciona seletor de método e modal PIX antes do botão de assinar
antigo2 = '''      {erro && (
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
        disabled={carregando}'''

novo2 = '''      {/* Seletor de método de pagamento */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[
          { id: "credito", label: "💳 Cartão de crédito" },
          { id: "pix", label: "⚡ PIX" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => { setMetodoPag(m.id); setPixData(null); setErro(""); }}
            style={{
              flex: 1,
              padding: "10px 6px",
              borderRadius: 12,
              border: `2px solid ${metodoPag === m.id ? (e ? "#00e0b3" : "#0F6E56") : c.borda}`,
              background: metodoPag === m.id ? (e ? "rgba(0,224,179,0.1)" : "rgba(15,110,86,0.08)") : "transparent",
              color: metodoPag === m.id ? (e ? "#00e0b3" : "#0F6E56") : c.textoSub,
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

      {/* Modal PIX */}
      {pixData && (
        <div style={{
          background: e ? "rgba(0,212,170,0.08)" : "rgba(0,212,170,0.06)",
          border: "2px solid #00D4AA44",
          borderRadius: 16,
          padding: "16px",
          marginBottom: 14,
          textAlign: "center",
        }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 800, color: "#00D4AA", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 1 }}>
            ⚡ PIX gerado — pague agora
          </p>
          {pixData.qrCodeBase64 && (
            <img
              src={`data:image/png;base64,${pixData.qrCodeBase64}`}
              alt="QR Code PIX"
              style={{ width: 180, height: 180, borderRadius: 12, marginBottom: 10 }}
            />
          )}
          <p style={{ fontSize: "0.72rem", color: c.textoSub, margin: "0 0 10px" }}>
            Válido por 30 minutos. Após o pagamento, o acesso é liberado automaticamente.
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(pixData.qrCode);
              setPixCopiado(true);
              setTimeout(() => setPixCopiado(false), 3000);
            }}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 12,
              border: "2px solid #00D4AA44",
              background: pixCopiado ? "#00D4AA22" : "transparent",
              color: "#00D4AA",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {pixCopiado ? "✅ Código copiado!" : "📋 Copiar código PIX"}
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
        disabled={carregando || !!pixData}'''

if antigo2 in content:
    content = content.replace(antigo2, novo2)
    print("modal PIX OK")
else:
    print("MODAL NAO ENCONTRADO")

# Atualiza texto do botão para refletir método
antigo3 = '        {carregando ? "Aguarde..." : "🚀 Assinar agora — R$20/mês"}'
novo3 = '        {carregando ? "Aguarde..." : metodoPag === "pix" ? "⚡ Gerar QR Code PIX — R$20" : "🚀 Assinar agora — R$20/mês"}'

if antigo3 in content:
    content = content.replace(antigo3, novo3)
    print("botao OK")
else:
    print("BOTAO NAO ENCONTRADO")

open('src/pages/PaisPage.jsx', 'w', encoding='utf-8').write(content)
print("DONE")