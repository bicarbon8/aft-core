import { TestLog } from "../../src/logging/test-log";
import { LoggingLevel } from "../../src/logging/logging-level";
import { RandomGenerator } from "../../src/helpers/random-generator";
import { TestResult } from "../../src/integrations/test-cases/test-result";
import { using } from "../../src/helpers/using";
import { LogMessage } from "./log-message";
import { LoggingPluginStore } from "./logging-plugin-store";
import { ILoggingOptions } from "../../src";

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
        let opts: ILoggingOptions = {
            name: 'will send logs to any registered ILoggingPlugin implementations',
            pluginNames: ['./dist/test/logging/fake-logger']
        };
        let logger: TestLog = new TestLog(opts);

        let messages: string[] = [];
        for (var i=0; i<5; i++) {
            messages.push(RandomGenerator.getString(RandomGenerator.getInt(10, 30)));
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
        let opts: ILoggingOptions = {
            name: 'will send cloned TestResult to any registered ILoggingPlugin implementations',
            pluginNames: ['./dist/test/logging/fake-logger']
        };
        let logger: TestLog = new TestLog(opts);

        let result: TestResult = new TestResult({
            testId: 'C' + RandomGenerator.getInt(1000, 999999),
            resultMessage: RandomGenerator.getString(100)
        });
        
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

    it('calls ILoggingPlugin.finalise on TestLog.dispose', async () => {
        let opts: ILoggingOptions = {
            name: 'calls ILoggingPlugin.finalise on TestLog.dispose',
            pluginNames: ['./dist/test/logging/fake-logger']
        };
        let logger: TestLog = new TestLog(opts);

        await logger.info(RandomGenerator.getString(18));

        expect(LoggingPluginStore.finalised).toEqual(false);

        await logger.dispose();

        expect(LoggingPluginStore.finalised).toEqual(true);
    });

    it('implements IDisposable', async () => {
        let opts: ILoggingOptions = {
            name: 'implements IDisposable',
            pluginNames: ['./dist/test/logging/fake-logger']
        };
        let message = RandomGenerator.getString(30);

        await using(new TestLog(opts), async (logger) => {
            await logger.info(message);
        });

        let actual: LogMessage = LoggingPluginStore.logs[0];
        expect(actual).toBeDefined();
        expect(actual.level).toEqual(LoggingLevel.info);
        expect(actual.message).toEqual(message);
        expect(LoggingPluginStore.finalised).toEqual(true);
    });
});