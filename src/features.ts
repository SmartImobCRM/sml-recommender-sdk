interface ImovelInput {
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
const get_features_imovel = (imovel: any) => {
  return {
    preco_venda: Number(imovel.preço_venda) || 0,
    ID: imovel.db_id,
    tipo: imovel.tipo || null,
    estado_id: imovel.estado ? String(imovel.estado.id || imovel.estado.value) || null : null,
    cidade_id: imovel.cidade ? String(imovel.cidade.id || imovel.cidade.value) || null : null,
    preco_locacao: Number(imovel.preço_locação) || 0,
  };
};

const inconsistent_vars = [
  'tipo',
  'cidade_id',
  'cidade_id_null',
  'cidade_id_true',
  'cidade_id_undefined',
  'estado_id',
  'estado_id_null',
  'estado_id_true',
  'estado_id_undefined',
];

interface ImovelInputWithDummies extends ImovelInput {
  [key: string]: any;
}
/**
 * Funcao que transforma uma lista de imoveis para adicionar variaveis "dummy"
 * "uma variável dummy é aquela que leva apenas o valor 0 ou 1 para indicar a ausência ou
 * presença de algum efeito categórico que pode mudar o resultado."
 * @param {ImovelInput[]} imoveis
 * @returns Uma array de mesmo tamanho da array de input
 */
export const get_dummies = (imoveis: ImovelInput[]) => {
  const possible_vars: Set<string> = new Set(['preco_venda', 'preco_locacao']);

  for (const imovel of imoveis) {
    if (imovel.cidade_id && typeof imovel.cidade_id === 'string') possible_vars.add(`cidade_id_${imovel.cidade_id}`);

    if (imovel.estado_id && typeof imovel.estado_id === 'string') possible_vars.add(`estado_id_${imovel.estado_id}`);

    if (imovel.tipo) possible_vars.add(`tipo_${imovel.tipo}`);
  }

  for (const i_var of inconsistent_vars) {
    possible_vars.delete(i_var);
  }

  const dummy_names = Array.from(possible_vars);

  const imoveis_with_dummies = imoveis.map<ImovelInputWithDummies>((imovel) => {
    const imovel_with_dummies: ImovelInputWithDummies = { ...imovel };

    for (const dummy of dummy_names) {
      if (dummy.startsWith('cidade_id_')) {
        const dummy_value = imovel.cidade_id == dummy.replace('cidade_id_', '') ? 1 : 0;
        imovel_with_dummies[dummy] = dummy_value;
      }
      if (dummy.startsWith('estado_id_')) {
        const dummy_value = imovel.estado_id == dummy.replace('estado_id_', '') ? 1 : 0;
        imovel_with_dummies[dummy] = dummy_value;
      }
      if (dummy.startsWith('tipo_')) {
        const dummy_value = imovel.tipo == dummy.replace('tipo_', '') ? 1 : 0;
        imovel_with_dummies[dummy] = dummy_value;
      }
    }

    for (const i_var of inconsistent_vars) {
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

export const weight_by_dummy_names = (dummy_names: string[], sample_size: number): number[] =>
  dummy_names.map((name) => {
    if (name.startsWith('cidade_id_')) return 1 / sample_size;
    if (name.startsWith('estado_id_')) return 1 / sample_size;
    if (name.startsWith('tipo_')) return 1 / Math.abs(sample_size - dummy_names.length);
    if (name.startsWith('preco_locacao')) return 1;
    return 1;
  });
