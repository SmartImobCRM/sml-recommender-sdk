import { XisWhatPercentOfY } from './percentage';
import sum from './sum';

export interface Visita {
  imoveis_visitados: string[];
  tf: number;
  ti: number;
}

export interface Visitante {
  visitas: Visita[];
  db_id: string;
}

/**
 * Cria pesos para cada imóvel de cada visita passada como input, retorna uma lista de [imoveis, weights]
 * @example
 * const v = [{ imoveis_visitados: ['S3CO9BIGiLkdOgHy4xqb'], tf: 1611262779971, ti: 1611262726257 }]
 * const vw = visitas_weight(v)
 *
 * vw === [['S3CO9BIGiLkdOgHy4xqb', 1]]
 *
 * sum(vw.map(([id, w]) => w)) // 1 ou 0.99999999999999 por razoes de inconsistencia de float
 * @param visitas
 */
export const visitas_weight = (visitas: Visita[]) => {
  const id_weight: [string, number][] = [];
  const t_diffs = visitas.map((visita) => visita.tf - visita.ti);
  const t_total = sum(t_diffs);

  for (const visita of visitas) {
    const diff = visita.tf - visita.ti;
    const w = XisWhatPercentOfY(diff, t_total) / 100;
    for (const imovel of visita.imoveis_visitados) {
      id_weight.push([imovel, w / visita.imoveis_visitados.length]);
    }
  }
  return id_weight;
};
