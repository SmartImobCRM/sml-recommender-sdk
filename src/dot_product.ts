/**
 * @description Em álgebra linear, o produto escalar é uma função binária definida entre dois vetores que fornece um número real (também chamado "escalar") como resultado
 * @see https://wikimedia.org/api/rest_v1/media/math/render/svg/5bd0b488ad92250b4e7c2f8ac92f700f8aefddd5
 * @param {number[]} a Vetor unidimensional de números
 * @param {number[]} b Vetor unidimensional de números
 * @param {number[]} ws Peso de cada valor
 */
const dot_product = (a: number[], b: number[], ws?: number[]) => {
  if (a.length !== b.length) {
    console.error(`Vetores com tamanhos diferentes. Vetor A: ${a.length}, Vetor B: ${b.length}.`);
    return 0;
  }
  /**
   * @example
   * a = [2, 7, 1]
   * b = [8, 2, 8]
   * dot_vector =  [2*8, 7*2, 1*8]
   */
  const products = a.map((a_val, i) => (ws ? ws[i] : 1) * a_val * b[i]);

  /**
   * Soma dos produtos
   */
  return products.reduce((prev, curr) => (prev += curr), 0);
};

export default dot_product;
