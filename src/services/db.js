// ═══════════════════════════════════════════════════════════
// EduPlay — Camada de dados Firestore
// Fonte única de verdade para todo o app
// ═══════════════════════════════════════════════════════════
import {
  doc, collection,
  getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, increment,
} from "firebase/firestore";
import { db } from "./firebase";

// ─────────────────────────────────────────────────────────────
// RESPONSÁVEL
// ─────────────────────────────────────────────────────────────

/** Busca dados do responsável */
export async function getResponsavel(uid) {
  const snap = await getDoc(doc(db, "responsaveis", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Cria ou atualiza dados do responsável */
export async function salvarResponsavel(uid, dados) {
  await setDoc(doc(db, "responsaveis", uid), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  }, { merge: true });
}

// ─────────────────────────────────────────────────────────────
// CRIANÇA
// ─────────────────────────────────────────────────────────────

/** Busca criança pelo código de acesso */
export async function getCrianca(codigoAcesso) {
  const snap = await getDoc(doc(db, "criancas", codigoAcesso));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Busca criança pelo uid do pai */
export async function getCriancaPorPai(uidPai) {
  const q = query(
    collection(db, "criancas"),
    where("parentId", "==", uidPai)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

/** Cria perfil da criança */
export async function criarCrianca(codigoAcesso, dados) {
  await setDoc(doc(db, "criancas", codigoAcesso), {
    ...dados,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
}

/** Atualiza dados da criança */
export async function atualizarCrianca(codigoAcesso, dados) {
  await updateDoc(doc(db, "criancas", codigoAcesso), {
    ...dados,
    atualizadoEm: serverTimestamp(),
  });
}

// ─────────────────────────────────────────────────────────────
// PROGRESSO DA CRIANÇA
// ─────────────────────────────────────────────────────────────

const PROGRESSO_INICIAL = {
  diasAtivos: [],
  diasSeguidos: 0,
  missoesFeitas: 0,
  missoesCompletas: [],
  badges: [],
  ultimoAcesso: null,
};

/** Busca progresso da criança */
export async function getProgresso(codigoAcesso) {
  const snap = await getDoc(doc(db, "progresso", codigoAcesso));
  return snap.exists()
    ? { ...PROGRESSO_INICIAL, ...snap.data() }
    : { ...PROGRESSO_INICIAL };
}

/** Registra acesso diário e atualiza sequência */
export async function registrarAcessoDiario(codigoAcesso) {
  const hoje = new Date().toISOString().slice(0, 10);
  const prog = await getProgresso(codigoAcesso);

  if (prog.diasAtivos.includes(hoje)) return prog; // já registrado hoje

  const ontem = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const ultimoDia = prog.diasAtivos.sort().at(-1);
  const diasSeguidos = ultimoDia === ontem ? prog.diasSeguidos + 1 : 1;

  const novosDias = [...prog.diasAtivos, hoje].slice(-90); // guarda 90 dias

  const atualizado = {
    diasAtivos: novosDias,
    diasSeguidos,
    ultimoAcesso: serverTimestamp(),
  };

  await setDoc(doc(db, "progresso", codigoAcesso), atualizado, { merge: true });
  return { ...prog, ...atualizado };
}

/** Registra missão concluída */
export async function registrarMissaoConcluida(codigoAcesso, chaveMissao) {
  const prog = await getProgresso(codigoAcesso);
  if (prog.missoesCompletas.includes(chaveMissao)) return;

  await setDoc(doc(db, "progresso", codigoAcesso), {
    missoesCompletas: [...prog.missoesCompletas, chaveMissao],
    missoesFeitas: increment(1),
    atualizadoEm: serverTimestamp(),
  }, { merge: true });
}

/** Adiciona badge de esforço */
export async function adicionarBadge(codigoAcesso, badge) {
  const prog = await getProgresso(codigoAcesso);
  if (prog.badges.includes(badge)) return;

  await setDoc(doc(db, "progresso", codigoAcesso), {
    badges: [...prog.badges, badge],
    atualizadoEm: serverTimestamp(),
  }, { merge: true });
}

// ─────────────────────────────────────────────────────────────
// MISSÕES GERADAS PELO PAI
// ─────────────────────────────────────────────────────────────

/** Salva missão gerada pelo pai no Firestore */
export async function salvarMissao(codigoAcesso, disciplina, missao) {
  const ref = collection(db, "missoes", codigoAcesso, "geradas");
  await addDoc(ref, {
    disciplina,
    titulo: missao.titulo || "",
    perguntaCentral: missao.perguntaCentral || "",
    atividades: missao.atividades || {},
    feita: false,
    criadoEm: serverTimestamp(),
  });
}

/** Busca missões disponíveis por disciplina */
export async function getMissoesPorDisciplina(codigoAcesso, disciplina) {
  const ref = collection(db, "missoes", codigoAcesso, "geradas");
  const q = query(
    ref,
    where("disciplina", "==", disciplina),
    orderBy("criadoEm", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Busca todas as missões de uma criança agrupadas por disciplina */
export async function getTodasMissoes(codigoAcesso) {
  const ref = collection(db, "missoes", codigoAcesso, "geradas");
  const q = query(ref, orderBy("criadoEm", "desc"));
  const snap = await getDocs(q);
  const missoes = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Agrupa por disciplina
  return missoes.reduce((acc, m) => {
    if (!acc[m.disciplina]) acc[m.disciplina] = [];
    acc[m.disciplina].push(m);
    return acc;
  }, {});
}

/** Marca missão como feita */
export async function marcarMissaoFeita(codigoAcesso, missaoId) {
  const ref = doc(db, "missoes", codigoAcesso, "geradas", missaoId);
  await updateDoc(ref, {
    feita: true,
    feitaEm: serverTimestamp(),
  });
}

/** Conta missões geradas hoje pelo pai */
export async function contarMissoesHoje(codigoAcesso) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const ref = collection(db, "missoes", codigoAcesso, "geradas");
  const snap = await getDocs(ref);

  return snap.docs.filter(d => {
    const criadoEm = d.data().criadoEm?.toDate?.();
    return criadoEm && criadoEm >= hoje;
  }).length;
}

// ─────────────────────────────────────────────────────────────
// SESSÕES DE QUIZ
// ─────────────────────────────────────────────────────────────

/** Salva resultado de quiz */
export async function salvarSessaoQuiz(codigoAcesso, dados) {
  await addDoc(collection(db, "quizSessions"), {
    codigoAcesso,
    ...dados,
    criadoEm: serverTimestamp(),
  });
}

/** Busca histórico de quiz da criança */
export async function getSessoesQuiz(codigoAcesso) {
  const q = query(
    collection(db, "quizSessions"),
    where("codigoAcesso", "==", codigoAcesso),
    orderBy("criadoEm", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─────────────────────────────────────────────────────────────
// DEMOS (acesso anônimo)
// ─────────────────────────────────────────────────────────────

/** Verifica se uid anônimo já fez demo hoje */
export async function verificarDemo(uid) {
  const snap = await getDoc(doc(db, "demos", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  const hoje = new Date().toISOString().slice(0, 10);
  return data.data === hoje ? data : null;
}

/** Registra demo feita */
export async function registrarDemo(uid, dados) {
  await setDoc(doc(db, "demos", uid), {
    ...dados,
    data: new Date().toISOString().slice(0, 10),
    criadoEm: serverTimestamp(),
  });
}

// ─────────────────────────────────────────────────────────────
// LOG ECA (imutável por lei)
// ─────────────────────────────────────────────────────────────

/** Registra consentimento ECA — nunca deletar */
export async function registrarConsentimentoECA(uid, dados) {
  await setDoc(
    doc(db, "eca_logs", `${uid}_${Date.now()}`),
    {
      ...dados,
      criadoEm: serverTimestamp(),
    }
  );
}