/**
 * @description É necessário dividir o resultado por 100 caso queira uma porcentagem entre 1 e 0 ao invés de 100 e 0
 * @see https://getcalc.com/formula/math/x-percentage-y.png
 */
export const WhatIsXPercentOfY = (x: number, y: number) => (x / 100) * y;
export const XisWhatPercentOfY = (x: number, y: number) => (x / y) * 100;
/**
 * @see https://uploads-cdn.omnicalculator.com/images/percentage_increase_eq2.png
 */
export const PercentageIncreaseFromXtoY = (x: number, y: number) => {
  const res = ((x - y) / y) * 100;
  return isNaN(res) ? 0 : res;
};
