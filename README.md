# AFT-Core
the Automated Functional Testing (AFT) library provides a framework for creating Functional Test Automation that needs to integrate with external systems and can be used for post-deployment verification testing, end-user acceptance testing, end-to-end testing as well as high-level integration testing scenarios. it enables test execution flow control and reporting as well as streamlined test development for JavaScript and TypeScript test automation by integrating with common test framworks as well as external test and defect tracking systems (via a robust plugin structure).

## Example Jasmine Test:
```typescript
describe('Sample Test', () => {
    it('can perform a demonstration of AFT-Core', async () => {
        let feature: FeatureObj = new FeatureObj();
        /**
         * the `should(expectation, options)` function
         * checks any specified `ITestCaseHandlerPlugin`
         * and `IDefectHandlerPlugin` implementations
         * to ensure the test should be run. It will then
         * report to any `ILoggingPlugin` implementations
         * with a `TestResult` indicating the success,
         * failure or skipped status
         */
        await should(() => expect(feature.performAction()).toBe('result of action'), 
        {
            testCases: ['C1234'], 
            description: 'expect that performAction will return \'result of action\''
        });
    });
});
```
the above results in the following console output if the expectation does not return false or throw an exception:
```
5:29:55 PM PASS  - [expect_that_performAction_will_return_result_of_action] C1234 Passed -
```
in more complex scenarios you can perform multiple actions inside the _expectation_ like in the following example:
```typescript
describe('Sample Test', () => {
    it('can perform a more complex demonstration of AFT-Core', async () => {
        let feature: FeatureObj = new FeatureObj();
        /**
         * the passed in expectation can accept a `TestWrapper` which can be used
         * during more complex actions
         */
        await should(async (tw) => {
            await tw.logger.step('about to call performAction');
            let result: string = feature.performAction();
            await tw.logger.info(`result of performAction was '${result}'`);
            expect(result).toBe('result of action');
            await tw.logger.trace('successfully executed expectation');
        },
        {
            testCases: ['C2345', 'C3344'], 
            description: 'more complex expectation actions'
        });
    });
});
```
which would output the following logs
```
5:29:55 PM STEP  - [more_complex_expectation_actions] 1: about to call performAction
5:29:55 PM INFO  - [more_complex_expectation_actions] result of performAction was 'result of action'
5:29:56 PM TRACE - [more_complex_expectation_actions] successfully executed expectation
5:29:56 PM PASS  - [more_complex_expectation_actions] Passed C2345 -
5:29:56 PM PASS  - [more_complex_expectation_actions] Passed C3344 -
```
## Benefits of AFT
the AFT-Core package on it's own contains some helpers for testing, but the actual benefit comes from the plugins. Because the above logging will also send to any registered logging plugins, it becomes easy to create loggers that send to any external system such as TestRail or to log results to Elasticsearch. Additionally, before running any _expectation_ passed to a `should(expectation, options)` function, AFT will confirm if the expectation should actually be run based on the results of a query to any supplied `ITestCaseHandlerPlugin` implementations and a subsequent query to any supplied `IDefectHandlerPlugin` implementations. 
### Logging Plugin
to create a logging plugin you simply need to implment the `ILoggingPlugin` interface in a class with a constructor accepting no arguments. Then, in your `aftconfig.json` add the following (where your `ILoggingPlugin` implementations are contained in files at `./relative/path/to/logging-plugin1.ts` and `/full/path/to/logging-plugin2.ts`):
```json
{
    "logging": {
        "pluginNames": [
            "./relative/path/to/logging-plugin1",
            "/full/path/to/logging-plugin2"
        ],
        "level": "info"
    }
}
```
```
NOTE: if the plugins are referenced as an external npm packages you may leave off the path and just reference by package name
```
#### Example Logging Plugin
```typescript
export class ExternalLogger implements ILoggingPlugin {
    name: string = 'externallogger';
    async level(): Promise<TestLogLevel> {
        let levelStr: string = await TestConfig.get('externalLogging.level', TestLogLevel.warn.name);
        return TestLogLevel.parse(levelStr);
    }
    async isEnabled(): Promise<boolean> {
        let enabledStr: string = await TestConfig.get('externalLogging.enabled', 'false');
        return enabledStr.toLocaleLowerCase() == 'true';
    }
    async onLoad(): Promise<void> {
        /* do something once on load */
    }
    async log(level: TestLogLevel, message: string): Promise<void> {
        /* perform some external logging action */
    }
    async logResult(result: TestResult): Promise<void> {
        /* log the TestResult to an external system */
    }
    async finalise(): Promise<void> {
        /* perform any cleanup */
    }
}
```
### Test Case Handler Plugin
the purpose of an `ITestCaseHandlerPlugin` is to provide execution control over any expectations by way of supplied _Test IDs_. to specify an implementation of the plugin to load you can add the following to your `aftconfig.json` (where the plugin can be found in a file called `plugin.ts` at relative path `./path/to`):
```json
{
    "testCaseManager": {
        "pluginName": "./path/to/plugin"
    }
}
```
if no plugin is specified then external Test Case Management integration will be disabled and expectations will be executed without checking their status before execution
```
NOTE: if the plugin is referenced as an external npm package you may leave off the path and just reference by package name
```
#### Example Test Case Handler Plugin (TestRail)
```typescript
export class MockTestCaseHandlerPlugin implements ITestCaseHandlerPlugin {
    name: string = 'testrail-test-case-handler-plugin';
    private testRailApi: TestRailClient;
    constructor(): void {
        this.testRailApi = new TestRailClient();
    }
    async isEnabled(): Promise<boolean> {
        return true;
    }
    async onLoad(): Promise<void> {
        /* do something one time on load */
    }
    async getTestCase(testId: string): Promise<ITestCase> {
        return await testRailApi.getCaseById(testId);
    }
    async findTestCases(searchTerm: string): Promise<ITestCase[]> {
        return await testRailApi.searchByTerm(searchTerm);
    }
    async shouldRun(testId: string): Promise<IProcessingResult> {
        let c: ITestCase = await this.getTestCase(testId);
        if (c.status == TestStatus.Untested) {
            return {obj: c, success: true, message: 'test has not yet been run'};
        }
        return {obj: c, success: false, message: 'test already has a result'};
    }
}
```
### Defect Handler Plugin
the purpose of an `IDefectHandlerPlugin` is to provide execution control over any expectations by way of supplied _Test IDs_ referenced in an external ticket tracking system like Bugzilla or Jira. to specify an implementation of the plugin to load you can add the following to your `aftconfig.json` (where the plugin can be found in a file called `plugin.ts` at relative path `./path/to`):
```json
{
    "defectManager": {
        "pluginName": "./path/to/plugin"
    }
}
```
if no plugin is specified then external Defect Management integration will be disabled and expectations will be executed without checking their status before execution, however if a Defect Management plugin is specified, the execution of any expectations passed into a `should(expectation, options)` function will be halted if any non-closed defects are found when searching for defects that contain reference to the specified _Test IDs_
```
NOTE: if the plugin is referenced as an external npm package you may leave off the path and just reference by package name
```
#### Example Defect Handler Plugin (Bugzilla)
```typescript
export class MockDefectHandlerPlugin implements IDefectHandlerPlugin {
    name: string = 'bugzilla-defect-handler-plugin';
    private bugzillaApi: BugzillaClient;
    constructor(): void {
        this.bugzillaApi = new BugzillaClient();
    }
    async isEnabled(): Promise<boolean> {
        return true;
    }
    async onLoad(): Promise<void> {
        /* do something one time on load */
    }
    async getDefect(defectId: string): Promise<IDefect> {
        return await bugzillaApi.getDefectById(defectId);
    }
    async findDefects(searchTerm: string): Promise<IDefect[]> {
        return await bugzillaApi.searchByTerm(searchTerm);
    }
}
```
