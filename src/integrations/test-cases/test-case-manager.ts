import { PluginManager } from "../../construction/plugin-manager";
import { ProcessingResult } from "../../helpers/processing-result";
import { TestLog } from "../../logging/test-log";
import { ITestCase } from "./itest-case";
import { ITestCaseHandlerPlugin } from "./plugins/itest-case-handler-plugin";
import { TestCaseManagerOptions } from "./test-case-manager-options";

/**
 * loads and provides an interface between any `ITestCaseHandlerPlugin`
 * to specify a plugin use the following `aftconfig.json` key:
 * ```
 * {
 *   ...
 *   "testCaseManager": {
 *     "pluginName": "./path/to/plugin"
 *   }
 *   ...
 * }
 * ```
 */
export class TestCaseManager extends PluginManager<ITestCaseHandlerPlugin, TestCaseManagerOptions> {
    private logger: TestLog;

    constructor(options?: TestCaseManagerOptions) {
        super(options);
        this.logger = this.options['logger'] || new TestLog({name: 'TestCaseManager', pluginNames: []});
    }
    
    getOptionsConfigurationKey(): string {
        return 'testCaseManager';
    }

    async getTestCase(testId: string): Promise<ITestCase> {
        return await this.getPlugin()
        .then(async (handler) => {
            if (handler && await handler.isEnabled()) {
                return await handler.getTestCase(testId);
            }
            return null;
        }).catch(async (err) => {
            await this.logger.warn(err);
            return null;
        });
    }

    async findTestCases(searchTerm: string): Promise<ITestCase[]> {
        return await this.getPlugin()
        .then(async (handler) => {
            if (handler && await handler.isEnabled()) {
                return await handler.findTestCases(searchTerm);
            }
            return null;
        }).catch(async (err) => {
            await this.logger.warn(err);
            return null;
        })
    }

    async shouldRun(testId: string): Promise<ProcessingResult> {
        return await this.getPlugin()
        .then(async (handler) => {
            if (handler && await handler.isEnabled()) {
                return await handler.shouldRun(testId);
            }
            return {success: true, message: `no ITestCaseHandlerPlugin in use so run all tests`};
        }).catch(async (err) => {
            await this.logger.warn(err);
            return {success: false, message: err};
        });
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

/**
 * [OBSOLETE] use `TestCaseManager` instead
 */
export var TestCasePluginManager = TestCaseManager;