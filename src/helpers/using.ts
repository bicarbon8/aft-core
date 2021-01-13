import { Func } from "./func";
import { IDisposable } from "./idisposable";

/**
 * function will execute a passed in function passing in the supplied `IDisposable`
 * and then calling the `dispose` method on the `IDisposable` when execution of the 
 * function is done.
 * Usage Example:
 * ```
 * await using(new ImplementsIDisposable(), async (disposable) => {
 *   await disposable.interact();
 *   // do stuff...
 * });
 * ```
 * @param disposable object implementing the `IDisposable` interface
 * @param func a function to be passed the `IDisposable` for use before disposal
 */
export async function using<T extends IDisposable>(disposable: T, func: Func<T, void | Promise<void>>): Promise<void> {
    let err: Error = null;
    try {
        await Promise.resolve(func(disposable));
    } catch (e) {
        err = e;
        throw e;
    } finally {
        await disposable.dispose(err);
    }
}