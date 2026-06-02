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

export default function AgentePage() {
  const { codigo: slug } = useParams();
  const codigo = slug.slice(-6);
  const navigate = useNavigate();
  const { tema } = useTema();
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
          const result = await signInAnonymously(auth);
          user = result.user;
        }

        const crianca = await getCrianca(codigo);
        if (!crianca) {
          setEtapa("invalido");
          return;
        }

        const nome = crianca.nome || "Agente";
        setNomeFilho(nome);
        localStorage.setItem("eduplay_player_name", nome);
        localStorage.setItem("eduplay_codigo_acesso", codigo);
        localStorage.setItem("eduplay_serie", crianca.serie || "6ano");

        // ── Verifica trial ──
        const trial = await verificarTrial(codigo);

        if (!trial.ativo) {
          setEtapa("trial_expirado");
          return;
        }

        setDiasRestantes(trial.diasRestantes);
        await registrarAcessoDiario(codigo);
        setEtapa("bemvindo");

        if (window.matchMedia("(display-mode: standalone)").matches) {
          setTimeout(() => window.location.replace("/"), 2000);
        }
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
          background: c.bg,
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
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap'); @keyframes pulsar { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }`}</style>
      </div>
    );

  if (etapa === "invalido")
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
        <div
          style={{
            width: "100%",
            maxWidth: 360,
            background: c.card,
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
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>
      </div>
    );

  // ── Trial expirado ──
  if (etapa === "trial_expirado")
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: e ? "#0D141C" : "#FFF8F0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: 16 }}>⏰</div>
          <h1
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.8rem",
              color: e ? "#E2E8F0" : "#1E293B",
              margin: "0 0 10px",
            }}
          >
            Período gratuito encerrado
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: e ? "#94A3B8" : "#64748B",
              lineHeight: 1.6,
              margin: "0 0 24px",
            }}
          >
            Os 5 dias gratuitos de{" "}
            <strong>{nomeFilho.split(" ")[0] || "seu filho"}</strong> chegaram
            ao fim.
            <br />
            <br />
            Para continuar aprendendo, peça ao seu responsável para ativar o
            plano mensal.
          </p>
          <div
            style={{
              background: e ? "#1A2633" : "#FFFFFF",
              borderRadius: 20,
              padding: "20px",
              marginBottom: 20,
              border: `2px solid #00D4AA44`,
            }}
          >
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#00D4AA",
                margin: "0 0 8px",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Plano EduPlay
            </p>
            <p
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "2rem",
                color: e ? "#E2E8F0" : "#1E293B",
                margin: "0 0 4px",
                fontWeight: 700,
              }}
            >
              R$ 20<span style={{ fontSize: "1rem" }}>/mês</span>
            </p>
            <p
              style={{
                fontSize: "0.82rem",
                color: e ? "#94A3B8" : "#64748B",
                margin: 0,
              }}
            >
              Até 2 filhos · Cancele quando quiser
            </p>
            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {[
                "✅ Missões ilimitadas com IA",
                "✅ Painel completo dos pais",
                "✅ Currículo paulista 6º ao 9º ano",
                "✅ Áudio explicativo em todas as missões",
              ].map((item, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: "0.82rem",
                    color: e ? "#94A3B8" : "#64748B",
                    margin: 0,
                    textAlign: "left",
                  }}
                >
                  {item}
                </p>
              ))}
            </div>
          </div>
          <p
            style={{
              fontSize: "0.78rem",
              color: e ? "#94A3B8" : "#64748B",
              lineHeight: 1.5,
            }}
          >
            Responsável: acesse <strong>eduplay.olloapp.com.br</strong> → "Sou
            responsável" para assinar.
          </p>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>
      </div>
    );

  // ── Bem-vindo ──
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

        {/* Badge de dias restantes do trial */}
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
            <p style={{ fontSize: "0.78rem", color: "#9FE1CB" }}>
              {pwaInstalado
                ? "✅ App instalado — entrando..."
                : "Entrando no EduPlay..."}
            </p>
            {!pwaInstalado && !deferredPrompt && (
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "rgba(159,225,203,0.7)",
                  marginTop: 8,
                  lineHeight: 1.5,
                }}
              >
                💡 Dica: adicione este link aos favoritos para entrar mais
                rápido.
              </p>
            )}
          </>
        )}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes pulsar  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes entrar  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes carregar{ from{width:0%} to{width:100%} }
      `}</style>
    </div>
  );
}
