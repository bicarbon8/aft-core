# AFT-Core
Automation Framework for Test (AFT) provides integrations with common testing systems to enable test execution flow and reporting as well as streamlined test development for JavaScript and TypeScript Unit, Integration and Functional tests.

## Example Jasmine Test:
```typescript
describe('Sample Test', () => {
    it('can perform a demonstration of AFT-Core', async () => {
        let options: TestWrapperOptions = new TestWrapperOptions('can perform a demonstration of AFT-Core');
        options.testCases.addRange('C2217763', 'C3131');
        await using(new TestWrapper(options), async (tw) => {
            await tw.check('C2217763', async () => {
                tw.logger.step('performing some action that throws Error...');
                throw new Error("the tw.check will not allow this to halt the test");
                // because of the above Error a TestResult of Failed will be logged for Test ID: C2217763
            });

            await tw.check('C3131', async () => {
                tw.logger.step('performing action that requires waiting for condition...');
                let result: Result;
                let count: number = 0;
                await Wait.forCondition(async () => {
                    tw.logger.info(`attempt ${++count}`);
                    result = await someAsyncActionReturningResultOrNull();
                    if (result) {
                        return true;
                    }
                    return false;
                }, 10000); // maximum wait of 10 seconds
                tw.logger.info(`we retried the action ${count} times before it returned a valid Result or until 10 seconds had elapsed.`);
            });
        });
    });
});
```
the above results in the following console output:
```
5:29:55 PM STEP  - [can_perform_a_demonstration_of_AFT-Core] 1: performing some action that throws Error...
5:29:56 PM FAIL  - [can_perform_a_demonstration_of_AFT-Core] Failed - C3456: the tw.check will not allow this to halt the test
5:29:56 PM STEP  - [can_perform_a_demonstration_of_AFT-Core] 2: performing action that requires waiting for condition...
5:29:56 PM INFO  - [can_perform_a_demonstration_of_AFT-Core] attempt 1
5:31:24 PM INFO  - [can_perform_a_demonstration_of_AFT-Core] attempt 2
5:33:02 PM INFO  - [can_perform_a_demonstration_of_AFT-Core] we retried the action 2 times before it returned a valid Result or until 10 seconds had elapsed.
5:29:56 PM PASS  - [can_perform_a_demonstration_of_AFT-Core] Passed - C3131:
```
## Actual Benefit of AFT
the AFT-Core package on it's own contains some helpers for testing, but the actual benefit comes from the plugins. Because the above logging will also send to any registered logging plugins, it becomes easy to create loggers that send to any external system such as TestRail or to log results to Elasticsearch.
### Logging Plugin
to create a logging plugin you simply need to implment the `ILoggingPlugin` interface in a class with a constructor accepting no arguments. Then, in your `aftconfig.json` add the following (where your `ILoggingPlugin` implementations are contained in files at `./relative/path/to/logging-plugin1.ts` and `/full/path/to/logging-plugin2.ts`):
```json
{
    "logging_plugins": "./relative/path/to/logging-plugin1,/full/path/to/logging-plugin2"
}
```
```
NOTE: if the plugins are referenced as external npm packages you may leave off the path and just reference by package name
```
#### Example Logging Plugin
```typescript
export class ExternalLogger implements ILoggingPlugin {
    name: string = 'externallogger';
    
    async level(): Promise<TestLogLevel> {
        let levelStr: string = await TestConfig.getValueOrDefault('external-logging-level', TestLogLevel.warn.name);
        return TestLogLevel.parse(levelStr);
    }

    async enabled(): Promise<boolean> {
        let enabledStr: string = await TestConfig.getValueOrDefault('external-logging-enabled', 'false');
        return enabledStr.toLocaleLowerCase() == 'true';
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