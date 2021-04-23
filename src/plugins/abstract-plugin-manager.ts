import { nameof } from "ts-simple-nameof";
import { IPlugin } from "./iplugin";
import { OptionsManager } from "../configuration/options-manager";
import { IPluginManagerOptions } from "./iplugin-manager-options";
import { PluginLoader } from "./plugin-loader";

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
export abstract class AbstractPluginManager<T extends IPlugin, Tops> extends OptionsManager<Tops> {
    private _plugins: Map<string, T>;

    /**
     * loads the plugin that is specified either in the options passed
     * to the class constructor or within `aftconfig.json` section under a
     * property of `pluginNames` accepting an array of strings containing paths
     * to the plugin to be loaded. if no plugin is specified then nothing will
     * be loaded and `undefined` is returned
     */
    async getPlugins(options?: Tops): Promise<T[]> {
        if (!options) {
            options = this._options;
        }
        if (!this._plugins) {
            await this._loadPlugins(options);
        }
        return Array.from(this._plugins.values());
    }

    private async _loadPlugins(options?: Tops): Promise<void> {
        this._plugins = new Map<string, T>();
        let pNames: string[] = await this.getOption<string[]>(nameof<IPluginManagerOptions>(p => p.pluginNames));
        if (pNames?.length) {
            for (var i=0; i<pNames.length; i++) {
                let name: string = pNames[i];
                let p: T = await PluginLoader.load<T>(name, options);
                this._plugins.set(p.name, p);
            }
        }
    }
}