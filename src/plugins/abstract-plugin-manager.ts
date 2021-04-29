import { AbstractPlugin, IPluginOptions } from "./abstract-plugin";
import { pluginLoader } from "./plugin-loader";
import { nameof } from "ts-simple-nameof";
import { OptionsManager } from "../configuration/options-manager";

/**
 * base interface that must be implemented by {options} objects
 * passed to the constructor of {AbstractPluginManager} implementations
 */
export interface IPluginManagerOptions {
    /**
     * Required either in `aftconfig.json` file section for the Plugin Manager
     * or to be passed in directly to the Plugin Manager's constructor
     */
    pluginNames?: string[];
    /**
     * [OPTIONAL] if none specified a new {OptionsManager} will be created
     * in the constructor to manage options from either `aftconfig.json` or
     * via the passed in values
     */
    _optMgr?: OptionsManager;
}

/**
 * base class for use by classes that load in and manage plugins.
 * the {AbstractPluginManager} instances should specify their
 * plugin names to be loaded in the passed in {options} object
 * or in the `aftconfig.json` file.
 * 
 * ex: `PluginManagerClassInstance`
 * ```typescript
 * export interface SomePluginInstanceOptions extends IPluginOptions {
 *     foo?: string;
 *     bar?: boolean;
 * }
 * export interface PluginManagerClassInstanceOptions extends IPluginManagerOptions, SomePluginInstanceOptions {
 * 
 * }
 * export class PluginManagerClassInstance extends AbstractPluginManager<SomePluginInstance, SomePluginInstanceOptions> {
 *     constructor(options?: PluginManagerClassInstanceOptions) {
 *         super('pluginmanagerclassinstance', options);
 *     }
 * }
 * ```
 * ex: `aftconfig.json`
 * ```json
 * {
 *   "pluginmanagerclassinstance": {
 *     ...
 *     "pluginNames": [
 *       "./path/to/plugin",
 *       "/full/path/to/other/plugin"
 *     ],
 *     "foo": "specify 'foo' for loaded plugin instances",
 *     "bar": false
 *     ...
 *   }
 * }
 * ```
 * NOTE: the `PluginManagerClassInstance` will load plugins listed in the `pluginNames` array
 * and pass them any additional {options} specified (in this case the values for `foo` and `bar`)
 */
export abstract class AbstractPluginManager<T extends AbstractPlugin<Topts>, Topts extends IPluginOptions> {
    private _plugins: Map<string, T>;
    private _opts: Topts;

    readonly optionsMgr: OptionsManager;

    constructor(key: string, options?: Topts) {
        this._opts = options;
        this.optionsMgr = this._opts?._optMgr || new OptionsManager(key, this._opts);
    }

    async getFirstEnabledPlugin(): Promise<T> {
        let plugins: T[] = await this.getEnabledPlugins();
        if (plugins?.length) {
            return plugins[0];
        }
        return null;
    }

    async getEnabledPlugins(): Promise<T[]> {
        let enabled: T[] = [];
        let plugins: T[] = await this.getPlugins();
        if (plugins?.length) {
            for (var i=0; i<plugins.length; i++) {
                let p: T = plugins[i];
                if (await p.enabled()) {
                    enabled.push(p);
                }
            }
        }
        return enabled;
    }

    /**
     * loads and caches the plugins specified either in the options passed
     * to the class constructor or within `aftconfig.json` section under a
     * property of `pluginNames` accepting an array of strings containing paths
     * to the plugin to be loaded. if no plugin is specified then nothing will
     * be loaded and `undefined` is returned
     */
    async getPlugins(): Promise<T[]> {
        if (!this._plugins) {
            this._plugins = await this._loadPlugins();
        }
        return Array.from(this._plugins.values());
    }

    private async _loadPlugins(): Promise<Map<string, T>> {
        let plugins = new Map<string, T>();
        let pNames: string[] = await this.optionsMgr.getOption<string[]>(nameof<IPluginManagerOptions>(p => p.pluginNames));
        if (pNames?.length) {
            for (var i=0; i<pNames.length; i++) {
                let name: string = pNames[i];
                let p: T = await pluginLoader.load<T>(name, this._opts);
                if (p) {
                    plugins.set(p.constructor.name, p);
                }
            }
        }
        return plugins;
    }
}