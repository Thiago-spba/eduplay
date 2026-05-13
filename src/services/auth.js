import { auth } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const provider = new GoogleAuthProvider();

// Login com Google — abre popup
export const loginComGoogle = () => signInWithPopup(auth, provider);

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