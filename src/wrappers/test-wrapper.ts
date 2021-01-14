import { TestLog } from "../logging/test-log";
import { Func } from "../helpers/func";
import { ITestWrapperOptions } from "./itest-wrapper-options";
import { TestStatus } from "../integrations/test-cases/test-status";
import { TestResult } from "../integrations/test-cases/test-result";
import '../extensions/string-extensions';
import '../extensions/set-extensions';
import { Convert } from "../helpers/convert";
import { IProcessingResult } from "../helpers/iprocessing-result";
import { TestCaseManager } from "../integrations/test-cases/test-case-manager";
import { IDefect } from "../integrations/defects/idefect";
import { DefectManager } from "../integrations/defects/defect-manager";
import { DefectStatus } from "../integrations/defects/defect-status";
import { ITestResultOptions } from "../integrations/test-cases/itest-result-options";

/**
 * provides pre-test execution filtering based on specified 
 * test IDs or defect IDs and post-test results logging. usage
 * is intended to be managed through the `should(expectation, options)`
 * function via:
 * ```
 * should(() => expect(true).toBeTruthy()).because('true is truthy');
 * ```
 */
export class TestWrapper {
    private _expectation: Func<void, any>;
    private _reason: string;
    private _logger: TestLog;
    private _testCases: string[] = [];
    private _defects: string[] = [];
    private _errors: string[] = [];
    private _startTime: number;
    private _loggedCases: string[] = [];
    private _testCaseManager: TestCaseManager = null;
    private _defectManager: DefectManager = null;

    expectation(): Func<void, any> {
        return this._expectation;
    }

    reason(): string {
        return this._reason;
    }

    logger(): TestLog {
        return this._logger;
    }

    testCases(): string[] {
        return this._testCases;
    }

    defects(): string[] {
        return this._defects;
    }

    errors(): string[] {
        return this._errors;
    }

    startTime(): number {
        return this._startTime;
    }

    loggedCases(): string[] {
        return this._loggedCases;
    }
    
    /**
     * function is intended to be utilised via the `should(expectation, options)` function
     * and not directly
     * @param expectation an expectation like `expect(true).toBeFalsy()`
     * @param options optional ITestWrapperOptions allowing test IDs, defect IDs and a `because` reason to be passed in
     */
    async init(expectation: Func<void, any>, options?: ITestWrapperOptions): Promise<TestWrapper> {
        this._expectation = expectation;
        this._reason = this._expectation.toString();

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
        this._logger = options?.logger || new TestLog(this._reason);
    }

    private initialiseTestCases(options?: ITestWrapperOptions) {
        this._testCaseManager = options?.testCaseManager || TestCaseManager.instance();
        options?.testCases?.forEach(c => {
            this._testCases.push(c);
        });
    }

    private initialiseDefects(options?: ITestWrapperOptions) {
        this._defectManager = options?.defectManager || DefectManager.instance();
        options?.defects?.forEach(d => {
            this._defects.push(d);
        });
    }

    /**
     * function checks if the expectation should be run
     * and if so runs it and logs the result using a `TestLog.addTestResult`
     * call for every specified `testId`. if no `testId` is specified
     * the `TestLog.addTestResult` call will be made only once
     * @param reason reason why result should be true. this will become part of 
     * any reported failure reasons
     */
    async because(reason?: string): Promise<boolean> {
        this._reason += ` because ${reason}`;
        this._logger.initName(this._reason);
        
        let result: IProcessingResult = await this.run();

        this.disposeLogger();

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
        if (this._testCases.length > 0) {
            for (var i=0; i<this._testCases.length; i++) {
                let testId: string = this._testCases[i];
                fullMessage = TestStatus[status] + ' - ' + testId + ': ' + message;

                switch (status) {
                    case TestStatus.Blocked:
                    case TestStatus.Retest:
                    case TestStatus.Skipped:
                    case TestStatus.Untested:
                        await this._logger.warn(fullMessage);
                        break;
                    case TestStatus.Failed:
                        await this._logger.fail(fullMessage);
                        break;
                    case TestStatus.Passed:
                    default:
                        await this._logger.pass(fullMessage);
                        break;
                }
            }
        } else {
            fullMessage = TestStatus[status] + ': ' + message;
        }

        let results: TestResult[] = this.generateTestResults(status, fullMessage);
        for (var i=0; i<results.length; i++) {
            let result: TestResult = results[i];
            try {
                await this._logger.logResult(result);
                if (result.testId) {
                    this._loggedCases.push(result.testId);
                }
            } catch (e) {
                await this._logger.warn(`unable to 'addTestResult' for test '${result.testId || result.resultId}' due to: ${e}`);
            }
        }
    }

    /**
     * checks the specified test IDs to determine if the
     * expectation should be executed and returns a result
     * based on execution or why it should not be run
     */
    private async run(): Promise<IProcessingResult> {
        let status: TestStatus = TestStatus.Untested;
        let message: string = this._reason;
        if (this._expectation) {
            let shouldRun: IProcessingResult = await this.shouldRun();
            if (shouldRun.success) {
                try {
                    let result = await Promise.resolve(this._expectation());
                    if (result !== false) {
                        status = TestStatus.Passed;
                    } else {
                        status = TestStatus.Failed;
                    }
                } catch(e) {
                    status = TestStatus.Retest;
                    this._errors.push(e);
                }
            } else {
                status = TestStatus.Skipped;
                this._errors.push(shouldRun.message);
            }
        } else {
            this._errors.push('no test expectation supplied so nothing could be tested');
        }
        
        await this.logResult(status, message);
        return {obj: status, message: message, success: status == TestStatus.Passed};
    }

    private async shouldRun(): Promise<IProcessingResult> {
        let tcShouldRun: IProcessingResult = await this.shouldRun_tests();
        if (!tcShouldRun.success) {
            return tcShouldRun;
        }
        let dShouldRun: IProcessingResult = await this.shouldRun_defects();
        if (!dShouldRun.success) {
            return dShouldRun;
        }
        return {success: true};
    }

    private async shouldRun_tests(): Promise<IProcessingResult> {
        let shouldRun: boolean = false;
        let reasons: string[] = [];
        if (this._testCases.length > 0) {
            for (var i=0; i<this._testCases.length; i++) {
                let testId: string = this._testCases[i];
                let tcShouldRun: IProcessingResult = await this._testCaseManager.shouldRun(testId);
                shouldRun = shouldRun || tcShouldRun.success;
                reasons.push(tcShouldRun.message);
            }
            return {success: shouldRun, message: reasons.join(', ')};
        }
        return {success: true};
    }

    private async shouldRun_defects(): Promise<IProcessingResult> {
        if (this._testCases.length > 0) {
            for (var i=0; i<this._testCases.length; i++) {
                let testId: string = this._testCases[i];
                let defects: IDefect[] = await this._defectManager.findDefects(testId) || [];
                for (var j=0; j<defects.length; j++) {
                    let d: IDefect = defects[j];
                    if (d.status == DefectStatus.open) {
                        return {success: false, message: `TestId: '${testId}' has open defect '${d.id}' so it should not be run.`};
                    }
                }
            }
        }
        return {success: true};
    }

    private generateTestResults(status: TestStatus, logMessage: string): TestResult[] {
        let results: TestResult[] = [];
        if (this._testCases.length > 0) {
            for (var i=0; i<this._testCases.length; i++) {
                let testId: string = this._testCases[i];
                let result: TestResult = this.generateTestResult(status, logMessage, testId);
                results.push(result);
            }
        } else {
            let result: TestResult = this.generateTestResult(status, logMessage);
            results.push(result);
        }
        return results;
    }

    private generateTestResult(status: TestStatus, logMessage: string, testId?: string): TestResult {
        let result: TestResult = new TestResult({
            testId: testId,
            resultMessage: logMessage.ellide(100),
            status: status,
            metadata: {
                durationMs: Convert.toElapsedMs(this._startTime),
                statusStr: TestStatus[status]
            }
        });
        if (this._errors.length > 0) {
            let exceptionsArray: string[] = [];
            for (var i=0; i<this._errors.length; i++) {
                let te: string = this._errors[i];
                if (te) {
                    exceptionsArray.push();
                }
            }
            let exceptionsStr: string = exceptionsArray.join('\n');
            result.metadata.logs = exceptionsStr;
            let lastError: string = this._errors[this._errors.length - 1];
            if (lastError) {
                result.metadata.lastError = lastError;
            }
        }
        return result;
    }

    private async disposeLogger(error?: Error) {
        await this._logger.dispose(error);
    }
}