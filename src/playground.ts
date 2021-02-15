console.log('plot init');
import { imoveis } from './examples';
import { imoveis_similares } from '.';

const { perf, ids_simi_vec, dummy_names } = imoveis_similares('3ZbRsnlGkNuCCaQrBJFi', imoveis, { performance: true });

console.log(ids_simi_vec, perf, dummy_names);
