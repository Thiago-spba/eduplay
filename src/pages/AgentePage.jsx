import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  getCrianca,
  registrarAcessoDiario,
  verificarTrial,
} from "../services/db";
import { useTema } from "../context/ThemeContext";

const MSGS = [
  {
    main: "A vaga na Etec, na Fatec ou no colégio federal",
    accent: "começa aqui, nas tarefas de hoje.",
  },
  {
    main: "Alunos que estudam todos os dias chegam às melhores escolas.",
    accent: "Seu filho pode ser um deles.",
  },
  {
    main: "O Currículo Paulista e a BNCC estão aqui.",
    accent: "Ele aprende o que a escola exige — e vai além.",
  },
  {
    main: "Bolsas integrais no Etec, Colégio Pedro II e escolas estaduais de excelência",
    accent: "são conquistadas por quem começa cedo.",
  },
  {
    main: "Cada missão cumprida hoje",
    accent: "é um ponto a mais na prova de amanhã.",
  },
  {
    main: "Do 6º ano ao 9º ano, do básico ao avançado.",
    accent: "O EduPlay cresce junto com seu filho.",
  },
  {
    main: "Não é sobre estudar mais. É sobre estudar certo.",
    accent: "Com o currículo que a escola usa, todo dia.",
  },
  {
    main: "Seu filho acabou de provar que consegue.",
    accent: "Agora é a sua vez de não deixar parar.",
  },
  {
    main: "Menos que uma pizza por mês.",
    accent: "O impacto de um professor particular, todos os dias.",
  },
  {
    main: "Colégios como Etec, Cefet e escolas estaduais de referência",
    accent: "preparam os alunos que já chegam preparados.",
  },
  {
    main: "O hábito de estudar leva 21 dias para se formar.",
    accent: "Você está no dia 6. Não pare agora.",
  },
  {
    main: "Consistência é o que separa",
    accent: "quem sonha de quem conquista a vaga.",
  },
];

function TrialExpirado({ navigate }) {
  const [idx, setIdx] = useState(0);
  const { tema, alternarTema } = useTema();
  const dark = tema === "escuro";

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % MSGS.length), 3800);
    return () => clearInterval(t);
  }, []);

  const assinar = () => {
    if (navigate) navigate("/pais");
    else window.location.href = "/pais";
  };

  const c = dark
    ? {
        rootBg: "#0D141C",
        msgColor: "#E2E8F0",
        accentColor: "#00e0b3",
        badgeBg: "rgba(0,224,179,0.12)",
        badgeColor: "#00e0b3",
        badgeBorder: "1px solid rgba(0,224,179,0.25)",
        sepBg: "#1E2D3D",
        planBg: "#1A2633",
        planBorder: "1px solid #2D3D50",
        labelColor: "#64748B",
        subColor: "#64748B",
        valueColor: "#00e0b3",
        ctaBg: "#00c47a",
        ctaColor: "#fff",
        ctaShadow: "0 4px 24px rgba(0,196,122,0.35)",
        segColor: "#4A5568",
        bulletColor: "#94A3B8",
        dotActive: "#00e0b3",
        dotInactive: "rgba(255,255,255,0.2)",
        btnTema: "#1A2633",
        btnTemaBorder: "#2D3D50",
      }
    : {
        rootBg: "#F0FFF8",
        msgColor: "#1E293B",
        accentColor: "#0F6E56",
        badgeBg: "rgba(15,110,86,0.1)",
        badgeColor: "#0F6E56",
        badgeBorder: "1px solid rgba(15,110,86,0.2)",
        sepBg: "#E2E8F0",
        planBg: "#fff",
        planBorder: "1px solid #E2E8F0",
        labelColor: "#94A3B8",
        subColor: "#94A3B8",
        valueColor: "#0F6E56",
        ctaBg: "#0F6E56",
        ctaColor: "#E1F5EE",
        ctaShadow: "0 4px 24px rgba(15,110,86,0.25)",
        segColor: "#94A3B8",
        bulletColor: "#475569",
        dotActive: "#0F6E56",
        dotInactive: "rgba(0,0,0,0.15)",
        btnTema: "#fff",
        btnTemaBorder: "#E2E8F0",
      };

  const msg = MSGS[idx];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
        @keyframes fin    { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulsar { 0%,100%{transform:scale(1)} 50%{transform:scale(1.025)} }
      `}</style>

      <div
        style={{
          width: "100%",
          minHeight: "100dvh",
          backgroundColor: c.rootBg,
          fontFamily: "'Nunito', sans-serif",
          overflowY: "auto",
          overflowX: "hidden",
          transition: "background-color .3s",
          position: "relative",
        }}
      >
        {/* Botão de tema */}
        <button
          onClick={alternarTema}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 38,
            height: 38,
            borderRadius: 12,
            border: `2px solid ${c.btnTemaBorder}`,
            background: c.btnTema,
            fontSize: "1.1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {dark ? "☀️" : "🌙"}
        </button>

        <div
          style={{
            width: "100%",
            maxWidth: 400,
            margin: "0 auto",
            padding: "48px 24px 48px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 16px",
              borderRadius: 20,
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: ".5px",
              marginBottom: 24,
              backgroundColor: c.badgeBg,
              color: c.badgeColor,
              border: c.badgeBorder,
              whiteSpace: "nowrap",
            }}
          >
            ⏳ PERÍODO GRATUITO ENCERRADO
          </div>

          {/* Mensagem rotativa */}
          <div
            style={{
              minHeight: 96,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <p
              key={idx}
              style={{
                fontSize: "1.12rem",
                fontWeight: 800,
                lineHeight: 1.65,
                margin: 0,
                color: c.msgColor,
                animation: "fin .5s ease",
              }}
            >
              {msg.main}{" "}
              <span style={{ color: c.accentColor }}>{msg.accent}</span>
            </p>
          </div>

          {/* Dots */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 7,
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            {MSGS.map((_, i) => (
              <div
                key={i}
                onClick={() => setIdx(i)}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  cursor: "pointer",
                  backgroundColor: i === idx ? c.dotActive : c.dotInactive,
                  transform: i === idx ? "scale(1.4)" : "scale(1)",
                  transition: "all .3s",
                  flexShrink: 0,
                }}
              />
            ))}
          </div>

          {/* Separador */}
          <div
            style={{
              width: "100%",
              height: 1,
              backgroundColor: c.sepBg,
              marginBottom: 20,
            }}
          />

          {/* Card plano */}
          <div
            style={{
              width: "100%",
              borderRadius: 16,
              padding: "20px 16px",
              marginBottom: 16,
              backgroundColor: c.planBg,
              border: c.planBorder,
              boxSizing: "border-box",
            }}
          >
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "1px",
                marginBottom: 8,
                color: c.labelColor,
              }}
            >
              PLANO MENSAL
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 4,
                justifyContent: "center",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: c.valueColor,
                }}
              >
                R$
              </span>
              <span
                style={{
                  fontSize: "2.6rem",
                  fontWeight: 900,
                  lineHeight: 1,
                  color: c.valueColor,
                }}
              >
                20
              </span>
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: c.valueColor,
                }}
              >
                /mês
              </span>
            </div>
            <p style={{ fontSize: "0.76rem", marginTop: 6, color: c.subColor }}>
              Cancele quando quiser • Sem fidelidade
            </p>
          </div>

          {/* Bullets */}
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {[
              "🎯 Missões alinhadas ao Currículo Paulista e BNCC",
              "🏫 Preparação desde o básico para Etec, Fatec e colégios federais",
              "📊 Acompanhamento diário com relatório mensal",
              "💡 Menos que R$1 por dia — menos que uma pizza por mês",
            ].map((b, i) => (
              <p
                key={i}
                style={{
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  textAlign: "left",
                  color: c.bulletColor,
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {b}
              </p>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={assinar}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 30,
              border: "none",
              fontSize: "1rem",
              fontWeight: 900,
              cursor: "pointer",
              marginBottom: 10,
              letterSpacing: ".3px",
              backgroundColor: c.ctaBg,
              color: c.ctaColor,
              boxShadow: c.ctaShadow,
              animation: "pulsar 2s ease-in-out infinite",
            }}
          >
            🚀 Assinar agora
          </button>

          <p
            style={{
              fontSize: "0.72rem",
              lineHeight: 1.6,
              color: c.segColor,
              margin: 0,
            }}
          >
            🔒 Pagamento seguro via Mercado Pago
          </p>
        </div>
      </div>
    </>
  );
}

// ── Tela de conta desativada (exibida para a criança quando responsável desativou) ──
function ContaDesativada({ navigate }) {
  const { tema } = useTema();
  const dark = tema === "escuro";
  const c = {
    bg: dark ? "#0D141C" : "#F0FFF8",
    card: dark ? "#1A2633" : "#FFFFFF",
    texto: dark ? "#E2E8F0" : "#1E293B",
    textoSub: dark ? "#94A3B8" : "#64748B",
    borda: dark ? "#2D3D50" : "#E2E8F0",
    verde: "#0F6E56",
    verdeClaro: "#E1F5EE",
  };
  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: c.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          backgroundColor: c.card,
          borderRadius: 24,
          padding: "32px 24px",
          textAlign: "center",
          border: `1.5px solid ${c.borda}`,
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔒</div>
        <h1
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: "1.6rem",
            color: c.texto,
            margin: "0 0 10px",
          }}
        >
          Acesso pausado
        </h1>
        <p
          style={{
            fontSize: "0.88rem",
            color: c.textoSub,
            lineHeight: 1.6,
            margin: "0 0 24px",
          }}
        >
          O acesso ao EduPlay foi pausado pelo seu responsável. Peça a ele para
          reativar a conta.
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 14,
            border: "none",
            background: c.verde,
            color: c.verdeClaro,
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          Voltar ao início
        </button>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@700;800;900&display=swap');`}</style>
    </div>
  );
}

export default function AgentePage() {
  const { codigo: slug } = useParams();
  const codigo = slug.slice(-6);
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();
  const e = tema === "escuro";

  const [etapa, setEtapa] = useState("verificando");
  const [nomeFilho, setNomeFilho] = useState("");
  const [diasRestantes, setDiasRestantes] = useState(5);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [pwaInstalado, setPwaInstalado] = useState(false);

  const c = {
    bg: e ? "#0D141C" : "#F0FFF8",
    card: e ? "#1A2633" : "#FFFFFF",
    texto: e ? "#E2E8F0" : "#1E293B",
    textoSub: e ? "#94A3B8" : "#64748B",
    borda: e ? "#2D3D50" : "#E2E8F0",
    verde: "#0F6E56",
    verdeClaro: "#E1F5EE",
    verdeSub: "#9FE1CB",
  };

  useEffect(() => {
    const handler = (ev) => {
      ev.preventDefault();
      setDeferredPrompt(ev);
    };
    window.addEventListener("beforeinstallprompt", handler);
    if (window.matchMedia("(display-mode: standalone)").matches)
      setPwaInstalado(true);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (!codigo) {
      setEtapa("invalido");
      return;
    }
    const verificar = async () => {
      try {
        let user = auth.currentUser;
        if (!user) {
          const r = await signInAnonymously(auth);
          user = r.user;
        }
        const crianca = await getCrianca(codigo);
        if (!crianca) {
          setEtapa("invalido");
          return;
        }

        // ── Conta desativada pelo responsável ──
        if (crianca.status === "inativo") {
          setEtapa("conta_desativada");
          return;
        }

        const nome = crianca.nome || "Agente";
        setNomeFilho(nome);
        localStorage.setItem("eduplay_player_name", nome);
        localStorage.setItem("eduplay_codigo_acesso", codigo);
        localStorage.setItem("eduplay_serie", crianca.serie || "6ano");
        const trial = await verificarTrial(codigo);
        if (!trial.ativo) {
          setEtapa("trial_expirado");
          return;
        }
        setDiasRestantes(trial.diasRestantes);
        await registrarAcessoDiario(codigo);
        setEtapa("bemvindo");
        if (window.matchMedia("(display-mode: standalone)").matches)
          setTimeout(() => window.location.replace("/"), 2000);
      } catch (err) {
        console.error("Erro ao verificar código:", err);
        setEtapa("invalido");
      }
    };
    verificar();
  }, [codigo]);

  const instalarPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setPwaInstalado(true);
      setDeferredPrompt(null);
      setTimeout(() => window.location.replace("/"), 1500);
    }
  };
  const entrarSemInstalar = () => window.location.replace("/");

  if (etapa === "verificando")
    return (
      <div
        style={{
          minHeight: "100dvh",
          backgroundColor: c.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: c.verde,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "1.8rem",
              animation: "pulsar 1.5s ease-in-out infinite",
            }}
          >
            🎮
          </div>
          <p style={{ color: c.textoSub, fontWeight: 700, fontSize: "0.9rem" }}>
            Verificando seu acesso...
          </p>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap'); @keyframes pulsar{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}`}</style>
      </div>
    );

  if (etapa === "invalido")
    return (
      <div
        style={{
          minHeight: "100dvh",
          backgroundColor: c.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 360,
            backgroundColor: c.card,
            borderRadius: 24,
            padding: "32px 24px",
            textAlign: "center",
            border: `1.5px solid ${c.borda}`,
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔒</div>
          <h1
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.6rem",
              color: c.texto,
              margin: "0 0 10px",
            }}
          >
            Link inválido
          </h1>
          <p
            style={{
              fontSize: "0.88rem",
              color: c.textoSub,
              lineHeight: 1.6,
              margin: "0 0 24px",
            }}
          >
            Este link não existe ou expirou. Peça ao seu responsável para enviar
            um novo link de acesso.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 14,
              border: "none",
              background: c.verde,
              color: c.verdeClaro,
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Voltar ao início
          </button>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@700;800;900&display=swap');`}</style>
      </div>
    );

  if (etapa === "conta_desativada")
    return <ContaDesativada navigate={navigate} />;

  if (etapa === "trial_expirado") return <TrialExpirado navigate={navigate} />;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: c.verde,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          textAlign: "center",
          animation: "entrar 0.4s ease",
        }}
      >
        <div
          style={{
            fontSize: "4rem",
            marginBottom: 16,
            animation: "pulsar 1.5s ease-in-out infinite",
          }}
        >
          🎮
        </div>
        <h1
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: "2rem",
            color: "#E1F5EE",
            margin: "0 0 8px",
          }}
        >
          Olá, {nomeFilho.split(" ")[0]}!
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "#9FE1CB",
            margin: "0 0 28px",
            lineHeight: 1.5,
          }}
        >
          Suas missões estão esperando por você.
        </p>
        {diasRestantes <= 5 && diasRestantes > 0 && (
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "8px 16px",
              marginBottom: 20,
              display: "inline-block",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <p
              style={{
                fontSize: "0.78rem",
                color: "#9FE1CB",
                margin: 0,
                fontWeight: 700,
              }}
            >
              ⏳ {diasRestantes}{" "}
              {diasRestantes === 1
                ? "dia gratuito restante"
                : "dias gratuitos restantes"}
            </p>
          </div>
        )}
        {!pwaInstalado && deferredPrompt && (
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              borderRadius: 20,
              padding: "20px",
              marginBottom: 16,
              border: "1.5px solid rgba(255,255,255,0.2)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>📲</div>
            <p
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "1.1rem",
                color: "#E1F5EE",
                margin: "0 0 6px",
                fontWeight: 700,
              }}
            >
              Salvar na tela inicial
            </p>
            <p
              style={{
                fontSize: "0.82rem",
                color: "#9FE1CB",
                margin: "0 0 16px",
                lineHeight: 1.5,
              }}
            >
              Instale o EduPlay para entrar sem precisar digitar o código toda
              vez.
            </p>
            <button
              onClick={instalarPWA}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 14,
                border: "none",
                background: "#E1F5EE",
                color: c.verde,
                fontWeight: 900,
                fontSize: "0.95rem",
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
                marginBottom: 8,
              }}
            >
              📲 Instalar agora
            </button>
            <button
              onClick={entrarSemInstalar}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 14,
                border: "1.5px solid rgba(255,255,255,0.3)",
                background: "transparent",
                color: "#9FE1CB",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Entrar sem instalar
            </button>
          </div>
        )}
        {(pwaInstalado || !deferredPrompt) && (
          <>
            <div
              style={{
                height: 6,
                background: "rgba(255,255,255,0.2)",
                borderRadius: 3,
                overflow: "hidden",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "#9FE1CB",
                  borderRadius: 3,
                  animation: "carregar 2s ease forwards",
                }}
              />
            </div>
            <p
              style={{
                fontSize: "0.78rem",
                color: "#9FE1CB",
                marginBottom: 16,
              }}
            >
              {pwaInstalado
                ? "✅ App instalado — entrando..."
                : "Pronto para jogar!"}
            </p>
            <button
              onClick={entrarSemInstalar}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 14,
                border: "none",
                background: "#E1F5EE",
                color: "#0F6E56",
                fontWeight: 900,
                fontSize: "1rem",
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              🚀 Entrar nas missões
            </button>
          </>
        )}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@700;800;900&display=swap');
        @keyframes pulsar  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes entrar  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes carregar{ from{width:0%} to{width:100%} }
      `}</style>
    </div>
  );
}
