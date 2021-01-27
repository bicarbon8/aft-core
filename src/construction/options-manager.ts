import { TestConfig } from "../configuration/test-config";

/**
 * base class to use for any classes that allow configuration
 * options to be passed in to the constructor or specified in
 * the `aftconfig.json`. provides a helpful `getOption` function
 * that will first look for the specified option in the passed
 * in options and if not found there will then check in the
 * `aftconfig.json` section specified by the `getOptionsConfigurationKey`
 * function
 */
export abstract class OptionsManager<T> {
    protected options: T;

    constructor(options?: T) {
        this.options = options || {} as T;
    }

    /**
     * when retrieving configuration from `aftconfig.json` this
     * value is used to retrieve an options object matching the
     * specified type `T`
     */
    abstract getOptionsConfigurationKey(): string;

    /**
     * function will lookup a value from the optional options passed to the class
     * and if not found will then check for the same in the `aftconfig.json` under
     * the configuration key specified by `getOptionsConfigurationKey` plus the
     * passed in `keys`
     * @param keys the lookup keys to be used to retrieve a value
     * @param defaultVal a default value to return in the case that no value is found
     */
    protected async getOption<Tval>(keys: string, defaultVal?: Tval): Promise<Tval> {
        let val: Tval = await TestConfig.getFrom(this.options, keys);
        if (!val) {
            val = await TestConfig.get<Tval>(`${this.getOptionsConfigurationKey()}.${keys}`, defaultVal);
        }
        return val;
    }
}