/**
 * Type to represent any function accepting a single argument
 * of type `T` that returns void. an alternative to writing:
 * ```
 * (input: T): void
 * ```
 */
export interface Action<T> {
    (item: T): void;
}