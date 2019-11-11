export interface IDisposable {
    dispose(error?: Error): Promise<void>;
}