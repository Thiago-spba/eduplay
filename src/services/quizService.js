import { db } from './firebase'
import {
  collection, addDoc, getDocs,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore'

const COL = 'quizKids'

export async function saveSession({ playerName, module, score, correct, wrong, level }) {
  return addDoc(collection(db, COL), {
    playerName,
    module,
    score,
    correct,
    wrong,
    level,
    createdAt: serverTimestamp()
  })
}

export async function getSessions(playerName) {
  const q = query(
    collection(db, COL),
    where('playerName', '==', playerName),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getAllSessions() {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
