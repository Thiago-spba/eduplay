import { useState, useCallback } from 'react'

const KEY = 'eduplay_parent_lock'

const DEFAULT_STATE = {
  senha: '1234',
  tentativas: 0,
  bloqueadoAte: null,
}

export function useParentLock() {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(KEY)
    return saved ? JSON.parse(saved) : DEFAULT_STATE
  })

  const salvar = (novoState) => {
    setState(novoState)
    localStorage.setItem(KEY, JSON.stringify(novoState))
  }

  // Verifica se está em cooldown por excesso de tentativas
  const emCooldown = state.bloqueadoAte && Date.now() < state.bloqueadoAte

  const tempoCooldown = emCooldown
    ? Math.ceil((state.bloqueadoAte - Date.now()) / 1000)
    : 0

  const verificarSenha = useCallback((digitada) => {
    if (emCooldown) return { ok: false, motivo: 'cooldown' }

    if (digitada === state.senha) {
      salvar({ ...state, tentativas: 0, bloqueadoAte: null })
      return { ok: true }
    }

    const novasTentativas = state.tentativas + 1

    // Após 3 tentativas erradas, bloqueia por 60 segundos
    if (novasTentativas >= 3) {
      salvar({
        ...state,
        tentativas: 0,
        bloqueadoAte: Date.now() + 60 * 1000,
      })
      return { ok: false, motivo: 'bloqueado' }
    }

    salvar({ ...state, tentativas: novasTentativas })
    return { ok: false, motivo: 'senha_errada', tentativasRestantes: 3 - novasTentativas }
  }, [state, emCooldown])

  const alterarSenha = useCallback((senhaAtual, novaSenha) => {
    if (senhaAtual !== state.senha) return { ok: false, motivo: 'senha_errada' }
    if (!/^\d{4}$/.test(novaSenha)) return { ok: false, motivo: 'formato_invalido' }
    salvar({ ...state, senha: novaSenha, tentativas: 0, bloqueadoAte: null })
    return { ok: true }
  }, [state])

  const resetar = useCallback(() => {
    salvar(DEFAULT_STATE)
  }, [])

  return {
    verificarSenha,
    alterarSenha,
    resetar,
    emCooldown,
        tempoCooldown,
    tentativas: state.tentativas,
  }
}