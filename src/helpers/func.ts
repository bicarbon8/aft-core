/**
 * Type representing a function accepting a single input
 * of type `T` and returning a result of type `TResult`.
 * an alternative to writing:
 * ```
 * (input: T): TResult
 * ```
 */
export interface Func<T, TResult> {
    (item: T): TResult;
}