import { useState, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// Atividades da missão que substituem a forca (quando a missão tem "extra")
// e o passo final "Explique com suas palavras".
// Todas chamam onConcluir(acertos, total), igual ao Quiz.
// ─────────────────────────────────────────────────────────────

/** Nome, emoji e cor de cada tipo — usado no checklist e nos avisos */
export const INFO_ATIVIDADE = {
  pares: { label: "Ligue os pares", emoji: "🔗", clr: "#FFB830" },
  fakenews: { label: "Detector de Fake News", emoji: "🕵️", clr: "#FFB830" },
  ordem: { label: "Ordem certa", emoji: "🔢", clr: "#FFB830" },
  erro: { label: "Ache o erro", emoji: "❌", clr: "#FFB830" },
  forca: { label: "Descobrir a Palavra", emoji: "🔤", clr: "#FFB830" },
};

function embaralhar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Peças visuais comuns ──
function Caixa({ children, c, cor }) {
  return (
    <div style={{ background: c.card2, borderRadius: 18, padding: "16px 18px", border: `2px solid ${cor}33`, color: c.texto, lineHeight: 1.5 }}>
      {children}
    </div>
  );
}

function Instrucao({ texto, progresso, cor, c }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: "0.85rem", color: c.textoSub, fontWeight: 700 }}>{texto}</span>
      {progresso && <span style={{ fontSize: "0.8rem", color: cor, fontWeight: 800, flexShrink: 0 }}>{progresso}</span>}
    </div>
  );
}

function BotaoOpcao({ children, onClick, estado, c, disabled }) {
  // estado: null | "certo" | "errado" | "marcado"
  const cores = {
    certo: { bg: "#0F6E5618", brd: "#0F6E56", clr: "#0F6E56" },
    errado: { bg: "#FF6B6B18", brd: "#FF6B6B", clr: "#FF6B6B" },
    marcado: { bg: "#0099FF18", brd: "#0099FF", clr: c.texto },
  }[estado] || { bg: c.card, brd: c.borda, clr: c.texto };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: cores.bg, border: `2px solid ${cores.brd}`, borderRadius: 14, padding: "13px 16px",
        color: cores.clr, fontSize: "0.95rem", fontWeight: estado ? 700 : 500, cursor: disabled ? "default" : "pointer",
        textAlign: "left", fontFamily: "'Nunito', sans-serif", width: "100%", lineHeight: 1.4,
      }}
    >
      {children}
    </button>
  );
}

function BotaoPrincipal({ children, onClick, cor, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", padding: "14px", border: "none", borderRadius: 14, color: "#fff", fontSize: "1rem", fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'Fredoka', sans-serif",
        background: disabled ? "#94A3B8" : `linear-gradient(135deg, ${cor}, ${cor}CC)`,
        boxShadow: disabled ? "none" : `0 4px 16px ${cor}40`,
      }}
    >
      {children}
    </button>
  );
}

function Feedback({ acertou, texto, c }) {
  return (
    <div
      style={{
        background: acertou ? "#0F6E5611" : "#E0F0FF18", border: `2px solid ${acertou ? "#0F6E5644" : "#6B9FD444"}`,
        borderRadius: 14, padding: "12px 14px", color: c.texto, fontSize: "0.9rem", lineHeight: 1.6,
      }}
    >
      <strong>{acertou ? "Isso mesmo! 🌟 " : "Quase! Veja só 💡 "}</strong>
      {texto}
    </div>
  );
}

const layout = { padding: "16px", maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 };

// ── 🔗 Ligue os pares: para cada conceito, escolha a explicação certa ──
function Pares({ dados, onConcluir, cor, c }) {
  const [pares] = useState(() => dados.pares);
  const [opcoes] = useState(() => embaralhar(dados.pares.map((p) => p.explicacao)));
  const [i, setI] = useState(0);
  const [sel, setSel] = useState(null);
  const [acertos, setAcertos] = useState(0);
  const par = pares[i];
  const acertou = sel !== null && sel === par.explicacao;

  const proximo = () => {
    const novos = acertos + (acertou ? 1 : 0);
    if (i + 1 >= pares.length) return onConcluir(novos, pares.length);
    setAcertos(novos);
    setI(i + 1);
    setSel(null);
  };

  return (
    <div style={layout}>
      <Instrucao texto={dados.instrucao || "Ligue cada conceito à explicação certa"} progresso={`${i + 1} de ${pares.length}`} cor={cor} c={c} />
      <Caixa c={c} cor={cor}>
        <div style={{ fontSize: "0.72rem", color: cor, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Conceito</div>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.15rem" }}>{par.conceito}</div>
      </Caixa>
      {opcoes.map((op) => (
        <BotaoOpcao
          key={op}
          c={c}
          disabled={sel !== null}
          onClick={() => setSel(op)}
          estado={sel === null ? null : op === par.explicacao ? "certo" : op === sel ? "errado" : null}
        >
          {op}
        </BotaoOpcao>
      ))}
      {sel !== null && (
        <>
          <Feedback acertou={acertou} c={c} texto={acertou ? "" : `"${par.conceito}" combina com: ${par.explicacao}`} />
          <BotaoPrincipal cor={cor} onClick={proximo}>{i + 1 >= pares.length ? "🏁 Concluir" : "Próximo →"}</BotaoPrincipal>
        </>
      )}
    </div>
  );
}

// ── 🕵️ Detector de Fake News: verdadeiro ou falso ──
function FakeNews({ dados, onConcluir, cor, c }) {
  const [itens] = useState(() => embaralhar(dados.afirmacoes));
  const [i, setI] = useState(0);
  const [resp, setResp] = useState(null); // true = disse verdadeira
  const [acertos, setAcertos] = useState(0);
  const item = itens[i];
  const acertou = resp !== null && resp === item.verdadeira;

  const proximo = () => {
    const novos = acertos + (acertou ? 1 : 0);
    if (i + 1 >= itens.length) return onConcluir(novos, itens.length);
    setAcertos(novos);
    setI(i + 1);
    setResp(null);
  };

  return (
    <div style={layout}>
      <Instrucao texto={dados.instrucao || "Verdadeiro ou falso?"} progresso={`${i + 1} de ${itens.length}`} cor={cor} c={c} />
      <Caixa c={c} cor={cor}>
        <div style={{ fontSize: "0.72rem", color: cor, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>📰 Notícia investigada</div>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.08rem" }}>{item.texto}</div>
      </Caixa>
      <div style={{ display: "flex", gap: 10 }}>
        {[{ v: true, t: "✅ Verdadeira" }, { v: false, t: "🚫 Fake" }].map((b) => (
          <BotaoOpcao
            key={b.t}
            c={c}
            disabled={resp !== null}
            onClick={() => setResp(b.v)}
            estado={resp === null ? null : b.v === item.verdadeira ? "certo" : b.v === resp ? "errado" : null}
          >
            <span style={{ display: "block", textAlign: "center" }}>{b.t}</span>
          </BotaoOpcao>
        ))}
      </div>
      {resp !== null && (
        <>
          <Feedback acertou={acertou} c={c} texto={`${item.verdadeira ? "É verdadeira." : "É fake."} ${item.explicacao}`} />
          <BotaoPrincipal cor={cor} onClick={proximo}>{i + 1 >= itens.length ? "🏁 Concluir" : "Próxima →"}</BotaoPrincipal>
        </>
      )}
    </div>
  );
}

// ── 🔢 Ordem certa: toque nos itens na ordem correta ──
function Ordem({ dados, onConcluir, cor, c }) {
  const certa = dados.itens;
  const [embaralhados] = useState(() => {
    let e = embaralhar(certa);
    // evita começar já na ordem certa
    if (e.every((x, k) => x === certa[k])) e = [...e.slice(1), e[0]];
    return e;
  });
  const [escolha, setEscolha] = useState([]);
  const [verificado, setVerificado] = useState(false);
  const acertos = escolha.filter((x, k) => x === certa[k]).length;

  return (
    <div style={layout}>
      <Instrucao texto={dados.instrucao || "Coloque na ordem certa"} progresso={`${escolha.length} de ${certa.length}`} cor={cor} c={c} />
      <p style={{ margin: 0, fontSize: "0.8rem", color: c.textoSub }}>Toque nos itens na ordem que você acha certa.</p>
      {!verificado &&
        embaralhados.map((it) => {
          const pos = escolha.indexOf(it);
          return (
            <BotaoOpcao key={it} c={c} disabled={pos >= 0} estado={pos >= 0 ? "marcado" : null} onClick={() => setEscolha([...escolha, it])}>
              <span style={{ fontWeight: 800, color: cor, marginRight: 8 }}>{pos >= 0 ? `${pos + 1}º` : "○"}</span>
              {it}
            </BotaoOpcao>
          );
        })}
      {verificado &&
        certa.map((it, k) => (
          <BotaoOpcao key={it} c={c} disabled estado={escolha[k] === it ? "certo" : "errado"}>
            <span style={{ fontWeight: 800, marginRight: 8 }}>{k + 1}º</span>
            {it}
            {escolha[k] !== it && <span style={{ display: "block", fontSize: "0.78rem", opacity: 0.8 }}>Você colocou: {escolha[k]}</span>}
          </BotaoOpcao>
        ))}
      {!verificado && escolha.length > 0 && (
        <button
          onClick={() => setEscolha(escolha.slice(0, -1))}
          style={{ background: "transparent", border: `1.5px solid ${c.borda}`, borderRadius: 12, padding: "9px", color: c.textoSub, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}
        >
          ↩ Desfazer o último
        </button>
      )}
      {!verificado && (
        <BotaoPrincipal cor={cor} disabled={escolha.length < certa.length} onClick={() => setVerificado(true)}>
          Verificar ordem
        </BotaoPrincipal>
      )}
      {verificado && (
        <>
          <Feedback acertou={acertos === certa.length} c={c} texto={`Você acertou a posição de ${acertos} de ${certa.length}. ${dados.explicacao || ""}`} />
          <BotaoPrincipal cor={cor} onClick={() => onConcluir(acertos, certa.length)}>🏁 Concluir</BotaoPrincipal>
        </>
      )}
    </div>
  );
}

// ── ❌ Ache o erro: qual passo do raciocínio está errado? ──
function AcheErro({ dados, onConcluir, cor, c }) {
  const [sel, setSel] = useState(null);
  const acertou = sel === dados.passoErrado;
  // A IA às vezes começa com "O passo 2 está errado" contando do zero; a tela já diz o número certo
  const explicacao = String(dados.explicacao || "").replace(/^\s*o\s+passo\s+\d+\s+(est[aá]\s+)?errad[oa][.:!]?\s*/i, "");
  return (
    <div style={layout}>
      <Instrucao texto={dados.instrucao || "Ache o passo errado"} cor={cor} c={c} />
      <Caixa c={c} cor={cor}>
        <div style={{ fontSize: "0.72rem", color: cor, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>🔎 Caso investigado</div>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.05rem" }}>{dados.enunciado}</div>
      </Caixa>
      <p style={{ margin: 0, fontSize: "0.8rem", color: c.textoSub }}>Um destes passos tem um erro. Toque nele.</p>
      {dados.passos.map((p, k) => (
        <BotaoOpcao
          key={k}
          c={c}
          disabled={sel !== null}
          onClick={() => setSel(k)}
          estado={sel === null ? null : k === dados.passoErrado ? "errado" : k === sel ? "marcado" : null}
        >
          <span style={{ fontWeight: 800, color: cor, marginRight: 8 }}>Passo {k + 1}</span>
          {p}
        </BotaoOpcao>
      ))}
      {sel !== null && (
        <>
          <Feedback acertou={acertou} c={c} texto={`O erro está no passo ${dados.passoErrado + 1}. ${explicacao}`} />
          <BotaoPrincipal cor={cor} onClick={() => onConcluir(acertou ? 1 : 0, 1)}>🏁 Concluir</BotaoPrincipal>
        </>
      )}
    </div>
  );
}

/** Escolhe a atividade pelo tipo do "extra" da missão */
export function AtividadeExtra({ dados, ...resto }) {
  if (dados?.tipo === "pares") return <Pares dados={dados} {...resto} />;
  if (dados?.tipo === "fakenews") return <FakeNews dados={dados} {...resto} />;
  if (dados?.tipo === "ordem") return <Ordem dados={dados} {...resto} />;
  if (dados?.tipo === "erro") return <AcheErro dados={dados} {...resto} />;
  return null;
}

// ── ✍️ Explique com suas palavras (passo final da missão) ──
// Pode escrever ou falar (🎤 usa o reconhecimento de voz do próprio aparelho: sem custo).
// avaliar(texto) -> Promise<{ nota, comentario, versaoMelhorada } | null>. Nota < 4 na 1ª vez pede para tentar de novo.
export function Explique({ pergunta, avaliar, onFinal, cor, c }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [avaliacao, setAvaliacao] = useState(null);
  const [tentativas, setTentativas] = useState(0);
  const [ouvindo, setOuvindo] = useState(false);
  const [porVoz, setPorVoz] = useState(false);
  const [erroMic, setErroMic] = useState("");
  const reconhRef = useRef(null);
  const MIN = 20;
  const pronto = texto.trim().length >= MIN;
  const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

  const alternarMicrofone = () => {
    setErroMic("");
    if (ouvindo) {
      reconhRef.current?.stop();
      return;
    }
    if (!SR) {
      setErroMic("Seu aparelho não tem reconhecimento de voz neste navegador. Escreva a resposta.");
      return;
    }
    const r = new SR();
    r.lang = "pt-BR";
    r.interimResults = false;
    r.continuous = true;
    r.onresult = (ev) => {
      let falado = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) falado += ev.results[i][0].transcript;
      }
      if (falado.trim()) {
        setPorVoz(true);
        setTexto((t) => (t ? `${t.trim()} ${falado.trim()}` : falado.trim()).slice(0, 600));
      }
    };
    r.onerror = (ev) => {
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") setErroMic("Permita o uso do microfone para gravar sua explicação.");
      else if (ev.error !== "aborted" && ev.error !== "no-speech") setErroMic("Não consegui ouvir. Tente de novo ou escreva.");
    };
    r.onend = () => setOuvindo(false);
    reconhRef.current = r;
    try {
      r.start();
      setOuvindo(true);
    } catch {
      setOuvindo(false);
    }
  };

  const enviar = async () => {
    if (!pronto || enviando) return;
    reconhRef.current?.stop();
    setEnviando(true);
    let r = null;
    try {
      r = await avaliar(texto.trim());
    } catch {
      r = null;
    }
    setEnviando(false);
    const n = tentativas + 1;
    setTentativas(n);
    // Sem avaliação (falha de rede/servidor): não trava a criança
    if (!r || r.nota === null || r.nota === undefined) {
      onFinal({ texto: texto.trim(), nota: null, comentario: "", versaoMelhorada: "", porVoz, tentativas: n });
      return;
    }
    setAvaliacao({ ...r, tentativas: n });
  };

  const fraca = avaliacao && avaliacao.nota < 4;
  const podeRefazer = fraca && avaliacao.tentativas < 2;

  return (
    <div style={layout}>
      <Caixa c={c} cor={cor}>
        <div style={{ fontSize: "0.72rem", color: cor, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>✍️ Explique com suas palavras</div>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.08rem" }}>{pergunta}</div>
      </Caixa>
      <p style={{ margin: 0, fontSize: "0.8rem", color: c.textoSub, lineHeight: 1.5 }}>
        Escreva ou fale 1 ou 2 frases do seu jeito, como se explicasse para um amigo. Não vale copiar!
      </p>
      {(!avaliacao || podeRefazer) && (
        <button
          onClick={alternarMicrofone}
          disabled={enviando}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 14,
            border: `2px solid ${ouvindo ? "#FF6B6B" : cor + "88"}`, background: ouvindo ? "#FF6B6B18" : "transparent",
            color: ouvindo ? "#FF6B6B" : c.texto, fontSize: "0.95rem", fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito', sans-serif",
          }}
        >
          {ouvindo ? "⏹️ Parar de gravar" : "🎤 Falar minha explicação"}
        </button>
      )}
      {ouvindo && <span style={{ fontSize: "0.78rem", color: "#FF6B6B", textAlign: "center" }}>🔴 Ouvindo... fale com calma e toque em parar quando terminar.</span>}
      {erroMic && <span style={{ fontSize: "0.78rem", color: "#F59E0B" }}>{erroMic}</span>}
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value.slice(0, 600))}
        onPaste={(e) => e.preventDefault()}
        disabled={enviando || (avaliacao && !podeRefazer)}
        rows={4}
        placeholder="Eu entendi que..."
        style={{
          width: "100%", boxSizing: "border-box", borderRadius: 14, border: `2px solid ${c.borda}`, background: c.card,
          color: c.texto, padding: "12px 14px", fontSize: "0.95rem", fontFamily: "'Nunito', sans-serif", resize: "vertical", outline: "none",
        }}
      />
      {!avaliacao && (
        <>
          <span style={{ fontSize: "0.72rem", color: pronto ? "#0F6E56" : c.textoSub, textAlign: "right" }}>
            {pronto ? "Pronto para enviar ✓" : `Escreva pelo menos ${MIN} letras (${texto.trim().length}/${MIN})`}
          </span>
          <BotaoPrincipal cor={cor} disabled={!pronto || enviando} onClick={enviar}>
            {enviando ? "Lendo sua resposta..." : "Enviar explicação"}
          </BotaoPrincipal>
        </>
      )}
      {avaliacao && (
        <div
          style={{
            background: fraca ? "#F59E0B18" : "#0F6E5611", border: `2px solid ${fraca ? "#F59E0B" : "#0F6E5644"}`,
            borderRadius: 14, padding: "12px 14px", color: c.texto, fontSize: "0.9rem", lineHeight: 1.6,
          }}
        >
          <strong>{avaliacao.nota >= 7 ? "Mandou muito bem! 🌟 " : fraca ? "Dá para explicar melhor 💪 " : "Boa! 👍 "}</strong>
          {avaliacao.comentario}
        </div>
      )}
      {avaliacao && avaliacao.versaoMelhorada && !podeRefazer && (
        <div style={{ background: c.card, border: `2px dashed ${cor}88`, borderRadius: 14, padding: "12px 14px", color: c.texto, fontSize: "0.9rem", lineHeight: 1.6 }}>
          <div style={{ fontSize: "0.72rem", color: cor, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            💡 Sua explicação, ainda mais completa
          </div>
          {avaliacao.versaoMelhorada}
        </div>
      )}
      {podeRefazer && (
        <BotaoPrincipal cor={cor} onClick={() => { setAvaliacao(null); }}>
          ✏️ Reescrever minha explicação
        </BotaoPrincipal>
      )}
      {avaliacao && !podeRefazer && (
        <BotaoPrincipal cor={cor} onClick={() => onFinal({ texto: texto.trim(), nota: avaliacao.nota, comentario: avaliacao.comentario, versaoMelhorada: avaliacao.versaoMelhorada || "", porVoz, tentativas: avaliacao.tentativas })}>
          🏁 Concluir missão
        </BotaoPrincipal>
      )}
    </div>
  );
}
