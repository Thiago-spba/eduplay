import { mensagemFimDeSemana } from "../utils/content";

// Cartão mostrado no sábado e domingo, no lugar das missões
export default function FimDeSemana({ c }) {
  const m = mensagemFimDeSemana();
  return (
    <div
      style={{
        background: c.card,
        borderRadius: 22,
        padding: "22px 18px",
        textAlign: "center",
        border: "2px solid #FFD70088",
        marginBottom: 20,
        animation: "edu-pop 0.45s ease",
      }}
    >
      <span
        style={{
          fontSize: "3.6rem",
          display: "inline-block",
          animation: "edu-flutuar 3s ease-in-out infinite",
          fontFamily: "'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif",
        }}
      >
        {m.emoji}
      </span>
      <p
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: "1.25rem",
          fontWeight: 600,
          color: c.texto,
          margin: "8px 0 6px",
        }}
      >
        É fim de semana! 🎉
      </p>
      <p style={{ fontSize: "0.9rem", color: c.texto, lineHeight: 1.6, margin: "0 0 12px" }}>
        {m.texto}
      </p>
      <p style={{ fontSize: "0.78rem", color: c.textoSub, fontWeight: 700, margin: 0 }}>
        Suas missões te esperam na segunda-feira. Bom descanso! 💚
      </p>
    </div>
  );
}
