import React, { useEffect, useRef } from 'react';

function Fireworks() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    const ctx = canvas.getContext('2d');
    const colors = ['#00D4AA','#FFD700','#00BB00','#FFEA00','#00FF88','#FFC300','#00E676','#FFB300'];
    const particles = [];
    function launch() {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 50; i++) {
        const angle = (Math.PI * 2 / 50) * i;
        const speed = 1.5 + Math.random() * 3;
        particles.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, alpha:1, color, size: 2+Math.random()*2.5 });
      }
    }
    launch();
    const timer = setInterval(launch, 700);
    let frame;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length-1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.alpha -= 0.016;
        if (p.alpha <= 0) { particles.splice(i,1); continue; }
        ctx.save(); ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill(); ctx.restore();
      }
      frame = requestAnimationFrame(animate);
    }
    animate();
    return () => { cancelAnimationFrame(frame); clearInterval(timer); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', borderRadius:'20px', pointerEvents:'none', zIndex:0 }} />;
}

export default function ModalPremiacao({ isOpen, fechar, premioTexto, premioImagemUrl, premioFreq, e }) {
  if (!isOpen) return null;
  const freq = premioFreq || "Semanal";
  const freqTexto = freq === "Semanal" ? "no fim de semana" : freq === "Quinzenal" ? "a cada 15 dias" : "no fim do mês";
  const msg = "Oi! Cumpri todas as missoes de hoje no EduPlay! Estou no caminho para conquistar: " + premioTexto + ". Se eu continuar assim, vou ganhar meu prêmio " + freqTexto + "! Me parabeniza? ";
  const link = "https://api.whatsapp.com/send?text=" + encodeURIComponent(msg);
  return (
    <div style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%", background:"rgba(0,0,0,0.88)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", boxSizing:"border-box" }}>
      <div style={{ position:"relative", background: e ? "#0F1F0F" : "#F0FFF4", width:"100%", maxWidth:"420px", borderRadius:"20px", border:"3px solid #FFD700", boxShadow:"0 0 40px #00D4AA55, 0 0 80px #FFD70022", overflow:"hidden", maxHeight:"92vh", overflowY:"auto" }}>
        <Fireworks />
        <div style={{ position:"relative", zIndex:2, padding:"24px 20px 20px" }}>
          <div style={{ fontSize:"2.5rem", marginBottom:"4px", textAlign:"center" }}>🎆</div>
          <h2 style={{ margin:"0 0 6px", background:"linear-gradient(135deg,#00D4AA,#FFD700)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontSize:"clamp(1.4rem,5vw,1.8rem)", fontWeight:900, letterSpacing:1, textAlign:"center" }}>
            Missões Concluídas!
          </h2>
          <p style={{ color: e ? "#A7F3A0" : "#166534", fontWeight:700, fontSize:"clamp(0.8rem,3vw,0.92rem)", marginBottom:"16px", textAlign:"center" }}>
            Continue assim e conquiste seu prêmio <strong style={{ color:"#FFD700" }}>{freqTexto}</strong>!
          </p>
          {premioImagemUrl && (
            <div style={{ marginBottom:"14px", borderRadius:"12px", overflow:"hidden", border:"3px solid #FFD70066", width:"100%" }}>
              <img
                src={premioImagemUrl}
                alt="Premio"
                style={{ width:"100%", maxHeight:"200px", objectFit:"cover", display:"block" }}
                onError={(e) => { e.target.style.display='none'; }}
              />
            </div>
          )}
          <div style={{ background:"linear-gradient(135deg,rgba(0,212,170,0.15),rgba(255,215,0,0.15))", padding:"14px 16px", borderRadius:"14px", marginBottom:"16px", border:"1.5px dashed #FFD70088", textAlign:"center" }}>
            <p style={{ margin:0, fontSize:"0.7rem", color:"#FFD700", textTransform:"uppercase", fontWeight:800, letterSpacing:2 }}>Seu Próximo Prêmio</p>
            <p style={{ margin:"6px 0 0", fontSize:"clamp(0.88rem,3.5vw,1rem)", color: e ? "#F8FAFC" : "#0F172A", fontWeight:800 }}>{premioTexto}</p>
            <p style={{ margin:"4px 0 0", fontSize:"clamp(0.7rem,2.5vw,0.78rem)", color: e ? "#A7F3A0" : "#166534", fontWeight:600 }}>
              Combinado para ser entregue {freqTexto}
            </p>
          </div>
          <a href={link} target="_blank" rel="noreferrer"
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", width:"100%", padding:"14px", background:"#25D366", color:"#FFF", textDecoration:"none", borderRadius:"14px", fontWeight:900, fontSize:"clamp(0.9rem,3.5vw,1rem)", marginBottom:"10px", boxShadow:"0 4px 12px #25D36644", boxSizing:"border-box" }}
          >
            Avisar o Responsável
          </a>
          <button onClick={fechar}
            style={{ width:"100%", padding:"10px", background:"transparent", color: e ? "#6EE7B7" : "#059669", border:"none", fontWeight:700, fontSize:"clamp(0.82rem,3vw,0.9rem)", cursor:"pointer", textDecoration:"underline" }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
