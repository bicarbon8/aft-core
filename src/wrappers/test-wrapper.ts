import { cloneDeep } from "lodash";
import { LoggingPluginManager } from "../plugins/logging/logging-plugin-manager";
import { convert } from "../helpers/converter";
import { ProcessingResult } from "../helpers/processing-result";
import { TestCasePluginManager } from "../plugins/test-cases/test-case-plugin-manager";
import { DefectStatus } from "../plugins/defects/defect-status";
import { rand } from "../helpers/random-generator";
import { ellide } from "../helpers/ellide";
import { DefectPluginManager } from "../plugins/defects/defect-plugin-manager";
import { BuildInfoPluginManager } from "../plugins/build-info/build-info-plugin-manager";
import { Func } from "../helpers/custom-types";
import { IDefect } from "../plugins/defects/idefect";
import { TestStatus } from "../plugins/test-cases/test-status";
import { ITestResult } from "../plugins/test-cases/itest-result";

export interface TestWrapperOptions {
    /**
     * a function that returns a boolean result indicating its
     * success, for example a {Jasmine.expect(..).toBe(...)}
     */
    expect: Func<TestWrapper, boolean | PromiseLike<boolean>>;
    /**
     * [OPTIONAL] an array of Defect IDs associated with this test
     * if an {AbstractDefectPlugin} implementation is loaded these
     * IDs will be checked to ensure the test should proceed
     */
    defects?: string[];
    /**
     * [OPTIONAL] description of the test being run and value used
     * for the {LoggingPluginManager.logName}
     */
    description?: string;
    /**
     * [OPTIONAL] an array of Test Case IDs associated with this test
     * if an {AbstractTestCasePlugin} implementation is loaded these
     * IDs will be checked to ensure the test should proceed
     */
    testCases?: string[];
    
    /**
     * [OPTIONAL] if not passed in the {BuildInfoPluginManager.instance()}
     * will be used instead
     */
    _buildInfoManager?: BuildInfoPluginManager;
    /**
     * [OPTIONAL] if not passed in the {DefectPluginManager.instance()}
     * will be used instead
     */
    _defectManager?: DefectPluginManager;
    /**
     * [OPTIONAL] if not passed in a new {LoggingPluginManager} instance
     * will be created with a name matching the {description} or a GUID
     * in the case of no {description}
     */
    _logMgr?: LoggingPluginManager;
    /**
     * [OPTIONAL] if not passed in the {TestCasePluginManager.instance()}
     * will be used instead
     */
    _testCaseManager?: TestCasePluginManager;
}

/**
 * provides pre-test execution filtering based on specified 
 * test IDs or defect IDs and post-test results logging. usage
 * is intended to be managed through the {should(options)}
 * function via:
 * ```
 * await should(() => expect(true).toBeTruthy(), {description: 'expect true is truthy'});
 * ```
 */
export class TestWrapper {
    readonly expectation: Func<TestWrapper, any>;
    readonly description: string;
    readonly logMgr: LoggingPluginManager;

    private _testCases: string[];
    private _defects: string[];
    private _errors: string[];
    private _startTime: number;

    private readonly _testCaseManager: TestCasePluginManager;
    private readonly _defectManager: DefectPluginManager;
    private readonly _buildInfoManager: BuildInfoPluginManager;

    constructor(options: TestWrapperOptions) {
        this.expectation = options.expect;
        this.description = this._initialiseDescription(options);
        this.logMgr = this._initialiselogMgr(options);
        this._testCaseManager = this._initialiseTestCases(options);
        this._defectManager = this._initialiseDefects(options);
        this._buildInfoManager = this._initialiseBuildInfo(options);
        this._initialiseErrors(options);
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
     * and returns the result via an {ProcessingResult}.
     * 
     * usage:
     * ```typescript
     * let tw: TestWrapper = new TestWrapper({
     *     expect: async (t) => {
     *         await t.logMgr().info("using the TestWrapper's LoggingPluginManager");
     *         let foo = 'foo';
     *         return expect(foo).toEqual('foo');
     *     }
     * });
     * await tw.run();
     * ```
     * @returns a {ProcessingResult} specifying the result of execution of
     * the passed in expectation
     */
    async run(): Promise<ProcessingResult> {
        this._startTime = new Date().getTime();
        
        let result: ProcessingResult = await this._beginProcessing();
        await this._logResult(result);

        return result;
    }

    private _initialiseDescription(options: TestWrapperOptions): string {
        let desc: string;
        if (options.description) {
            desc = options.description;
        } else {
            if (options.testCases?.length) {
                desc = `${options.testCases?.join(' ')}`
            } else {
                desc = rand.guid;
            }
        }
        return desc;
    }

    private _initialiselogMgr(options: TestWrapperOptions): LoggingPluginManager {
        return options._logMgr || new LoggingPluginManager({logName: this.description});
    }

    private _initialiseTestCases(options: TestWrapperOptions): TestCasePluginManager {
        this._testCases = [];
        options.testCases?.forEach(c => {
            this._testCases.push(c);
        });
        return options._testCaseManager || TestCasePluginManager.instance();
    }

    private _initialiseDefects(options: TestWrapperOptions): DefectPluginManager {
        this._defects = [];
        options.defects?.forEach(d => {
            this._defects.push(d);
        });
        return options._defectManager || DefectPluginManager.instance();
    }

    private _initialiseBuildInfo(options: TestWrapperOptions): BuildInfoPluginManager {
        return options._buildInfoManager || BuildInfoPluginManager.instance();
    }

    private _initialiseErrors(options: TestWrapperOptions) {
        this._errors = [];
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
                await this.logMgr.logResult(result);
            } catch (e) {
                await this.logMgr.warn(`unable to log test result for test '${result.testId || result.resultId}' due to: ${e}`);
            }
        }

        await this.logMgr.dispose();
    }

    private async _logMessage(status: TestStatus, message: string): Promise<void> {
        switch (status) {
            case TestStatus.Blocked:
            case TestStatus.Retest:
            case TestStatus.Skipped:
            case TestStatus.Untested:
                await this.logMgr.warn(message);
                break;
            case TestStatus.Failed:
                await this.logMgr.fail(message);
                break;
            case TestStatus.Passed:
            default:
                await this.logMgr.pass(message);
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
        if (this.expectation) {
            let shouldRun: ProcessingResult = await this._shouldRun();
            if (shouldRun.success) {
                try {
                    let result = await Promise.resolve(this.expectation(this));
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