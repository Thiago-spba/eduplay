import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

// ─────────────────────────────────────────────────────────────
// Resumo para os pais: escolha da frequência (Config) e caixa de resumos (Visão).
// Os resumos são gerados pelo servidor às 20h (função enviarResumos) e
// também enviados por e-mail quando o envio estiver configurado.
// ─────────────────────────────────────────────────────────────

export const FREQUENCIAS = [
  { id: "diario", label: "Diário", desc: "Todo dia útil às 20h, com o que ele fez no dia." },
  { id: "semanal", label: "Semanal", desc: "Toda sexta às 20h, resumo da semana." },
  { id: "mensal", label: "Mensal", desc: "No último dia do mês, resumo do mês." },
  { id: "desligado", label: "Desligado", desc: "Sem resumos." },
];
export const FREQUENCIA_PADRAO = "semanal";

/** Config: escolha diário / semanal / mensal / desligado */
export function ConfigResumo({ c, uid }) {
  const [freq, setFreq] = useState(null);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, "responsaveis", uid))
      .then((s) => setFreq(s.data()?.resumoFrequencia || FREQUENCIA_PADRAO))
      .catch(() => setFreq(FREQUENCIA_PADRAO));
  }, [uid]);

  const escolher = async (id) => {
    setFreq(id);
    setSalvo(false);
    try {
      await setDoc(doc(db, "responsaveis", uid), { resumoFrequencia: id }, { merge: true });
      setSalvo(true);
    } catch (_) {}
  };

  const atual = FREQUENCIAS.find((f) => f.id === freq);
  return (
    <div style={{ background: c.card, border: `1.5px solid ${c.borda}`, borderRadius: 16, padding: "18px" }}>
      <p style={{ fontSize: "0.72rem", fontWeight: 800, color: c.textoSub, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 6px" }}>
        📬 Resumo para você
      </p>
      <p style={{ fontSize: "0.8rem", color: c.textoSub, margin: "0 0 12px", lineHeight: 1.5 }}>
        Receba o que seu filho fez: missões, acertos, tempo e a explicação dele com as próprias palavras.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {FREQUENCIAS.map((f) => {
          const ativo = f.id === freq;
          return (
            <button
              key={f.id}
              onClick={() => escolher(f.id)}
              disabled={freq === null}
              style={{
                padding: "10px 6px", borderRadius: 12, cursor: "pointer", fontWeight: 800, fontSize: "0.85rem",
                fontFamily: "'Nunito', sans-serif", border: `2px solid ${ativo ? "#3B82F6" : c.borda}`,
                background: ativo ? "#3B82F615" : "transparent", color: ativo ? "#3B82F6" : c.textoSub,
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      {atual && (
        <p style={{ fontSize: "0.76rem", color: c.textoSub, margin: "10px 0 0" }}>
          {salvo ? "✅ Salvo. " : ""}{atual.desc}
        </p>
      )}
    </div>
  );
}

function dataCurta(v) {
  const d = v?.toDate ? v.toDate() : v ? new Date(v) : null;
  return d && !isNaN(d) ? d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" }) : "";
}

/** Visão: últimos resumos recebidos */
export function CaixaResumos({ c, uid }) {
  const [itens, setItens] = useState(null);
  const [aberto, setAberto] = useState(0);

  useEffect(() => {
    if (!uid) return;
    getDocs(query(collection(db, "resumos", uid, "itens"), orderBy("criadoEm", "desc"), limit(6)))
      .then((s) => setItens(s.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch(() => setItens([]));
  }, [uid]);

  if (!itens) return null;
  return (
    <div style={{ background: c.card, border: `1.5px solid ${c.borda}`, borderRadius: 16, padding: "14px 16px" }}>
      <p style={{ margin: "0 0 10px", fontSize: "0.75rem", fontWeight: 800, color: c.textoSub, textTransform: "uppercase", letterSpacing: 1 }}>
        📬 Seus resumos
      </p>
      {itens.length === 0 && (
        <p style={{ margin: 0, fontSize: "0.8rem", color: c.textoSub, lineHeight: 1.5 }}>
          O primeiro resumo chega no horário escolhido em Config (padrão: toda sexta às 20h).
        </p>
      )}
      {itens.map((r, i) => (
        <div key={r.id} style={{ borderTop: i ? `1px solid ${c.borda}` : "none", padding: "8px 0" }}>
          <button
            onClick={() => setAberto(aberto === i ? -1 : i)}
            style={{ all: "unset", cursor: "pointer", display: "flex", justifyContent: "space-between", width: "100%", gap: 8 }}
          >
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: c.texto }}>{r.titulo}</span>
            <span style={{ fontSize: "0.72rem", color: c.textoSub, flexShrink: 0 }}>{dataCurta(r.criadoEm)} {aberto === i ? "▾" : "▸"}</span>
          </button>
          {aberto === i && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {(r.linhas || []).map((l, k) => (
                <p key={k} style={{ margin: 0, fontSize: "0.8rem", color: c.texto, lineHeight: 1.5 }}>{l}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
