import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

// Instância conectada à nuvem do Firebase
const gerarMissaoFn = httpsCallable(functions, "gerarMissao");

/**
 * Solicita uma nova missão educacional à Inteligência Central.
 * @param {Object} params - Dados da missão solicitada.
 * @param {string} params.disciplina - Setor do conhecimento (ex: historia).
 * @param {string} params.serie - Nível do agente (ex: 6ano).
 * @param {string} params.bimestre - Período atual.
 * @param {string} params.tema - Foco da operação.
 * @param {boolean} [params.isDemo] - Se true, aplica verificação e bloqueio de demo única no servidor.
 * @returns {Promise<Object>} O dossiê completo da missão gerada.
 */
export async function gerarMissaoIA({ disciplina, serie, bimestre, tema, isDemo }) {
  // 1. BLINDAGEM DE CUSTOS (Frontend Security)
  // Evita que o sistema faça chamadas vazias à nuvem e gere custos de API.
  if (!disciplina || !serie) {
    throw new Error("Parâmetros de missão incompletos. Conexão abortada por segurança.");
  }

  // 2. INJEÇÃO DE CONTEXTO TEMPORAL (Copiloto Aware)
  // Passamos o "mundo real" para a IA, permitindo que ela identifique feriados próximos.
  const dataAtual = new Date();
  const contextoTemporal = {
    dataIso: dataAtual.toISOString(),
    dia: dataAtual.getDate(),
    mes: dataAtual.getMonth() + 1,
    ano: dataAtual.getFullYear()
  };

  try {
    // 3. REQUISIÇÃO ASSÍNCRONA OTIMIZADA
    const resultado = await gerarMissaoFn({
      disciplina,
      serie,
      bimestre,
      tema,
      contextoTemporal,
      isDemo: isDemo === true, // Repassa para a Cloud Function controlar o bloqueio
    });

    // 4. VERIFICAÇÃO DE INTEGRIDADE
    if (!resultado || !resultado.data) {
      throw new Error("Sinal perdido. A base de dados não retornou pacotes.");
    }

    if (!resultado.data.ok) {
      throw new Error(resultado.data.erro || "A Inteligência Central rejeitou o pedido.");
    }

    return resultado.data.missao;

  } catch (error) {
    // 5. TRATAMENTO TÁTICO DE ERROS
    console.error("[SISTEMA IA] Falha de Comunicação:", error);

    if (error?.code === 'unauthenticated') {
      throw new Error("Acesso Negado: O Agente não possui credenciais ativas no momento.");
    }

    // Demo já utilizada — servidor bloqueou
    if (error?.code === 'already-exists') {
      throw new Error("DEMO_JA_USADA");
    }

    if (error?.code === 'internal') {
      throw new Error("Ocorreu uma falha no motor de Inteligência. Tente novamente em alguns segundos.");
    }

    throw new Error(error.message || "Erro desconhecido na geração da missão.");
  }
}