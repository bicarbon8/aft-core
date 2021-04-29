import { AbstractPluginManager, IPluginManagerOptions } from "../abstract-plugin-manager";
import { ProcessingResult } from "../../helpers/processing-result";
import { LoggingPluginManager } from "../logging/logging-plugin-manager";
import { ITestCase } from "./itest-case";
import { AbstractTestCasePlugin, ITestCasePluginOptions } from "./abstract-test-case-plugin";
import { nameof } from "ts-simple-nameof";

export interface ITestCasePluginManagerOptions extends ITestCasePluginOptions, IPluginManagerOptions {
    _logMgr?: LoggingPluginManager;
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
export class TestCasePluginManager extends AbstractPluginManager<AbstractTestCasePlugin, ITestCasePluginOptions> {
    private _logMgr: LoggingPluginManager;

    constructor(options?: ITestCasePluginManagerOptions) {
        super(nameof(TestCasePluginManager).toLowerCase(), options);
        this._logMgr = options?._logMgr || new LoggingPluginManager({logName: nameof(TestCasePluginManager), pluginNames: []});
    }

    async getTestCase(testId: string): Promise<ITestCase> {
        return await this.getFirstEnabledPlugin()
        .then(async (plugin) => {
            return await plugin?.getTestCase(testId) || null;
        }).catch(async (err) => {
            await this._logMgr.warn(err);
            return null;
        });
    }

    async findTestCases(searchTerm: string): Promise<ITestCase[]> {
        return await this.getFirstEnabledPlugin()
        .then(async (plugin) => {
            return await plugin?.findTestCases(searchTerm) || [];
        }).catch(async (err) => {
            await this._logMgr.warn(err);
            return null;
        })
    }

    async shouldRun(testId: string): Promise<ProcessingResult> {
        return await this.getFirstEnabledPlugin()
        .then(async (handler) => {
            return await handler?.shouldRun(testId) || {success: true, message: `no ITestCasePlugin in use so run all tests`};
        }).catch(async (err) => {
            await this._logMgr.warn(err);
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