import { useState, useEffect, useRef, useCallback } from 'react'

const STORAGE_KEY = 'eduplay_timer'

export function useTimer() {
  const [tempoLimite, setTempoLimite] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved).limite : 25
  })

  const [tempoRestante, setTempoRestante] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved).restante : 25 * 60
  })

  const [rodando, setRodando] = useState(false)
  const [bloqueado, setBloqueado] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      limite: tempoLimite,
      restante: tempoRestante
    }))
  }, [tempoLimite, tempoRestante])

  useEffect(() => {
    if (rodando && !bloqueado) {
      intervalRef.current = setInterval(() => {
        setTempoRestante(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setRodando(false)
            setBloqueado(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [rodando, bloqueado])

  const iniciar = useCallback(() => {
    if (!bloqueado) setRodando(true)
  }, [bloqueado])

  const pausar = useCallback(() => setRodando(false), [])

  const desbloquear = useCallback(() => {
    setBloqueado(false)
    setTempoRestante(tempoLimite * 60)
    setRodando(true)
  }, [tempoLimite])

  const mudarLimite = useCallback((minutos) => {
    setTempoLimite(minutos)
    setTempoRestante(minutos * 60)
    setRodando(false)
    setBloqueado(false)
  }, [])

  const tempoFormatado = (() => {
    const min = Math.floor(tempoRestante / 60)
    const seg = tempoRestante % 60
    return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`
  })()

  const percentual = Math.round((tempoRestante / (tempoLimite * 60)) * 100)
  const alertaProximo = tempoRestante <= 300 && tempoRestante > 0

  return {
    tempoLimite, tempoRestante, tempoFormatado,
    percentual, rodando, bloqueado, alertaProximo,
    iniciar, pausar, desbloquear, mudarLimite,
  }
}