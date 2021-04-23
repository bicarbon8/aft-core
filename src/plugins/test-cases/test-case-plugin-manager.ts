import { AbstractPluginManager } from "../abstract-plugin-manager";
import { ProcessingResult } from "../../helpers/processing-result";
import { Logger } from "../../logging/logger";
import { ITestCase } from "../../test-cases/itest-case";
import { ITestCasePlugin } from "./itest-case-plugin";
import { IPluginManagerOptions } from "../iplugin-manager-options";

export interface TestCasePluginManagerOptions extends IPluginManagerOptions {
    logger?: Logger;
}

/**
 * loads and provides an interface between any `ITestCasePlugin`
 * to specify a plugin use the following `aftconfig.json` key:
 * ```
 * {
 *   ...
 *   "testcasepluginmanager": {
 *     "pluginNames": ["plugin-name"]
 *   }
 *   ...
 * }
 * ```
 */
export class TestCasePluginManager extends AbstractPluginManager<ITestCasePlugin, TestCasePluginManagerOptions> {
    private _logger: Logger;

    constructor(options?: TestCasePluginManagerOptions) {
        super(options);
        this._logger = options?.logger || new Logger({name: 'TestCasePluginManager', pluginNames: []});
    }

    async getTestCase(testId: string): Promise<ITestCase> {
        return await this.getPlugins()
        .then(async (plugins) => {
            for (var i=0; i<plugins.length; i++) {
                let handler: ITestCasePlugin = plugins[i];
                if (handler && await handler.isEnabled()) {
                    return await handler.getTestCase(testId);
                }
            }
            return null;
        }).catch(async (err) => {
            await this._logger.warn(err);
            return null;
        });
    }

    async findTestCases(searchTerm: string): Promise<ITestCase[]> {
        return await this.getPlugins()
        .then(async (plugins) => {
            for (var i=0; i<plugins.length; i++) {
                let handler: ITestCasePlugin = plugins[i];
                if (handler && await handler.isEnabled()) {
                    return await handler.findTestCases(searchTerm);
                }
            }
            return null;
        }).catch(async (err) => {
            await this._logger.warn(err);
            return null;
        })
    }

    async shouldRun(testId: string): Promise<ProcessingResult> {
        return await this.getPlugins()
        .then(async (plugins) => {
            for (var i=0; i<plugins.length; i++) {
                let handler: ITestCasePlugin = plugins[i];
                if (handler && await handler.isEnabled()) {
                    return await handler.shouldRun(testId);
                }
            }
            return {success: true, message: `no ITestCasePlugin in use so run all tests`};
        }).catch(async (err) => {
            await this._logger.warn(err);
            return {success: false, message: err};
        });
    }
}

export module TestCasePluginManager {
    var _inst: TestCasePluginManager = null;
    export function instance(): TestCasePluginManager {
        if (_inst === null) {
            _inst = new TestCasePluginManager();
        }
        return _inst;
    }
}