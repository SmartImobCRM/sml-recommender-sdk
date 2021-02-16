import { get_dummies, features, weight_by_dummy_names } from '../imoveis_features';

const imoveis = [
  { preco_venda: 550000, ID: '544608', tipo: 'Cobertura', estado_id: 'null', cidade_id: 'null', preco_locacao: 2500 },
  { preco_venda: 0, ID: '555303', tipo: 'Apartamento', estado_id: 'null', cidade_id: 'null', preco_locacao: 1600 },
  { preco_venda: 0, ID: '555348', tipo: 'Duplex', estado_id: '24', cidade_id: '2403251', preco_locacao: 1250 },
  {
    preco_venda: 70000,
    ID: '555556',
    tipo: 'Sala Comercial',
    estado_id: '24',
    cidade_id: '2408102',
    preco_locacao: 1100,
  },
  {
    preco_venda: 0,
    ID: 'rKi2CmwSdaZe5xFFpbsD',
    tipo: 'Apartamento',
    estado_id: '24',
    cidade_id: '2408102',
    preco_locacao: 1700,
  },
  {
    preco_venda: 170000,
    ID: 'sUcdYE4BVAovQbENDjPi',
    tipo: 'Apartamento',
    estado_id: '24',
    cidade_id: '2408102',
    preco_locacao: 0,
  },
  {
    preco_venda: 440000,
    ID: 'tSNxpIWN6lqdyl0flpnK',
    tipo: 'Apartamento',
    estado_id: '24',
    cidade_id: '2408102',
    preco_locacao: 0,
  },
  {
    preco_venda: 650000,
    ID: 'ttUfmJQbwbLGPgTsmCRT',
    tipo: 'Apartamento',
    estado_id: '24',
    cidade_id: '2408102',
    preco_locacao: 0,
  },
  { preco_venda: 0, ID: 'ty5HRmO8svFmbZFbCidg', tipo: null, estado_id: null, cidade_id: null, preco_locacao: 0 },
  {
    preco_venda: 0,
    ID: 'vjwxBIXtFqVaI5pRojFV',
    tipo: null,
    estado_id: 'undefined',
    cidade_id: 'undefined',
    preco_locacao: 0,
  },
];

//https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

test('[ml] Get dummies', () => {
  const { dummy_names, imoveis_with_dummies } = get_dummies(imoveis);
  const ws = weight_by_dummy_names(dummy_names, imoveis.length, 'alt')
  const a = new Map()
  let i = 0;
  for (const name of dummy_names) {
    a.set(name, ws[i])
    i++
  }
  console.log(a)
  for (const feature_name in features) {
    const type = features[feature_name];
    if (type === 'binary-from-string' || type === 'binary-from-number') {
      //verificar se existe pelo menos um campos binario de cada feature

      const tem_feature = 1 <= dummy_names.filter((name) => name.startsWith(feature_name + '_')).length;

      expect(tem_feature).toBe(true);
    } else if (type === 'nonbinary') {
      //verificar se existe apenas um campos nao binario de cada feature

      const tem_feature = 1 === dummy_names.filter((name) => name === feature_name).length;

      expect(tem_feature).toBe(true);
    }
  }

  const rand_imovel_index = randomIntFromInterval(0, imoveis_with_dummies.length);
  const rand_imovel = imoveis_with_dummies[rand_imovel_index];

  // -1 por causa do campo ID
  expect(Object.keys(rand_imovel).length - 1 === dummy_names.length);
});
