import dot_product from './dot_product';

/**
 * @description Cosine similarity is a measure of similarity between two non-zero vectors of an inner product space.
 * @see https://towardsdatascience.com/how-to-build-a-textual-similarity-analysis-web-app-aa3139d4fb71#8762
 * @param {number[]} a Vetor unidimensional de números, provavelmente as features
 * @param {number[]} b Vetor unidimensional de números, provavelmente as features
 * @param {number[]} ws Vetor unidimensional de números, peso de cada feature, sera multiplicado pelo valor correspondente a no indice da array a e b durante a execução do "dot_product"
 * @return {number} Um número entre 1 e -1, 1 => muito semelhante, -1 nao semelhante
 */
const cos_similarity = (a: number[], b: number[], ws?: number[]) => {
  const magnitude_a = Math.sqrt(dot_product(a, a, ws));
  const magnitude_b = Math.sqrt(dot_product(b, b, ws));

  if (magnitude_a && magnitude_b)
    /**
     * @see https://wikimedia.org/api/rest_v1/media/math/render/svg/1d94e5903f7936d3c131e040ef2c51b473dd071d
     */
    return dot_product(a, b, ws) / (magnitude_a * magnitude_b);
  else return false;
};

export default cos_similarity;
