import { nameof } from "ts-simple-nameof";
import { OptionsManager } from "../configuration/options-manager";
import { IDisposable } from "../helpers/idisposable";

/**
 * a base options object that must be implemented by any
 * Plugin implementation's constructor options
 */
export interface IPluginOptions {
    /**
     * [OPTIONAL] if not provided, will default to value in `aftconfig.json` or `true`
     */
    enabled?: boolean;
    /**
     * [OPTIONAL] if not provided a new {OptionsManager} will be created
     */
    _optMgr?: OptionsManager;
}

/**
 * base class to be extended by any Plugin implementation.
 * 
 * NOTE:
 * * the `onLoad` function is called automatically after the plugin instance is created
 * * the `dispose` function is only called if the plugin is used within a {using} call
 * ```
 * await using(pluginInstance, (plugin) => {
 *     plugin.doStuff();
 * }); // `plugin.dispose` is called here
 * ```
 */
export abstract class AbstractPlugin<T extends IPluginOptions> implements IDisposable {
    private _enabled: boolean;
    readonly optionsMgr: OptionsManager;
    constructor(key: string, options?: T) {
        this.optionsMgr = new OptionsManager(key, options);
    }
    async enabled(): Promise<boolean> {
        if (this._enabled === undefined) {
            this._enabled = await this.optionsMgr.getOption(nameof<IPluginOptions>(p => p.enabled), true);
        }
        return this._enabled;
    }
    abstract onLoad(): Promise<void>;
    abstract dispose(error?: Error): Promise<void>;
}