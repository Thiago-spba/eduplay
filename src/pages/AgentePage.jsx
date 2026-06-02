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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 40%, #002b28 0%, #001211 65%, #000 100%)",
          fontFamily: "'Montserrat', sans-serif",
          color: "#fff",
          overflow: "hidden",
          position: "relative",
          padding: "36px 24px 40px",
        }}
      >
        {/* Planta + orbitais */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          {/* Orbital container */}
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 380,
              height: 230,
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 13,
                height: 13,
                borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 0 12px rgba(255,255,255,0.9)",
                left: 0,
                top: "50%",
                animation: "orbit 5s linear infinite",
                animationDelay: "-1.25s",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 13,
                height: 13,
                borderRadius: "50%",
                background: "#00e0ff",
                boxShadow: "0 0 18px rgba(0,224,255,1)",
                left: 0,
                top: "50%",
                animation: "orbit 5s linear infinite",
                animationDelay: "-3.75s",
              }}
            />
          </div>
          <img
            src="/images/planta_limpa.png"
            alt="EduPlay"
            style={{
              width: 230,
              height: "auto",
              animation: "breathe 3s ease-in-out infinite",
              position: "relative",
              zIndex: 12,
            }}
          />
          <h1
            style={{
              fontWeight: 700,
              fontSize: "2.6rem",
              color: "#00e0b3",
              margin: "0",
              letterSpacing: 1,
              marginTop: -18,
            }}
          >
            EduPlay
          </h1>
          <p
            style={{
              fontWeight: 300,
              fontSize: "1rem",
              color: "#888",
              margin: "6px 0 28px",
            }}
          >
            Semeando o conhecimento, cultivando o futuro.
          </p>
        </div>

        {/* Mensagens rotativas */}
        <div
          style={{
            textAlign: "center",
            maxWidth: 340,
            minHeight: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            id="eduplay-msg"
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: "1.08rem",
              fontWeight: 700,
              color: "#ddf5f0",
              lineHeight: 1.7,
              margin: 0,
            }}
          />
        </div>

        {/* Dots */}
        <div
          id="eduplay-dots"
          style={{
            display: "flex",
            gap: 9,
            justifyContent: "center",
            margin: "14px 0 22px",
          }}
        />

        {/* Botão */}
        <button
          onClick={() => navigate("/pais")}
          style={{
            padding: "14px 48px",
            borderRadius: 30,
            border: "none",
            background: "linear-gradient(135deg,#00C853,#00BFA5)",
            color: "#fff",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: "1rem",
            cursor: "pointer",
            animation: "pb 2.5s ease-in-out infinite",
          }}
        >
          🌱 Continuar aprendendo
        </button>
        <p
          style={{
            fontSize: "0.73rem",
            color: "rgba(255,255,255,0.35)",
            marginTop: 9,
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          R$20/mês · até 2 filhos · cancele quando quiser
        </p>

        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&family=Nunito:wght@700;800;900&display=swap');
        @keyframes breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
        @keyframes orbit {
          0%   { transform:rotate(0deg)   translateX(-190px) scale(1);   z-index:5  }
          49%  { z-index:5  }
          50%  { transform:rotate(180deg) translateX(-190px) scale(1.5); z-index:15 }
          100% { transform:rotate(360deg) translateX(-190px) scale(1);   z-index:15 }
        }
        @keyframes pb { 0%,100%{box-shadow:0 4px 22px rgba(0,200,83,.35)} 50%{box-shadow:0 6px 32px rgba(0,200,83,.6)} }
        @keyframes fin { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        #eduplay-msg { animation: fin 0.6s ease; }
      `}</style>

        <script
          dangerouslySetInnerHTML={{
            __html: `
        (function(){
          var NOME = '${nomeFilho.split(" ")[0] || "seu filho"}';
          var MSGS = [
            'Você decidiu que <span style="color:#00e0b3;font-weight:900">' + NOME + '</span> merece mais.<br>Essa decisão tem continuidade.',
            'Os 5 dias de <span style="color:#00e0b3;font-weight:900">' + NOME + '</span> foram o começo.<br>O hábito leva 21 dias para se formar.',
            'Pais que investem hoje não precisam<br>se preocupar com o amanhã de <span style="color:#00e0b3;font-weight:900">' + NOME + '</span>.',
            'Menos que uma pizza.<br>O impacto de um professor todos os dias.',
            'O momento mais fácil de desistir<br>é exatamente antes de virar rotina.',
            '<span style="color:#00e0b3;font-weight:900">' + NOME + '</span> não sabe que você está aqui.<br>Mas vai sentir a diferença.',
            'Consistência é o que separa<br>quem sonha de quem conquista.',
            'O que você investe em <span style="color:#00e0b3;font-weight:900">' + NOME + '</span> hoje,<br>ele carrega para sempre.',
          ];
          var idx=0, timer;
          var el=document.getElementById('eduplay-msg');
          var dc=document.getElementById('eduplay-dots');
          if(!el||!dc) return;
          MSGS.forEach(function(_,i){
            var d=document.createElement('div');
            d.style.cssText='width:7px;height:7px;border-radius:50%;cursor:pointer;transition:.3s;background:'+(i===0?'#00e0b3':'rgba(255,255,255,0.2)');
            d.onclick=function(){clearInterval(timer);idx=i;show(i);loop()};
            dc.appendChild(d);
          });
          function show(i){
            el.style.animation='none';void el.offsetHeight;el.style.animation='fin 0.6s ease';
            el.innerHTML=MSGS[i];
            Array.from(dc.children).forEach(function(d,j){d.style.background=j===i?'#00e0b3':'rgba(255,255,255,0.2)';d.style.transform=j===i?'scale(1.4)':'scale(1)'});
          }
          function loop(){timer=setInterval(function(){idx=(idx+1)%MSGS.length;show(idx)},3800)}
          show(0);setTimeout(loop,3800);
        })();
      `,
          }}
        />
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
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes pulsar  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes entrar  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes carregar{ from{width:0%} to{width:100%} }
      `}</style>
    </div>
  );
}
