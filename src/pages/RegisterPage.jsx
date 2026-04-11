import { useState } from "react";

const AVATARES = ["👦", "👧", "🧒", "👽", "🦊", "🐼", "🦁", "🐸"];

export default function RegisterPage({ onRegister }) {
  const [nome, setNome] = useState("");
  const [avatar, setAvatar] = useState("👦");
  const [erro, setErro] = useState("");

  const handleSubmit = () => {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErro("Digite seu nome para continuar!");
      return;
    }
    if (nomeLimpo.length < 2) {
      setErro("Nome muito curto!");
      return;
    }
    onRegister(nomeLimpo);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #D4E5E4 0%, #EDE8DF 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: "4rem",
          marginBottom: "16px",
          animation: "flutuar 3s ease-in-out infinite",
        }}
      >
        🌿
      </div>
      <h1
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: "2rem",
          color: "#3D6B6A",
          marginBottom: "8px",
        }}
      >
        EduPlay
      </h1>
      <p
        style={{ color: "#7A7A7A", marginBottom: "32px", textAlign: "center" }}
      >
        Exploradores do Saber 🚀
      </p>

      {/* Card */}
      <div
        style={{
          background: "#F7F5F0",
          borderRadius: "24px",
          padding: "32px 24px",
          width: "100%",
          maxWidth: "360px",
          boxShadow: "0 8px 24px rgba(90,143,140,0.16)",
        }}
      >
        <h2
          style={{
            fontFamily: "'Fredoka', sans-serif",
            color: "#3D6B6A",
            marginBottom: "24px",
            textAlign: "center",
            fontSize: "1.3rem",
          }}
        >
          Qual é o seu nome, explorador?
        </h2>

        {/* Input nome */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "700",
              color: "#3D6B6A",
              marginBottom: "8px",
              fontSize: "0.95rem",
            }}
          >
            Seu nome
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setErro("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Ex: João, Maria..."
            maxLength={20}
            autoFocus
            style={{
              width: "100%",
              padding: "14px 16px",
              border: `3px solid ${erro ? "#D4A5A5" : "#A8C5C3"}`,
              borderRadius: "16px",
              fontSize: "1rem",
              fontFamily: "'Nunito', sans-serif",
              background: "#F7F5F0",
              outline: "none",
              color: "#4A4A4A",
            }}
          />
          {erro && (
            <p
              style={{
                color: "#A65D5D",
                fontSize: "0.85rem",
                marginTop: "6px",
              }}
            >
              ⚠️ {erro}
            </p>
          )}
        </div>

        {/* Seleção de avatar */}
        <div style={{ marginBottom: "28px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "700",
              color: "#3D6B6A",
              marginBottom: "12px",
              fontSize: "0.95rem",
            }}
          >
            Escolha seu avatar:
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px",
            }}
          >
            {AVATARES.map((av) => (
              <button
                key={av}
                onClick={() => setAvatar(av)}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  background: avatar === av ? "#D4E5E4" : "#EDE8DF",
                  border: `3px solid ${avatar === av ? "#5A8F8C" : "#E5E0D5"}`,
                  borderRadius: "50%",
                  fontSize: "1.8rem",
                  cursor: "pointer",
                  transform: avatar === av ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.2s",
                }}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Botão */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "16px",
            background: "#5A8F8C",
            color: "#F7F5F0",
            border: "none",
            borderRadius: "16px",
            fontSize: "1.1rem",
            fontWeight: "700",
            fontFamily: "'Fredoka', sans-serif",
            cursor: "pointer",
            letterSpacing: "0.5px",
          }}
        >
          Começar Aventura! 🚀
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700&display=swap');
        @keyframes flutuar {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
