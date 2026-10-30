// Testes das regras do Firestore (missões: feita, feitaEm, etapasFeitas, notasEtapas).
// Rodar (precisa de Java): npm run test:rules
// Usa o projeto "demo-eduplay": nada aqui toca o Firebase real.
import { readFileSync } from "node:fs";
import { test, before, after, beforeEach } from "node:test";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";

let env;
const MISSAO = (codigo) => `missoes/${codigo}/geradas/m1`;
const ETAPAS_OK = { leitura: true, quiz: true, forca: false };
const NOTAS_OK = { quiz: { a: 2, t: 3 } };

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-eduplay",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});
after(async () => env?.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const futuro = Timestamp.fromMillis(Date.now() + 7 * 864e5);
    const passado = Timestamp.fromMillis(Date.now() - 864e5);
    // ONZE: acesso liberado pelo responsável (aparelho da criança, login anônimo)
    await setDoc(doc(db, "criancas/ONZE"), { parentId: "pai1", acessoLiberado: { liberadoPor: "pai1", expiraEm: futuro } });
    // VENCIDO: liberação expirada
    await setDoc(doc(db, "criancas/VENCIDO"), { parentId: "pai2", acessoLiberado: { liberadoPor: "pai2", expiraEm: passado } });
    // SEMLIB: responsável não liberou acesso para nenhum aparelho
    await setDoc(doc(db, "criancas/SEMLIB"), { parentId: "pai3" });
    for (const c of ["ONZE", "VENCIDO", "SEMLIB"]) {
      await setDoc(doc(db, MISSAO(c)), { titulo: "Perímetro e área", disciplina: "matematica", feita: false });
    }
  });
});

const crianca = () => env.authenticatedContext("crianca-anonima").firestore();
const pai = () => env.authenticatedContext("pai1").firestore();
const estranho = () => env.authenticatedContext("outra-familia").firestore();
const anonimo = () => env.unauthenticatedContext().firestore();

// ── Pode ──
test("criança com acesso ativo atualiza feita e feitaEm", async () => {
  await assertSucceeds(updateDoc(doc(crianca(), MISSAO("ONZE")), { feita: true, feitaEm: serverTimestamp() }));
});
test("criança com acesso ativo atualiza etapasFeitas e notasEtapas", async () => {
  await assertSucceeds(updateDoc(doc(crianca(), MISSAO("ONZE")), { etapasFeitas: ETAPAS_OK, notasEtapas: NOTAS_OK }));
});
test("zerar Quiz e 3ª etapa (notasEtapas vazio) é permitido", async () => {
  await assertSucceeds(updateDoc(doc(crianca(), MISSAO("ONZE")), { etapasFeitas: { leitura: true, quiz: false, forca: false }, notasEtapas: {} }));
});
test("responsável dono também atualiza etapasFeitas", async () => {
  await assertSucceeds(updateDoc(doc(pai(), MISSAO("ONZE")), { etapasFeitas: ETAPAS_OK, notasEtapas: { quiz: { a: 3, t: 3 }, forca: { a: 1, t: 1 } } }));
});
test("criança com acesso ativo lê a missão", async () => {
  await assertSucceeds(getDoc(doc(crianca(), MISSAO("ONZE"))));
});

// ── Não pode: outros campos ──
test("não atualiza titulo", async () => {
  await assertFails(updateDoc(doc(crianca(), MISSAO("ONZE")), { titulo: "outro" }));
});
test("não atualiza disciplina", async () => {
  await assertFails(updateDoc(doc(crianca(), MISSAO("ONZE")), { disciplina: "historia" }));
});
test("não mistura campo permitido com titulo", async () => {
  await assertFails(updateDoc(doc(crianca(), MISSAO("ONZE")), { etapasFeitas: ETAPAS_OK, titulo: "outro" }));
});

// ── Não pode: etapasFeitas inválido ──
test("etapasFeitas com chave extra", async () => {
  await assertFails(updateDoc(doc(crianca(), MISSAO("ONZE")), { etapasFeitas: { ...ETAPAS_OK, explique: true } }));
});
test("etapasFeitas com valor não booleano", async () => {
  await assertFails(updateDoc(doc(crianca(), MISSAO("ONZE")), { etapasFeitas: { leitura: true, quiz: "sim", forca: false } }));
  await assertFails(updateDoc(doc(crianca(), MISSAO("ONZE")), { etapasFeitas: { leitura: 1, quiz: false, forca: false } }));
});
test("etapasFeitas faltando chave", async () => {
  await assertFails(updateDoc(doc(crianca(), MISSAO("ONZE")), { etapasFeitas: { leitura: true, quiz: true } }));
});
test("etapasFeitas que não é map", async () => {
  await assertFails(updateDoc(doc(crianca(), MISSAO("ONZE")), { etapasFeitas: true }));
});

// ── Não pode: notasEtapas inválido ──
test("notasEtapas com chave extra, acerto maior que total ou número quebrado", async () => {
  const ref = doc(crianca(), MISSAO("ONZE"));
  await assertFails(updateDoc(ref, { notasEtapas: { quiz: { a: 2, t: 3 }, bonus: { a: 1, t: 1 } } }));
  await assertFails(updateDoc(ref, { notasEtapas: { quiz: { a: 5, t: 3 } } }));
  await assertFails(updateDoc(ref, { notasEtapas: { quiz: { a: 1.5, t: 3 } } }));
  await assertFails(updateDoc(ref, { notasEtapas: { quiz: { a: 1, t: 3, xp: 99 } } }));
  await assertFails(updateDoc(ref, { notasEtapas: { forca: { a: 0, t: 0 } } }));
});

// ── tentativas ──
test("criança salva tentativas válidas", async () => {
  await assertSucceeds(updateDoc(doc(crianca(), MISSAO("ONZE")), { etapasFeitas: ETAPAS_OK, notasEtapas: {}, tentativas: { n: 1, primeira: 38, reserva: true } }));
  await assertSucceeds(updateDoc(doc(crianca(), MISSAO("ONZE")), { tentativas: { n: 0, primeira: -1, reserva: false } }));
});
test("tentativas inválidas são bloqueadas", async () => {
  const ref = doc(crianca(), MISSAO("ONZE"));
  await assertFails(updateDoc(ref, { tentativas: { n: 1, primeira: 38 } }));
  await assertFails(updateDoc(ref, { tentativas: { n: 1, primeira: 38, reserva: true, xp: 5 } }));
  await assertFails(updateDoc(ref, { tentativas: { n: -1, primeira: 38, reserva: true } }));
  await assertFails(updateDoc(ref, { tentativas: { n: 51, primeira: 38, reserva: true } }));
  await assertFails(updateDoc(ref, { tentativas: { n: 1, primeira: 101, reserva: true } }));
  await assertFails(updateDoc(ref, { tentativas: { n: 1.5, primeira: 38, reserva: "sim" } }));
});

// ── Quem não tem acesso continua bloqueado ──
// Obs.: com liberação ATIVA, acessoAtivoParaCrianca aceita qualquer login que saiba o código
// (é assim que o aparelho da criança entra, com login anônimo). Isso já era assim antes.
test("outra família, sem liberação ativa, não lê nem escreve", async () => {
  await assertFails(getDoc(doc(estranho(), MISSAO("SEMLIB"))));
  await assertFails(updateDoc(doc(estranho(), MISSAO("SEMLIB")), { feita: true }));
  await assertFails(updateDoc(doc(estranho(), MISSAO("SEMLIB")), { etapasFeitas: ETAPAS_OK }));
});
test("sem login não lê nem escreve", async () => {
  await assertFails(getDoc(doc(anonimo(), MISSAO("ONZE"))));
  await assertFails(updateDoc(doc(anonimo(), MISSAO("ONZE")), { etapasFeitas: ETAPAS_OK }));
});
test("liberação vencida não lê nem escreve", async () => {
  await assertFails(getDoc(doc(crianca(), MISSAO("VENCIDO"))));
  await assertFails(updateDoc(doc(crianca(), MISSAO("VENCIDO")), { etapasFeitas: ETAPAS_OK }));
});
