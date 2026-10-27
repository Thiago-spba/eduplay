// ─────────────────────────────────────────────────────────────
// Seções de venda da página inicial (aba "Sou responsável"):
// como funciona, por dentro do app, preço + garantia, revisão pedagógica,
// demonstração grátis, perguntas frequentes e novidades a caminho.
// ─────────────────────────────────────────────────────────────

const CONTATO_EMAIL = "contato@olloapp.com.br";

function paleta(tema) {
  const e = tema === "escuro";
  return {
    e,
    card: e ? "rgba(26,43,60,0.78)" : "rgba(255,255,255,0.9)",
    texto: e ? "#E8F4F8" : "#1A2B3C",
    sub: e ? "#8BAFC0" : "#5A7A8A",
    borda: e ? "#1F3448" : "#DCE8F2",
    azul: "#3B82F6",
    verde: "#00C896",
  };
}

function Secao({ titulo, children, p }) {
  return (
    <section
      style={{
        width: "100%", boxSizing: "border-box", background: p.card, borderRadius: 18, padding: "16px 18px",
        border: `2px solid ${p.borda}`, backdropFilter: "blur(8px)",
      }}
    >
      <p style={{ fontSize: "0.72rem", fontWeight: 800, color: p.azul, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px" }}>
        {titulo}
      </p>
      {children}
    </section>
  );
}

// Mini "tela de celular" ilustrando o app (feito em código, sem imagem)
function MiniTela({ titulo, children, p }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 0, background: p.e ? "#0D141C" : "#F0F4F8", border: `2px solid ${p.borda}`, borderRadius: 16, padding: 8 }}>
      <div style={{ width: 28, height: 4, borderRadius: 2, background: p.borda, margin: "0 auto 6px" }} />
      <div style={{ fontSize: "0.62rem", fontWeight: 800, color: p.texto, textAlign: "center", marginBottom: 6 }}>{titulo}</div>
      {children}
    </div>
  );
}

const linha = (cor, w = "100%") => <div style={{ height: 5, width: w, background: cor, borderRadius: 3, margin: "4px 0" }} />;

const PERGUNTAS = [
  ["Para qual série é o EduPlay?", "Do 6º ao 9º ano do Ensino Fundamental, seguindo o Currículo Paulista de cada série e bimestre — o bimestre muda sozinho pelo calendário escolar."],
  ["Quanto tempo por dia?", "Cerca de 30 minutos: 3 missões de ~10 minutos, de segunda a sexta. No fim de semana o app incentiva o descanso e a convivência em família."],
  ["Preciso montar as missões?", "Não. O sistema gera as missões automaticamente todo dia útil. Você pode gerar outras quando quiser pelo Painel dos Pais."],
  ["Como sei que meu filho aprendeu de verdade?", "Além do quiz, ele explica com as próprias palavras (escrevendo ou falando) e a IA dá uma nota. No painel você vê o tempo, as tentativas e a explicação dele."],
  ["Funciona no celular?", "Sim. Funciona no navegador de qualquer celular, tablet ou computador, e pode ser instalado como aplicativo — sem loja."],
  ["Tenho mais de um filho. E agora?", `Fale com a gente pelo e-mail ${CONTATO_EMAIL} que montamos o acesso para os seus filhos.`],
  ["Como cancelo?", "Quando quiser, sem fidelidade e sem multa. No Pix o acesso vale 30 dias e você renova se quiser."],
  ["Como funciona a garantia?", "Se seu filho fizer as 3 missões diárias em todos os dias úteis e, em 30 dias, você não notar evolução, devolvemos seu dinheiro."],
];

const EM_BREVE = [
  ["📝", "Simulado ETEC e IFSP", "Provas no estilo do vestibulinho, com nota e evolução mês a mês."],
  ["👨‍👩‍👧‍👦", "Vários filhos na mesma conta", "Um painel só para acompanhar todos os seus filhos."],
  ["🎨", "Desenhos interativos", "Figuras, mapas e linhas do tempo que se mexem para explicar o conteúdo."],
  ["🎬", "Vídeo-aulas dentro do app", "Vídeos selecionados que tocam no próprio EduPlay."],
];

export default function VendasResponsavel({ tema, onComecar, onDemo }) {
  const p = paleta(tema);
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14, marginTop: 8, animation: "fadeInUp 0.3s ease" }}>
      {/* Como funciona */}
      <Secao titulo="Como funciona" p={p}>
        {[
          ["1", "Cadastre seu filho", "Você recebe um link exclusivo para enviar a ele pelo WhatsApp."],
          ["2", "Ele faz 3 missões por dia", "Leitura ou áudio, quiz, uma atividade divertida e, no fim, explica com as próprias palavras."],
          ["3", "Você acompanha tudo", "Painel em tempo real e resumo diário, semanal ou mensal — você escolhe."],
        ].map(([n, t, d]) => (
          <div key={n} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", background: p.azul, color: "#fff", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</span>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "0.86rem", fontWeight: 800, color: p.texto }}>{t}</p>
              <p style={{ margin: 0, fontSize: "0.76rem", color: p.sub, lineHeight: 1.45 }}>{d}</p>
            </div>
          </div>
        ))}
      </Secao>

      {/* Por dentro do app */}
      <Secao titulo="Por dentro do app" p={p}>
        <div style={{ display: "flex", gap: 8 }}>
          <MiniTela titulo="🎯 Missão" p={p}>
            <div style={{ background: "#9B7BFF33", borderRadius: 8, padding: 5, fontSize: "0.55rem", color: p.texto, marginBottom: 4 }}>Quanto é o perímetro?</div>
            {["40 cm", "32 cm", "20 cm"].map((o, i) => (
              <div key={o} style={{ border: `1.5px solid ${i === 0 ? "#0F6E56" : p.borda}`, background: i === 0 ? "#0F6E5622" : "transparent", borderRadius: 6, padding: "3px 5px", fontSize: "0.52rem", color: p.texto, marginBottom: 3 }}>{i === 0 ? "✅ " : "○ "}{o}</div>
            ))}
          </MiniTela>
          <MiniTela titulo="✍️ Explique" p={p}>
            <div style={{ fontSize: "0.52rem", color: p.sub, marginBottom: 4 }}>"Os lados iguais deixam medir uma vez só..."</div>
            <div style={{ background: "#FFD70022", border: "1.5px solid #FFD70088", borderRadius: 6, padding: "3px 5px", fontSize: "0.55rem", fontWeight: 800, color: p.texto }}>⭐ Nota 9/10</div>
            <div style={{ fontSize: "0.5rem", color: p.sub, marginTop: 4 }}>🎤 pode falar também</div>
          </MiniTela>
          <MiniTela titulo="📊 Painel" p={p}>
            <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
              {["3/3", "🔥4", "92%"].map((v) => (
                <div key={v} style={{ flex: 1, background: "#00C89622", borderRadius: 5, fontSize: "0.5rem", fontWeight: 800, color: p.texto, textAlign: "center", padding: "3px 0" }}>{v}</div>
              ))}
            </div>
            {linha("#00C89666", "90%")}{linha("#3B82F655", "70%")}{linha("#FFB83066", "80%")}
          </MiniTela>
        </div>
      </Secao>

      {/* Preço + garantia */}
      <Secao titulo="Plano" p={p}>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "0.8rem", color: p.sub }}>Depois de 5 dias grátis, só</p>
          <p style={{ margin: "2px 0", fontSize: "2.2rem", fontWeight: 900, color: p.texto, fontFamily: "'Fredoka', sans-serif" }}>
            R$ 20<span style={{ fontSize: "1rem", color: p.sub }}>/mês</span>
          </p>
          <p style={{ margin: "0 0 10px", fontSize: "0.8rem", color: p.sub }}>Menos de R$ 1 por dia · Cartão ou Pix · Sem fidelidade</p>
          <div style={{ background: "#FFD70018", border: "1.5px solid #FFD70066", borderRadius: 12, padding: "8px 10px", fontSize: "0.78rem", color: p.texto, lineHeight: 1.5 }}>
            🛡️ <strong>Resultado garantido</strong> ou seu dinheiro de volta em 30 dias.
          </div>
        </div>
      </Secao>

      {/* Revisão pedagógica */}
      <Secao titulo="Quem cuida do conteúdo" p={p}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: "2rem" }}>👩‍🏫</span>
          <p style={{ margin: 0, fontSize: "0.82rem", color: p.texto, lineHeight: 1.5 }}>
            As missões são <strong>revisadas toda semana por uma pedagoga pós-graduada</strong>, com 20 anos de experiência em sala de aula.
          </p>
        </div>
      </Secao>

      {/* Demonstração */}
      {onDemo && (
        <button
          onClick={onDemo}
          style={{
            width: "100%", padding: "13px", borderRadius: 50, border: `2px solid ${p.verde}`, background: "transparent",
            color: p.verde, fontWeight: 900, fontSize: "0.95rem", cursor: "pointer", fontFamily: "'Nunito', sans-serif",
          }}
        >
          🎮 Experimentar uma missão agora — sem cadastro
        </button>
      )}

      {/* Perguntas frequentes */}
      <Secao titulo="Perguntas frequentes" p={p}>
        {PERGUNTAS.map(([q, r]) => (
          <details key={q} style={{ borderTop: `1px solid ${p.borda}`, padding: "9px 0" }}>
            <summary style={{ cursor: "pointer", fontSize: "0.84rem", fontWeight: 800, color: p.texto, listStyle: "none" }}>
              ▸ {q}
            </summary>
            <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: p.sub, lineHeight: 1.5 }}>{r}</p>
          </details>
        ))}
      </Secao>

      {/* Em breve */}
      <Secao titulo="🚀 Novidades a caminho" p={p}>
        {EM_BREVE.map(([ic, t, d]) => (
          <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{ic}</span>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "0.82rem", fontWeight: 800, color: p.texto }}>
                {t} <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#F5A623", background: "#F5A62322", borderRadius: 6, padding: "1px 6px" }}>EM BREVE</span>
              </p>
              <p style={{ margin: 0, fontSize: "0.74rem", color: p.sub, lineHeight: 1.4 }}>{d}</p>
            </div>
          </div>
        ))}
      </Secao>

      {/* Chamada final */}
      <button
        onClick={onComecar}
        style={{
          width: "100%", padding: "15px", borderRadius: 50, border: "none", background: `linear-gradient(135deg, ${p.azul}, #1D4ED8)`,
          color: "#fff", fontWeight: 900, fontSize: "1rem", cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: `0 6px 24px ${p.azul}40`,
        }}
      >
        Começar 5 dias grátis →
      </button>
      <p style={{ margin: "0 0 70px", fontSize: "0.74rem", color: p.sub, textAlign: "center" }}>
        Dúvidas? {CONTATO_EMAIL}
      </p>
    </div>
  );
}
