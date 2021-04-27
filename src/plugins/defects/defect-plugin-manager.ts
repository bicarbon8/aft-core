import { AbstractPluginManager, IPluginManagerOptions } from "../abstract-plugin-manager";
import { LoggingPluginManager } from "../logging/logging-plugin-manager";
import { IDefect } from "./idefect";
import { AbstractDefectPlugin, IDefectPluginOptions } from "./abstract-defect-plugin";
import { nameof } from "ts-simple-nameof";

export interface IDefectPluginManagerOptions extends IDefectPluginOptions, IPluginManagerOptions {
    logMgr?: LoggingPluginManager;
}

/**
 * loads and provides an interface between any `IDefectPlugin`
 * to specify a plugin use the following `aftconfig.json` key:
 * ```
 * {
 *   ...
 *   "defectpluginmanager": {
 *     "pluginNames": ["plugin-name"]
 *   }
 *   ...
 * }
 * ```
 */
export class DefectPluginManager extends AbstractPluginManager<AbstractDefectPlugin, IDefectPluginOptions> {
    private _logMgr: LoggingPluginManager;

    constructor(options?: IDefectPluginManagerOptions) {
        super(nameof(DefectPluginManager).toLowerCase(), options);
        this._logMgr = options?.logMgr || new LoggingPluginManager({logName: nameof(DefectPluginManager), pluginNames: []});
    }
    
    async getDefect(defectId: string): Promise<IDefect> {
        return await this.getFirstEnabledPlugin()
        .then(async (plugin: AbstractDefectPlugin) => {
            return await plugin?.getDefect(defectId);
        }).catch(async (err) => {
            await this._logMgr.warn(err);
            return null;
        });
    }

    async findDefects(searchTerm: string): Promise<IDefect[]> {
        return await this.getFirstEnabledPlugin()
        .then(async (plugin: AbstractDefectPlugin) => {
            return await plugin?.findDefects(searchTerm) || [];
        }).catch(async (err) => {
            await this._logMgr.warn(err);
            return [];
        });
    }
}

export module DefectPluginManager {
    var _inst: DefectPluginManager = null;
    export function instance(): DefectPluginManager {
        if (_inst === null) {
            _inst = new DefectPluginManager();
        }
        return _inst;
    }
}