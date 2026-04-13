// ═══════════════════════════════════════════════════════════════════
// RamoAnimado.jsx — EduPlay · Planta + Logo + Estrela Orbitando
// Mobile First · CSS 3D puro · Zero dependências
// ═══════════════════════════════════════════════════════════════════

export default function RamoAnimado() {
  const rastro = Array.from({ length: 10 });

  return (
    <div className="cena-container">
      {/* Container 3D Principal */}
      <div className="ambiente-3d">
        {/* Planta + Vaso */}
        <div className="planta-estatica">
          <svg
            width="240"
            height="320"
            viewBox="0 0 240 320"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="vasoBrilho" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#E28765" />
                <stop offset="50%" stopColor="#A85732" />
                <stop offset="100%" stopColor="#5C2C16" />
              </radialGradient>
              <linearGradient id="vasoBorda" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F4A27A" />
                <stop offset="100%" stopColor="#8A4222" />
              </linearGradient>
              <linearGradient id="folhaLuz" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#81C784" />
                <stop offset="100%" stopColor="#2E7D32" />
              </linearGradient>
              <linearGradient
                id="folhaSombra"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#4CAF50" />
                <stop offset="100%" stopColor="#1B5E20" />
              </linearGradient>
              <linearGradient id="caule" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#795548" />
                <stop offset="50%" stopColor="#3E2723" />
                <stop offset="100%" stopColor="#2D1C15" />
              </linearGradient>
            </defs>

            {/* Sombra chão */}
            <ellipse
              cx="120"
              cy="310"
              rx="45"
              ry="8"
              fill="#000"
              opacity="0.12"
            />

            {/* VASO */}
            <g transform="translate(0, 20)">
              <path
                d="M 85 280 Q 75 220 120 220 Q 165 220 155 280 Q 145 300 120 300 Q 95 300 85 280 Z"
                fill="url(#vasoBrilho)"
              />
              <ellipse cx="120" cy="220" rx="40" ry="7" fill="#3E2723" />
              <ellipse
                cx="120"
                cy="220"
                rx="45"
                ry="12"
                fill="url(#vasoBorda)"
                stroke="#5C2C16"
                strokeWidth="1.5"
              />
              {/* Brilho lateral vaso */}
              <path
                d="M 92 235 Q 88 260 90 285"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </g>

            {/* PLANTA */}
            <g transform="translate(120, 240)">
              <path
                d="M 0 0 Q -5 -60 0 -150"
                stroke="url(#caule)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
              <g transform="translate(0, -30)">
                <path
                  d="M 0 0 Q -30 -10 -70 -20 C -60 -40 -30 -20 0 0"
                  fill="url(#folhaSombra)"
                />
                <path
                  d="M 0 0 Q 30 -10 70 -20 C 60 -40 30 -20 0 0"
                  fill="url(#folhaSombra)"
                />
              </g>
              <g transform="translate(-2, -60)">
                <path
                  d="M 0 0 Q -25 -20 -55 -30 C -45 -50 -15 -30 0 0"
                  fill="url(#folhaLuz)"
                />
                <path
                  d="M 0 0 Q 25 -20 55 -30 C 45 -50 15 -30 0 0"
                  fill="url(#folhaLuz)"
                />
              </g>
              <g transform="translate(2, -95)">
                <path
                  d="M 0 0 Q -20 -20 -40 -35 C -30 -50 -10 -30 0 0"
                  fill="url(#folhaSombra)"
                />
                <path
                  d="M 0 0 Q 20 -20 40 -35 C 30 -50 10 -30 0 0"
                  fill="url(#folhaSombra)"
                />
              </g>
              <g transform="translate(0, -130)">
                <path
                  d="M 0 0 Q -10 -20 -20 -40 C -10 -50 0 -30 0 0"
                  fill="url(#folhaLuz)"
                />
                <path
                  d="M 0 0 Q 10 -20 20 -40 C 10 -50 0 -30 0 0"
                  fill="url(#folhaLuz)"
                />
                <path d="M 0 0 C -5 -25 5 -25 0 -45" fill="url(#folhaLuz)" />
              </g>
            </g>
          </svg>
        </div>

        {/* Estrela Orbitando */}
        <div className="magia-elevador">
          <div className="magia-orbita">
            {/* Estrela de 5 pontas */}
            <div className="estrela-nucleo">
              <svg width="22" height="22" viewBox="0 0 22 22">
                <polygon
                  points="11,1 13.9,7.6 21,8.5 15.8,13.5 17.2,21 11,17.3 4.8,21 6.2,13.5 1,8.5 8.1,7.6"
                  fill="white"
                  style={{
                    filter:
                      "drop-shadow(0 0 6px #00C896) drop-shadow(0 0 12px #3B82F6)",
                  }}
                />
              </svg>
            </div>
            {/* Rastro */}
            {rastro.map((_, i) => (
              <div
                key={i}
                className={`estrela-rastro ${i % 2 === 0 ? "rastro-verde" : "rastro-azul"}`}
                style={{
                  animationDelay: `-${i * 0.1}s`,
                  width: `${7 - i * 0.5}px`,
                  height: `${7 - i * 0.5}px`,
                  opacity: 1 - i * 0.09,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Logo + Nome + Frase */}
      <div className="titulo-container">
        {/* Logo original PNG */}
        <div className="logo-icone">
          <img
            src="/icons/icon-192.png"
            alt="EduPlay logo"
            width={80}
            height={80}
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Nome */}
        <h1 className="logo-texto">
          {["E", "d", "u", "P", "l", "a", "y"].map((letra, i) => (
            <span
              key={i}
              className={`letra ${i % 2 === 0 ? "esq" : "dir"}`}
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              {letra}
            </span>
          ))}
        </h1>

        <p className="frase-impacto">
          Semeando o conhecimento, cultivando o futuro.
        </p>
      </div>

      <style>{`
        .cena-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: radial-gradient(circle at 50% 40%, #F0FFF8 0%, #E2EEF5 60%, #D4E5E4 100%);
          overflow: hidden;
          font-family: 'Nunito', sans-serif;
          padding: 24px;
        }
        .ambiente-3d {
          position: relative;
          width: 240px;
          height: 320px;
          perspective: 800px;
          transform-style: preserve-3d;
        }
        .planta-estatica {
          position: absolute;
          width: 100%;
          height: 100%;
          transform: translateZ(0px);
          filter: drop-shadow(0 15px 25px rgba(0,0,0,0.12));
          animation: plantaFlutuar 4s ease-in-out infinite;
        }
        .magia-elevador {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          transform-style: preserve-3d;
          animation: subirDescer 6s ease-in-out infinite;
        }
        .magia-orbita {
          position: absolute;
          top: 50%; left: 50%;
          transform-style: preserve-3d;
          animation: girar 3s linear infinite;
        }
        .estrela-nucleo {
          position: absolute;
          margin-top: -11px;
          margin-left: -11px;
          animation: pulsaEstrela 1.5s ease-in-out infinite alternate;
          filter: drop-shadow(0 0 8px #00C896) drop-shadow(0 0 16px #3B82F6);
        }
        .estrela-rastro {
          position: absolute;
          border-radius: 50%;
          margin-top: -4px;
          margin-left: -4px;
          background: #FFFFFF;
          animation: girarRastro 3s linear infinite;
        }
        .rastro-verde { box-shadow: 0 0 8px 3px #00C896; }
        .rastro-azul  { box-shadow: 0 0 8px 3px #3B82F6; }

        .titulo-container {
          text-align: center;
          margin-top: 28px;
          z-index: 10;
        }
        .logo-icone {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
          animation: fadeSobe 0.8s ease-out 0.3s both;
        }
        .logo-texto {
          font-size: clamp(2.8rem, 8vw, 4.5rem);
          font-weight: 900;
          margin: 0 0 6px;
          display: flex;
          justify-content: center;
          overflow: hidden;
          padding: 4px 10px;
          letter-spacing: -1px;
        }
        .letra {
          display: inline-block;
          opacity: 0;
          color: #00C896;
          animation-duration: 0.8s;
          animation-fill-mode: forwards;
          animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .esq { animation-name: deslizarEsq; }
        .dir { animation-name: deslizarDir; }

        .frase-impacto {
          margin-top: 4px;
          font-size: clamp(0.85rem, 3vw, 1rem);
          color: #475569;
          font-weight: 600;
          opacity: 0;
          animation: fadeSobe 1s ease-out 1.2s forwards;
        }

        @keyframes plantaFlutuar {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes pulsaEstrela {
          0%   { transform: scale(0.85) rotate(0deg); }
          100% { transform: scale(1.2) rotate(15deg); }
        }
        @keyframes subirDescer {
          0%   { transform: translateY(120px); }
          50%  { transform: translateY(-120px); }
          100% { transform: translateY(120px); }
        }
        @keyframes girar {
          0%   { transform: rotateY(0deg) translateZ(100px); }
          100% { transform: rotateY(360deg) translateZ(100px); }
        }
        @keyframes girarRastro {
          0%   { transform: rotateY(0deg) translateZ(100px); }
          100% { transform: rotateY(360deg) translateZ(100px); }
        }
        @keyframes deslizarEsq {
          0%   { transform: translateX(-80px) translateY(10px); opacity: 0; }
          100% { transform: translateX(0) translateY(0); opacity: 1; }
        }
        @keyframes deslizarDir {
          0%   { transform: translateX(80px) translateY(-10px); opacity: 0; }
          100% { transform: translateX(0) translateY(0); opacity: 1; }
        }
        @keyframes fadeSobe {
          0%   { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
