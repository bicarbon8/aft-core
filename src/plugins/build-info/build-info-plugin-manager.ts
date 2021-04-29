import { AbstractPluginManager, IPluginManagerOptions } from "../abstract-plugin-manager";
import { LoggingPluginManager } from "../logging/logging-plugin-manager";
import { AbstractBuildInfoPlugin, IBuildInfoPluginOptions } from "./ibuild-info-plugin";
import { nameof } from "ts-simple-nameof";

export interface IBuildInfoPluginManagerOptions extends IBuildInfoPluginOptions, IPluginManagerOptions {
    _logMgr?: LoggingPluginManager;
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
export class BuildInfoPluginManager extends AbstractPluginManager<AbstractBuildInfoPlugin, IBuildInfoPluginOptions> {
    private _logMgr: LoggingPluginManager;

    constructor(options?: IBuildInfoPluginManagerOptions) {
        super(nameof(BuildInfoPluginManager).toLowerCase(), options);
        this._logMgr = options?._logMgr || new LoggingPluginManager({logName: nameof(BuildInfoPluginManager), pluginNames: []});
    }

    async getBuildName(): Promise<string> {
        return await this.getFirstEnabledPlugin()
        .then(async (plugin) => {
            return await plugin?.getBuildName();
        }).catch(async (err) => {
            await this._logMgr.warn(err);
            return null;
        });
    }

    async getBuildNumber(): Promise<string> {
        return await this.getFirstEnabledPlugin()
        .then(async (plugin) => {
            return await plugin?.getBuildNumber();
        }).catch(async (err) => {
            await this._logMgr.warn(err);
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