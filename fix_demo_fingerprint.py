content = open('src/pages/DemoPage.jsx', 'r', encoding='utf-8').read()

# Adiciona função de fingerprint após os imports
antigo = '// ── Constantes ──'

novo = '''// ── Fingerprint de device ──
async function gerarFingerprint() {
  const nav = window.navigator;
  const screen = window.screen;
  const dados = [
    nav.userAgent,
    nav.language,
    nav.hardwareConcurrency,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    nav.platform || '',
  ].join('|');
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(dados));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Constantes ──'''

content = content.replace(antigo, novo)

# Substitui a verificação de demo para incluir fingerprint
antigo2 = '''    const verificar = async () => {
      try {
        const cred = await signInAnonymously(auth);
        const uidAnon = cred.user.uid;
        setUid(uidAnon);
        const ref = doc(db, "demos", uidAnon);
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().usada === true) {
          const dados = snap.data();
          setDemoInfo({
            disciplina: dados.disciplina || "",
            assunto: dados.assunto || "",
          });
          setEtapa("limite");
        } else {
          setEtapa("escolha");
        }
      } catch (err) {
        console.error("Erro ao verificar demo:", err);
        setEtapa("escolha"); // fallback: deixa tentar
      }
    };'''

novo2 = '''    const verificar = async () => {
      try {
        const cred = await signInAnonymously(auth);
        const uidAnon = cred.user.uid;
        setUid(uidAnon);

        // Verifica por uid anônimo
        const ref = doc(db, "demos", uidAnon);
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().usada === true) {
          const dados = snap.data();
          setDemoInfo({
            disciplina: dados.disciplina || "",
            assunto: dados.assunto || "",
          });
          setEtapa("limite");
          return;
        }

        // Verifica por fingerprint de device
        const fp = await gerarFingerprint();
        const fpRef = doc(db, "demos_fp", fp);
        const fpSnap = await getDoc(fpRef);
        if (fpSnap.exists() && fpSnap.data().usada === true) {
          const dados = fpSnap.data();
          setDemoInfo({
            disciplina: dados.disciplina || "",
            assunto: dados.assunto || "",
          });
          setEtapa("limite");
          return;
        }

        // Salva fingerprint para uso posterior
        sessionStorage.setItem("demo_fp", fp);
        setEtapa("escolha");
      } catch (err) {
        console.error("Erro ao verificar demo:", err);
        setEtapa("escolha");
      }
    };'''

if antigo2 in content:
    content = content.replace(antigo2, novo2)
    print("verificar OK")
else:
    print("VERIFICAR NAO ENCONTRADO")

# Salva fingerprint no Firestore quando a demo for usada
antigo3 = '''      setDemoInfo({
        disciplina: disc.label,
        assunto: missaoGerada.titulo || disc.label,
      });
      setMissao(missaoGerada);
      setEtapa("missao");'''

novo3 = '''      setDemoInfo({
        disciplina: disc.label,
        assunto: missaoGerada.titulo || disc.label,
      });

      // Salva fingerprint no Firestore para bloquear reuso
      try {
        const fp = sessionStorage.getItem("demo_fp");
        if (fp) {
          const { setDoc, doc: fsDoc } = await import("firebase/firestore");
          const { db: fsDb } = await import("./firebase" );
          await setDoc(fsDoc(fsDb, "demos_fp", fp), {
            usada: true,
            disciplina: disc.label,
            assunto: missaoGerada.titulo || disc.label,
            criadoEm: new Date().toISOString(),
          });
        }
      } catch (fpErr) {
        console.warn("Fingerprint save error:", fpErr);
      }

      setMissao(missaoGerada);
      setEtapa("missao");'''

if antigo3 in content:
    content = content.replace(antigo3, novo3)
    print("handleGerar OK")
else:
    print("HANDLEGAR NAO ENCONTRADO")

open('src/pages/DemoPage.jsx', 'w', encoding='utf-8').write(content)
print("DONE")