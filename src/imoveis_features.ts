/**
 * @todo suporte para mais features
 */

import mean from "./mean";
import std_deviation from "./std_deviation";

type FeatureTypes = 'nonbinary' | 'binary-from-string' | 'binary-from-number';

export const features: {
  [feature_name: string]: FeatureTypes;
} = {
  preco_venda: 'nonbinary',
  preco_locacao: 'nonbinary',
  tipo: 'binary-from-string',
  cidade_id: 'binary-from-number',
  estado_id: 'binary-from-number',
  //
  lat: 'nonbinary',
  long: 'nonbinary',
  dormitórios: 'nonbinary',
  vagas: 'nonbinary',
  suítes: 'nonbinary',
  banheiros: 'nonbinary',
  area_total: 'nonbinary',
  area_útil: 'nonbinary',
  area_privativa: 'nonbinary',
  area_construída: 'nonbinary',
  IPTU: 'nonbinary',
  preco_condominio: 'nonbinary',
};

interface ImovelInput {
  [feature_name: string]: string | any;
  preco_venda: number;
  ID: string;
  tipo: string | null;
  estado_id: string | null;
  cidade_id: string | null;
  preco_locacao: number;
}
/**
 * Cria um objeto de features baseado em um imóvel
 * @param imovel
 */
export const get_features_imovel = (imovel: any) => {
  return {
    preco_venda: Number(imovel.preço_venda) || 0,
    ID: imovel.db_id,
    tipo: imovel.tipo || null,
    estado_id: imovel.estado ? String(imovel.estado.id || imovel.estado.value) || null : null,
    cidade_id: imovel.cidade ? String(imovel.cidade.id || imovel.cidade.value) || null : null,
    preco_locacao: Number(imovel.preço_locação) || 0,
    lat: Number(imovel.lat) || 0,
    long: Number(imovel.long) || 0,
    dormitórios: Number(imovel.dormitórios) || 0,
    vagas: Number(imovel.vagas) || 0,
    suítes: Number(imovel.suítes) || 0,
    banheiros: Number(imovel.banheiros) || 0,
    area_total: Number(imovel.area_total) || 0,
    area_útil: Number(imovel.area_útil) || 0,
    area_privativa: Number(imovel.area_privativa) || 0,
    area_construída: Number(imovel.area_construída) || 0,
    IPTU: Number(imovel.IPTU) || 0,
    preco_condominio: Number(imovel.preço_condominio) || 0,
  };
};

const notwanted_features = Object.entries(features)
  .map(([feature, type]) => (type.startsWith('binary') ? feature : ''))
  .filter((feature) => feature !== '')
  .reduce<string[]>((prev, curr) => {
    // adiciona [x_null, x_true, x_undefined, x] a array
    return (prev = prev.concat([
      ...['_null', '_true', '_undefined'].map((to_be_deleted) => curr + to_be_deleted),
      curr,
    ]));
  }, []);

export interface ImovelInputWithDummies extends ImovelInput {
  [key: string]: any;
}
/**
 * Funcao que transforma uma lista de imoveis para adicionar variaveis "dummy"
 * "uma variável dummy é aquela que leva apenas o valor 0 ou 1 para indicar a ausência ou
 * presença de algum efeito categórico que pode mudar o resultado."
 * @param {ImovelInput[]} imoveis
 * @name "get_dummies" é o mesmo nome da função do package "pandas" usado em python. https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.get_dummies.html
 * @returns Uma array de mesmo tamanho da array de input
 */
export const get_dummies = (imoveis: ImovelInput[]) => {
  const features_entries = Object.entries(features);

  // Usando Set para não ter que se preucupar com strings repetidas
  const possible_vars: Set<string> = new Set(
    features_entries.filter(([feature, type]) => type === 'nonbinary').map(([name]) => name),
  );

  for (const imovel of imoveis) {
    for (const [feature, type] of features_entries) {
      if (type === 'binary-from-number' || type === 'binary-from-string') {
        if (imovel[feature] && typeof imovel[feature] === 'string') possible_vars.add(`${feature}_${imovel[feature]}`);
      }
    }
  }

  for (const feature of notwanted_features) {
    possible_vars.delete(feature);
  }

  const dummy_names = Array.from(possible_vars);

  const imoveis_with_dummies = imoveis.map<ImovelInputWithDummies>((imovel) => {
    /**
     * Criar shallow copy do objeto, assim o objeto original não é mutado
     * @see https://medium.com/@manjuladube/understanding-deep-and-shallow-copy-in-javascript-13438bad941c
     */
    const imovel_with_dummies: ImovelInputWithDummies = { ...imovel };

    for (const dummy of dummy_names) {
      for (const [feature, type] of features_entries) {
        if (dummy.startsWith(feature + '_')) {
          const dummy_value = imovel[feature] == dummy.replace(feature + '_', '') ? 1 : 0;
          imovel_with_dummies[dummy] = dummy_value;
        }
      }
    }

    for (const i_var of notwanted_features) {
      delete imovel_with_dummies[i_var];
    }

    return imovel_with_dummies;
  });
  return {
    imoveis_with_dummies,
    dummy_names,
  };
};

/**
 * Remove o parametro ID de um imóvel, com dummies, de input
 * @param imovel
 */
export const prune_ids = (imovel: ImovelInputWithDummies): number[] => {
  const imovel_copy: any = { ...imovel };

  delete imovel_copy.ID;

  return Object.values(imovel_copy);
};

/**
 * Função que cria um peso para cada feature, talvez possa receber hyperparametros
 * @todo hyperparametros
 * @param dummy_names
 * @param sample_size
 */
export const weight_by_dummy_names = (dummy_names: string[], imoveis_with_dummies: ImovelInputWithDummies[], calc_type: 'default' | 'alt' | 'no-outliers' | 'custom' = 'default', custom_w_fn?: ((dummy_names: string[], imoveis_with_dummies: ImovelInputWithDummies[]) => number[]) ): number[] => {
  
  // Remover discrepancias extremas de preços
  if (calc_type === 'no-outliers') {
    const p_venda = []
    const p_locacao = []
    for (const imovel of imoveis_with_dummies) {
      p_venda.push(imovel.preco_venda)
      p_locacao.push(imovel.preco_locacao)
    }
    /**
     * @todo
     */
    const mean_venda = mean(p_venda)
    const stdd_venda = std_deviation(p_venda)
  }

  // Função de gerar weights customizada
  if (calc_type === 'custom' && custom_w_fn !== undefined) return custom_w_fn(dummy_names, imoveis_with_dummies)

  return dummy_names.map((name) => {
    if (name.startsWith('cidade_id_')) return 1 / dummy_names.filter(n => n.startsWith('cidade_id_')).length;
    if (name.startsWith('estado_id_')) return 1 / dummy_names.filter(n => n.startsWith('estado_id_')).length;
    if (name.startsWith('tipo_')) return 1 / dummy_names.filter(n => n.startsWith('tipo_')).length;

    // Provavelmente é melhor fazer 1 ser o valor mais alto, provavelmente isso ai em baixo pode ta fodendo os calculos "um pouco",
    // Mas os hyperparametros vão corrigir isso

    if (name.startsWith('preco_locacao')) return calc_type === 'alt' ? 0.1 : 2.5; // 1;
    if (name.startsWith('preco_venda')) return calc_type === 'alt' ? 1 : 2.5; // 1;
    return calc_type === 'alt' ? (1 / (dummy_names.length / 1.9)) : 1 / dummy_names.length; // (1 / dummy_names.length) / 2
  });
}