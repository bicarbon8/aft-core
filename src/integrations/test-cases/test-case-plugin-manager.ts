import { PluginManager } from "../../construction/plugin-manager";
import { ProcessingResult } from "../../helpers/processing-result";
import { ITestCase } from "./itest-case";
import { ITestCaseHandlerPlugin } from "./plugins/itest-case-handler-plugin";

export class TestCasePluginManager extends PluginManager<ITestCaseHandlerPlugin> {
    getConfigurationKey(): string {
        return 'test-case-handler-plugin';
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

export module TestCasePluginManager {
    var _inst: TestCasePluginManager = null;
    export function instance(): TestCasePluginManager {
        if (_inst === null) {
            _inst = new TestCasePluginManager();
        }
        return _inst;
    }
}