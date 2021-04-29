/**
 * Type to represent any function accepting a single argument
 * of type `T` that returns void. an alternative to writing:
 * ```
 * (input: T): void
 * ```
 */
export type Action<T> = {
    (item: T): void;
}

/**
 * allows for creation of functions that can create new instances of
 * generic types. Ex:
 * ```
 * function get<T>(type: Clazz<T>, ...args: any[]): T {
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
export type Clazz<T> = {
    new (...args: any[]): T;
    readonly prototype: T;
}

/**
 * Type representing a function accepting a single input
 * of type `T` and returning a result of type `TResult`.
 * an alternative to writing:
 * ```
 * (input: T): TResult
 * ```
 */
export type Func<T, TResult> = {
    (item: T): TResult;
}