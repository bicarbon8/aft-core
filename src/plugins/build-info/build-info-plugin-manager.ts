import { AbstractPluginManager } from "../abstract-plugin-manager";
import { Logger } from "../../logging/logger";
import { IBuildInfoPlugin } from "./ibuild-info-plugin";
import { IPluginManagerOptions } from "../iplugin-manager-options";

export interface BuildInfoPluginManagerOptions extends IPluginManagerOptions {
    logger?: Logger;
}

/**
 * loads and provides an interface between any `IBuildInfoPlugin`
 * to specify a plugin use the following `aftconfig.json` key:
 * ```
 * {
 *   ...
 *   "buildinfopluginmanager": {
 *     "pluginNames": ["plugin-name"]
 *   }
 *   ...
 * }
 * ```
 */
export class BuildInfoPluginManager extends AbstractPluginManager<IBuildInfoPlugin, BuildInfoPluginManagerOptions> {
    private _logger: Logger;

    constructor(options?: BuildInfoPluginManagerOptions) {
        super(options);
        this._logger = options?.logger || new Logger({name: 'BuildInfoPluginManager', pluginNames: []});
    }

    async getBuildName(): Promise<string> {
        return await this.getPlugins()
        .then(async (plugins) => {
            for (var i=0; i<plugins.length; i++) {
                let p: IBuildInfoPlugin = plugins[i];
                if (p && await p.isEnabled()) {
                    return await p.getBuildName();
                }
            }
            return null;
        }).catch(async (err) => {
            await this._logger.warn(err);
            return null;
        });
    }

    async getBuildNumber(): Promise<string> {
        return await this.getPlugins()
        .then(async (plugins) => {
            for (var i=0; i<plugins.length; i++) {
                let p: IBuildInfoPlugin = plugins[i];
                if (p && await p.isEnabled()) {
                    return await p.getBuildNumber();
                }
            }
            return null;
        }).catch(async (err) => {
            await this._logger.warn(err);
            return null;
        });
    }
}

export module BuildInfoPluginManager {
    var _inst: BuildInfoPluginManager = null;
    export function instance(): BuildInfoPluginManager {
        if (_inst === null) {
            _inst = new BuildInfoPluginManager();
        }
        return _inst;
    }
}