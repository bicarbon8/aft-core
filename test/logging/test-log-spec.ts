import { TestLog } from "../../src/logging/test-log";
import { RG } from "../../src/helpers/random-generator";
import { ITestResult } from "../../src/integrations/test-cases/itest-result";
import { LoggingPluginStore } from "./logging-plugin-store";
import { LoggingOptions, TestStatus } from "../../src";

let consoleLog = console.log;
describe('TestLog', () => {
    beforeAll(() => {
        console.log = function(){};
    });

    afterAll(() => {
        console.log = consoleLog;
    });

    beforeEach(() => {
        LoggingPluginStore.reset();
    });

    it('will send logs to any registered ILoggingPlugin implementations', async () => {
        let opts: LoggingOptions = {
            name: 'will send logs to any registered ILoggingPlugin implementations',
            pluginNames: ['./dist/test/logging/fake-logger']
        };
        let logger: TestLog = new TestLog(opts);

        let messages: string[] = [];
        for (var i=0; i<5; i++) {
            messages.push(RG.getString(RG.getInt(10, 30)));
        }

        for (var i=0; i<messages.length; i++) {
            await logger.trace(messages[i]);
            await logger.debug(messages[i]);
            await logger.step(messages[i]);
            await logger.info(messages[i]);
            await logger.warn(messages[i]);
            await logger.error(messages[i]);
        }

        expect(LoggingPluginStore.logs.length).toEqual(5 * 6);
        expect(LoggingPluginStore.results.length).toEqual(0);
        expect(LoggingPluginStore.logs[0].message).toEqual(messages[0]);
        expect(LoggingPluginStore.logs[LoggingPluginStore.logs.length - 1].message).toEqual(messages[messages.length - 1]);
    });

    it('will send cloned TestResult to any registered ILoggingPlugin implementations', async () => {
        let opts: LoggingOptions = {
            name: 'will send cloned TestResult to any registered ILoggingPlugin implementations',
            pluginNames: ['./dist/test/logging/fake-logger']
        };
        let logger: TestLog = new TestLog(opts);

        let result: ITestResult = {
            testId: 'C' + RG.getInt(1000, 999999),
            created: new Date(),
            resultId: RG.getGuid(),
            status: TestStatus.Untested,
            resultMessage: RG.getString(100)
        };
        
        // wait 0.1 second
        await new Promise((resolve, reject) => {
            setTimeout(resolve, 10);
        });

        await logger.logResult(result);

        expect(LoggingPluginStore.logs.length).toEqual(0);
        expect(LoggingPluginStore.results.length).toEqual(1);
        expect(LoggingPluginStore.results[0]).not.toBe(result);
        expect(LoggingPluginStore.results[0].testId).toEqual(result.testId);
        expect(LoggingPluginStore.results[0].created).toEqual(result.created);
    });

    it('calls ILoggingPlugin.finalise on TestLog.finalise', async () => {
        let opts: LoggingOptions = {
            name: 'calls ILoggingPlugin.finalise on TestLog.finalise',
            pluginNames: ['./dist/test/logging/fake-logger']
        };
        let logger: TestLog = new TestLog(opts);

        await logger.info(RG.getString(18));

        expect(LoggingPluginStore.finalised).toEqual(false);

        await logger.finalise();

        expect(LoggingPluginStore.finalised).toEqual(true);
    });
});