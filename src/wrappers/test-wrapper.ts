import { TestLog } from "../logging/test-log";
import { ITestWrapperOptions } from "./itest-wrapper-options";
import { RandomGenerator } from "../helpers/random-generator";
import { TestStatus } from "../integrations/test-cases/test-status";
import { TestResult } from "../integrations/test-cases/test-result";
import { IDisposable } from "../helpers/idisposable";
import { ITestResultMetaData } from "../integrations/test-cases/itest-result-metadata";
import '../extensions/string-extensions';
import '../extensions/set-extensions';
import { TestException } from "../integrations/test-cases/test-exception";
import { Convert } from "../helpers/convert";
import { Validator } from "./validator";
import { Action } from "../helpers/action";
import { IProcessingResult } from "../helpers/iprocessing-result";
import { TestCaseManager } from "../integrations/test-cases/test-case-manager";
import { ITestCase } from "../integrations/test-cases/itest-case";
import { IDefect } from "../integrations/defects/idefect";
import { DefectManager } from "../integrations/defects/defect-manager";
import { DefectStatus } from "../integrations/defects/defect-status";

/**
 * provides helper methods and properties for use when integration or functional testing
 */
export class TestWrapper implements IDisposable {
    name: string;
    logger: TestLog;
    testCases: Set<string> = new Set<string>();
    defects: Set<string> = new Set<string>();
    errors: Error[] = [];
    
    private _startTime: number;
    private _loggedCases: Set<string> = new Set<string>();
    private _testCaseManager: TestCaseManager = null;
    private _defectManager: DefectManager = null;
    
    constructor(name: string, options?: ITestWrapperOptions) {
        this.name = name;

        this.initialiseLogger(options);
        this.initialiseTestCases(options);
        this.initialiseDefects(options);

        this._startTime = new Date().getTime();
    }

    private initialiseLogger(options?: ITestWrapperOptions): void {
        this.logger = options?.logger || new TestLog(this.name);
    }

    private initialiseTestCases(options?: ITestWrapperOptions) {
        this._testCaseManager = options?.testCaseManager || TestCaseManager.instance();
        options?.testCases?.forEach(c => {
            this.testCases.add(c);
        });
    }

    private initialiseDefects(options?: ITestWrapperOptions) {
        this._defectManager = options?.defectManager || DefectManager.instance();
        options?.defects?.forEach(d => {
            this.defects.add(d);
        });
    }

    /**
     * logs the passed in message and then sends an ExternalTestResult
     * to any referenced ILoggingPlugins for handling with external systems
     * @param testId the ID of the current test
     * @param status the ExternalTestStatus for the result
     * @param message the message to be sent in the result
     */
    async addTestResult(testId: string, status: TestStatus, message?: string): Promise<void> {
        if (!this._loggedCases.has(testId)) {
            if (!message) {
                message = '';
            }

            let fullMessage: string = TestStatus[status] + ' - ' + testId + ': ' + message;

            if (this.testCases.size == 0 || this.testCases.has(testId)) {
                switch (status) {
                    case TestStatus.Blocked:
                    case TestStatus.Retest:
                    case TestStatus.Skipped:
                    case TestStatus.Untested:
                        await this.logger.warn(fullMessage);
                        break;
                    case TestStatus.Failed:
                        await this.logger.error(fullMessage);
                        break;
                    case TestStatus.Passed:
                    default:
                        await this.logger.pass(fullMessage);
                        break;
                }
                
                try {
                    let result: TestResult = this.generateTestResult(testId, status, fullMessage);
                    await this.logger.logResult(result);
                    this._loggedCases.add(testId);
                } catch (e) {
                    await this.logger.warn("unable to 'addTestResult' for test '" + testId + "' due to: " + e);
                }
            } else {
                await this.logger.warn("test '" + testId + "' is not a valid test ID; please use one of [" + this.testCases.join(',') + "] instead; no result will be submitted.");
            }
        } else {
            await this.logger.warn("you are attempting to add a second result for test '" + testId + "' which already has a result; no result will be submitted.");
        }
    }

    /**
     * DANGER!!: this method does not catch 'jasmine.expect' failures unless
     * you've wrapped the expect call using 'should(expect(actual).toBe(expected)).because('reason');'
     * this function runs the passed in test action and then calls 'addTestResult'
     * based on the results of the call
     * @param testId the test ID being validated
     * @param action the test action being performed
     */
    async check(testId: string, action: Action<void>): Promise<void> {
        // check if passed in 'testId' should be run
        let shouldRun: IProcessingResult = await this.shouldRunTestCase(testId);
        if (shouldRun.success) {
            let err: Error = await this.runAction(action);
            
            if (err) {
                this.errors.push(err);
                await this.addTestResult(testId, TestStatus.Failed, err.message);
            } else {
                await this.addTestResult(testId, TestStatus.Passed);
            }
        } else {
            await this.addTestResult(testId, TestStatus.Skipped, shouldRun.message);
        }
    }

    /**
     * runs the passed in action, passing in a new Validator
     * as an argument and returns any Errors thrown
     * instead of letting the Error out
     * @param action the action to run
     */
    async runAction(action: Action<void>): Promise<Error> {
        let err: Error = null;
        if (action) {
            try {
                await Promise.resolve(action());
            } catch (e) {
                err = e;
            }
        }
        return err;
    }

    /**
     * function will lookup the passed in 'testId' in any Test Case 
     * Handler Plugins specified and determine if the test should be
     * executed or skipped. If no Handler Plugins exist, the result 
     * will indicate that the test SHOULD be run otherwise the logic
     * is left to the plugin to determine
     * @param testId the test case ID passed to the 'check' function
     */
    private async shouldRunTestCase(testId: string): Promise<IProcessingResult> {
        if (!this.testCases.has(testId)) {
            this.testCases.add(testId);
        }
        try {
            let tcShouldRun: IProcessingResult = await this._testCaseManager.shouldRun(testId);
            if (tcShouldRun.success) {
                let defects: IDefect[] = await this._defectManager.findDefects(testId) || [];
                for (var i=0; i<defects.length; i++) {
                    let d: IDefect = defects[i];
                    if (d.status == DefectStatus.open) {
                        if (!this.defects.has(d.id)) {
                            this.defects.add(d.id);
                        }
                        return {
                            obj: d, // the open defect
                            success: false, // should not run test
                            message: `defect: '${d.id}' referencing testId: '${testId}' is open so test should not be run`
                        };
                    }
                }
            }
            return tcShouldRun;
        } catch (e) {
            return {success: false, message: e} as IProcessingResult;
        }
    }

    async dispose(error?: Error) {
        let status: TestStatus = TestStatus.Passed;
        let message: string = '';
        if (error) {
            status = TestStatus.Failed;
            message = error.message;
        }
        this.logRemainingCases(status, message);

        await this.disposeLogger(error);
    }

    private generateTestResult(testId: string, status: TestStatus, logMessage: string): TestResult {
        let result: TestResult = new TestResult(testId, logMessage.ellide(100));
        result.status = status;
        result.metadata.durationMs = Convert.toElapsedMs(this._startTime);
        result.metadata.statusStr = TestStatus[status];
        if (this.errors.length > 0) {
            let exceptionsArray: string[] = [];
            for (var i=0; i<this.errors.length; i++) {
                let te: Error = this.errors[i];
                if (te) {
                    exceptionsArray.push(TestException.generate(te).asSimpleString());
                }
            }
            let exceptionsStr: string = exceptionsArray.join('\n');
            result.metadata.logs = exceptionsStr;
            let lastError: Error = this.errors[this.errors.length - 1];
            if (lastError) {
                let lastEx: TestException = TestException.generateFull(lastError);
                result.metadata.lastError = lastEx;
            }
        }

        return result;
    }

    private logRemainingCases(status: TestStatus, message: string) {
        for (let c of this.testCases) {
            if (!this._loggedCases.has(c)) {
                this.addTestResult(c, status, message);
            }
        }
    }

    private async disposeLogger(error?: Error) {
        await this.logger.dispose(error);
    }
}