import { useMemo, useState } from "react";
import { dataConclusaoSP, registrarDesafio, registrarXpBonus } from "../services/db";

// ⚡ Desafio relâmpago: 1 pergunta de uma missão concluída em dia anterior.
// Relembrar depois de um tempo é o que faz o conteúdo durar (prática espaçada).
// Aparece uma vez por dia; acertar vale +5 XP.

const XP_DESAFIO = 5;

function embaralhar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Índice da alternativa certa (formato salvo pela IA: opção 0 + "respostaCorreta"; aceita índice numérico)
function indiceCerto(q) {
  if (!Array.isArray(q?.opcoes) || q.opcoes.length < 2) return -1;
  if (typeof q.correta === "number" && q.correta >= 0 && q.correta < q.opcoes.length) return q.correta;
  return q.opcoes.findIndex((o) => String(o).trim() === String(q.respostaCorreta || "").trim());
}

export function escolherDesafio(missoesTodas, hojeSP) {
  // Missão mais recente concluída ANTES de hoje
  const anteriores = missoesTodas
    .map((m) => ({ m, dia: dataConclusaoSP(m) }))
    .filter((x) => x.dia && x.dia < hojeSP && Array.isArray(x.m.atividades?.quiz) && x.m.atividades.quiz.length)
    .sort((a, b) => (a.dia < b.dia ? 1 : -1));
  if (!anteriores.length) return null;
  const { m } = anteriores[0];
  const quiz = m.atividades.quiz.filter((q) => indiceCerto(q) >= 0);
  if (!quiz.length) return null;
  // Pergunta do dia (fixa no dia, muda a cada dia)
  const semente = Number(hojeSP.replace(/-/g, "")) % quiz.length;
  return { missao: m, pergunta: quiz[semente] };
}

export default function DesafioRelampago({ desafio, codigoAcesso, jaFeitoHoje, c, onXp, opcional = false }) {
  const [opcoes] = useState(() => {
    const q = desafio.pergunta;
    const certo = indiceCerto(q);
    return embaralhar(q.opcoes.map((t, i) => ({ t: String(t), certa: i === certo })));
  });
  const [sel, setSel] = useState(null);
  const acertou = sel !== null && opcoes[sel].certa;
  const titulo = useMemo(() => desafio.missao.titulo || "uma missão anterior", [desafio]);

  if (jaFeitoHoje && sel === null) {
    return (
      <div style={{ background: c.card, borderRadius: 18, padding: "12px 16px", border: `1.5px solid ${c.borda}`, marginBottom: 20, fontSize: "0.82rem", color: c.textoSub }}>
        ⚡ Desafio relâmpago de hoje feito! Volte amanhã para outro.
      </div>
    );
  }

  const responder = async (i) => {
    if (sel !== null) return;
    setSel(i);
    const ok = opcoes[i].certa;
    try {
      await Promise.all([
        registrarDesafio(codigoAcesso, { acertou: ok, missao: titulo }),
        ok ? registrarXpBonus(codigoAcesso, XP_DESAFIO, "desafio") : null,
      ]);
      if (ok && onXp) onXp(XP_DESAFIO);
    } catch (_) {
      /* não trava a criança se falhar */
    }
  };

  return (
    <div style={{ background: c.card, borderRadius: 20, padding: "16px", border: "2px solid #FFD70088", marginBottom: 20, animation: "edu-pop 0.45s ease" }}>
      <p style={{ margin: "0 0 4px", fontSize: "0.72rem", fontWeight: 800, color: "#F5A623", textTransform: "uppercase", letterSpacing: 1 }}>
        ⚡ Desafio relâmpago · +{XP_DESAFIO} XP
      </p>
      {opcional && (
        <p style={{ margin: "0 0 6px", fontSize: "0.75rem", color: c.textoSub }}>
          🎉 Hoje é feriado: o desafio é opcional e pular não quebra sua sequência.
        </p>
      )}
      <p style={{ margin: "0 0 10px", fontSize: "0.78rem", color: c.textoSub }}>Lembra da missão "{titulo}"?</p>
      <p style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 700, color: c.texto, lineHeight: 1.45 }}>{desafio.pergunta.pergunta}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {opcoes.map((o, i) => {
          const est = sel === null ? null : o.certa ? "certo" : i === sel ? "errado" : null;
          return (
            <button
              key={i}
              onClick={() => responder(i)}
              disabled={sel !== null}
              style={{
                textAlign: "left", padding: "11px 14px", borderRadius: 12, fontSize: "0.88rem", lineHeight: 1.4,
                fontFamily: "'Nunito', sans-serif", cursor: sel === null ? "pointer" : "default",
                border: `2px solid ${est === "certo" ? "#0F6E56" : est === "errado" ? "#FF6B6B" : c.borda}`,
                background: est === "certo" ? "#0F6E5618" : est === "errado" ? "#FF6B6B18" : "transparent",
                color: est === "errado" ? "#FF6B6B" : c.texto, fontWeight: est ? 700 : 500,
              }}
            >
              {o.t}
            </button>
          );
        })}
      </div>
      {sel !== null && (
        <p style={{ margin: "12px 0 0", fontSize: "0.85rem", color: c.texto, lineHeight: 1.55 }}>
          <strong>{acertou ? `Isso! +${XP_DESAFIO} XP 🌟 ` : "Quase! 💡 "}</strong>
          {desafio.pergunta.explicacao || ""}
        </p>
      )}
    </div>
  );
}
