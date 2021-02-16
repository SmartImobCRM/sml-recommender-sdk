import cos_similarity from './cos_similarity';
import { get_dummies, get_features_imovel, ImovelInputWithDummies, prune_ids, weight_by_dummy_names } from './imoveis_features';
import std_scaler from './std_scaler';
import { performance } from 'perf_hooks';
import { visitas_weight, Visitante, Visita } from './visitantes_features';

/**
 * Função que retorna o id de imóveis similares
 * @fires [get_dummies,std_scaler] Para uma performance melhor e funções mais flexiveis use uma "factory"
 * @param {string} imovel_id Id do imóvel a procura do par perfeito <3
 * @param imoveis Array de imóveis, devem estar sanitizados com a função "get_features_imovel"
 * @param options Opções da extras da função (logs, debuggar performance, alterar o limite de resultados, e alterar a threshold minima de semelhança nos resultas)
 * @example
 * imoveis_similares_por_id('id_de_imovel', array_de_imoveis)
 */
export const imoveis_similares = (
  imovel_input: string | number[],
  imoveis: any[],
  options?: ImoveisSemelhantesOptions,
): {
  ids: string[];
  ids_with_simi: [string, number][];
  ids_with_vector: [string, number[]][];
  ids_simi_vec: [string, number, number[]][];
  weights: number[];
  input_vector: number[];
  output_top_vector: number[];
  output_top_simi: number;
  output_top_id: string;
  perf: number | null;
  dummy_names: string[];
} => {
  let perf = 0;
  if (options?.performance) perf = performance.now();
  // Inicio da inicialização dos imóveis
  /**
   * Criar variaveis "dummy", para variaveis que não são números,
   * por exemplo: Tipo
   * Imóveis possuem um atributo tipo que contem uma string, essa função
   * cria uma matriz onde cada possivel valor de tipo vira uma coluna
   *
   *     ID tipo_Apartamento tipo_Casa tipo_Duplex
   *   0 x  1                0         0
   *   1 y  0                1         0
   *   2 z  1                0         0
   */
  const { imoveis_with_dummies, dummy_names } = get_dummies(imoveis);
  /**
   * Gera uma lista de "pesos" para cada variavel dummy, essa função talvez possa ser otimizada com hyperparametros
   */
  const ws = weight_by_dummy_names(dummy_names, imoveis.length);
  // Remover o campo ID da lista de imóveis com variaveis dummy
  const imoveis_to_std = imoveis_with_dummies.map(prune_ids);
  // Standarização das colunas
  const imoveis_std = std_scaler(imoveis_to_std);

  // Fim da inicialização dos imóveis

  let imovel_vec: number[] = [];
  if (typeof imovel_input === 'string') {
    // Index do imóvel em questão
    const index = imoveis.findIndex((imovel) => imovel.ID == imovel_input);
    if (options?.debug) {
      console.log('imovel index found', index);
    }
    imovel_vec = imoveis_std[index];
  } else {
    imovel_vec = imovel_input;
  }

  if (options?.debug) {
    console.log('imovel_vec', imovel_vec);
    console.log('weight_by_dummy_names:', ws.join(', '));
  }

  /**
   * Calcula a similaridade de todos os imóveis com o imóvel em questão
   */
  let i: number = 0;
  const id_simi_vec: [string, number, number[]][] = [];
  for (const imovel_std of imoveis_std) {
    const imovel = imoveis[i];
    const simi = cos_similarity(imovel_vec, imovel_std, ws);
    id_simi_vec.push([imovel.ID, simi === false ? -1 : simi, imovel_std]);
    i++;
  }

  let top_similares = id_simi_vec.sort((a, b) => b[1] - a[1]);
  const threshold = options?.percentage_threshold || -1;

  if (options?.debug) {
    console.log('top_similares', top_similares);
    console.log('threshold', threshold);
  }

  if (options?.from_visitante) {
    const imoveis_ja_vistos =
      options.from_visitante.visitas[options.from_visitante.visitas.length - 1].imoveis_visitados;
    top_similares = top_similares.filter((imovel) => !imoveis_ja_vistos.includes(imovel[0]));
  }

  const imoveis_in_threshold = top_similares.filter((imovel) => imovel[1] > threshold).slice(0, options?.limit || 5);

  return {
    ids: imoveis_in_threshold.map((imovel) => imovel[0]),
    ids_simi_vec: imoveis_in_threshold,
    ids_with_simi: imoveis_in_threshold.map((imovel) => [imovel[0], imovel[1]]),
    ids_with_vector: imoveis_in_threshold.map((imovel) => [imovel[0], imovel[2]]),
    weights: ws,
    dummy_names,
    perf: options?.performance ? performance.now() - perf : null,
    input_vector: imovel_vec,
    output_top_vector: imoveis_in_threshold[0][2],
    output_top_simi: imoveis_in_threshold[0][1],
    output_top_id: imoveis_in_threshold[0][0],
  };
};

/**
 * Gera um imóvel (vetor) "ideal" para o visitante baseado nos imóveis visitados por ele no passado
 * @fires [get_dummies,std_scaler] Para uma performance melhor e funções mais flexiveis use uma "factory"
 * @todo tratar imóveis que não existem no banco
 * @param visitante Visitante que tera o historico analizado
 * @param imoveis Imoveis em que a procura vai acontecer
 * @example
 *
 * const visitante = {
 *     visitas: [
 *       { imoveis_visitados: ['BGez8euD36rlZHSmZgPa'], time_fim_visita: 1605367097992, time_inicio_visita: 1605366954950 },
 *       { imoveis_visitados: ['ImJO54R6XEccBjdz8FPQ', 'ExW26iGqhb71LCoI3N4Z'], time_fim_visita: 1609701821601, time_inicio_visita: 1609701572716 },
 *       { imoveis_visitados: ['vtYrF0QIzQnep6xkzOvB'], time_fim_visita: 1609701960194, time_inicio_visita: 1609701842242 },
 *     ]
 * }
 *
 * const imoveis = imoveis_db.map(get_features_imovel)
 *
 * const ideal_vec = visitante_imovel_ideal_vec(visitante, imoveis)
 *
 * const { ids_with_simi } = imoveis_similares(ideal_vec, imoveis, { limit: 4, percentage_threshold: 0.8, from_visitante: visitante });
 *
 * console.log(ids_with_simi); // Imóveis com semelhança acima de 80% dos imóveis que esse visitante viu
 */
export const visitante_imovel_ideal_vec = (visitante: Visitante, imoveis: any[]): number[] => {
  // Inicio da inicialização dos imóveis
  /**
   * Criar variaveis "dummy", para variaveis que não são números,
   * por exemplo: Tipo
   * Imóveis possuem um atributo tipo que contem uma string, essa função
   * cria uma matriz onde cada possivel valor de tipo vira uma coluna
   *
   *     ID tipo_Apartamento tipo_Casa tipo_Duplex
   *   0 x  1                0         0
   *   1 y  0                1         0
   *   2 z  1                0         0
   */
  const { imoveis_with_dummies } = get_dummies(imoveis);

  // Remover o campo ID da lista de imóveis com variaveis dummy
  const imoveis_to_std = imoveis_with_dummies.map(prune_ids);
  // Standarização das colunas
  const imoveis_std = std_scaler(imoveis_to_std);

  // Fim da inicialização dos imóveis

  const vw = visitas_weight(visitante.visitas);

  let ideal_vec: number[] = [];
  for (const [imovel_id, weight] of vw) {
    // Index do imóvel em questão
    const id = imoveis.findIndex((imovel) => imovel.ID == imovel_id);
    const imovel_vec = imoveis_std[id];

    const weighted_vec = imovel_vec.map((item) => item * weight);

    if (ideal_vec.length === 0) {
      ideal_vec = weighted_vec;
    } else {
      ideal_vec = ideal_vec.map((item, i) => item + weighted_vec[i]);
    }
  }

  return ideal_vec;
};

type FactoryOptions = {
  /**
   * Caso true, exibirá console logs
   * @default false
   */
  debug?: boolean;

  /**
   * Ativar um medidor de performance
   * @default false
   */
  performance?: boolean;
  /**
   * As defaults foras as weights usadas nos testes iniciais, as alts são weights não testadas mas teoricamente melhores
   */
  weights_calc_type: 'default' | 'alt'
};
type FactoryConfig = {
  imoveis: any[];
  options?: FactoryOptions;
};
/**
 * Uma "Factory" é usada para armazenar os imóveis e criar recomendações baseadas nesses imóveis
 * Usar factories é melhor pelo ganho em performance, elas ativam as funções get_dummies, prune_ids, std_scaler
 * apenas uma vez durante a inicialização e quando a lista de imóveis é atualizada
 * Várias factories podem ser usadas para varias listas de imóveis dessa forma facilitando a recomendação em servidores
 * que precisam recomendar baseado em diferentes informações
 *
 * @param imoveis Lista de imóveis para serem usados nas recomendações
 * @param options
 * @example
 * const f1 = new Factory({imoveis})
 * f1.imoveis_recomendados_para_visitante(visitante)
 * @implements "visitante_imovel_ideal_vec e imoveis_similares" Caso tenha dúvidas sobre essas funções confira os comentários nas funções fora da factory
 */
export class Factory {
  private imoveis: any[];
  private imoveis_std: number[][];
  private imoveis_to_std: number[][];
  private imoveis_with_dummies: ImovelInputWithDummies[];
  public dummy_names: string[];
  public dummy_ws: number[];
  public last_recalc_perf: number | null;
  public options?: FactoryOptions;
  constructor({ imoveis, options }: FactoryConfig) {
    this.imoveis = imoveis;
    this.options = options;
    let perf = 0;
    if (options?.performance) perf = performance.now();

    const { imoveis_with_dummies, dummy_names } = get_dummies(imoveis);

    /**
     * Gera uma lista de "pesos" para cada variavel dummy, essa função talvez possa ser otimizada com hyperparametros
     */
    this.dummy_ws = weight_by_dummy_names(dummy_names, imoveis.length, this.options?.weights_calc_type);

    this.imoveis_to_std = imoveis_with_dummies.map(prune_ids);
    this.imoveis_std = std_scaler(this.imoveis_to_std);
    this.imoveis_with_dummies = imoveis_with_dummies;
    this.dummy_names = dummy_names;

    this.last_recalc_perf = options?.performance ? performance.now() - perf : null;
  }
  visitante_imovel_ideal_vec(visitante: Visitante) {
    const vw = visitas_weight(visitante.visitas);

    let ideal_vec: number[] = [];
    for (const [imovel_id, weight] of vw) {
      // Index do imóvel em questão
      const id = this.imoveis.findIndex((imovel) => imovel.ID == imovel_id);
      const imovel_vec = this.imoveis_std[id];

      const weighted_vec = imovel_vec.map((item) => item * weight);

      if (ideal_vec.length === 0) {
        ideal_vec = weighted_vec;
      } else {
        ideal_vec = ideal_vec.map((item, i) => item + weighted_vec[i]);
      }
    }

    return ideal_vec;
  }
  recalc_imoveis(imoveis: any[]) {
    let perf = 0;
    if (this.options?.performance) perf = performance.now();
    const { imoveis_with_dummies, dummy_names } = get_dummies(imoveis);

    /**
     * Gera uma lista de "pesos" para cada variavel dummy, essa função talvez possa ser otimizada com hyperparametros
     */
    const dummy_ws = weight_by_dummy_names(dummy_names, imoveis.length, this.options?.weights_calc_type);

    const imoveis_to_std = imoveis_with_dummies.map(prune_ids);
    const imoveis_std = std_scaler(imoveis_to_std);

    this.dummy_ws = dummy_ws;
    this.imoveis_to_std = imoveis_to_std;
    this.imoveis_std = imoveis_std;
    this.imoveis_with_dummies = imoveis_with_dummies;
    this.dummy_names = dummy_names;
    this.last_recalc_perf = this.options?.performance ? performance.now() - perf : null;
    this.imoveis = imoveis;
  }
  imoveis_similares(imovel_input: string | number[], options?: ImoveisSemelhantesOptions) {
    let perf = 0;
    if (options?.performance) perf = performance.now();

    let imovel_vec: number[] = [];
    if (typeof imovel_input === 'string') {
      // Index do imóvel em questão
      const index = this.imoveis.findIndex((imovel) => imovel.ID == imovel_input);
      if (options?.debug) {
        console.log('imovel index found', index);
      }
      imovel_vec = this.imoveis_std[index];
    } else {
      imovel_vec = imovel_input;
    }

    if (options?.debug) {
      console.log('imovel_vec', imovel_vec);
      console.log('weight_by_dummy_names:', this.dummy_ws.join(', '));
    }

    /**
     * Calcula a similaridade de todos os imóveis com o imóvel em questão
     */
    let i: number = 0;
    const id_simi_vec: [string, number, number[]][] = [];
    for (const imovel_std of this.imoveis_std) {
      const imovel = this.imoveis[i];
      const simi = cos_similarity(imovel_vec, imovel_std, this.dummy_ws);
      id_simi_vec.push([imovel.ID, simi === false ? -1 : simi, imovel_std]);
      i++;
    }

    let top_similares = id_simi_vec.sort((a, b) => b[1] - a[1]);
    const threshold = options?.percentage_threshold || -1;

    if (options?.debug) {
      console.log('top_similares', top_similares);
      console.log('threshold', threshold);
    }

    if (options?.from_visitante) {
      const imoveis_ja_vistos =
        options.from_visitante.visitas[options.from_visitante.visitas.length - 1].imoveis_visitados;
      top_similares = top_similares.filter((imovel) => !imoveis_ja_vistos.includes(imovel[0]));
    }

    const imoveis_in_threshold = top_similares.filter((imovel) => imovel[1] > threshold).slice(0, options?.limit || 5);

    return {
      ids: imoveis_in_threshold.map((imovel) => imovel[0]),
      ids_simi_vec: imoveis_in_threshold,
      ids_with_simi: imoveis_in_threshold.map((imovel) => [imovel[0], imovel[1]]),
      ids_with_vector: imoveis_in_threshold.map((imovel) => [imovel[0], imovel[2]]),
      weights: this.dummy_ws,
      dummy_names: this.dummy_names,
      perf: options?.performance ? performance.now() - perf : null,
      input_vector: imovel_vec,
      output_top_vector: imoveis_in_threshold[0][2],
      output_top_simi: imoveis_in_threshold[0][1],
      output_top_id: imoveis_in_threshold[0][0],
    };
  }
  imoveis_recomendados_para_visitante(visitante: Visitante, options?: ImoveisSemelhantesOptions) {
    const ideal_vec = this.visitante_imovel_ideal_vec(visitante);
    return this.imoveis_similares(ideal_vec, options);
  }
  imoveis_semelhantes_por_id(imovel_id: string, options?: ImoveisSemelhantesOptions) {
    return this.imoveis_similares(imovel_id, options);
  }
  imoveis_semelhantes_por_vetor(imovel_input: number[], options?: ImoveisSemelhantesOptions) {
    return this.imoveis_similares(imovel_input, options);
  }
}

interface ImoveisSemelhantesOptions {
  /**
   * Caso true, exibirá console logs
   * @default false
   */
  debug?: boolean;
  /**
   * Número de resultados retornados
   * @default 5
   */
  limit?: number;
  /**
   * Número entre -1 e 1, simbolizando a similaridade entre os resultados
   * @default -1
   */
  percentage_threshold?: number;
  /**
   * Ativar um medidor de performance
   */
  performance?: boolean;
  /**
   * Caso essa função esteja sendo usada para recomendar imóveis para um visitante
   * Caso esteja ativada os imóveis da visita mais recente do visitante não apareceram como recomendações
   */
  from_visitante?: Visitante;
}

export const extract_features = get_features_imovel

export default {
  imoveis_similares,
  visitante_imovel_ideal_vec,
  Factory,
  createFactory: (params:FactoryConfig) => new Factory(params),
  extract_features
};
