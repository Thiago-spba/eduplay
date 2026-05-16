import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { db, storage } from "../services/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useTema } from "../context/ThemeContext";
import { useEffect } from "react";

const ADMIN_EMAIL = "thiago.rpba@gmail.com";
const MAX_BYTES = 30 * 1024 * 1024; // 30MB (~10 min MP3)

const DISCIPLINAS = [
  { id: "historia", label: "História", icone: "📜" },
  { id: "geografia", label: "Geografia", icone: "🗺️" },
  { id: "matematica", label: "Matemática", icone: "📐" },
  { id: "ciencias", label: "Ciências", icone: "🔬" },
  { id: "portugues", label: "Português", icone: "✍️" },
];

const BIMESTRES = [
  { id: "1bimestre", label: "1º Bimestre" },
  { id: "2bimestre", label: "2º Bimestre" },
  { id: "3bimestre", label: "3º Bimestre" },
  { id: "4bimestre", label: "4º Bimestre" },
];

const SERIES = [
  { id: "6ano", label: "6º ano" },
  { id: "7ano", label: "7º ano" },
  { id: "8ano", label: "8º ano" },
  { id: "9ano", label: "9º ano" },
];

export default function AdminPage({ userPai }) {
  const navigate = useNavigate();
  const { tema, alternarTema } = useTema();
  const e = tema === "escuro";
  const fileRef = useRef(null);

  const [disciplina, setDisciplina] = useState("historia");
  const [bimestre, setBimestre] = useState("1bimestre");
  const [serie, setSerie] = useState("6ano");
  const [arquivo, setArquivo] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [gratuito, setGratuito] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [status, setStatus] = useState(""); // "gerando" | "uploading" | "salvo" | "erro"
  const [mensagem, setMensagem] = useState("");
  const [podcasts, setPodcasts] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(true);

  const c = {
    bg: e ? "#0F1923" : "#F0F7FF",
    card: e ? "#1A2B3C" : "#FFFFFF",
    card2: e ? "#0D1820" : "#F8FBFF",
    texto: e ? "#E8F4F8" : "#1A2B3C",
    textoSub: e ? "#6B8A9A" : "#7A9AAA",
    borda: e ? "#1A3347" : "#EEF5FF",
    accent: "#00D4AA",
    azul: "#3B82F6",
  };

  // Verifica se é admin
  if (!userPai || userPai.email !== ADMIN_EMAIL) {
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
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔒</div>
          <p style={{ color: c.textoSub, fontWeight: 700 }}>Acesso restrito.</p>
          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: 16,
              padding: "10px 24px",
              borderRadius: 12,
              border: "none",
              background: c.accent,
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  // Carrega lista de podcasts
  useEffect(() => {
    const carregar = async () => {
      try {
        const q = query(
          collection(db, "podcasts"),
          orderBy("criadoEm", "desc"),
        );
        const snap = await getDocs(q);
        setPodcasts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {
        /* silencia */
      } finally {
        setCarregandoLista(false);
      }
    };
    carregar();
  }, [status]);

  const selecionarArquivo = (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setMensagem("Selecione um arquivo de áudio MP3.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setMensagem("Arquivo muito grande. Máximo 30MB (~10 min).");
      return;
    }
    setArquivo(file);
    setMensagem("");
    setTitulo("");
    setDescricao("");
  };

  const gerarMetadados = async () => {
    setStatus("gerando");
    setMensagem("Gerando título e descrição com IA...");
    try {
      const fn = httpsCallable(
        getFunctions(undefined, "us-central1"),
        "gerarMetadadosPodcast",
      );
      const result = await fn({ disciplina, bimestre, serie });
      setTitulo(result.data.titulo);
      setDescricao(result.data.descricao);
      setMensagem("");
      setStatus("");
    } catch {
      setMensagem("Erro ao gerar metadados. Preencha manualmente.");
      setStatus("");
    }
  };

  const salvar = async () => {
    if (!arquivo) {
      setMensagem("Selecione um arquivo de áudio.");
      return;
    }
    if (!titulo.trim()) {
      setMensagem("Preencha o título.");
      return;
    }
    if (!descricao.trim()) {
      setMensagem("Preencha a descrição.");
      return;
    }

    setStatus("uploading");
    setProgresso(0);
    setMensagem("Fazendo upload do arquivo...");

    try {
      const nomeArquivo = `podcasts/${disciplina}_${serie}_${bimestre}_${Date.now()}.mp3`;
      const storageRef = ref(storage, nomeArquivo);
      const upload = uploadBytesResumable(storageRef, arquivo);

      upload.on(
        "state_changed",
        (snap) =>
          setProgresso(
            Math.round((snap.bytesTransferred / snap.totalBytes) * 100),
          ),
        () => {
          setMensagem("Erro no upload. Tente novamente.");
          setStatus("erro");
        },
        async () => {
          const url = await getDownloadURL(upload.snapshot.ref);
          await addDoc(collection(db, "podcasts"), {
            disciplina,
            bimestre,
            serie,
            titulo: titulo.trim(),
            descricao: descricao.trim(),
            url,
            gratuito,
            duracaoSegundos: 0,
            criadoEm: serverTimestamp(),
          });
          setStatus("salvo");
          setMensagem("✅ Podcast publicado com sucesso!");
          setArquivo(null);
          setTitulo("");
          setDescricao("");
          setProgresso(0);
          if (fileRef.current) fileRef.current.value = "";
        },
      );
    } catch {
      setMensagem("Erro ao salvar. Tente novamente.");
      setStatus("erro");
    }
  };

  const disc = DISCIPLINAS.find((d) => d.id === disciplina);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: c.bg,
        fontFamily: "'Nunito', sans-serif",
        paddingBottom: 60,
      }}
    >
      {/* Header */}
      <header
        style={{
          background: c.card,
          borderBottom: `2px solid ${c.borda}`,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => navigate("/pais")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
              color: c.texto,
            }}
          >
            ←
          </button>
          <span
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: c.accent,
            }}
          >
            🎙️ Painel Admin — Podcasts
          </span>
        </div>
        <button
          onClick={alternarTema}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: `2px solid ${c.borda}`,
            background: e ? "#1A2B3C" : "#fff",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {e ? "☀️" : "🌙"}
        </button>
      </header>

      <main
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Upload */}
        <div
          style={{
            background: c.card,
            borderRadius: 20,
            padding: "20px",
            border: `2px solid ${c.borda}`,
          }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              fontWeight: 800,
              color: c.textoSub,
              textTransform: "uppercase",
              letterSpacing: 1,
              margin: "0 0 14px",
            }}
          >
            📤 Novo Podcast
          </p>

          {/* Disciplina */}
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: c.textoSub,
              margin: "0 0 8px",
            }}
          >
            Disciplina
          </p>
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            {DISCIPLINAS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDisciplina(d.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 10,
                  cursor: "pointer",
                  background:
                    disciplina === d.id ? `${c.accent}20` : "transparent",
                  border: `2px solid ${disciplina === d.id ? c.accent : c.borda}`,
                  color: disciplina === d.id ? c.accent : c.textoSub,
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                {d.icone} {d.label}
              </button>
            ))}
          </div>

          {/* Série + Bimestre */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: c.textoSub,
                  margin: "0 0 8px",
                }}
              >
                Série
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {SERIES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSerie(s.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                      background:
                        serie === s.id ? `${c.azul}20` : "transparent",
                      border: `1.5px solid ${serie === s.id ? c.azul : c.borda}`,
                      color: serie === s.id ? c.azul : c.textoSub,
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      fontFamily: "'Nunito', sans-serif",
                      textAlign: "left",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: c.textoSub,
                  margin: "0 0 8px",
                }}
              >
                Bimestre
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {BIMESTRES.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBimestre(b.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                      background:
                        bimestre === b.id ? `${c.accent}20` : "transparent",
                      border: `1.5px solid ${bimestre === b.id ? c.accent : c.borda}`,
                      color: bimestre === b.id ? c.accent : c.textoSub,
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      fontFamily: "'Nunito', sans-serif",
                      textAlign: "left",
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Upload de arquivo */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              background: c.card2,
              borderRadius: 14,
              padding: "20px",
              border: `2px dashed ${arquivo ? c.accent : c.borda}`,
              textAlign: "center",
              cursor: "pointer",
              marginBottom: 14,
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>
              {arquivo ? "🎵" : "📁"}
            </div>
            <p
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: arquivo ? c.accent : c.textoSub,
                margin: 0,
              }}
            >
              {arquivo ? arquivo.name : "Clique para selecionar o arquivo MP3"}
            </p>
            {arquivo && (
              <p
                style={{
                  fontSize: "0.72rem",
                  color: c.textoSub,
                  margin: "4px 0 0",
                }}
              >
                {(arquivo.size / 1024 / 1024).toFixed(1)} MB
              </p>
            )}
            <p
              style={{
                fontSize: "0.7rem",
                color: c.textoSub,
                margin: "6px 0 0",
              }}
            >
              MP3 · máximo 30MB (~10 minutos)
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              onChange={selecionarArquivo}
              style={{ display: "none" }}
            />
          </div>

          {/* Gerar metadados */}
          <button
            onClick={gerarMetadados}
            disabled={status === "gerando"}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 12,
              border: `2px solid ${c.accent}`,
              background: "transparent",
              color: c.accent,
              fontWeight: 800,
              fontSize: "0.88rem",
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
              marginBottom: 12,
              transition: "all 0.2s",
            }}
          >
            {status === "gerando"
              ? "⏳ Gerando com IA..."
              : "🤖 Gerar título e descrição com IA"}
          </button>

          {/* Título */}
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: c.textoSub,
              margin: "0 0 6px",
            }}
          >
            Título
          </p>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: A Revolução do Sistema Decimal"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: `1.5px solid ${c.borda}`,
              background: c.card2,
              color: c.texto,
              fontSize: "0.9rem",
              fontFamily: "'Nunito', sans-serif",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: 12,
            }}
          />

          {/* Descrição */}
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: c.textoSub,
              margin: "0 0 6px",
            }}
          >
            Descrição curta
          </p>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Descubra como os números que usamos hoje conquistaram o mundo..."
            rows={3}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: `1.5px solid ${c.borda}`,
              background: c.card2,
              color: c.texto,
              fontSize: "0.88rem",
              fontFamily: "'Nunito', sans-serif",
              outline: "none",
              resize: "none",
              boxSizing: "border-box",
              marginBottom: 12,
            }}
          />

          {/* Gratuito */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              marginBottom: 16,
            }}
          >
            <input
              type="checkbox"
              checked={gratuito}
              onChange={(ev) => setGratuito(ev.target.checked)}
              style={{ width: 18, height: 18, accentColor: c.accent }}
            />
            <span
              style={{ fontSize: "0.85rem", color: c.texto, fontWeight: 600 }}
            >
              Disponível gratuitamente (demo + trial)
            </span>
          </label>

          {/* Barra de progresso upload */}
          {status === "uploading" && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  height: 6,
                  background: c.borda,
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progresso}%`,
                    background: `linear-gradient(90deg, ${c.accent}, #0099FF)`,
                    borderRadius: 3,
                    transition: "width 0.3s",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: c.textoSub,
                  margin: "4px 0 0",
                  textAlign: "right",
                }}
              >
                {progresso}%
              </p>
            </div>
          )}

          {mensagem && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background:
                  status === "salvo"
                    ? "#00D4AA15"
                    : status === "erro"
                      ? "#EF444415"
                      : `${c.azul}15`,
                border: `1.5px solid ${status === "salvo" ? "#00D4AA44" : status === "erro" ? "#EF444444" : `${c.azul}44`}`,
                marginBottom: 12,
              }}
            >
              <p
                style={{
                  fontSize: "0.82rem",
                  color:
                    status === "salvo"
                      ? c.accent
                      : status === "erro"
                        ? "#EF4444"
                        : c.azul,
                  margin: 0,
                  fontWeight: 700,
                }}
              >
                {mensagem}
              </p>
            </div>
          )}

          <button
            onClick={salvar}
            disabled={status === "uploading" || status === "gerando"}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 14,
              border: "none",
              background:
                status === "uploading"
                  ? c.borda
                  : `linear-gradient(135deg, ${c.accent}, #0099FF)`,
              color: "#fff",
              fontWeight: 900,
              fontSize: "1rem",
              cursor: status === "uploading" ? "not-allowed" : "pointer",
              fontFamily: "'Nunito', sans-serif",
              transition: "all 0.2s",
            }}
          >
            {status === "uploading" ? "⏳ Enviando..." : "📤 Publicar Podcast"}
          </button>
        </div>

        {/* Lista de podcasts */}
        <div
          style={{
            background: c.card,
            borderRadius: 20,
            padding: "20px",
            border: `2px solid ${c.borda}`,
          }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              fontWeight: 800,
              color: c.textoSub,
              textTransform: "uppercase",
              letterSpacing: 1,
              margin: "0 0 14px",
            }}
          >
            📋 Podcasts publicados
          </p>
          {carregandoLista ? (
            <p
              style={{
                color: c.textoSub,
                fontSize: "0.85rem",
                textAlign: "center",
              }}
            >
              Carregando...
            </p>
          ) : podcasts.length === 0 ? (
            <p
              style={{
                color: c.textoSub,
                fontSize: "0.85rem",
                textAlign: "center",
              }}
            >
              Nenhum podcast publicado ainda.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {podcasts.map((p) => {
                const d = DISCIPLINAS.find((x) => x.id === p.disciplina);
                const b = BIMESTRES.find((x) => x.id === p.bimestre);
                const s = SERIES.find((x) => x.id === p.serie);
                return (
                  <div
                    key={p.id}
                    style={{
                      background: c.card2,
                      borderRadius: 14,
                      padding: "12px 14px",
                      border: `1.5px solid ${c.borda}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          color: c.accent,
                          textTransform: "uppercase",
                        }}
                      >
                        {d?.icone} {d?.label} · {s?.label} · {b?.label}
                      </span>
                      {p.gratuito && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 800,
                            color: "#00D4AA",
                            background: "#00D4AA15",
                            padding: "2px 8px",
                            borderRadius: 6,
                          }}
                        >
                          Gratuito
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: c.texto,
                        margin: "0 0 2px",
                      }}
                    >
                      {p.titulo}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: c.textoSub,
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {p.descricao}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700;800;900&display=swap');
      `}</style>
    </div>
  );
}
