import { TestConfig } from "../../configuration/test-config";
import { PluginLoader } from "../../construction/plugin-loader";
import { IProcessingResult } from "../../helpers/iprocessing-result";
import { TestLog } from "../../logging/test-log";
import { ITestCase } from "./itest-case";
import { ITestCaseManagerOptions } from "./itest-case-manager-options";
import { ITestCaseHandlerPlugin } from "./plugins/itest-case-handler-plugin";

export class TestCaseManager {
    private _logger: TestLog;

    constructor(options?: ITestCaseManagerOptions) {
        this._pluginName = options?.pluginName;
        this._logger = options?.logger || new TestLog('TestCaseManager');
    }

    async getTestCase(testId: string): Promise<ITestCase> {
        return await this.getHandler()
        .then(async (handler) => {
            if (handler && await handler.enabled()) {
                return await handler.getTestCase(testId);
            }
            return null;
        }).catch(async (err) => {
            await this._logger.warn(err);
            return null;
        });
    }

    async findTestCases(searchTerm: string): Promise<ITestCase[]> {
        return await this.getHandler()
        .then(async (handler) => {
            if (handler && await handler.enabled()) {
                return await handler.findTestCases(searchTerm);
            }
            return null;
        }).catch(async (err) => {
            await this._logger.warn(err);
            return null;
        })
    }

    async shouldRun(testId: string): Promise<IProcessingResult> {
        return await this.getHandler()
        .then(async (handler) => {
            if (handler && await handler.enabled()) {
                return await handler.shouldRun(testId);
            }
            return {success: true, message: `no ITestCaseHandlerPlugin in use so run all tests`};
        }).catch(async (err) => {
            await this._logger.warn(err);
            return {success: false, message: err};
        });
    }

    private _pluginName: string = null;
    async pluginName(): Promise<string> {
        if (this._pluginName === null) {
            this._pluginName = await TestConfig.get<string>('testCaseManager.pluginName');
        }
        return this._pluginName;
    }

    private _handler: ITestCaseHandlerPlugin = null;
    async getHandler(): Promise<ITestCaseHandlerPlugin> {
        if (this._handler === null) {
            let pluginName: string = await this.pluginName();
            if (pluginName) {
                try {
                    let plugins: ITestCaseHandlerPlugin[] = await PluginLoader.load<ITestCaseHandlerPlugin>(pluginName);
                    if (plugins && plugins.length > 0) {
                        this._handler = plugins[0];
                        this._logger.trace(`loaded ITestCaseHandlerPlugin: '${this._handler.name}'`);
                    }
                } catch (e) {
                    this._logger.warn(`error occurred in loading ITestCaseHandlerPlugin: ${e}`);
                }
            }
        }
        return this._handler;
    }
}

export module TestCaseManager {
    var _inst: TestCaseManager = null;
    export function instance(): TestCaseManager {
        if (_inst === null) {
            _inst = new TestCaseManager();
        }
        return _inst;
    }
}