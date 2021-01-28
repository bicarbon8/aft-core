import { IPlugin } from "./iplugin";
import { OptionsManager } from "./options-manager";
import { PluginLoader } from "./plugin-loader";

/**
 * helper base class for use by classes that load in and manage a plugin
 * to provide integration with some external system.
 * NOTE: loading of only one plugin is supported by this base class and
 * the configuration key for it must always be `pluginName`.
 * ex: `aftconfig.json`
 * ```
 * {
 *   "someConfigOptions": {
 *     ...
 *     "pluginName": "./path/to/plugin"
 *     ...
 *   }
 * }
 * ```
 */
export abstract class PluginManager<T extends IPlugin, Tops> extends OptionsManager<Tops> {
    protected plugin: T;
    /**
     * loads the plugin that is specified either in the options passed
     * to the class constructor or within `aftconfig.json`. if no plugin
     * is specified then nothing will be loaded and `undefined` is returned
     */
    async getPlugin(): Promise<T> {
        if (!this.plugin) {
            let pName: string = await this.getOption('pluginName');
            if (pName) {
                this.plugin = await PluginLoader.load<T>(pName);
            }
        }
        return this.plugin;
    }
}