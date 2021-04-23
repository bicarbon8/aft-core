import { AbstractPluginManager } from "../abstract-plugin-manager";
import { Logger } from "../../logging/logger";
import { IDefect } from "../../defects/idefect";
import { IDefectPlugin } from "./idefect-plugin";
import { IPluginManagerOptions } from "../iplugin-manager-options";

export interface DefectPluginManagerOptions extends IPluginManagerOptions {
    logger?: Logger;
}

/**
 * loads and provides an interface between any `IDefectPlugin`
 * to specify a plugin use the following `aftconfig.json` key:
 * ```
 * {
 *   ...
 *   "defectpluginmanager": {
 *     "pluginName": "plugin-name"
 *   }
 *   ...
 * }
 * ```
 */
export class DefectPluginManager extends AbstractPluginManager<IDefectPlugin, DefectPluginManagerOptions> {
    private _logger: Logger;

    constructor(options?: DefectPluginManagerOptions) {
        super(options);
        this._logger = options?.logger || new Logger({name: 'DefectManager', pluginNames: []});
    }
    
    async getDefect(defectId: string): Promise<IDefect> {
        return await this.getPlugins()
        .then(async (plugins: IDefectPlugin[]) => {
            for (var i=0; i<plugins.length; i++) {
                let p: IDefectPlugin = plugins[i];
                if (p && await p.isEnabled()) {
                    return await p.getDefect(defectId);
                }
            }
            return null;
        }).catch(async (err) => {
            await this._logger.warn(err);
            return null;
        });
    }

    async findDefects(searchTerm: string): Promise<IDefect[]> {
        return await this.getPlugins()
        .then(async (plugins: IDefectPlugin[]) => {
            for (var i=0; i<plugins.length; i++) {
                let p: IDefectPlugin = plugins[i];
                if (p && await p.isEnabled()) {
                    return await p.findDefects(searchTerm);
                }
            }
            return [];
        }).catch(async (err) => {
            await this._logger.warn(err);
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