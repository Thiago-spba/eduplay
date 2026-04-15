import { useState, useEffect } from "react";
import { signInAnonymously, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/firebase";

const KEY = "eduplay_player_name";

export function usePlayer() {
  const [playerName, setPlayerName] = useState(
    () => localStorage.getItem(KEY) || ""
  );
  const [uid, setUid] = useState(null);
  const [authPronto, setAuthPronto] = useState(false);

  /* ── Escuta mudanças de auth ── */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
      }
      setAuthPronto(true);
    });
    return () => unsubscribe();
  }, []);

  /* ── Login anônimo automático se tem nome mas não tem sessão ── */
  useEffect(() => {
    if (authPronto && playerName && !uid) {
      signInAnonymously(auth).catch((err) => {
        console.error("Erro no login anonimo:", err.message);
      });
    }
  }, [authPronto, playerName, uid]);

  const saveName = async (name) => {
    localStorage.setItem(KEY, name);
    setPlayerName(name);

    /* Login anônimo silencioso ao registrar */
    if (!uid) {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Erro no login anonimo:", err.message);
      }
    }
  };

  const clearName = async () => {
    localStorage.removeItem(KEY);
    setPlayerName("");

    /* Desloga ao trocar de explorador */
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Erro no signOut:", err.message);
    }
  };

  return { playerName, saveName, clearName, uid, authPronto };
}