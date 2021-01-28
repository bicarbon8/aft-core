/**
 * this interface should be extended from by any
 * interfaces used to define configuration options
 * expected to be passed to the constructor or loaded
 * from `aftconfig.json` in classes extending the
 * `OptionsManager` abstract class
 */
export interface IPluginManagerOptions {
    pluginName?: string;
}