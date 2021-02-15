import cos_similarity from "./cos_similarity"
import { get_dummies, prune_ids, weight_by_dummy_names } from "./features"
import std_scaler from "./std_scaler"
import { performance } from 'perf_hooks';

/**
 * @todo mais features
 * @todo discrepancia muito grande de preços, talvez remover os top 10% de cima e em baixo , ou usar somente imoveis enter o (preco do imovel - media), e (preco do imovel + media)
 */

/**
 * Função que retorna o id de imóveis similares
 * @todo performance né
 * @param imovel_std_matrix 
 */
export const imoveis_similares = (imovel_id:string, imoveis:any[], options?:{
    /**
     * Caso true, exibira console logs
     * @default false
     */
    debug?: boolean,
    /**
     * Numero de resultados retornados
     * @default 5
     */
    limit?: number,
    /**
     * Numero entre -1 e 1, simbolizando a similaridade entre os resultados
     * @default -1
     */
    percentage_threshold?: number
    /**
     * Ativar um medidor de performance
     */
    performance?: boolean
}):{
    ids: string[],
    ids_with_simi: [string, number][],
    ids_with_vector: [string, number[]][],
    ids_simi_vec:[string, number, number[]][],
    weights: number[],
    input_vector: number[],
    output_top_vector: number[]
    output_top_simi: number,
    output_top_id: string,
    perf: number | null,
    dummy_names: string[]
} => {
    let perf = 0;
    if (options?.performance) perf = performance.now();
    const { imoveis_with_dummies, dummy_names } = get_dummies(imoveis)
    const ws = weight_by_dummy_names(dummy_names, imoveis.length)
    const id = imoveis.findIndex(imovel => imovel.ID == imovel_id)
    const imoveis_to_std = imoveis_with_dummies.map(prune_ids)
    const imoveis_std = std_scaler(imoveis_to_std)
    
    if (options?.debug) {
        console.log('weight_by_dummy_names:', ws.join(', '))
    }

    let i:number = 0;
    const id_simi_vec:[string, number, number[]][] = []
    for (const iterator of imoveis_std) {
        const imovel = imoveis[i]
        const simi = cos_similarity(imoveis_std[id], iterator, ws);
        id_simi_vec.push([imovel.ID, simi === false ? -1 : simi, iterator])
        i++
    }

    const top_similares = id_simi_vec.sort((a, b) => b[1] - a[1] )
    const threshold = options?.percentage_threshold || -1;

    if (options?.debug) {
        console.log('top_similares', top_similares)
        console.log('threshold', threshold)
    }

    const imoveis_in_threshold = top_similares.filter(imovel => imovel[1] > threshold).slice(0, options?.limit || 5);
    
    return {
        ids: imoveis_in_threshold.map(imovel => imovel[0]),
        ids_simi_vec: imoveis_in_threshold,
        ids_with_simi: imoveis_in_threshold.map(imovel => [imovel[0], imovel[1]]),
        ids_with_vector: imoveis_in_threshold.map(imovel => [imovel[0], imovel[2]]),
        weights: ws,
        dummy_names,
        perf: options?.performance ? performance.now() - perf : null,
        input_vector: imoveis_std[id],
        output_top_vector: imoveis_in_threshold[0][2],
        output_top_simi: imoveis_in_threshold[0][1],
        output_top_id: imoveis_in_threshold[0][0],
    }
}

export default {
    imoveis_similares
}