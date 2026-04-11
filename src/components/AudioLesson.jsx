import { useState, useEffect, useRef, useCallback } from "react";

export const roteiros = {
  "geografia_brasil-localizacao": {
    titulo: "O Brasil no Mapa-Múndi",
    duracao: "3 min",
    texto: `Bem-vindo ao Instituto do Saber! Hoje vamos descobrir onde fica o Brasil no mapa do mundo. O Brasil é o maior país da América do Sul e o quinto maior do mundo inteiro. Isso mesmo, somos enormes! Para você ter ideia, o Brasil é maior que todos os países da Europa juntos. Mas onde exatamente fica o Brasil? Olha o mapa: a América do Sul está no hemisfério ocidental, ou seja, do lado esquerdo do mapa. O Brasil ocupa quase metade desse continente. Uma curiosidade incrível: o Brasil faz fronteira com dez países! Os únicos países da América do Sul que não fazem fronteira com o Brasil são o Chile e o Equador. O Brasil também tem uma posição geográfica especial: o país é cortado pela Linha do Equador, lá no norte, e pelo Trópico de Capricórnio, no sul. Isso faz o Brasil ter um clima predominantemente tropical, com muito calor e chuvas. Outro detalhe importante: o Brasil é banhado pelo Oceano Atlântico em toda a sua costa leste. São mais de oito mil quilômetros de litoral. Impressionante, não é? E a capital do Brasil é Brasília, construída do zero em 1960, bem no centro do país. Antes disso, a capital era o Rio de Janeiro. Agora você já sabe onde fica o Brasil e por que ele é tão especial no mapa do mundo. Missão iniciada, Agente!`,
  },
  "geografia_regioes-brasil": {
    titulo: "As 5 Regiões do Brasil",
    duracao: "4 min",
    texto: `Olá, Agente! Hoje vamos explorar as cinco regiões do Brasil. Cada uma tem características únicas, é como se fossem cinco mundos diferentes dentro de um único país. A primeira região é o Norte. É a maior de todas, ocupando quase metade do território brasileiro. É lá que fica a maior floresta tropical do planeta: a Amazônia. O Norte tem o rio mais caudaloso do mundo, o Rio Amazonas, e uma biodiversidade incrível. A segunda região é o Nordeste. Conhecida pelo forró, pelas praias lindas e pelo clima seco no sertão. O Nordeste tem a maior costa litorânea do Brasil e foi uma das primeiras regiões habitadas pelos portugueses. A terceira região é o Centro-Oeste. É onde fica Brasília, nossa capital federal. Essa região é dominada pelo Cerrado, o segundo maior bioma brasileiro. A quarta região é o Sudeste. É a mais populosa e a mais rica economicamente. São Paulo, Rio de Janeiro, Minas Gerais e Espírito Santo ficam aqui. São Paulo é a maior cidade do Brasil e uma das maiores do mundo. Por último, o Sul. É a região mais fria do Brasil, com direito a neve no inverno! O Sul tem forte influência da imigração europeia: alemã, italiana e polonesa. Cinco regiões, cinco histórias, um Brasil. Missão desbloqueada, Agente!`,
  },
  "geografia_estados-capitais": {
    titulo: "Estados e Capitais do Brasil",
    duracao: "4 min",
    texto: `Agente, prepare seu mapa! Hoje vamos decifrar os 26 estados e o Distrito Federal do Brasil. Primeiro, o que é um estado? Estado é uma divisão do país, como se fosse um país menor dentro do Brasil. Cada estado tem seu próprio governador e suas leis específicas. E o Distrito Federal? É diferente dos estados. Nele fica Brasília, a capital do Brasil. No Norte temos sete estados: Amazonas com capital Manaus, Pará com capital Belém, Acre com capital Rio Branco, Rondônia com capital Porto Velho, Roraima com capital Boa Vista, Amapá com capital Macapá, e Tocantins com capital Palmas. No Nordeste são nove estados: Bahia com capital Salvador, Pernambuco com capital Recife, Ceará com capital Fortaleza, Maranhão com capital São Luís, Paraíba com capital João Pessoa, Rio Grande do Norte com capital Natal, Alagoas com capital Maceió, Sergipe com capital Aracaju, e Piauí com capital Teresina. No Centro-Oeste: Goiás com capital Goiânia, Mato Grosso com capital Cuiabá, Mato Grosso do Sul com capital Campo Grande, e o Distrito Federal com Brasília. No Sudeste: São Paulo, Rio de Janeiro, Minas Gerais com capital Belo Horizonte, e Espírito Santo com capital Vitória. No Sul: Paraná com capital Curitiba, Santa Catarina com capital Florianópolis, e Rio Grande do Sul com capital Porto Alegre. Vinte e seis estados mais o Distrito Federal. Missão cumprida, Agente!`,
  },
  "historia_pre-historia": {
    titulo: "A Pré-História",
    duracao: "3 min",
    texto: `Agente, prepare-se para uma viagem no tempo. Vamos descobrir como viviam os primeiros seres humanos. A Pré-História é o período que vai desde o surgimento dos primeiros humanos até a invenção da escrita, por volta de 3500 antes de Cristo. É um período enorme, durou milhões de anos! Os primeiros humanos eram chamados de nômades. Isso significa que eles não tinham um lugar fixo para morar. Andavam de um lugar para outro seguindo os animais que caçavam e procurando frutas e raízes para comer. Uma das maiores descobertas da Pré-História foi o domínio do fogo. Com o fogo, os humanos podiam se aquecer, cozinhar os alimentos, se proteger dos animais e iluminar as cavernas onde dormiam. Por falar em cavernas, os pré-históricos também eram artistas! Eles faziam pinturas nas paredes das cavernas mostrando animais e cenas do cotidiano. No Brasil, a Serra da Capivara, no Piauí, tem pinturas rupestres com mais de 25 mil anos! Com o tempo, os humanos aprenderam a cultivar plantas e criar animais. Isso mudou tudo! Eles pararam de ser nômades e começaram a se fixar em um lugar. Surgiram as primeiras aldeias e depois as primeiras cidades. Essa transição marcou o fim da Pré-História e o início da História. Missão registrada, Agente!`,
  },
  "historia_indigenas-brasil": {
    titulo: "Os Povos Originários do Brasil",
    duracao: "4 min",
    texto: `Agente, hoje vamos investigar uma das histórias mais importantes do Brasil: a dos povos que já estavam aqui muito antes dos portugueses chegarem. Os povos indígenas habitam o território brasileiro há mais de 12 mil anos. Isso mesmo, enquanto na Europa a Idade Média ainda estava acontecendo, aqui no Brasil existiam centenas de povos com línguas e culturas completamente diferentes entre si. Quando os portugueses chegaram em 1500, estima-se que havia entre 2 e 4 milhões de indígenas vivendo no Brasil. Cada povo tinha sua própria língua. Eram mais de 1200 línguas diferentes! Hoje ainda existem mais de 300 povos indígenas no Brasil, falando mais de 270 línguas. Os povos indígenas deixaram marcas profundas na cultura brasileira. Muitas palavras que usamos no dia a dia vêm das línguas indígenas, principalmente do tupi. Abacaxi, mandioca, pipoca, capivara, Curitiba, Paraná, Pernambuco, todas essas palavras têm origem indígena. A culinária brasileira também tem raízes indígenas: a tapioca, o beiju, a paçoca, o açaí, tudo vem dos povos originários. Infelizmente, com a chegada dos europeus, os povos indígenas sofreram muito. Hoje, eles lutam para preservar suas terras, suas línguas e suas culturas. Conhecer essa história é respeitar quem estava aqui primeiro. Missão investigada, Agente!`,
  },
  "historia_chegada-portugueses": {
    titulo: "A Chegada dos Portugueses",
    duracao: "3 min",
    texto: `Agente, é 22 de abril de 1500. Uma frota de 13 navios avista uma grande montanha verde no horizonte. É o Monte Pascoal, na Bahia. O Brasil acabou de ser encontrado pelos portugueses. Pedro Álvares Cabral era o comandante da frota. Ele estava a caminho das Índias, seguindo a rota do Oceano Atlântico. Mas ventos e correntes desviaram os navios para o oeste, e ali estava uma terra desconhecida para os europeus. Os portugueses chamaram primeiro de Ilha de Vera Cruz, depois de Terra de Santa Cruz. O nome Brasil só veio depois, por causa de uma árvore muito valiosa que existia em abundância: o pau-brasil. O pau-brasil era uma madeira avermelhada usada para fazer tinta vermelha na Europa. Era tão valiosa que os portugueses começaram a explorar intensamente a nova terra. A chegada dos portugueses mudou completamente a história do Brasil. Os indígenas que aqui viviam tiveram seu modo de vida transformado para sempre. Alguns povos resistiram, outros se aliaram aos portugueses, e muitos foram escravizados ou morreram de doenças trazidas pelos europeus. O Brasil que conhecemos hoje é resultado desse encontro entre povos indígenas, portugueses e africanos trazidos como escravos. Compreender 1500 é compreender o início de uma história que ainda está sendo escrita. Missão decodificada, Agente!`,
  },
};

const VELOCIDADES = [
  { label: "🐢 Devagar", value: 80 },
  { label: "▶ Normal", value: 50 },
  { label: "🐇 Rápido", value: 25 },
];

export default function AudioLesson({
  disciplinaId,
  moduloId,
  onFechar,
  tema,
  alternarTema,
}) {
  const chave = `${disciplinaId}_${moduloId}`;
  const roteiro = roteiros[chave];

  const [tocando, setTocando] = useState(false);
  const [comVoz, setComVoz] = useState(true);
  const [idx, setIdx] = useState(-1);
  const [velIdx, setVelIdx] = useState(1);
  const [concluido, setConcluido] = useState(false);

  const timerRef = useRef(null);
  const palavraRef = useRef(null);
  const speechRef = useRef(null);

  const palavras = roteiro?.texto.split(/\s+/) || [];
  const total = palavras.length;
  const progresso = idx >= 0 ? Math.round((idx / total) * 100) : 0;
  const vel = VELOCIDADES[velIdx].value;

  // Scroll automático para palavra atual
  useEffect(() => {
    if (palavraRef.current) {
      palavraRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [idx]);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const parar = useCallback(() => {
    clearInterval(timerRef.current);
    window.speechSynthesis?.cancel();
    setTocando(false);
  }, []);

  const iniciarDestaque = useCallback(
    (inicio = 0) => {
      clearInterval(timerRef.current);
      let i = inicio;
      setIdx(i);
      timerRef.current = setInterval(() => {
        i++;
        if (i >= total) {
          clearInterval(timerRef.current);
          setTocando(false);
          setIdx(-1);
          setConcluido(true);
        } else {
          setIdx(i);
        }
      }, vel * 10);
    },
    [total, vel],
  );

  const play = useCallback(() => {
    if (concluido) {
      setConcluido(false);
      setIdx(-1);
    }
    setTocando(true);

    if (comVoz && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(roteiro.texto);
      u.lang = "pt-BR";
      u.rate = velIdx === 0 ? 0.8 : velIdx === 2 ? 1.2 : 1;
      const vozes = window.speechSynthesis.getVoices();
      const voz = vozes.find((v) => v.lang?.startsWith("pt"));
      if (voz) u.voice = voz;
      u.onend = () => {
        setTocando(false);
        setIdx(-1);
        setConcluido(true);
      };
      speechRef.current = u;
      window.speechSynthesis.speak(u);
    }

    iniciarDestaque(idx >= 0 ? idx : 0);
  }, [comVoz, roteiro, velIdx, idx, iniciarDestaque, concluido]);

  const pausar = useCallback(() => {
    clearInterval(timerRef.current);
    window.speechSynthesis?.pause();
    setTocando(false);
  }, []);

  const retomar = useCallback(() => {
    setTocando(true);
    window.speechSynthesis?.resume();
    iniciarDestaque(idx);
  }, [idx, iniciarDestaque]);

  const reiniciar = useCallback(() => {
    parar();
    setIdx(-1);
    setConcluido(false);
    setTimeout(() => play(), 100);
  }, [parar, play]);

  const mudarVelocidade = (i) => {
    setVelIdx(i);
    if (tocando) {
      parar();
      setTimeout(() => play(), 100);
    }
  };

  if (!roteiro) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.97)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "#E8F4F8" }}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🎙️</div>
          <p>Podcast em produção...</p>
          <button
            onClick={onFechar}
            style={{
              marginTop: "16px",
              color: "#00D4AA",
              background: "none",
              border: "none",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  const bgColor = tema === "escuro" ? "#0F1923" : "#F5F9FF";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: bgColor,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: `1px solid ${tema === "escuro" ? "#2A3F52" : "#DDE8F0"}`,
          background: tema === "escuro" ? "#0D1820" : "#FFFFFF",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => {
            parar();
            onFechar();
          }}
          style={{
            width: "40px",
            height: "40px",
            background: "#FF6B6B22",
            border: "2px solid #FF6B6B44",
            borderRadius: "12px",
            color: "#FF6B6B",
            fontSize: "1.1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ✕
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.65rem",
              color: "#00D4AA",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            🎙️ Podcast do Instituto
          </div>
          <div
            style={{
              color: tema === "escuro" ? "#E8F4F8" : "#1A2B3C",
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {roteiro.titulo}
          </div>
        </div>

        {/* Toggle voz */}
        <button
          onClick={() => {
            parar();
            setComVoz((v) => !v);
          }}
          style={{
            padding: "6px 12px",
            background: comVoz ? "#00D4AA22" : "#2A3F52",
            border: `2px solid ${comVoz ? "#00D4AA" : "#3A5262"}`,
            borderRadius: "20px",
            color: comVoz ? "#00D4AA" : "#8BAFC0",
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {comVoz ? "🔊 Com voz" : "🔇 Sem voz"}
        </button>

        <button
          onClick={alternarTema}
          style={{
            width: "40px",
            height: "40px",
            background: "#2A3F52",
            border: "2px solid #3A5262",
            borderRadius: "12px",
            fontSize: "1.1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {tema === "escuro" ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Barra progresso */}
      <div
        style={{
          height: "4px",
          background: tema === "escuro" ? "#1A2B3C" : "#E0EEF5",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progresso}%`,
            background: "linear-gradient(90deg, #00D4AA, #0099FF)",
            transition: "width 0.2s",
          }}
        />
      </div>

      {/* Texto com destaque */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "clamp(16px, 3vw, 32px)",
          maxWidth: "720px",
          margin: "0 auto",
          width: "100%",
          background: tema === "escuro" ? "#0F1923" : "#F5F9FF",
        }}
      >
        <div
          style={{
            lineHeight: "clamp(1.9, 3.5vw, 2.4)",
            fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)",
            textAlign: "justify",
          }}
        >
          {palavras.map((palavra, i) => (
            <span
              key={i}
              ref={i === idx ? palavraRef : null}
              style={{
                color:
                  i === idx
                    ? tema === "escuro"
                      ? "#FFFFFF"
                      : "#1A2B3C"
                    : i < idx
                      ? tema === "escuro"
                        ? "#A8C5C3"
                        : "#5A8F8C"
                      : tema === "escuro"
                        ? "#4A6A7A"
                        : "#A0B8C8",
                background: i === idx ? "#00D4AA33" : "transparent",
                borderRadius: "4px",
                padding: i === idx ? "2px 5px" : "2px 0",
                fontWeight: i === idx ? 800 : 400,
                fontSize:
                  i === idx ? "clamp(1.1rem, 2.7vw, 1.3rem)" : "inherit",
                transition: "all 0.1s",
                display: "inline",
              }}
            >
              {palavra}{" "}
            </span>
          ))}
        </div>

        {concluido && (
          <div
            style={{
              textAlign: "center",
              marginTop: "28px",
              padding: "clamp(16px, 3vw, 24px)",
              background: "#00D4AA18",
              borderRadius: "16px",
              border: "2px solid #00D4AA44",
            }}
          >
            <div
              style={{
                fontSize: "clamp(2rem, 6vw, 3rem)",
                marginBottom: "8px",
              }}
            >
              🎉
            </div>
            <div
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                color: "#00D4AA",
                marginBottom: "4px",
              }}
            >
              Podcast concluído!
            </div>
            <div
              style={{
                fontSize: "clamp(0.8rem, 1.8vw, 0.9rem)",
                color: "#8BAFC0",
              }}
            >
              Agora complete as atividades da missão
            </div>
          </div>
        )}
      </div>

      {/* Controles */}
      <div
        style={{
          padding: "clamp(12px, 2.5vw, 20px)",
          background: tema === "escuro" ? "#0D1820" : "#FFFFFF",
          borderTop: `1px solid ${tema === "escuro" ? "#2A3F52" : "#DDE8F0"}`,
          flexShrink: 0,
        }}
      >
        {/* Velocidade */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(6px, 1.5vw, 10px)",
            marginBottom: "14px",
          }}
        >
          {VELOCIDADES.map((v, i) => (
            <button
              key={i}
              onClick={() => mudarVelocidade(i)}
              style={{
                padding: "clamp(5px, 1vw, 8px) clamp(10px, 2vw, 16px)",
                borderRadius: "20px",
                background: velIdx === i ? "#00D4AA22" : "transparent",
                border: `2px solid ${velIdx === i ? "#00D4AA" : "#2A3F52"}`,
                color:
                  velIdx === i
                    ? "#00D4AA"
                    : tema === "escuro"
                      ? "#8BAFC0"
                      : "#5A7A8A",
                fontSize: "clamp(0.72rem, 1.5vw, 0.82rem)",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Play / Pause / Stop / Reiniciar */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(10px, 2.5vw, 20px)",
            alignItems: "center",
          }}
        >
          <button
            onClick={reiniciar}
            title="Reiniciar"
            style={{
              width: "clamp(42px, 8vw, 52px)",
              height: "clamp(42px, 8vw, 52px)",
              background: "#2A3F52",
              border: "2px solid #3A5262",
              borderRadius: "50%",
              color: "#8BAFC0",
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            🔄
          </button>

          <button
            onClick={tocando ? pausar : idx >= 0 ? retomar : play}
            style={{
              width: "clamp(62px, 12vw, 78px)",
              height: "clamp(62px, 12vw, 78px)",
              background: "linear-gradient(135deg, #00D4AA, #0099FF)",
              border: "none",
              borderRadius: "50%",
              color: "#FFF",
              fontSize: "clamp(1.4rem, 4vw, 1.9rem)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(0,212,170,0.4)",
            }}
          >
            {tocando ? "⏸" : "▶"}
          </button>

          <button
            onClick={parar}
            title="Parar"
            style={{
              width: "clamp(42px, 8vw, 52px)",
              height: "clamp(42px, 8vw, 52px)",
              background: "#FF6B6B22",
              border: "2px solid #FF6B6B44",
              borderRadius: "50%",
              color: "#FF6B6B",
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ⏹
          </button>
        </div>

        <p
          style={{
            textAlign: "center",
            color: tema === "escuro" ? "#4A6A7A" : "#7A9BB0",
            fontSize: "clamp(0.68rem, 1.4vw, 0.76rem)",
            marginTop: "10px",
          }}
        >
          {comVoz ? "🔊 Narração ativa · " : "🔇 Só destaque · "}
          {progresso}% lido
        </p>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700&display=swap');`}</style>
    </div>
  );
}
