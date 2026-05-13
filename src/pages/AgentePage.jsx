import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../services/firebase";
import { getCrianca } from "../services/db";
import { registrarAcessoDiario } from "../services/db";
import { useTema } from "../context/ThemeContext";

export default function AgentePage() {
  const { codigo: slug } = useParams();
  const codigo = slug.slice(-6);
  const navigate = useNavigate();
  const { tema } = useTema();
  const e = tema === "escuro";

  const [etapa, setEtapa] = useState("verificando");
  const [nomeFilho, setNomeFilho] = useState("");

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
    if (!codigo) {
      setEtapa("invalido");
      return;
    }

    const verificar = async () => {
      try {
        // 1. Garante auth anônimo para a criança
        let user = auth.currentUser;
        if (!user) {
          const result = await signInAnonymously(auth);
          user = result.user;
        }

        // 2. Busca dados da criança no Firestore (coleção nova)
        const crianca = await getCrianca(codigo);
        if (!crianca) {
          setEtapa("invalido");
          return;
        }

        const nome = crianca.nome || "Agente";
        setNomeFilho(nome);

        // 3. Salva identidade no localStorage como cache
        localStorage.setItem("eduplay_player_name", nome);
        localStorage.setItem("eduplay_codigo_acesso", codigo);

        // 4. Registra acesso diário no Firestore
        await registrarAcessoDiario(codigo);

        setEtapa("bemvindo");

        // 5. Redireciona para o app após animação
        setTimeout(() => window.location.replace("/"), 2500);
      } catch (err) {
        console.error("Erro ao verificar código:", err);
        setEtapa("invalido");
      }
    };

    verificar();
  }, [codigo]);

  // ── Verificando ──
  if (etapa === "verificando") {
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
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
          @keyframes pulsar { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        `}</style>
      </div>
    );
  }

  // ── Inválido ──
  if (etapa === "invalido") {
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
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        `}</style>
      </div>
    );
  }

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
          maxWidth: 360,
          textAlign: "center",
          animation: "entrar 0.4s ease",
        }}
      >
        <div
          style={{
            fontSize: "4rem",
            marginBottom: 20,
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
            margin: "0 0 32px",
            lineHeight: 1.5,
          }}
        >
          Suas missões estão esperando por você.
        </p>
        <div
          style={{
            height: 6,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#9FE1CB",
              borderRadius: 3,
              animation: "carregar 2.3s ease forwards",
            }}
          />
        </div>
        <p style={{ fontSize: "0.78rem", color: "#9FE1CB", marginTop: 10 }}>
          Entrando no EduPlay...
        </p>
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
