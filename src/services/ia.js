import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const gerarMissaoFn = httpsCallable(functions, "gerarMissao");

export async function gerarMissaoIA({ disciplina, serie, bimestre, tema }) {
  const resultado = await gerarMissaoFn({
    disciplina,
    serie,
    bimestre,
    tema,
  });

  if (!resultado.data?.ok) {
    throw new Error("Erro ao gerar missao com IA");
  }

  return resultado.data.missao;
}