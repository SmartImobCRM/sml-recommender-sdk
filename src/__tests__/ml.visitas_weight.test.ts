import sum from '../sum';
import { visitas_weight } from '../visitantes_features';

test('[ml] Visitas Weight 1 Imóvel', () => {
  const v = [{ imoveis_visitados: ['S3CO9BIGiLkdOgHy4xqb'], time_fim_visita: 1611262779971, time_inicio_visita: 1611262726257 }];
  const vw = visitas_weight(v);
  expect(vw).toStrictEqual([['S3CO9BIGiLkdOgHy4xqb', 1]]);
  expect(sum(vw.map(([id, w]) => w)) > 0.98).toBe(true);
});

test('[ml] Visitas Weight X Imóveis', () => {
  const v = [
    { imoveis_visitados: ['564914'], time_fim_visita: 1612799816114, time_inicio_visita: 1612799126393 },
    { imoveis_visitados: ['670737'], time_fim_visita: 1612800292963, time_inicio_visita: 1612799816114 },
    { imoveis_visitados: ['ttUfmJQbwbLGPgTsmCRT', '630860'], time_fim_visita: 1612800742420, time_inicio_visita: 1612800342839 },
    { imoveis_visitados: ['aJthnigZbht4pr6uyteF'], time_fim_visita: 1612800988526, time_inicio_visita: 1612800742420 },
  ];
  const vw = visitas_weight(v);
  expect(vw).toStrictEqual([
    ['564914', 0.38058674900966033],
    ['670737', 0.2631243802617399],
    ['ttUfmJQbwbLGPgTsmCRT', 0.11024402168125161],
    ['630860', 0.11024402168125161],
    ['aJthnigZbht4pr6uyteF', 0.13580082736609653],
  ]);
  expect(sum(vw.map(([id, w]) => w)) > 0.98).toBe(true);
});
