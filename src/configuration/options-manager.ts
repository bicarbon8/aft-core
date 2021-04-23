import { config } from "./config-loader";

/**
 * base class to use for any classes that allow configuration
 * options to be passed in to the constructor or specified in
 * the `aftconfig.json`. provides a helpful `getOption` function
 * that will first look for the specified option in the passed
 * in options and if not found there will then check in the
 * `aftconfig.json` section specified by the Class name (all lowercase)
 */
export abstract class OptionsManager<T> {
    protected _options: T;
    readonly key: string;

    constructor(options?: T) {
        this._options = options || {} as T;
        this.key = this.constructor.name.toLowerCase();
    }

    /**
     * function will lookup a value from the optional options passed to the class
     * and if not found will then check for the same in the `aftconfig.json` under
     * the configuration key specified by the Class name (all lowercase) plus the
     * passed in `keys`
     * @param keys the lookup keys to be used to retrieve a value
     * @param defaultVal a default value to return in the case that no value is found
     */
    protected async getOption<Tval>(keys: string, defaultVal?: Tval): Promise<Tval> {
        let val: Tval = await config.getFrom(this._options, keys);
        if (!val) {
            val = await config.get<Tval>(`${this.key}.${keys}`, defaultVal);
        }
        return val;
    }
}