const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const serviceAccount = require("../serviceAccountKey.json");

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

async function main() {
  const snap = await db.collection("criancas").get();
  console.log("Total de criancas encontradas: " + snap.size);

  let jaTinham = 0;
  let atualizadas = 0;
  let semParentId = 0;

  const agora = Timestamp.now();
  const expiraEm = Timestamp.fromMillis(agora.toMillis() + 180 * 24 * 60 * 60 * 1000);

  const batchSize = 400;
  let batch = db.batch();
  let opsNoBatch = 0;

  for (const doc of snap.docs) {
    const dados = doc.data();

    if (dados.acessoLiberado && dados.acessoLiberado.expiraEm) {
      jaTinham++;
      continue;
    }

    if (!dados.parentId) {
      console.warn("AVISO: crianca " + doc.id + " nao tem parentId, pulando.");
      semParentId++;
      continue;
    }

    batch.update(doc.ref, {
      acessoLiberado: {
        liberadoPor: dados.parentId,
        liberadoEm: agora,
        expiraEm: expiraEm,
      },
    });
    opsNoBatch++;
    atualizadas++;

    if (opsNoBatch >= batchSize) {
      await batch.commit();
      batch = db.batch();
      opsNoBatch = 0;
    }
  }

  if (opsNoBatch > 0) {
    await batch.commit();
  }

  console.log("--- Resumo da migracao ---");
  console.log("Ja tinham liberacao: " + jaTinham);
  console.log("Atualizadas agora:   " + atualizadas);
  console.log("Sem parentId (puladas): " + semParentId);
  console.log("Concluido.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("ERRO na migracao:", err);
    process.exit(1);
  });