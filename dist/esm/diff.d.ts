export default diff;
export type Diff = string | DiffObject;
export type DiffObject = {
    operation: string;
    atom?: string;
};
/**
 * @param {Array<string>} A
 * @param {Array<string>} B
 * @param {(a: any, b: any) => boolean} [equals]
 */
declare function diff(A: Array<string>, B: Array<string>, equals?: (a: any, b: any) => boolean): Diff[];
