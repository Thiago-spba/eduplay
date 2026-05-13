const fs = require("fs");
let f = fs.readFileSync("src/pages/DemoPage.jsx", "utf8");

const novaWA = `  const compartilharWhatsApp = () => {
    const demo = getDemoAnterior();
    const link = "https://eduplay.olloapp.com.br";
    const msg = encodeURIComponent(
      "\uD83C\uDF31 *EduPlay \u2014 Instituto do Saber*\n\n" +
      "Oi! Tenho algo especial para te mostrar. \uD83D\uDC40\n\n" +
      "Hoje joguei uma miss\u00e3o de *" + (demo.disciplina || "Hist\u00f3ria") + "* no EduPlay " +
      "e aprendi sobre *" + (demo.assunto || "conte\u00fado incr\u00edvel") + "* sem perceber que estava estudando! \uD83E\uDD2F\n\n" +
      "\uD83D\uDCA1 O app usa IA para criar miss\u00f5es personalizadas do curr\u00edculo escolar.\n\n" +
      "Posso continuar? \uD83D\uDE4F\n" +
      "\uD83D\uDD17 " + link + "\n\n" +
      "_5 dias gr\u00e1tis \u00b7 Sem cart\u00e3o \u00b7 Cancele quando quiser_"
    );
    window.open(\`https://wa.me/?text=\${msg}\`, "_blank");
  };`;

const novaOutro = `  const compartilharOutro = (rede) => {
    const demo = getDemoAnterior();
    const link = "https://eduplay.olloapp.com.br";
    const texto =
      "\uD83C\uDF31 EduPlay \u2014 Instituto do Saber\n\n" +
      "Oi! Hoje joguei uma miss\u00e3o de " + (demo.disciplina || "Hist\u00f3ria") + " no EduPlay " +
      "e aprendi sobre " + (demo.assunto || "conte\u00fado incr\u00edvel") + " sem perceber que estava estudando! \uD83E\uDD2F\n\n" +
      "O app usa IA para criar miss\u00f5es personalizadas do curr\u00edculo escolar.\n\n" +
      "Posso continuar? \uD83D\uDE4F\n" +
      link + "\n\n" +
      "5 dias gr\u00e1tis \u00b7 Sem cart\u00e3o \u00b7 Cancele quando quiser";
    if (rede === "copiar") {
      navigator.clipboard.writeText(texto);
      alert("Mensagem copiada! Cole onde quiser.");
    }
  };`;

f = f.replace(/  const compartilharWhatsApp[\s\S]*?window\.open[\s\S]*?\};\n/, novaWA + "\n");
f = f.replace(/  const compartilharOutro[\s\S]*?alert[\s\S]*?\};\n  \};\n/, novaOutro + "\n");

fs.writeFileSync("src/pages/DemoPage.jsx", f);
console.log("OK");
