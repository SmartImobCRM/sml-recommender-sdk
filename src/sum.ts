/**
 * Soma todos os números da array e retorna o resultado
 * @see https://en.wikipedia.org/wiki/Summation
 * @example 
 * const ns = [1, 2, 3]
 * sum(ns) === 6
 * @param n_list Array de números a serem somados
 * @returns {number} A soma de todos os números da array
 */
export const sum = (n_list: number[]) => n_list.reduce((prev, curr) => (prev += curr), 0);
export default sum;
