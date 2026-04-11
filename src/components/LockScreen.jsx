import { useState, useEffect } from "react";
import { useTema } from "../context/ThemeContext";

export default function LockScreen({ timer, lock }) {
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [shake, setShake] = useState(false);
  const { tema, alternarTema } = useTema();

  const c = {
    bg1: tema === "escuro" ? "#0D2137" : "#E8F7FF",
    bg2: tema === "escuro" ? "#0A1520" : "#D0EEE8",
    titulo: tema === "escuro" ? "#F7F5F0" : "#1A2B3C",
    subtitulo: tema === "escuro" ? "#A8C5C3" : "#5A7A8A",
    card: tema === "escuro" ? "#1A2B3C" : "#F7F5F0",
    cardBorda: tema === "escuro" ? "#2A3F52" : "#DDE8F0",
    label: tema === "escuro" ? "#8BAFC0" : "#7A7A7A",
    input: tema === "escuro" ? "#0F1923" : "#FFFFFF",
    inputBorda: tema === "escuro" ? "#2A3F52" : "#A8C5C3",
    erro: tema === "escuro" ? "#FF8080" : "#A65D5D",
    contador: "#00D4AA",
    btnAtivo: "#00D4AA",
    btnInativo: tema === "escuro" ? "#2A3F52" : "#A8C5C3",
    btnTexto: "#FFFFFF",
  };

  useEffect(() => {
    if (!lock.emCooldown) return;
    setCooldown(lock.tempoCooldown);
    const intervalo = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          setMensagem("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalo);
  }, [lock.emCooldown]);

  const handleDesbloquear = () => {
    if (lock.emCooldown) return;
    const resultado = lock.verificarSenha(senha);
    if (resultado.ok) {
      timer.desbloquear();
      setSenha("");
      setMensagem("");
    } else {
      setSenha("");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (resultado.motivo === "bloqueado") {
        setMensagem("Muitas tentativas! Aguarde 60 segundos.");
        setCooldown(60);
      } else if (resultado.motivo === "cooldown") {
        setMensagem(`Aguarde ${cooldown} segundos para tentar novamente.`);
      } else {
        setMensagem(
          `Senha incorreta! ${resultado.tentativasRestantes} tentativa(s) restante(s).`,
        );
      }
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: `linear-gradient(135deg, ${c.bg1} 0%, ${c.bg2} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Nunito', sans-serif",
        zIndex: 9999,
      }}
    >
      {/* Botão tema */}
      <button
        onClick={alternarTema}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          width: "40px",
          height: "40px",
          background: tema === "escuro" ? "#1A2B3C" : "#FFFFFF44",
          border: `2px solid ${tema === "escuro" ? "#2A3F52" : "#FFFFFF66"}`,
          borderRadius: "12px",
          fontSize: "1.1rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {tema === "escuro" ? "☀️" : "🌙"}
      </button>

      {/* Ícone */}
      <div
        style={{
          fontSize: "5rem",
          marginBottom: "16px",
          animation: "pulsar 2s ease-in-out infinite",
        }}
      >
        ⏰
      </div>

      <h2
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: "1.8rem",
          color: c.titulo,
          marginBottom: "8px",
          textAlign: "center",
        }}
      >
        Tempo Esgotado!
      </h2>

      <p
        style={{
          color: c.subtitulo,
          marginBottom: "32px",
          textAlign: "center",
          fontSize: "1rem",
          maxWidth: "280px",
        }}
      >
        Ótimo estudo hoje! Peça para um responsável digitar a senha para
        continuar.
      </p>

      {/* Card senha */}
      <div
        style={{
          background: c.card,
          borderRadius: "24px",
          padding: "28px 24px",
          width: "100%",
          maxWidth: "320px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          border: `2px solid ${c.cardBorda}`,
          animation: shake ? "shake 0.5s ease" : "none",
        }}
      >
        <p
          style={{
            textAlign: "center",
            color: c.label,
            marginBottom: "16px",
            fontSize: "0.95rem",
          }}
        >
          🔒 Senha dos responsáveis
        </p>

        <input
          type="password"
          value={senha}
          onChange={(e) => {
            setSenha(e.target.value);
            setMensagem("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleDesbloquear()}
          placeholder="••••"
          maxLength={4}
          disabled={lock.emCooldown}
          style={{
            width: "100%",
            padding: "16px",
            border: `3px solid ${mensagem.includes("incorreta") ? c.erro : c.inputBorda}`,
            borderRadius: "16px",
            fontSize: "2rem",
            textAlign: "center",
            letterSpacing: "12px",
            fontFamily: "'Fredoka', sans-serif",
            background: lock.emCooldown ? c.btnInativo : c.input,
            color: c.titulo,
            outline: "none",
            marginBottom: "12px",
            boxSizing: "border-box",
          }}
        />

        {mensagem && (
          <p
            style={{
              textAlign: "center",
              color: c.erro,
              fontSize: "0.85rem",
              marginBottom: "12px",
            }}
          >
            ⚠️ {mensagem}
          </p>
        )}

        {lock.emCooldown && cooldown > 0 && (
          <p
            style={{
              textAlign: "center",
              color: c.contador,
              fontSize: "1.2rem",
              fontWeight: "700",
              fontFamily: "'Fredoka', sans-serif",
              marginBottom: "12px",
            }}
          >
            ⏱️ {cooldown}s
          </p>
        )}

        <button
          onClick={handleDesbloquear}
          disabled={lock.emCooldown || senha.length < 4}
          style={{
            width: "100%",
            padding: "16px",
            background:
              lock.emCooldown || senha.length < 4 ? c.btnInativo : c.btnAtivo,
            color: c.btnTexto,
            border: "none",
            borderRadius: "16px",
            fontSize: "1.1rem",
            fontWeight: "700",
            fontFamily: "'Fredoka', sans-serif",
            cursor:
              lock.emCooldown || senha.length < 4 ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          🔓 Liberar
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700&display=swap');
        @keyframes pulsar { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-10px); } 40% { transform: translateX(10px); } 60% { transform: translateX(-10px); } 80% { transform: translateX(10px); } }
      `}</style>
    </div>
  );
}
