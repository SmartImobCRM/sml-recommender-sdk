//arquivo para testes, vai ser excluido nas versões finais
console.log('playground init');
import { imoveis } from './examples';
import { imoveis_similares_por_id } from '.';

const { perf, ids_simi_vec, dummy_names } = imoveis_similares_por_id('3ZbRsnlGkNuCCaQrBJFi', imoveis, { performance: true });

console.log(ids_simi_vec, perf, dummy_names);
