import { TestLog } from "../logging/test-log";
import { TestLogOptions } from "../logging/test-log-options";
import { TestWrapperOptions } from "./test-wrapper-options";
import { RandomGenerator } from "../helpers/random-generator";
import { TestStatus } from "../integrations/test-cases/test-status";
import { TestResult } from "../integrations/test-cases/test-result";
import { IDisposable } from "../helpers/idisposable";
import { TestResultMetaData } from "../integrations/test-cases/test-result-metadata";
import '../extensions/string-extensions';
import '../extensions/set-extensions';
import { TestException } from "../integrations/test-cases/test-exception";
import { Convert } from "../helpers/convert";

/**
 * provides helper methods and properties for use when integration or functional testing
 */
export class TestWrapper implements IDisposable {
    name: string;
    logger: TestLog;
    testCases: Set<string> = new Set<string>();
    defects: Set<string> = new Set<string>();
    errors: Error[] = [];
    
    private startTime: number;
    private loggedCases: Set<string> = new Set<string>();
    
    constructor(options: TestWrapperOptions) {
        this.name = options.name || RandomGenerator.getGuid();
        this.initialiseLogger(options);
        this.initialiseTestCases(options);
        this.initialiseDefects(options);

        this.startTime = new Date().getTime();
    }

    private initialiseLogger(options: TestWrapperOptions): void {
        this.logger = options.logger || new TestLog(new TestLogOptions(this.name));
    }

    private initialiseTestCases(options: TestWrapperOptions) {
        options.testCases.forEach(c => {
            this.testCases.add(c);
        });
        // TODO: implement plugin system for TestCaseHandler Plugins
    }

    private initialiseDefects(options: TestWrapperOptions) {
        options.defects.forEach(d => {
            this.defects.add(d);
        })
        // TODO: implement plugin system for DefectHandler Plugins
    }

    /**
     * logs the passed in message and then sends an ExternalTestResult
     * to any referenced ILoggingPlugins for handling with external systems
     * @param testId the ID of the current test
     * @param status the ExternalTestStatus for the result
     * @param message the message to be sent in the result
     */
    async addTestResult(testId: string, status: TestStatus, message?: string): Promise<void> {
        if (!this.loggedCases.has(testId)) {
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
                        this.logger.warn(fullMessage);
                        break;
                    case TestStatus.Failed:
                        this.logger.error(fullMessage);
                        break;
                    case TestStatus.Passed:
                    default:
                        this.logger.pass(fullMessage);
                        break;
                }
                
                try {
                    let result: TestResult = this.generateTestResult(testId, status, fullMessage);
                    await this.logger.logResult(result);
                    this.loggedCases.add(testId);
                } catch (e) {
                    this.logger.warn("unable to 'addTestResult' for test '" + testId + "' due to: " + e);
                }
            } else {
                this.logger.warn("test '" + testId + "' is not a valid test ID; please use one of [" + this.testCases.join(',') + "] instead; no result will be submitted.");
            }
        } else {
            this.logger.warn("you are attempting to add a second result for test '" + testId + "' which already has a result; no result will be submitted.");
        }
    }

    /**
     * DANGER!!: this method does not catch 'jasmine.expect' failures unless
     * you've set 'stopSpecOnExpectationFailure' to 'true' in your jasmine.json.
     * this function runs the passed in test action and then calls 'addTestResult'
     * based on the results of the call
     * @param testId the test ID being validated
     * @param action the test action being performed
     */
    async check(testId: string, action: Function): Promise<void> {
        let err: Error = await this.runAction(action);
        
        if (err) {
            this.errors.push(err);
            await this.addTestResult(testId, TestStatus.Failed, err.message);
        } else {
            await this.addTestResult(testId, TestStatus.Passed);
        }
    }

    /**
     * runs the passed in action and returns any Error
     * thrown instead of letting the Error be thrown
     * @param action the action to run
     */
    async runAction(action: Function): Promise<Error> {
        let err: Error = null;
        if (action) {
            try {
                await action();
            } catch (e) {
                err = e;
            }
        }
        return err;
    }

    async dispose(error?: Error) {
        let status: TestStatus = TestStatus.Passed;
        let message: string = '';
        if (error) {
            status = TestStatus.Failed;
            message = error.message;
        }
        await this.logRemainingCases(status, message);

        await this.disposeLogger(error);
    }

    private generateTestResult(testId: string, status: TestStatus, logMessage: string): TestResult {
        let result: TestResult = new TestResult();
        result.TestId = testId;
        result.TestStatus = status;
        result.ResultMessage = logMessage.ellide(100);
        result.MetaData[TestResultMetaData[TestResultMetaData.DurationMs]] = Convert.toElapsedMs(this.startTime).toString();
        result.MetaData[TestResultMetaData[TestResultMetaData.TestStatusStr]] = TestStatus[status];
        if (this.errors.length > 0) {
            let exceptionsArray: string[] = [];
            for (var i=0; i<this.errors.length; i++) {
                let te: Error = this.errors[i];
                if (te) {
                    exceptionsArray.push(TestException.generate(te).asSimpleString());
                }
            }
            let exceptionsStr: string = exceptionsArray.join('\n');
            result.MetaData[TestResultMetaData[TestResultMetaData.ExceptionsStr]] = exceptionsStr;
            let lastError: Error = this.errors[this.errors.length - 1];
            if (lastError) {
                let lastEx: TestException = TestException.generateFull(lastError);
                result.MetaData[TestResultMetaData[TestResultMetaData.LastException]] = lastEx;
            }
        }

        return result;
    }

    private logRemainingCases(status: TestStatus, message: string) {
        for (let c of this.testCases) {
            if (!this.loggedCases.has(c)) {
                this.addTestResult(c, status, message);
            }
        }
    }

    private async disposeLogger(error?: Error) {
        await this.logger.dispose(error);
    }
}