/**
 * interface to be implemented by any class
 * that needs to override the cloning process
 * used by `Cloner.clone`. if implemented,
 * the `ICloneable.clone` function will be called
 * instead of the `Cloner` attempting to clone
 * on it's own
 */
export interface ICloneable {
    clone(): object;
}