import mean from "./mean";
import sum from "./sum";

export const std_deviation = (n_array: number[]) => {
    const n_mean = mean(n_array);
    return Math.sqrt( sum(n_array.map(n => Math.abs( n - n_mean) ** 2)) / n_array.length)
}

export default std_deviation