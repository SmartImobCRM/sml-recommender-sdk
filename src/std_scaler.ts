import sum from "./sum";

/**
 * Standardize features by removing the mean and scaling to unit variance
 * The standard score of a sample x is calculated as:
 * z = (x - u) / s
 * @see https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.StandardScaler.html
 * @param matrix2D 
 */
export const std_scaler = (matrix2D: number[][]):number[][] => {
    const scaled_array:number[][] = []
    for (const row of matrix2D) {
        const scaled_row:number[] = []
        let column_index:number = 0;
        for (const item of row) {
            const column = matrix2D.map(row => row[column_index])
            const u = sum(column) / column.length
            const std_dev_inside = matrix2D.map(row => Math.abs(row[column_index] - u) ** 2)
            const s = Math.sqrt(sum(std_dev_inside) / matrix2D.length)
            scaled_row.push((item - u) / s)
            column_index++;
        }
        scaled_array.push(scaled_row)
    }
    return scaled_array
}

export default std_scaler