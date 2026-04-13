// ═══════════════════════════════════════════════════════════════════
// Typewriter.jsx — EduPlay · Texto animado de entrada
// Digita e apaga frases em sequência alternando público
// Mobile First · Zero dependências · CSS puro
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";

const FRASES = [
  { texto: "Sua missão começa aqui.", publico: "filho" },
  { texto: "Aprendizado real. Fora da escola.", publico: "pai" },
  { texto: "Desvende História. Conquiste Geografia.", publico: "filho" },
  { texto: "Acompanhe cada passo do seu filho.", publico: "pai" },
  { texto: "Cada desafio vale fragmentos.", publico: "filho" },
  { texto: "Currículo Paulista. Em casa. Com diversão.", publico: "pai" },
];

export default function Typewriter() {
  const [textExibido, setTextExibido] = useState("");
  const [indiceFrase, setIndiceFrase] = useState(0);
  const [digitando, setDigitando] = useState(true);
  const [cursorVisivel, setCursorVisivel] = useState(true);
  const timeout = useRef(null);

  const fraseAtual = FRASES[indiceFrase];

  // Piscar cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisivel((v) => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Lógica de digitar e apagar
  useEffect(() => {
    if (digitando) {
      if (textExibido.length < fraseAtual.texto.length) {
        timeout.current = setTimeout(() => {
          setTextExibido(fraseAtual.texto.slice(0, textExibido.length + 1));
        }, 55);
      } else {
        // Frase completa — pausa antes de apagar
        timeout.current = setTimeout(() => {
          setDigitando(false);
        }, 2200);
      }
    } else {
      if (textExibido.length > 0) {
        timeout.current = setTimeout(() => {
          setTextExibido((t) => t.slice(0, -1));
        }, 30);
      } else {
        // Avança para próxima frase
        setIndiceFrase((i) => (i + 1) % FRASES.length);
        setDigitando(true);
      }
    }
    return () => clearTimeout(timeout.current);
  }, [textExibido, digitando, fraseAtual]);

  const corPublico = fraseAtual.publico === "filho" ? "#00C896" : "#3B82F6";
  const labelPublico =
    fraseAtual.publico === "filho" ? "👦 Para o estudante" : "👨‍👩‍👦 Para os pais";

  return (
    <div
      style={{
        textAlign: "center",
        padding: "0 16px",
        maxWidth: 420,
        margin: "0 auto",
      }}
    >
      {/* Label do público */}
      <div
        style={{
          display: "inline-block",
          fontSize: "0.72rem",
          fontWeight: 700,
          color: corPublico,
          background: corPublico + "18",
          border: `1px solid ${corPublico}44`,
          borderRadius: 20,
          padding: "3px 12px",
          marginBottom: 10,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          transition: "all 0.4s ease",
        }}
      >
        {labelPublico}
      </div>

      {/* Texto animado */}
      <div
        style={{
          minHeight: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          borderRadius: 16,
          padding: "14px 20px",
          boxShadow: `0 4px 20px ${corPublico}20`,
          border: `2px solid ${corPublico}22`,
          transition: "box-shadow 0.4s, border 0.4s",
        }}
      >
        <span
          style={{
            fontSize: "clamp(1rem, 3.5vw, 1.25rem)",
            fontWeight: 800,
            color: "#1A2B3C",
            fontFamily: "'Nunito', sans-serif",
            letterSpacing: "-0.01em",
            lineHeight: 1.4,
          }}
        >
          {textExibido}
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: "1.1em",
              background: corPublico,
              marginLeft: 3,
              verticalAlign: "text-bottom",
              borderRadius: 1,
              opacity: cursorVisivel ? 1 : 0,
              transition: "opacity 0.1s",
            }}
          />
        </span>
      </div>
    </div>
  );
}
