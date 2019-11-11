import { IDisposable } from "./idisposable";

export async function using<T extends IDisposable>(disposable: T, func: (disposable: T) => Promise<void>): Promise<void> {
    try {
        await func(disposable);
        await disposable.dispose();
    } catch (e) {
        await disposable.dispose(e);
        throw e;
    }
}