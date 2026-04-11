import { useState, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════
// INSTITUTO DO SABER — Sistema de Progresso
// Nomenclatura exclusiva: Fragmentos (não XP)
// ═══════════════════════════════════════════════════════════

const CHAVE_PROGRESSO = 'instituto_progresso'
const CHAVE_META      = 'instituto_meta'

const PROGRESSO_INICIAL = {
  fragmentos:        0,
  nivel:             1,
  missoesCompletas:  [],   // ['historia_indigenas', 'geografia_localizacao']
  atividadesFeitas:  [],   // ['historia_indigenas_quiz', ...]
  diasEstudados:     [],   // ['2026-04-08', ...]
  sequenciaDias:     0,    // dias seguidos estudando
  totalAcertos:      0,
  totalTentativas:   0,
}

const META_INICIAL = {
  ativa:          false,
  tipo:           null,    // 'missoes' | 'atividades' | 'dias' | 'acertos'
  quantidade:     3,
  prazo:          7,       // em dias
  dataInicio:     null,
  recompensa:     null,    // só o pai sabe
  recompensaTipo: null,    // 'tela' | 'jantar' | 'filme' | 'dinheiro' | 'passeio' | 'personalizado'
  revelada:       false,
  conquistada:    false,
}

// Tabela de níveis — nomenclatura do Instituto
export const NIVEIS = [
  { nivel: 1, titulo: 'Pesquisador Júnior',    fragmentosNecessarios: 0    },
  { nivel: 2, titulo: 'Analista de Campo',     fragmentosNecessarios: 150  },
  { nivel: 3, titulo: 'Investigador',          fragmentosNecessarios: 400  },
  { nivel: 4, titulo: 'Especialista',          fragmentosNecessarios: 800  },
  { nivel: 5, titulo: 'Pesquisador Sênior',    fragmentosNecessarios: 1500 },
  { nivel: 6, titulo: 'Diretor do Instituto',  fragmentosNecessarios: 3000 },
]

// Tipos de recompensa disponíveis para o pai configurar
export const TIPOS_RECOMPENSA = [
  { id: 'tela',         icone: '📱', label: 'Tempo extra de tela'         },
  { id: 'jantar',       icone: '🍕', label: 'Escolher o jantar'           },
  { id: 'filme',        icone: '🎬', label: 'Escolher o filme'            },
  { id: 'dinheiro',     icone: '💰', label: 'Mesada bônus'                },
  { id: 'passeio',      icone: '🎡', label: 'Passeio especial'            },
  { id: 'jogo',         icone: '🎮', label: 'Tempo extra de videogame'    },
  { id: 'personalizado',icone: '🎁', label: 'Surpresa personalizada'      },
]

function carregar(chave, padrao) {
  try {
    const salvo = localStorage.getItem(chave)
    return salvo ? { ...padrao, ...JSON.parse(salvo) } : { ...padrao }
  } catch {
    return { ...padrao }
  }
}

function salvar(chave, dados) {
  localStorage.setItem(chave, JSON.stringify(dados))
}

export function useProgress() {
  const [progresso, setProgresso] = useState(() => carregar(CHAVE_PROGRESSO, PROGRESSO_INICIAL))
  const [meta, setMeta]           = useState(() => carregar(CHAVE_META, META_INICIAL))

  // ── Atualizar progresso e persistir ──
  const atualizarProgresso = useCallback((novosDados) => {
    setProgresso(prev => {
      const atualizado = { ...prev, ...novosDados }
      salvar(CHAVE_PROGRESSO, atualizado)
      return atualizado
    })
  }, [])

  const atualizarMeta = useCallback((novosDados) => {
    setMeta(prev => {
      const atualizado = { ...prev, ...novosDados }
      salvar(CHAVE_META, atualizado)
      return atualizado
    })
  }, [])

  // ── Registrar atividade concluída ──
  const registrarAtividade = useCallback((disciplinaId, moduloId, tipoAtividade, acertou, fragmentosGanhos) => {
    const chaveAtividade = `${disciplinaId}_${moduloId}_${tipoAtividade}`
    const hoje = new Date().toISOString().split('T')[0]

    setProgresso(prev => {
      const jaFeita = prev.atividadesFeitas.includes(chaveAtividade)
      const novasAtividades = jaFeita
        ? prev.atividadesFeitas
        : [...prev.atividadesFeitas, chaveAtividade]

      // Dias estudados
      const jaEstudouHoje = prev.diasEstudados.includes(hoje)
      const novosDias = jaEstudouHoje
        ? prev.diasEstudados
        : [...prev.diasEstudados, hoje]

      // Sequência de dias
      const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const novaSequencia = prev.diasEstudados.includes(ontem) || jaEstudouHoje
        ? prev.sequenciaDias + (jaEstudouHoje ? 0 : 1)
        : 1

      const novosFragmentos = jaFeita ? prev.fragmentos : prev.fragmentos + fragmentosGanhos

      // Calcular nível
      const novoNivel = NIVEIS.filter(n => novosFragmentos >= n.fragmentosNecessarios).pop()

      const atualizado = {
        ...prev,
        fragmentos:       novosFragmentos,
        nivel:            novoNivel.nivel,
        atividadesFeitas: novasAtividades,
        diasEstudados:    novosDias,
        sequenciaDias:    novaSequencia,
        totalAcertos:     acertou ? prev.totalAcertos + 1 : prev.totalAcertos,
        totalTentativas:  prev.totalTentativas + 1,
      }

      salvar(CHAVE_PROGRESSO, atualizado)
      return atualizado
    })

    // Verificar meta após atividade
    verificarMeta()
  }, [])

  // ── Registrar missão completa ──
  const registrarMissao = useCallback((disciplinaId, moduloId) => {
    const chaveMissao = `${disciplinaId}_${moduloId}`

    setProgresso(prev => {
      if (prev.missoesCompletas.includes(chaveMissao)) return prev

      const atualizado = {
        ...prev,
        missoesCompletas: [...prev.missoesCompletas, chaveMissao],
      }
      salvar(CHAVE_PROGRESSO, atualizado)
      return atualizado
    })

    verificarMeta()
  }, [])

  // ── Verificar se meta foi atingida ──
  const verificarMeta = useCallback(() => {
    setMeta(prevMeta => {
      if (!prevMeta.ativa || prevMeta.conquistada) return prevMeta

      // Verificar prazo
      if (prevMeta.dataInicio) {
        const diasPassados = Math.floor((Date.now() - new Date(prevMeta.dataInicio)) / 86400000)
        if (diasPassados > prevMeta.prazo) {
          // Meta expirou — resetar
          const resetada = { ...META_INICIAL }
          salvar(CHAVE_META, resetada)
          return resetada
        }
      }

      setProgresso(prevProg => {
        let atingiu = false

        if (prevMeta.tipo === 'missoes') {
          atingiu = prevProg.missoesCompletas.length >= prevMeta.quantidade
        } else if (prevMeta.tipo === 'atividades') {
          atingiu = prevProg.atividadesFeitas.length >= prevMeta.quantidade
        } else if (prevMeta.tipo === 'dias') {
          atingiu = prevProg.sequenciaDias >= prevMeta.quantidade
        } else if (prevMeta.tipo === 'acertos') {
          const percentual = prevProg.totalTentativas > 0
            ? Math.round((prevProg.totalAcertos / prevProg.totalTentativas) * 100)
            : 0
          atingiu = percentual >= prevMeta.quantidade
        }

        if (atingiu) {
          const metaAtualizada = { ...prevMeta, conquistada: true }
          salvar(CHAVE_META, metaAtualizada)
          setMeta(metaAtualizada)
        }

        return prevProg
      })

      return prevMeta
    })
  }, [])

  // ── Configurar meta (pelo pai) ──
  const configurarMeta = useCallback((tipo, quantidade, prazo, recompensaTipo, recompensaTexto) => {
    const novaMeta = {
      ativa:          true,
      tipo,
      quantidade,
      prazo,
      dataInicio:     new Date().toISOString(),
      recompensa:     recompensaTexto,
      recompensaTipo,
      revelada:       false,
      conquistada:    false,
    }
    salvar(CHAVE_META, novaMeta)
    setMeta(novaMeta)
  }, [])

  // ── Revelar recompensa (requer senha do pai) ──
  const revelarRecompensa = useCallback(() => {
    atualizarMeta({ revelada: true })
  }, [atualizarMeta])

  // ── Resetar meta ──
  const resetarMeta = useCallback(() => {
    salvar(CHAVE_META, META_INICIAL)
    setMeta({ ...META_INICIAL })
  }, [])

  // ── Computados úteis ──
  const nivelAtual = NIVEIS.filter(n => progresso.fragmentos >= n.fragmentosNecessarios).pop()
  const proximoNivel = NIVEIS.find(n => n.fragmentosNecessarios > progresso.fragmentos)

  const percentualNivel = proximoNivel
    ? Math.round(((progresso.fragmentos - nivelAtual.fragmentosNecessarios) /
        (proximoNivel.fragmentosNecessarios - nivelAtual.fragmentosNecessarios)) * 100)
    : 100

  const percentualAcertos = progresso.totalTentativas > 0
    ? Math.round((progresso.totalAcertos / progresso.totalTentativas) * 100)
    : 0

  // Progresso da meta atual
  const progressoMeta = (() => {
    if (!meta.ativa) return 0
    if (meta.tipo === 'missoes')    return Math.min(progresso.missoesCompletas.length, meta.quantidade)
    if (meta.tipo === 'atividades') return Math.min(progresso.atividadesFeitas.length, meta.quantidade)
    if (meta.tipo === 'dias')       return Math.min(progresso.sequenciaDias, meta.quantidade)
    if (meta.tipo === 'acertos')    return Math.min(percentualAcertos, meta.quantidade)
    return 0
  })()

  const diasRestantesMeta = meta.ativa && meta.dataInicio
    ? Math.max(0, meta.prazo - Math.floor((Date.now() - new Date(meta.dataInicio)) / 86400000))
    : 0

  return {
    // Estado
    progresso,
    meta,

    // Ações da criança
    registrarAtividade,
    registrarMissao,

    // Ações do pai
    configurarMeta,
    revelarRecompensa,
    resetarMeta,

    // Computados
    nivelAtual,
    proximoNivel,
    percentualNivel,
    percentualAcertos,
    progressoMeta,
    diasRestantesMeta,
  }
}