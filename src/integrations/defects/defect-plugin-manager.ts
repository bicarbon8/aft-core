import { PluginManager } from "../../construction/plugin-manager";
import { IDefect } from "./idefect";
import { IDefectHandlerPlugin } from "./plugins/idefect-handler-plugin";

export class DefectPluginManager extends PluginManager<IDefectHandlerPlugin> {
    getConfigurationKey(): string {
        return 'defect-handler-plugin';
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

export module DefectPluginManager {
    var _inst: DefectPluginManager = null;
    export function instance(): DefectPluginManager {
        if (_inst === null) {
            _inst = new DefectPluginManager();
        }
        return _inst;
    }
}