// Painel dos Pais: contato para mais de um filho + novidades a caminho
const CONTATO_EMAIL = "contato@olloapp.com.br";

const EM_BREVE = [
  ["📝", "Simulado ETEC e IFSP", "Provas no estilo do vestibulinho, com nota e evolução mês a mês."],
  ["👨‍👩‍👧‍👦", "Vários filhos na mesma conta", "Um painel só para acompanhar todos os seus filhos."],
  ["🎨", "Desenhos interativos", "Figuras, mapas e linhas do tempo que se mexem para explicar o conteúdo."],
];

export default function NovidadesPainel({ c }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
      <a
        href={`mailto:${CONTATO_EMAIL}?subject=${encodeURIComponent("EduPlay — tenho mais de um filho")}`}
        style={{
          display: "flex", alignItems: "center", gap: 12, textDecoration: "none", background: c.card,
          border: `1.5px solid ${c.borda}`, borderRadius: 16, padding: "14px 16px",
        }}
      >
        <span style={{ fontSize: "1.6rem" }}>👨‍👩‍👧‍👦</span>
        <span>
          <span style={{ display: "block", fontSize: "0.88rem", fontWeight: 800, color: c.texto }}>Tem mais de um filho?</span>
          <span style={{ display: "block", fontSize: "0.76rem", color: c.textoSub, lineHeight: 1.4 }}>
            Fale com a gente que montamos o acesso para todos: {CONTATO_EMAIL}
          </span>
        </span>
      </a>

      <div style={{ background: c.card, border: `1.5px solid ${c.borda}`, borderRadius: 16, padding: "14px 16px" }}>
        <p style={{ margin: "0 0 10px", fontSize: "0.75rem", fontWeight: 800, color: c.textoSub, textTransform: "uppercase", letterSpacing: 1 }}>
          🚀 Novidades a caminho
        </p>
        {EM_BREVE.map(([ic, t, d]) => (
          <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{ic}</span>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "0.84rem", fontWeight: 800, color: c.texto }}>
                {t}{" "}
                <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#B45309", background: "#F59E0B22", borderRadius: 6, padding: "1px 6px" }}>EM BREVE</span>
              </p>
              <p style={{ margin: 0, fontSize: "0.76rem", color: c.textoSub, lineHeight: 1.4 }}>{d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
