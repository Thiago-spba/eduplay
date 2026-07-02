import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { temErro: false };
  }

  static getDerivedStateFromError() {
    return { temErro: true };
  }

  componentDidCatch(error, info) {
    console.error("💥 Erro não tratado capturado pelo ErrorBoundary:", error, info);
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