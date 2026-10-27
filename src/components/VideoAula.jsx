import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../services/firebase";

// 🎬 Vídeo-aula DENTRO do app: busca até 3 vídeos (safeSearch rigoroso) e toca aqui mesmo,
// no player do YouTube sem cookies. Se a busca falhar, cai no link de busca do YouTube (como antes).
// Busca padrão: Cloud Function buscarVideoAula (pode ser trocada por "buscar" em testes)
async function buscarNoServidor(busca) {
  const fn = httpsCallable(functions, "buscarVideoAula");
  const r = await fn({ busca });
  return r.data?.videos || [];
}

export default function VideoAula({ busca, linkFallback, c, textoBotao = "▶ Ver vídeos sobre o assunto", buscar = buscarNoServidor }) {
  const [estado, setEstado] = useState("fechado"); // fechado | carregando | lista | erro
  const [videos, setVideos] = useState([]);
  const [tocando, setTocando] = useState(null);

  const abrir = async () => {
    setEstado("carregando");
    try {
      const lista = await buscar(busca);
      if (!lista.length) throw new Error("vazio");
      setVideos(lista);
      setTocando(lista[0]);
      setEstado("lista");
    } catch {
      setEstado("erro");
    }
  };

  if (estado === "fechado" || estado === "carregando") {
    return (
      <button
        onClick={abrir}
        disabled={estado === "carregando"}
        style={{
          display: "block", width: "100%", padding: "12px", borderRadius: 14, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #FF0000, #CC0000)", color: "#fff", fontSize: "0.92rem", fontWeight: 800,
          fontFamily: "'Fredoka', sans-serif",
        }}
      >
        {estado === "carregando" ? "Procurando bons vídeos..." : textoBotao}
      </button>
    );
  }

  if (estado === "erro") {
    return (
      <a
        href={linkFallback}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "block", padding: "12px", borderRadius: 14, textAlign: "center", textDecoration: "none",
          background: "linear-gradient(135deg, #FF0000, #CC0000)", color: "#fff", fontSize: "0.92rem", fontWeight: 800,
          fontFamily: "'Fredoka', sans-serif",
        }}
      >
        ▶ Abrir vídeos no YouTube
      </a>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
      {tocando && (
        <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: 14, overflow: "hidden", background: "#000" }}>
          <iframe
            key={tocando.videoId}
            src={`https://www.youtube-nocookie.com/embed/${tocando.videoId}?rel=0&modestbranding=1&playsinline=1`}
            title={tocando.titulo}
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          />
        </div>
      )}
      {tocando && (
        <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: c.texto, lineHeight: 1.4 }}>
          {tocando.titulo}
          <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: c.textoSub }}>{tocando.canal}</span>
        </p>
      )}
      {videos.length > 1 && (
        <>
          <p style={{ margin: "4px 0 0", fontSize: "0.72rem", fontWeight: 800, color: c.textoSub, textTransform: "uppercase", letterSpacing: 1 }}>
            Outros vídeos
          </p>
          {videos.filter((v) => v.videoId !== tocando?.videoId).map((v) => (
            <button
              key={v.videoId}
              onClick={() => setTocando(v)}
              style={{
                display: "flex", gap: 10, alignItems: "center", padding: 8, borderRadius: 12, cursor: "pointer", textAlign: "left",
                border: `1.5px solid ${c.borda}`, background: c.card, color: c.texto, fontFamily: "'Nunito', sans-serif",
              }}
            >
              {v.thumb && <img src={v.thumb} alt="" style={{ width: 96, height: 54, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />}
              <span style={{ fontSize: "0.8rem", fontWeight: 700, lineHeight: 1.3 }}>
                {v.titulo}
                <span style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, color: c.textoSub }}>{v.canal}</span>
              </span>
            </button>
          ))}
        </>
      )}
      <p style={{ margin: 0, fontSize: "0.7rem", color: c.textoSub, textAlign: "center" }}>
        Vídeos do YouTube escolhidos automaticamente. Assista com um adulto por perto. 💚
      </p>
    </div>
  );
}
