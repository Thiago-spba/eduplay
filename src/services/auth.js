import { auth } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// Login com Google — abre popup
export const loginComGoogle = async () => {
  try {
    // Cria provider NOVO a cada tentativa (não reutiliza o anterior)
    const provider = new GoogleAuthProvider();
    
    // Força re-autenticação do Google (evita cache de sessão expirada)
    provider.setCustomParameters({ prompt: "select_account" });
    
    // Adiciona scopes necessários
    provider.addScope("profile");
    provider.addScope("email");
    
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    console.error("Erro detalhado do Google Auth:", {
      code: error.code,
      message: error.message,
      email: error.email,
    });
    throw error; // ← IMPORTANTE: repassa o erro pra cima
  }
};

// Login com email e senha
export const loginComEmail = (email, senha) =>
  signInWithEmailAndPassword(auth, email, senha);

// Cadastro com email e senha
export const cadastrarComEmail = (email, senha) =>
  createUserWithEmailAndPassword(auth, email, senha);

// Logout
export const logout = () => signOut(auth);

// Escuta mudanças de auth — chama cb(user) quando logar/deslogar
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);