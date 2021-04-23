import { cloneDeep } from "lodash";
import { Logger } from "../logging/logger";
import { TestStatus } from "../test-cases/test-status";
import { ITestResult } from "../test-cases/itest-result";
import { convert } from "../helpers/converter";
import { ProcessingResult } from "../helpers/processing-result";
import { TestCasePluginManager } from "../plugins/test-cases/test-case-plugin-manager";
import { IDefect } from "../defects/idefect";
import { DefectStatus } from "../defects/defect-status";
import { rand } from "../helpers/random-generator";
import { ellide } from "../helpers/ellide";
import { DefectPluginManager } from "../plugins/defects/defect-plugin-manager";
import { BuildInfoPluginManager } from "../plugins/build-info/build-info-plugin-manager";
import { Func } from "../helpers/custom-types";

export interface TestWrapperOptions {
    expect: Func<TestWrapper, boolean | PromiseLike<boolean>>;
    buildInfoManager?: BuildInfoPluginManager;
    defects?: string[];
    defectManager?: DefectPluginManager;
    logger?: Logger;
    testCases?: string[];
    testCaseManager?: TestCasePluginManager;
    description?: string;
}

/**
 * provides pre-test execution filtering based on specified 
 * test IDs or defect IDs and post-test results logging. usage
 * is intended to be managed through the `should(expectation, options)`
 * function via:
 * ```
 * await should(() => expect(true).toBeTruthy(), {description: 'expect true is truthy'});
 * ```
 */
export class TestWrapper {
    private _expectation: Func<TestWrapper, any>;
    private _description: string;
    private _logger: Logger;
    private _testCases: string[] = [];
    private _defects: string[] = [];
    private _errors: string[] = [];
    private _startTime: number;
    private _testCaseManager: TestCasePluginManager = null;
    private _defectManager: DefectPluginManager = null;
    private _buildInfoManager: BuildInfoPluginManager = null;

    /**
     * this class is intended to be utilised via the `should(expectation, options)` function
     * and not directly...
     * @param expectation a function containing some expectation like `expect(true).toBeFalsy()` or
     * `'foo' == 'foo'` where the function either accepts no arguments or one argument of type `TestWrapper`
     * ex:
     * ```
     * let tw: TestWrapper = new TestWrapper(async (t) => {
     *     await t.logger().info("using the TestWrapper's logger");
     *     let foo = 'foo';
     *     expect(foo).toEqual('foo');
     * });
     * await tw.run();
     * ```
     * @param options optional `TestWrapperOptions` allowing test IDs, defect IDs and a `description` to be passed in
     */
    constructor(options: TestWrapperOptions) {
        this._expectation = options.expect;
        
        this._initialiseDescription(options);
        this._initialiseLogger(options);
        this._initialiseTestCases(options);
        this._initialiseDefects(options);
        this._initialiseBuildInfo(options);
    }

    get expectation(): Func<TestWrapper, any> {
        return this._expectation;
    }

    get description(): string {
        return this._description;
    }

    get logger(): Logger {
        return this._logger;
    }

    get testCases(): string[] {
        return cloneDeep(this._testCases);
    }

    get defects(): string[] {
        return cloneDeep(this._defects);
    }

    get errors(): string[] {
        return cloneDeep(this._errors);
    }

    get startTime(): number {
        return this._startTime;
    }
    
    /**
     * checks if the expectation should be executed and if so runs it
     * and returns the result via an `IProcessingResult`
     */
    async run(): Promise<ProcessingResult> {
        this._startTime = new Date().getTime();
        
        let result: ProcessingResult = await this._beginProcessing();
        await this._logResult(result);

        return result;
    }

    private _initialiseDescription(options: TestWrapperOptions): void {
        if (options.description) {
            this._description = options.description;
        } else {
            if (options.testCases?.length) {
                this._description = `${options.testCases?.join(' ')}`
            } else {
                this._description = rand.guid;
            }
        }
    }

    private _initialiseLogger(options: TestWrapperOptions): void {
        this._logger = options.logger || new Logger({name: this.description});
    }

    private _initialiseTestCases(options: TestWrapperOptions): void {
        this._testCaseManager = options.testCaseManager || TestCasePluginManager.instance();
        options.testCases?.forEach(c => {
            this._testCases.push(c);
        });
    }

    private _initialiseDefects(options: TestWrapperOptions): void {
        this._defectManager = options.defectManager || DefectPluginManager.instance();
        options.defects?.forEach(d => {
            this._defects.push(d);
        });
    }

    private _initialiseBuildInfo(options: TestWrapperOptions) {
        this._buildInfoManager = options.buildInfoManager || BuildInfoPluginManager.instance();
    }

    /**
     * creates `ITestResult` objects for each `testId` and sends these
     * to the `TestLog.logResult` function
     * @param result an `IProcessingResult` returned from executing the 
     * expectation
     */
    private async _logResult(result: ProcessingResult): Promise<void> {
        let status: TestStatus = result.obj as TestStatus || TestStatus.Untested;
        let message: string = result.message;
        if (this._testCases.length > 0) {
            for (var i=0; i<this._testCases.length; i++) {
                let testId: string = this._testCases[i];
                if (message) {
                    await this._logMessage(status, `${testId} - ${message}`);
                } else {
                    await this._logMessage(status, testId);
                }
            }
        } else {
            await this._logMessage(status, message);
        }

        let results: ITestResult[] = await this._generateTestResults(status, message, ...this._testCases);
        for (var i=0; i<results.length; i++) {
            let result: ITestResult = results[i];
            try {
                await this._logger.logResult(result);
            } catch (e) {
                await this._logger.warn(`unable to log test result for test '${result.testId || result.resultId}' due to: ${e}`);
            }
        }

        this.logger.finalise();
    }

    private async _logMessage(status: TestStatus, message: string): Promise<void> {
        switch (status) {
            case TestStatus.Blocked:
            case TestStatus.Retest:
            case TestStatus.Skipped:
            case TestStatus.Untested:
                await this.logger.warn(message);
                break;
            case TestStatus.Failed:
                await this.logger.fail(message);
                break;
            case TestStatus.Passed:
            default:
                await this.logger.pass(message);
                break;
        }
    }

    /**
     * checks the specified test IDs to determine if the
     * expectation should be executed and returns a result
     * based on execution or why it should not be run
     */
    private async _beginProcessing(): Promise<ProcessingResult> {
        let status: TestStatus = TestStatus.Untested;
        let message: string;
        if (this._expectation) {
            let shouldRun: ProcessingResult = await this._shouldRun();
            if (shouldRun.success) {
                try {
                    let result = await Promise.resolve(this._expectation(this));
                    if (result !== false) {
                        status = TestStatus.Passed;
                    } else {
                        status = TestStatus.Failed;
                    }
                } catch(e) {
                    status = TestStatus.Failed;
                    message = (e as Error).message;
                }
            } else {
                status = TestStatus.Skipped;
                message = shouldRun.message;
            }
        } else {
            message = 'no test expectation supplied so nothing could be tested';
        }
        if (message) {
            this._errors.push(message);
        }
        return {obj: status, message: message, success: status == TestStatus.Passed};
    }

    private async _shouldRun(): Promise<ProcessingResult> {
        let tcShouldRun: ProcessingResult = await this._shouldRun_tests();
        if (!tcShouldRun.success) {
            return tcShouldRun;
        }
        let dShouldRun: ProcessingResult = await this._shouldRun_defects();
        if (!dShouldRun.success) {
            return dShouldRun;
        }
        return {success: true};
    }

    private async _shouldRun_tests(): Promise<ProcessingResult> {
        let shouldRun: boolean = false;
        let reasons: string[] = [];
        if (this._testCases.length > 0) {
            for (var i=0; i<this._testCases.length; i++) {
                let testId: string = this._testCases[i];
                let tcShouldRun: ProcessingResult = await this._testCaseManager.shouldRun(testId);
                shouldRun = shouldRun || tcShouldRun.success;
                reasons.push(tcShouldRun.message);
            }
            return {success: shouldRun, message: reasons.join(', ')};
        }
        return {success: true};
    }

    private async _shouldRun_defects(): Promise<ProcessingResult> {
        // first search for any specified Defects by ID
        if (this._defects.length > 0) {
            for (var i=0; i<this._defects.length; i++) {
                let defectId: string = this._defects[i];
                let defect: IDefect = await this._defectManager.getDefect(defectId);
                if (defect?.status == DefectStatus.open) {
                    return {success: false, message: `Defect: '${defectId}' is open so test should not be run.`};
                }
            }
        }
        // next search for any defects referencing the specified Test ID's
        if (this._testCases.length > 0) {
            for (var i=0; i<this._testCases.length; i++) {
                let testId: string = this._testCases[i];
                let defects: IDefect[] = await this._defectManager.findDefects(testId) || [];
                for (var j=0; j<defects.length; j++) {
                    let d: IDefect = defects[j];
                    if (d?.status == DefectStatus.open) {
                        return {success: false, message: `TestId: '${testId}' has open defect '${d.id}' so test should not be run.`};
                    }
                }
            }
        }
        return {success: true};
    }

    private async _generateTestResults(status: TestStatus, logMessage: string, ...testIds: string[]): Promise<ITestResult[]> {
        let results: ITestResult[] = [];
        if (testIds.length > 0) {
            for (var i=0; i<testIds.length; i++) {
                let testId: string = testIds[i];
                let result: ITestResult = await this._generateTestResult(status, logMessage, testId);
                results.push(result);
            }
        } else {
            let result: ITestResult = await this._generateTestResult(status, logMessage);
            results.push(result);
        }
        return results;
    }

    private async _generateTestResult(status: TestStatus, logMessage: string, testId?: string): Promise<ITestResult> {
        let result: ITestResult = {
            testId: testId,
            created: new Date(),
            resultId: rand.guid,
            resultMessage: (logMessage) ? ellide(logMessage, 100) : undefined,
            status: status,
            metadata: {
                durationMs: convert.toElapsedMs(this._startTime),
                statusStr: TestStatus[status],
                buildName: await this._buildInfoManager.getBuildName() || 'unknown',
                buildNumber: await this._buildInfoManager.getBuildNumber() || 'unknown'
            }
        };
        if (this._errors.length > 0) {
            let exceptionsStr: string = this._errors.join('\n');
            result.metadata['errors'] = exceptionsStr;
        }
        return result;
    }
}