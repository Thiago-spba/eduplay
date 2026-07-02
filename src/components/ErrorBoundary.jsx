import { Component } from "react";

/**
 * Pega qualquer erro inesperado de renderização em qualquer tela do app
 * e mostra uma mensagem amigável em vez de deixar a tela em branco.
 *
 * Caso especial: quando o erro é "arquivo desatualizado" (aconteceu um
 * deploy novo enquanto a pessoa estava com o app aberto), recarrega a
 * página sozinho, uma única vez, em vez de mostrar a tela de erro.
 */
const CHAVE_RELOAD = "eduplay_auto_reload_tentado";

function ehErroDeArquivoDesatualizado(error) {
  const msg = String(error?.message || "");
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("error loading dynamically imported module") ||
    (msg.includes("Unexpected token") && msg.includes("<"))
  );
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { temErro: false };
  }

  componentDidMount() {
    // Carregou com sucesso — libera a tentativa de auto-reload pra próxima vez
    sessionStorage.removeItem(CHAVE_RELOAD);
  }

  static getDerivedStateFromError() {
    return { temErro: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("💥 Erro não tratado capturado pelo ErrorBoundary:", error, info);

    if (ehErroDeArquivoDesatualizado(error)) {
      const jaTentou = sessionStorage.getItem(CHAVE_RELOAD);
      if (!jaTentou) {
        sessionStorage.setItem(CHAVE_RELOAD, "1");
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.temErro) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            height: "100dvh",
            background: "#0F1923",
            color: "#fff",
            fontFamily: "sans-serif",
            textAlign: "center",
            padding: 24,
          }}
        >
          <div style={{ fontSize: 40 }}>😕</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            Ops! Algo deu errado.
          </div>
          <div style={{ fontSize: "0.95rem", opacity: 0.8, maxWidth: 320 }}>
            Isso já foi registrado. Tenta recarregar a página.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "#00D4AA",
              color: "#0F1923",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}