/**
 * interface should be implemented by classes that require
 * some disposal after their use. automatic disposal is
 * handled by using the `IDisposable` within the `using`
 * object like follows:
 * ```
 * async using(new ImplementsIDisposable(), async (disp) => {
 *     await disp.doSomethingAsync();
 *     disp.doSomethingSync();
 * });
 * ```
 * where the `dispose` function would be called
 * automatically upon completion or in the case of an
 * Error
 */
export interface IDisposable {
    dispose(error?: Error): Promise<void>;
}