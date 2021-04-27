import { aftconfigMgr } from "./aftconfig-manager";

/**
 * **WARNING**
 * 
 * DO NOT USE FOR COMPLEX CLASSES! ONLY SIMPLE JSON OBJECTS
 * SUPPORTED
 * 
 * manages the retrieval of options based on either a passed
 * in set of options or by looking in the `aftconfig.json` section
 * specified by the {key} passed to the constructor followed by any
 * specified {keys} passed to the {getOption} function. For example
 * in the following `aftconfig.json` snippet:
 * ```json
 * {
 *   ...
 *   "key": {
 *     "foo": "this is 'key.foo'",
 *     "bar": true,
 *     "baz": {
 *       "foo": "this is 'key.baz.foo'"
 *     }
 *   }
 *   ...
 * }
 * ```
 */
export class OptionsManager {
    readonly key: string;

    private _options: {};

    constructor(key: string, options?: {}) {
        this.key = key;
        // ensure this is purely a plain object with no functions
        this._options = JSON.parse(JSON.stringify(options || {}));
    }

    /**
     * function will lookup a value from the optional options passed to the class
     * and if not found will then check for the same in the `aftconfig.json` under
     * the configuration key specified by the Class name (all lowercase) plus the
     * passed in `keys`
     * @param keys the lookup keys to be used to retrieve a value
     * @param defaultVal a default value to return in the case that no value is found
     */
    async getOption<Tval>(keys: string, defaultVal?: Tval): Promise<Tval> {
        let val: Tval = await aftconfigMgr.getFrom<Tval>(this._options, keys);
        if (val === undefined) {
            val = await aftconfigMgr.get<Tval>(`${this.key}.${keys}`, defaultVal);
        }
        return val;
    }
}