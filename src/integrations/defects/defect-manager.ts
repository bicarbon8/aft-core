import { PluginManager } from "../../construction/plugin-manager";
import { TestLog } from "../../logging/test-log";
import { DefectManagerOptions } from "./defect-manager-options";
import { IDefect } from "./idefect";
import { IDefectHandlerPlugin } from "./plugins/idefect-handler-plugin";

/**
 * loads and provides an interface between any `IDefectHandlerPlugin`
 * to specify a plugin use the following `aftconfig.json` key:
 * ```
 * {
 *   ...
 *   "defectManager": {
 *     "pluginName": "./path/to/plugin"
 *   }
 *   ...
 * }
 * ```
 */
export class DefectManager extends PluginManager<IDefectHandlerPlugin, DefectManagerOptions> {
    private logger: TestLog;

    constructor(options?: DefectManagerOptions) {
        super(options);
        this.logger = this.options['logger'] || new TestLog({name: 'DefectManager', pluginNames: []});
    }
    
    getOptionsConfigurationKey(): string {
        return 'defectManager';
    }
    
    async getDefect(defectId: string): Promise<IDefect> {
        return await this.getPlugin()
        .then(async (handler) => {
            if (handler && await handler.isEnabled()) {
                return await handler.getDefect(defectId);
            }
            return null;
        }).catch(async (err) => {
            await this.logger.warn(err);
            return null;
        });
    }

    async findDefects(searchTerm: string): Promise<IDefect[]> {
        return await this.getPlugin()
        .then(async (handler) => {
            if (handler && await handler.isEnabled()) {
                return await handler.findDefects(searchTerm);
            }
            return [];
        }).catch(async (err) => {
            await this.logger.warn(err);
            return [];
        });
    }
}

export module DefectManager {
    var _inst: DefectManager = null;
    export function instance(): DefectManager {
        if (_inst === null) {
            _inst = new DefectManager();
        }
        return _inst;
    }
}

/**
 * [OBSOLETE] use `DefectManager` instead
 */
export var DefectPluginManager = DefectManager;