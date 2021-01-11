import { TestLog } from "../logging/test-log";
import { Func } from "../helpers/func";
import { ITestWrapperOptions } from "./itest-wrapper-options";
import { TestStatus } from "../integrations/test-cases/test-status";
import { TestResult } from "../integrations/test-cases/test-result";
import '../extensions/string-extensions';
import '../extensions/set-extensions';
import { TestException } from "../integrations/test-cases/test-exception";
import { Convert } from "../helpers/convert";
import { Action } from "../helpers/action";
import { IProcessingResult } from "../helpers/iprocessing-result";
import { TestCaseManager } from "../integrations/test-cases/test-case-manager";
import { IDefect } from "../integrations/defects/idefect";
import { DefectManager } from "../integrations/defects/defect-manager";
import { DefectStatus } from "../integrations/defects/defect-status";
import { ITestResult } from "../integrations/test-cases/itest-result";
import { ISafeStringOption } from "../helpers/isafe-string-option";

/**
 * provides helper methods and properties for use when integration or functional testing
 */
export class TestWrapper {
    expectation: Func<void, any>;
    reason: string;
    logger: TestLog;
    testCases: string[] = [];
    defects: string[] = [];
    errors: Error[] = [];
    
    private _startTime: number;
    private _loggedCases: Set<string> = new Set<string>();
    private _testCaseManager: TestCaseManager = null;
    private _defectManager: DefectManager = null;
    
    async init(expectation: Func<void, any>, options?: ITestWrapperOptions): Promise<TestWrapper> {
        this.expectation = expectation;
        this.reason = this.expectation.toString();

        this.initialiseLogger(options);
        this.initialiseTestCases(options);
        this.initialiseDefects(options);

        this._startTime = new Date().getTime();

        if (options?.because) {
            await this.because(options?.because);
        }

        return this;
    }

    private initialiseLogger(options?: ITestWrapperOptions): void {
        this.logger = options?.logger || new TestLog(this.reason);
    }

    private initialiseTestCases(options?: ITestWrapperOptions) {
        this._testCaseManager = options?.testCaseManager || TestCaseManager.instance();
        options?.testCases?.forEach(c => {
            this.testCases.push(c);
        });
    }

    private initialiseDefects(options?: ITestWrapperOptions) {
        this._defectManager = options?.defectManager || DefectManager.instance();
        options?.defects?.forEach(d => {
            this.defects.push(d);
        });
    }

    /**
     * function will throw a ValidationError if the 
     * specified result is false, otherwise no action
     * is taken
     * @param reason reason why result should be true
     */
    async because(reason?: string): Promise<boolean> {
        this.reason += ` because ${reason}`;
        this.logger.initName(this.reason);
        
        let result: IProcessingResult = await this.run();
        if (!result.success) {
            throw new Error(result.message);
        }

        return result.success;
    }

    /**
     * logs the passed in message and then sends an ExternalTestResult
     * to any referenced ILoggingPlugins for handling with external systems
     * @param testId the ID of the current test
     * @param status the ExternalTestStatus for the result
     * @param message the message to be sent in the result
     */
    private async logResult(status: TestStatus, message?: string): Promise<void> {
        if (!message) {
            message = '';
        }
        let fullMessage: string;
        if (this.testCases.length > 0) {
            for (var i=0; i<this.testCases.length; i++) {
                let testId: string = this.testCases[i];
                fullMessage = TestStatus[status] + ' - ' + testId + ': ' + message;

                switch (status) {
                    case TestStatus.Blocked:
                    case TestStatus.Retest:
                    case TestStatus.Skipped:
                    case TestStatus.Untested:
                        await this.logger.warn(fullMessage);
                        break;
                    case TestStatus.Failed:
                        await this.logger.fail(fullMessage);
                        break;
                    case TestStatus.Passed:
                    default:
                        await this.logger.pass(fullMessage);
                        break;
                }
            }
        } else {
            fullMessage = TestStatus[status] + ': ' + message;
        }

        let results: ITestResult[] = this.generateTestResults(status, fullMessage);
        for (var i=0; i<results.length; i++) {
            let result: ITestResult = results[i];
            try {
                await this.logger.logResult(result);
                if (result.testId) {
                    this._loggedCases.add(result.testId);
                }
            } catch (e) {
                await this.logger.warn(`unable to 'addTestResult' for test '${result.testId || result.resultId}' due to: ${e}`);
            }
        }
    }

    /**
     * runs the passed in action, passing in a new Validator
     * as an argument and returns any Errors thrown
     * instead of letting the Error out
     * @param action the action to run
     */
    private async run(): Promise<IProcessingResult> {
        let status: TestStatus = TestStatus.Untested;
        let message: string = this.reason;
        if (this.expectation) {
            let shouldRun: IProcessingResult = await this.shouldRun();
            if (shouldRun.success) {
                try {
                    let result: boolean = await Promise.resolve<boolean>(this.expectation());
                    if (result != false) {
                        status = TestStatus.Passed;
                    } else {
                        status = TestStatus.Failed;
                    }
                } catch(e) {
                    status = TestStatus.Retest;
                    message = e;
                }
            } else {
                status = TestStatus.Skipped;
                message = shouldRun.message;
            }
        } else {
            message = 'no test expectation supplied so nothing could be tested';
        }
        
        this.logResult(status, message);
        return {obj: status, message: message, success: status == TestStatus.Passed};
    }

    private async shouldRun(): Promise<IProcessingResult> {
        let tcShouldRun: IProcessingResult = await this.shouldRun_tests();
        if (!tcShouldRun.success) {
            return tcShouldRun;
        }
        let dShouldRun: IProcessingResult = await this.shouldRun_defects();
        if (!dShouldRun) {
            return dShouldRun;
        }
        return {success: true} as IProcessingResult;
    }

    private async shouldRun_tests(): Promise<IProcessingResult> {
        let shouldRun: boolean = false;
        let reasons: string[] = [];
        if (this.testCases.length > 0) {
            for (var i=0; i<this.testCases.length; i++) {
                let testId: string = this.testCases[i];
                let tcShouldRun: IProcessingResult = await this._testCaseManager.shouldRun(testId);
                shouldRun = shouldRun || tcShouldRun.success;
                reasons.push(tcShouldRun.message);
            }
            return {success: shouldRun, message: reasons.join(', ')} as IProcessingResult;
        }
        return {success: true} as IProcessingResult;
    }

    private async shouldRun_defects(): Promise<IProcessingResult> {
        if (this.testCases.length > 0) {
            for (var i=0; i<this.testCases.length; i++) {
                let testId: string = this.testCases[i];
                let defects: IDefect[] = await this._defectManager.findDefects(testId) || [];
                for (var j=0; j<defects.length; j++) {
                    let d: IDefect = defects[j];
                    if (d.status == DefectStatus.open) {
                        return {success: false, message: `TestId: '${testId}' has open defect '${d.id}' so it should not be run.`} as IProcessingResult;
                    }
                }
            }
        }
        return {success: true} as IProcessingResult;
    }

    private generateTestResults(status: TestStatus, logMessage: string): ITestResult[] {
        let results: ITestResult[] = [];
        if (this.testCases.length > 0) {
            for (var i=0; i<this.testCases.length; i++) {
                let testId: string = this.testCases[i];
                let result: ITestResult = this.generateTestResult(status, logMessage, testId);
                results.push(result);
            }
        } else {
            let result: ITestResult = this.generateTestResult(status, logMessage);
            results.push(result);
        }
        return results;
    }

    private generateTestResult(status: TestStatus, logMessage: string, testId?: string): ITestResult {
        let result: TestResult = new TestResult(logMessage.ellide(100));
        result.testId = testId;
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

    private async disposeLogger(error?: Error) {
        await this.logger.dispose(error);
    }
}

export module AFT {
    export async function tw(expectation: Func<void, any>, options?: ITestWrapperOptions): Promise<TestWrapper> {
        return await new TestWrapper().init(expectation, options);
    }
}