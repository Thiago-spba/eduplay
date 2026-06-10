const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ credential: cert(require('./serviceAccountKey.json')) });
const db = getFirestore();

async function limpar() {
  const criancaId = 'e6cses';
  let total = 0;

  for (const col of ['missoes', 'quizSessions']) {
    for (const campo of ['criancaId', 'codigoAcesso']) {
      const snap = await db.collection(col).where(campo, '==', criancaId).get();
      for (const d of snap.docs) { await d.ref.delete(); total++; console.log('Deletado:', col, d.id); }
    }
  }

  await db.collection('progresso').doc(criancaId).delete();
  console.log('Progresso zerado!');
  console.log('Total deletado:', total, 'documentos');
  process.exit(0);
}

limpar().catch(err => { console.error(err); process.exit(1); });
