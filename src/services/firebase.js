import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Padrão Singleton: Garante instância única de segurança, evitando colisões no empacotamento do Vite
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db        = getFirestore(app);
export const auth      = getAuth(app);
export const functions = getFunctions(app, "us-central1");
export const storage   = getStorage(app);

// Configuração explícita de persistência mobile para estabilidade de sessão e adequação à LGPD/ECA
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Instituto do Saber - Falha ao definir diretrizes de persistência da sessão:", error);
});