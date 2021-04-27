# AFT-Core
the Automated Functional Testing (AFT) library provides a framework for creating Functional Test Automation that needs to integrate with external systems and can be used for post-deployment verification testing, end-user acceptance testing, end-to-end testing as well as high-level integration testing scenarios. it enables test execution flow control and reporting as well as streamlined test development for JavaScript and TypeScript test automation by integrating with common test framworks as well as external test and defect tracking systems (via a robust plugin structure).

## Example Jasmine Test:
```typescript
describe('Sample Test', () => {
    it('can perform a demonstration of AFT-Core', async () => {
        let feature: FeatureObj = new FeatureObj();
        /**
         * the `should(options)` function
         * checks any specified `ITestCaseHandlerPlugin`
         * and `IDefectHandlerPlugin` implementations
         * to ensure the test should be run. It will then
         * report to any `ILoggingPlugin` implementations
         * with a `TestResult` indicating the success,
         * failure or skipped status
         */
        await should({expect: () => expect(feature.performAction()).toBe('result of action'),
            testCases: ['C1234'], 
            description: 'expect that performAction will return \'result of action\''
        });
    });
});
```
the above results in the following console output if the expectation does not return false or throw an exception:
```
5:29:55 PM - expect_that_performAction_will_return_result_of_action - PASS  - C1234
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
        await should({
            expect: async (tw) => {
                await tw.logMgr.step('about to call performAction');
                let result: string = feature.performAction();
                await tw.logMgr.info(`result of performAction was '${result}'`);
                let success: boolean = expect(result).toBe('result of action');
                await tw.logMgr.trace('successfully executed expectation');
                return success;
            },
            testCases: ['C2345', 'C3344'], 
            description: 'more complex expectation actions'
        });
    });
});
```
which would output the following logs:
```
5:29:55 PM - more_complex_expectation_actions - STEP  - 1: about to call performAction
5:29:55 PM - more_complex_expectation_actions - INFO  - result of performAction was 'result of action'
5:29:56 PM - more_complex_expectation_actions - TRACE - successfully executed expectation
5:29:56 PM - more_complex_expectation_actions - PASS  - C2345
5:29:56 PM - more_complex_expectation_actions - PASS  - C3344
```
## Benefits of AFT
the AFT-Core package on it's own contains some helpers for testing, but the actual benefit comes from the plugins. Because the above logging will also send to any registered logging plugins, it becomes easy to create logging plugins that send to any external system such as TestRail or to log results to Elasticsearch. Additionally, before running any _expectation_ passed to a `should(options)` function, AFT will confirm if the expectation should actually be run based on the results of a query to any supplied `AbstractTestCasePlugin` implementations and a subsequent query to any supplied `AbstractDefectPlugin` implementations. 
### Logging Plugins
to create a logging plugin you simply need to extend from the `AbstractLoggingPlugin` class in a class with a constructor accepting a simple object and from the constructor, call `super(key, options)` where the `key` is the name of the section in your `aftconfig.json` where configuration can be specified for your plugin. Then, in your `aftconfig.json` add the following (where plugins `console-logging-plugin.js` is bundled with `aft-core` and `logging-plugin2.js` is some bespoke plugin that is contained within the test execution directory or a subdirectory of it and `loggingpluginmanager` is the logging plugin manager):
```json
{
    "loggingpluginmanager": {
        "pluginNames": [
            "console-logging-plugin",
            "logging-plugin2"
        ],
        "level": "info"
    }
}
```
> NOTE: it is also possible to specify a full path to the plugin like: '/full/path/to/logging-plugin2' leaving off the suffix (useful for plugins not contained in a directory or subdirectory of the test execution directory)

> NOTE: setting the `level` in the `loggingpluginmanager` will override any settings in the plugins own configuration setting (this can be useful to disable all logging by setting it to a value of `none`)

#### Example Logging Plugin
to create your own simple logging plugin that stores all logs until the `dispose` function is called you would implement the code below.

> NOTE: configuration for the below can be added in a object in the `aftconfig.json` named `ondisposeconsolelogger` based on the `key` passed to the `AbstractLoggingPlugin` constructor
```typescript
export class OnDisposeConsoleLogger extends AbstractLoggingPlugin {
    private _logs: string[];
    constructor(options?: ILoggingPluginOptions) {
        super('ondisposeconsolelogger', options);
        this._logs = [];
    }
    async onLoad(): Promise<void> {
        /* do nothing */
    }
    async log(level: LoggingLevel, message: string): Promise<void> {
        if (await this.enabled()) {
            let l: LoggingLevel = await this.level();
            if (level.value >= l.value && level != LoggingLevel.none) {
                this._logs.push(`${level.logString} - ${message}`);
            }
        }
    }
    async logResult(result: ITestResult): Promise<void> { 
        if (result.status.Passed) {
            this.log(LoggingLevel.pass, JSON.stringify(result));
        } else {
            this.log(LogginLevel.fail, JSON.stringify(result));
        }
    }
    async dispose(error?: Error): Promise<void> { 
        console.log(`[${await this.name()}]`);
        this._logs.forEach((message) => {
            console.log(message);
        });
        if (error) {
            console.error(`ERROR: ${error.message}`);
        }
        console.log('OnDisposeConsoleLogger is now disposed!');
    }
}
```
### Test Case Plugin
the purpose of an `AbstractTestCasePlugin` implementation is to provide execution control over any expectations by way of supplied _Test IDs_. to specify an implementation of the plugin to load you can add the following to your `aftconfig.json` (where plugins `test-case-plugin.js` is contained within the test execution directory or a subdirectory of it):
```json
{
    "testcasepluginmanager": {
        "pluginNames": ["test-case-plugin"]
    }
}
```
if no plugin is specified then external Test Case Management integration will be disabled and expectations will be executed without checking their status before execution
> NOTE: it is also possible to specify a full path to the plugin like: '/full/path/to/test-case-plugin' leaving off the suffix

#### Example Test Case Plugin (TestRail)
```typescript
export class TestRailTestCasePlugin extends AbstractTestCasePlugin {
    private _client: TestRailClient;
    constructor(options?: ITestCasePluginOptions) {
        super('testrailtestcaseplugin', options);
        this._client = new TestRailClient();
    }
    async onLoad(): Promise<void> { /* perform some action if needed */ }
    async getTestCase(testId: string): Promise<ITestCase> {
        return await this._client.getTestCase(testId);
    }
    async findTestCases(searchTerm: string): Promise<ITestCase[]> {
        return await this._client.findTestCases(searchTerm);
    }
    async shouldRun(testId: string): Promise<ProcessingResult> {
        return await this._client.shouldRun(testId);
    }
}
```
### Defect Plugin
the purpose of an `AbstractDefectPlugin` implementation is to provide execution control over any expectations by way of supplied _Test IDs_ referenced in an external ticket tracking system like Bugzilla or Jira. to specify an implementation of the plugin to load you can add the following to your `aftconfig.json` (where plugins `defect-plugin.js` is contained within the test execution directory or a subdirectory of it):
```json
{
    "defectpluginmanager": {
        "pluginNames": ["defect-plugin"]
    }
}
```
if no plugin is specified then external Defect Management integration will be disabled and expectations will be executed without checking their status before execution, however if a Defect Management plugin is specified, the execution of any expectations passed into a `should(options)` function will be halted if any non-closed defects are found when searching for defects that contain reference to the specified _Test IDs_
> NOTE: it is also possible to specify a full path to the plugin like: '/full/path/to/defect-plugin' leaving off the suffix

#### Example Defect Plugin (Bugzilla)
```typescript
export class BugzillaDefectPlugin extends AbstractDefectPlugin {
    private _client: BugzillaClient;
    constructor(options?: IDefectPluginOptions) {
        super('bugzilladefectplugin', options)
        this._client = new BugzillaClient();
    }
    async onLoad(): Promise<void> { /* perform some action if needed */ }
    async getDefect(defectId: string): Promise<IDefect> {
        return await this._client.getDefect(defectId);
    }
    async findDefects(searchTerm: string): Promise<IDefect[]> {
        return await this._client.findDefects(searchTerm);
    }
}
```
