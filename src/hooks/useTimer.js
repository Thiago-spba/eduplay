import { useState, useEffect, useRef, useCallback } from 'react'

const STORAGE_KEY = 'eduplay_timer'

export function useTimer() {
  const [tempoLimite, setTempoLimite] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : {}
    return parsed.limite ?? 0
  })
  const [tempoRestante, setTempoRestante] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : {}
    return parsed.restante ?? 0
  })
  const [rodando,   setRodando]   = useState(false)
  const [bloqueado, setBloqueado] = useState(false)
  const intervalRef = useRef(null)

  const semLimite = tempoLimite === 0

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      limite:   tempoLimite,
      restante: tempoRestante,
    }))
  }, [tempoLimite, tempoRestante])

  useEffect(() => {
    if (semLimite || !rodando || bloqueado) {
      clearInterval(intervalRef.current)
      return
    }
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
    return () => clearInterval(intervalRef.current)
  }, [rodando, bloqueado, semLimite])

  const iniciar = useCallback(() => {
    if (semLimite || bloqueado) return
    setRodando(true)
  }, [bloqueado, semLimite])

  const pausar = useCallback(() => setRodando(false), [])

  const desbloquear = useCallback(() => {
    setBloqueado(false)
    setTempoRestante(tempoLimite * 60)
    if (!semLimite) setRodando(true)
  }, [tempoLimite, semLimite])

  const mudarLimite = useCallback((minutos) => {
    setTempoLimite(minutos)
    setTempoRestante(minutos * 60)
    setRodando(false)
    setBloqueado(false)
  }, [])

  const tempoFormatado = (() => {
    if (semLimite) return "livre"
    const min = Math.floor(tempoRestante / 60)
    const seg = tempoRestante % 60
    return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`
  })()

  const percentual    = semLimite ? 100 : Math.round((tempoRestante / (tempoLimite * 60)) * 100)
  const alertaProximo = !semLimite && tempoRestante <= 300 && tempoRestante > 0

  return {
    tempoLimite, tempoRestante, tempoFormatado,
    percentual, rodando, bloqueado, alertaProximo,
    semLimite,
    iniciar, pausar, desbloquear, mudarLimite,
  }
}
