export interface Func<T, TResult> {
    (item: T): TResult;
}