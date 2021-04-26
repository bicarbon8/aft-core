import { AbstractPlugin, IPluginOptions } from "./abstract-plugin";
import { PluginLoader } from "./plugin-loader";
import { nameof } from "ts-simple-nameof";
import { OptionsManager } from "../configuration/options-manager";

export interface IPluginManagerOptions {
    pluginNames?: string[];
}

/**
 * helper base class for use by classes that load in and manage a plugin
 * to provide integration with some external system.
 * NOTE: loading of only one plugin is supported by this base class and
 * the configuration key for it must always be `pluginNames`.
 * ex: `aftconfig.json`
 * ```
 * {
 *   "pluginmanagerclassname": {
 *     ...
 *     "pluginNames": [
 *       "./path/to/plugin",
 *       "/full/path/to/other/plugin"
 *     ]
 *     ...
 *   }
 * }
 * ```
 */
export abstract class AbstractPluginManager<T extends AbstractPlugin<Topts>, Topts extends IPluginOptions> {
    private _plugins: Map<string, T>;
    private _opts: Topts;

    readonly optionsMgr: OptionsManager;

    constructor(key: string, options?: Topts) {
        this._opts = options;
        this.optionsMgr = new OptionsManager(key, this._opts);
    }

    async getFirstEnabledPlugin(): Promise<T> {
        let plugins: T[] = await this.getPlugins();
        if (plugins?.length) {
            for (var i=0; i<plugins.length; i++) {
                let p: T = plugins[i];
                if (await p.enabled()) {
                    return p;
                }
            }
        }
        return null;
    }

    /**
     * loads the plugin that is specified either in the options passed
     * to the class constructor or within `aftconfig.json` section under a
     * property of `pluginNames` accepting an array of strings containing paths
     * to the plugin to be loaded. if no plugin is specified then nothing will
     * be loaded and `undefined` is returned
     */
    async getPlugins(): Promise<T[]> {
        if (!this._plugins) {
            await this._loadPlugins();
        }
        return Array.from(this._plugins.values());
    }

    private async _loadPlugins(): Promise<void> {
        this._plugins = new Map<string, T>();
        let pNames: string[] = await this.optionsMgr.getOption<string[]>(nameof<IPluginManagerOptions>(p => p.pluginNames));
        if (pNames?.length) {
            for (var i=0; i<pNames.length; i++) {
                let name: string = pNames[i];
                let p: T = await PluginLoader.load<T>(name, this._opts);
                if (p) {
                    this._plugins.set(p.constructor.name.toLowerCase(), p);
                }
            }
        }
    }
}