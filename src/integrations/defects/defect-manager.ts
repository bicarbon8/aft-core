import { TestConfig } from "../../configuration/test-config";
import { PluginLoader } from "../../construction/plugin-loader";
import { TestLog } from "../../logging/test-log";
import { IDefect } from "./idefect";
import { IDefectManagerOptions } from "./idefect-manager-options";
import { IDefectHandlerPlugin } from "./plugins/idefect-handler-plugin";

export class DefectManager {
    private _logger: TestLog;
    
    constructor(options?: IDefectManagerOptions) {
        this._pluginName = options?.pluginName;
        this._logger = options?.logger || new TestLog('DefectManager');
    }

    async getDefect(defectId: string): Promise<IDefect> {
        return await this.getHandler()
        .then(async (handler) => {
            if (handler && await handler.enabled()) {
                return await handler.getDefect(defectId);
            }
            return null;
        }).catch(async (err) => {
            await this._logger.warn(err);
            return null;
        });
    }

    async findDefects(searchTerm: string): Promise<IDefect[]> {
        return await this.getHandler()
        .then(async (handler) => {
            if (handler && await handler.enabled()) {
                return await handler.findDefects(searchTerm);
            }
            return [];
        }).catch(async (err) => {
            await this._logger.warn(err);
            return [];
        });
    }

    private _pluginName: string = null;
    async pluginName(): Promise<string> {
        if(this._pluginName === null) {
            this._pluginName = await TestConfig.get<string>('defectHandler.pluginName');
        }
        return this._pluginName;
    }

    private _handler: IDefectHandlerPlugin = null;
    async getHandler(): Promise<IDefectHandlerPlugin> {
        if (this._handler === null) {
            let pluginName: string = await this.pluginName();
            if (pluginName) {
                try {
                    let plugins: IDefectHandlerPlugin[] = await PluginLoader.load<IDefectHandlerPlugin>(pluginName);
                    if (plugins && plugins.length > 0) {
                        this._handler = plugins[0];
                        this._logger.trace(`loaded IDefectHandlerPlugin: '${this._handler.name}'`);
                    }
                } catch (e) {
                    this._logger.warn(`error occurred in loading IDefectHandlerPlugin: ${e}`);
                }
            }
        }
        return this._handler;
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