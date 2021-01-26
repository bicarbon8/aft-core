/**
 * allows for creation of functions that can create new instances of
 * generic types. Ex:
 * ```
 * function get<T>(type: Constructor<T>, ...args: any[]): T {
 *     return new type(...args);
 * }
 * ```
 * which can then be used like:
 * ```
 * let obj: CustomObj = get(CustomObj, 'foo', 123);
 * ```
 * assuming that `CustomObj` looks like:
 * ```
 * class CustomObj {
 *     someStr: string;
 *     someNum: number;
 *     constructor(inputStr: string, inputNum: number) {
 *         this.someStr = inputStr;
 *         this.someNum = inputNum;
 *     }
 * }
 * ```
 */
export type Constructor<T> = {
    new (...args: any[]): T;
    readonly prototype: T;
}