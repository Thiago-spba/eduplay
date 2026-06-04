import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTema } from "../context/ThemeContext";
import { gerarMissaoIA } from "../services/ia";
import { signInAnonymously } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

// ── Fingerprint de device ──
async function gerarFingerprint() {
  const nav = window.navigator;
  const screen = window.screen;
  const dados = [
    nav.userAgent,
    nav.language,
    nav.hardwareConcurrency,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    nav.platform || '',
  ].join('|');
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(dados));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Constantes ──
const DISCIPLINAS = [
  { id: "historia", label: "História", icone: "📜", cor: "#C4A882" },
  { id: "geografia", label: "Geografia", icone: "🗺️", cor: "#5A8F8C" },
  { id: "matematica", label: "Matemática", icone: "📐", cor: "#6B5B95" },
  { id: "ciencias", label: "Ciências", icone: "🔬", cor: "#2E8B57" },
  { id: "portugues", label: "Português", icone: "✍️", cor: "#C0392B" },
];

const SERIES = [
  { id: "6ano", label: "6º ano" },
  { id: "7ano", label: "7º ano" },
  { id: "8ano", label: "8º ano" },
  { id: "9ano", label: "9º ano" },
];

const FRASES_LOADING = [
  "Preparando sua missão especial...",
  "Analisando o currículo do seu ano...",
  "Criando desafios feitos para você...",
  "Quase pronto, Agente...",
];

// ── Quiz ──
function QuizDemo({ perguntas, onConcluir, cor, c }) {
  const [indice, setIndice] = useState(0);
  const [sel, setSel] = useState(null);
  const [acertos, setAcertos] = useState(0);
  const [resp, setResp] = useState(false);

  if (!perguntas || perguntas.length === 0) return null;
  const q = perguntas[indice];

  const responder = (i) => {
    if (resp) return;
    setSel(i);
    setResp(true);
    if (i === q.correta) setAcertos((a) => a + 1);
  };

  const proxima = () => {
    // acertos já foi incrementado no momento da resposta — não somar de novo
    if (indice + 1 >= perguntas.length) onConcluir(acertos, perguntas.length);
    else {
      setIndice((i) => i + 1);
      setSel(null);
      setResp(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <span
          style={{ fontSize: "0.82rem", color: c.textoSub, fontWeight: 600 }}
        >
          Pergunta {indice + 1} de {perguntas.length}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {perguntas.map((_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background:
                  i < indice ? cor : i === indice ? "#00D4AA" : c.borda,
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          background: c.card2,
          borderRadius: 18,
          padding: "20px",
          border: `2px solid ${c.borda}`,
          fontFamily: "'Fredoka', sans-serif",
          fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
          color: c.texto,
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        ❓ {q.pergunta}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opcoes.map((op, i) => {
          let bg = c.card,
            brd = c.borda,
            clr = c.texto;
          if (resp) {
            if (i === q.correta) {
              bg = "#00D4AA18";
              brd = "#00D4AA";
              clr = "#00D4AA";
            } else if (i === sel) {
              bg = "#FF6B6B18";
              brd = "#FF6B6B";
              clr = "#FF6B6B";
            }
          }
          return (
            <button
              key={i}
              onClick={() => responder(i)}
              style={{
                background: bg,
                border: `2px solid ${brd}`,
                borderRadius: 14,
                padding: "14px 18px",
                color: clr,
                fontSize: "0.95rem",
                fontWeight: resp && i === q.correta ? 700 : 500,
                cursor: resp ? "default" : "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                fontFamily: "'Nunito', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>
                {resp && i === q.correta
                  ? "✅"
                  : resp && i === sel && i !== q.correta
                    ? "❌"
                    : "○"}
              </span>
              {op}
            </button>
          );
        })}
      </div>

      {resp && (
        <div
          style={{
            background: sel === q.correta ? "#00D4AA11" : "#FF6B6B11",
            border: `2px solid ${sel === q.correta ? "#00D4AA44" : "#FF6B6B44"}`,
            borderRadius: 14,
            padding: "14px 16px",
            color: c.texto,
            fontSize: "0.9rem",
            lineHeight: 1.6,
          }}
        >
          <strong>
            {sel === q.correta ? "🎉 Correto! " : "📚 Saiba mais: "}
          </strong>
          {q.explicacao}
        </div>
      )}

      {resp && (
        <button
          onClick={proxima}
          style={{
            width: "100%",
            padding: "16px",
            background: "linear-gradient(135deg, #00D4AA, #0099FF)",
            border: "none",
            borderRadius: 16,
            color: "#FFF",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Fredoka', sans-serif",
            boxShadow: "0 4px 16px rgba(0,212,170,0.3)",
          }}
        >
          {indice + 1 >= perguntas.length ? "🏁 Ver Resultado" : "Próxima →"}
        </button>
      )}
    </div>
  );
}

// ── Tela de Conversão (reutilizada em "limite" e pós-resultado) ──
function TelaConversao({ c, e, alternarTema, demoInfo, navigate }) {
  const compartilharWhatsApp = () => {
    const link = "https://eduplay.olloapp.com.br";
    const opcoes = [
      `EduPlay — Instituto do Saber\n\nSeu filho completou uma missão de ${demoInfo.disciplina || "uma disciplina"} sobre ${demoInfo.assunto || "um conteúdo incrível"} hoje.\n\nMissões montadas por pedagogos e professores especialistas, baseadas no currículo escolar. Um momento que faz diferença real.\n\nComece hoje. Sem compromisso.\n${link}`,
      `Meu filho acabou de completar uma missão de ${demoInfo.disciplina || "uma disciplina"} no EduPlay 🎓\n\nÉ incrível ver ele aprendendo de verdade. Você deveria testar com o seu também!\n\n5 dias grátis. ${link}`,
      `${demoInfo.disciplina || "Uma disciplina"} nunca foi tão envolvente 🚀\n\nO EduPlay criou uma missão personalizada pro meu filho e ele adorou. Missões baseadas no currículo da escola.\n\nTesta grátis: ${link}`,
    ];
    const msg = encodeURIComponent(
      opcoes[Math.floor(Math.random() * opcoes.length)],
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const copiarMensagem = () => {
    const link = "https://eduplay.olloapp.com.br";
    const texto = `EduPlay — Instituto do Saber\n\nSeu filho completou uma missão de ${demoInfo.disciplina || "uma disciplina"} sobre ${demoInfo.assunto || "um conteúdo incrível"} hoje.\n\nMissões montadas por pedagogos e professores especialistas, baseadas no currículo escolar. Um momento que faz diferença real.\n\nComece hoje. Sem compromisso.\n${link}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).catch(() => {});
    } else {
      const el = document.createElement("textarea");
      el.value = texto;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    alert("Mensagem copiada! Cole onde quiser.");
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: c.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        fontFamily: "'Nunito', sans-serif",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <button
          onClick={alternarTema}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border: `2px solid ${c.borda}`,
            background: e ? "#1A2B3C" : "#fff",
            fontSize: "1.1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {e ? "☀️" : "🌙"}
        </button>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
          animation: "fadeIn 0.4s ease",
        }}
      >
        {/* Headline de conversão */}
        <div
          style={{
            background: c.card,
            borderRadius: 24,
            padding: "28px 24px",
            border: `2px solid #00D4AA44`,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🏆</div>
          <h1
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.5rem",
              color: c.texto,
              margin: "0 0 8px",
              lineHeight: 1.3,
            }}
          >
            Seu filho acabou de provar que consegue.
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: c.textoSub,
              margin: "0 0 20px",
              lineHeight: 1.6,
              fontWeight: 700,
            }}
          >
            Agora é a sua vez.
          </p>

          <div
            style={{
              background: e ? "#0D1820" : "#F0FFF8",
              borderRadius: 16,
              padding: "16px",
              marginBottom: 20,
              border: `2px solid #00D4AA22`,
            }}
          >
            <p
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "1.4rem",
                color: "#00D4AA",
                margin: "0 0 4px",
                fontWeight: 700,
              }}
            >
              5 dias grátis
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                color: c.textoSub,
                margin: "0 0 4px",
              }}
            >
              Depois, <strong style={{ color: c.texto }}>R$ 19,90/mês</strong>
            </p>
            <p
              style={{
                fontSize: "0.78rem",
                color: c.textoSub,
                margin: 0,
                fontStyle: "italic",
              }}
            >
              Menos que uma pizza. Mais que qualquer aula particular.
            </p>
          </div>

          <button
            onClick={() => navigate("/login")}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, #00D4AA, #0099FF)",
              color: "#fff",
              fontWeight: 900,
              fontSize: "1.05rem",
              cursor: "pointer",
              fontFamily: "'Fredoka', sans-serif",
              boxShadow: "0 6px 20px rgba(0,212,170,0.35)",
              marginBottom: 10,
            }}
          >
            Começar agora →
          </button>
        </div>

        {/* Compartilhar com responsável */}
        <div
          style={{
            background: c.card,
            borderRadius: 20,
            padding: "20px 24px",
            border: `2px solid ${c.borda}`,
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontSize: "0.82rem",
              color: c.textoSub,
              margin: "0 0 12px",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            Ou peça para seu responsável liberar 📲
          </p>
          <button
            onClick={compartilharWhatsApp}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 14,
              border: "none",
              background: "#25D366",
              color: "#fff",
              fontWeight: 900,
              fontSize: "0.9rem",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            📲 Mandar pelo WhatsApp
          </button>
          <button
            onClick={copiarMensagem}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 14,
              border: `2px solid ${c.borda}`,
              background: "transparent",
              color: c.textoSub,
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            📋 Copiar mensagem
          </button>
        </div>

        <button
          onClick={() => {
            window.location.href = "/";
          }}
          style={{
            background: "none",
            border: "none",
            color: c.textoSub,
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
            textDecoration: "underline",
          }}
        >
          ← Voltar ao início
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// ── Componente principal ──
export default function DemoPage() {
  const { tema, alternarTema } = useTema();
  const navigate = useNavigate();
  const e = tema === "escuro";

  // etapas: verificando | escolha | gerando | missao | resultado | conversao | limite
  const [etapa, setEtapa] = useState("verificando");
  const [uid, setUid] = useState(null);
  const [demoInfo, setDemoInfo] = useState({ disciplina: "", assunto: "" });

  const [disciplinaSel, setDisciplinaSel] = useState(null);
  const [serieSel, setSerieSel] = useState("6ano");
  const [missao, setMissao] = useState(null);
  const [fraseIdx, setFraseIdx] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [total, setTotal] = useState(0);

  const c = {
    bg: e
      ? "radial-gradient(circle at 50% 20%, #0D1820 0%, #0F1923 60%, #0A1628 100%)"
      : "radial-gradient(circle at 50% 20%, #F0FFF8 0%, #E8F4F0 50%, #D4E5E4 100%)",
    card: e ? "rgba(26,43,60,0.9)" : "rgba(255,255,255,0.95)",
    card2: e ? "#0D1820" : "#F0F7FF",
    texto: e ? "#E8F4F8" : "#1A2B3C",
    textoSub: e ? "#8BAFC0" : "#5A7A8A",
    borda: e ? "#2A3F52" : "#E0EEF5",
  };

  // ── 1. Verificar demo no Firestore (1 vez única) ──
  useEffect(() => {
    const verificar = async () => {
      try {
        const cred = await signInAnonymously(auth);
        const uidAnon = cred.user.uid;
        setUid(uidAnon);

        const ref = doc(db, "demos", uidAnon);
        const snap = await getDoc(ref);

        if (snap.exists() && snap.data().usada === true) {
          const dados = snap.data();
          setDemoInfo({
            disciplina: dados.disciplina || "",
            assunto: dados.assunto || "",
          });
          setEtapa("limite");
        } else {
          setEtapa("escolha");
        }
      } catch (err) {
        console.error("Erro ao verificar demo:", err);
        setEtapa("escolha"); // fallback: deixa tentar
      }
    };
    verificar();
  }, []);

  // ── Frases loading rotativas ──
  useEffect(() => {
    if (etapa !== "gerando") return;
    const iv = setInterval(
      () => setFraseIdx((f) => (f + 1) % FRASES_LOADING.length),
      2500,
    );
    return () => clearInterval(iv);
  }, [etapa]);

  // ── Gerar missão ──
  const handleGerar = async () => {
    if (!disciplinaSel) return;
    setEtapa("gerando");
    try {
      const serie = serieSel;
      const disc = DISCIPLINAS.find((d) => d.id === disciplinaSel);
      const missaoGerada = await gerarMissaoIA({
        disciplina: disciplinaSel,
        serie,
        bimestre: "1bimestre",
        tema: `Conteúdo do ${SERIES.find((s) => s.id === serie)?.label} - 1º Bimestre`,
        isDemo: true, // Cloud Function grava no Firestore e bloqueia reuso
      });

      setDemoInfo({
        disciplina: disc.label,
        assunto: missaoGerada.titulo || disc.label,
      });

      // Salva fingerprint no Firestore para bloquear reuso
      try {
        const fp = sessionStorage.getItem("demo_fp");
        if (fp) {
          const { setDoc, doc: fsDoc } = await import("firebase/firestore");
          const { db: fsDb } = await import("../services/firebase");
          await setDoc(fsDoc(fsDb, "demos_fp", fp), {
            usada: true,
            disciplina: disc.label,
            assunto: missaoGerada.titulo || disc.label,
            criadoEm: new Date().toISOString(),
          });
        }
      } catch (fpErr) {
        console.warn("Fingerprint save error:", fpErr);
      }

      setMissao(missaoGerada);
      setEtapa("missao");
    } catch (err) {
      console.error("Erro na demo:", err);
      if (err.message === "DEMO_JA_USADA") {
        setEtapa("limite"); // Servidor confirmou: demo já foi usada
      } else {
        setEtapa("escolha");
      }
    }
  };

  const handleConcluir = (ac, tot) => {
    setAcertos(ac);
    setTotal(tot);
    setEtapa("resultado");
  };

  const disc =
    DISCIPLINAS.find((d) => d.id === disciplinaSel) || DISCIPLINAS[0];

  // ══ VERIFICANDO (splash mínimo) ══
  if (etapa === "verificando") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: c.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "2.5rem",
              animation: "pulsar 1.2s ease-in-out infinite",
            }}
          >
            🔬
          </div>
        </div>
        <style>{`
          @keyframes pulsar { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
        `}</style>
      </div>
    );
  }

  // ══ LIMITE → tela de conversão ══
  if (etapa === "limite") {
    return (
      <TelaConversao
        c={c}
        e={e}
        alternarTema={alternarTema}
        demoInfo={demoInfo}
        navigate={navigate}
      />
    );
  }

  // ══ ESCOLHA ══
  if (etapa === "escolha") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: c.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
          fontFamily: "'Nunito', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(circle at 85% 15%, #00C89615 0%, transparent 40%), radial-gradient(circle at 15% 85%, #3B82F615 0%, transparent 40%)`,
          }}
        />

        <div style={{ position: "absolute", top: 16, right: 16 }}>
          <button
            onClick={alternarTema}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: `2px solid ${c.borda}`,
              background: e ? "#1A2B3C" : "#fff",
              fontSize: "1.1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {e ? "☀️" : "🌙"}
          </button>
        </div>
        <div style={{ position: "absolute", top: 20, left: 16 }}>
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              background: "none",
              border: "none",
              color: c.textoSub,
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            ← Voltar
          </button>
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 420,
            animation: "fadeIn 0.4s ease",
            zIndex: 1,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: "3rem", marginBottom: 8 }}>🔬</div>
            <h1
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "1.8rem",
                color: "#00D4AA",
                margin: "0 0 6px",
              }}
            >
              Missão Demonstração
            </h1>
            <p
              style={{
                fontSize: "0.85rem",
                color: c.textoSub,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Escolha sua disciplina e série.
              <br />A IA vai criar uma missão exclusiva para você.
            </p>
          </div>

          <div
            style={{
              background: c.card,
              borderRadius: 24,
              padding: "24px",
              border: `2px solid ${c.borda}`,
              backdropFilter: "blur(12px)",
            }}
          >
            <p
              style={{
                fontSize: "0.78rem",
                fontWeight: 800,
                color: c.textoSub,
                textTransform: "uppercase",
                letterSpacing: 1,
                margin: "0 0 10px",
              }}
            >
              Sua série
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 6,
                marginBottom: 20,
              }}
            >
              {SERIES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSerieSel(s.id)}
                  style={{
                    padding: "8px 4px",
                    borderRadius: 10,
                    border: `2px solid ${serieSel === s.id ? "#00D4AA" : c.borda}`,
                    background: serieSel === s.id ? "#00D4AA15" : "transparent",
                    color: serieSel === s.id ? "#00D4AA" : c.textoSub,
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <p
              style={{
                fontSize: "0.78rem",
                fontWeight: 800,
                color: c.textoSub,
                textTransform: "uppercase",
                letterSpacing: 1,
                margin: "0 0 10px",
              }}
            >
              Escolha a disciplina
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {DISCIPLINAS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDisciplinaSel(d.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    background:
                      disciplinaSel === d.id ? `${d.cor}15` : "transparent",
                    border: `2px solid ${disciplinaSel === d.id ? d.cor : c.borda}`,
                    borderRadius: 14,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: `${d.cor}22`,
                      border: `2px solid ${d.cor}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.3rem",
                      flexShrink: 0,
                    }}
                  >
                    {d.icone}
                  </div>
                  <span
                    style={{
                      fontFamily: "'Fredoka', sans-serif",
                      fontSize: "1rem",
                      color: disciplinaSel === d.id ? d.cor : c.texto,
                      fontWeight: 600,
                    }}
                  >
                    {d.label}
                  </span>
                  {disciplinaSel === d.id && (
                    <span
                      style={{
                        marginLeft: "auto",
                        color: d.cor,
                        fontSize: "1.1rem",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleGerar}
              disabled={!disciplinaSel}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 16,
                border: "none",
                background: !disciplinaSel
                  ? c.borda
                  : "linear-gradient(135deg, #00D4AA, #0099FF)",
                color: !disciplinaSel ? c.textoSub : "#fff",
                fontWeight: 900,
                fontSize: "1rem",
                cursor: !disciplinaSel ? "not-allowed" : "pointer",
                fontFamily: "'Nunito', sans-serif",
                boxShadow: !disciplinaSel
                  ? "none"
                  : "0 6px 20px rgba(0,212,170,0.35)",
                transition: "all 0.2s",
              }}
            >
              {disciplinaSel
                ? `Iniciar Missão de ${DISCIPLINAS.find((d) => d.id === disciplinaSel)?.label} →`
                : "Selecione uma disciplina"}
            </button>
          </div>

          <p
            style={{
              fontSize: "0.72rem",
              color: c.textoSub,
              textAlign: "center",
              marginTop: 14,
            }}
          >
            🎯 1 missão gratuita · Sem cadastro necessário
          </p>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
          @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  }

  // ══ GERANDO ══
  if (etapa === "gerando") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: c.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <div style={{ textAlign: "center", animation: "fadeIn 0.4s ease" }}>
          <div
            style={{
              fontSize: "3.5rem",
              marginBottom: 16,
              animation: "pulsar 1.5s ease-in-out infinite",
            }}
          >
            🧠
          </div>
          <h2
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.4rem",
              color: "#00D4AA",
              margin: "0 0 8px",
            }}
          >
            Preparando sua missão...
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: c.textoSub,
              margin: "0 0 24px",
              minHeight: "2em",
              transition: "all 0.3s",
            }}
          >
            {FRASES_LOADING[fraseIdx]}
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#00D4AA",
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes pulsar { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
          @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        `}</style>
      </div>
    );
  }

  // ══ MISSÃO ══
  if (etapa === "missao" && missao) {
    const corDisc = disc.cor;
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: c.bg,
          fontFamily: "'Nunito', sans-serif",
          paddingBottom: 40,
          transition: "background 0.3s",
        }}
      >
        <header
          style={{
            background: e ? "#0F1923" : "#fff",
            borderBottom: `2px solid ${c.borda}`,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: `${corDisc}22`,
              border: `2px solid ${corDisc}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              flexShrink: 0,
            }}
          >
            {disc.icone}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "1rem",
                color: c.texto,
                fontWeight: 600,
              }}
            >
              {missao.titulo}
            </div>
            <div
              style={{ fontSize: "0.72rem", color: corDisc, fontWeight: 700 }}
            >
              🎯 MISSÃO DEMONSTRAÇÃO
            </div>
          </div>
          <button
            onClick={alternarTema}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: `2px solid ${c.borda}`,
              background: e ? "#1A2B3C" : "#fff",
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {e ? "☀️" : "🌙"}
          </button>
        </header>

        <main style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px" }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${corDisc}22, ${corDisc}08)`,
              borderRadius: 20,
              padding: "20px",
              marginBottom: 20,
              border: `2px solid ${corDisc}33`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                color: corDisc,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 8,
                background: `${corDisc}22`,
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: 8,
              }}
            >
              🔍 Alvo da Investigação
            </div>
            <p
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                color: c.texto,
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {missao.perguntaCentral}
            </p>
          </div>

          {missao.atividades?.quiz && (
            <QuizDemo
              perguntas={missao.atividades.quiz}
              onConcluir={handleConcluir}
              cor={corDisc}
              c={c}
            />
          )}
        </main>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        `}</style>
      </div>
    );
  }

  // ══ RESULTADO → redireciona para tela de conversão ══
  if (etapa === "resultado") {
    const pct = Math.round((acertos / total) * 100);
    const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "🎯" : "📚";
    const msg =
      pct >= 80
        ? "Missão Cumprida, Agente!"
        : pct >= 60
          ? "Bom Trabalho!"
          : "Continue Praticando!";

    return (
      <div
        style={{
          minHeight: "100dvh",
          background: c.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
          fontFamily: "'Nunito', sans-serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 16, right: 16 }}>
          <button
            onClick={alternarTema}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: `2px solid ${c.borda}`,
              background: e ? "#1A2B3C" : "#fff",
              fontSize: "1.1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {e ? "☀️" : "🌙"}
          </button>
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 420,
            animation: "fadeIn 0.5s ease",
          }}
        >
          {/* Score */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: "4rem", marginBottom: 8 }}>{emoji}</div>
            <h1
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "1.8rem",
                color: c.texto,
                margin: "0 0 4px",
              }}
            >
              {msg}
            </h1>
            <p style={{ fontSize: "0.85rem", color: c.textoSub, margin: 0 }}>
              Você completou a missão de {demoInfo.disciplina}
            </p>
          </div>

          <div
            style={{
              background: c.card,
              borderRadius: 20,
              padding: "24px",
              border: `2px solid #00D4AA33`,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "3rem",
                color: pct >= 60 ? "#00D4AA" : "#FF6B6B",
                fontWeight: 700,
              }}
            >
              {acertos}/{total}
            </div>
            <div
              style={{
                fontSize: "0.9rem",
                color: c.textoSub,
                marginBottom: 16,
              }}
            >
              {pct}% de acertos
            </div>
            <div
              style={{
                height: 12,
                background: c.borda,
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background:
                    pct >= 60
                      ? "linear-gradient(90deg, #00D4AA, #0099FF)"
                      : "#FF6B6B",
                  borderRadius: 6,
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>

          {/* Conversão pós-resultado */}
          <button
            onClick={() => setEtapa("conversao")}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, #00D4AA, #0099FF)",
              color: "#fff",
              fontWeight: 900,
              fontSize: "1rem",
              cursor: "pointer",
              fontFamily: "'Fredoka', sans-serif",
              boxShadow: "0 6px 20px rgba(0,212,170,0.35)",
              marginBottom: 10,
            }}
          >
            Quero continuar aprendendo →
          </button>

          <button
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 14,
              border: `2px solid ${c.borda}`,
              background: "transparent",
              color: c.textoSub,
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            ← Voltar ao início
          </button>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
          @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  }

  // ══ CONVERSÃO (após resultado) ══
  if (etapa === "conversao") {
    return (
      <TelaConversao
        c={c}
        e={e}
        alternarTema={alternarTema}
        demoInfo={demoInfo}
        navigate={navigate}
      />
    );
  }

  return null;
}
