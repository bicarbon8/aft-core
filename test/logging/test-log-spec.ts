import { TestLog } from "../../src/logging/test-log";
import { TestLogLevel } from "../../src/logging/test-log-level";
import { RandomGenerator } from "../../src/helpers/random-generator";
import { TestLogOptions } from "../../src/logging/test-log-options";
import { TestResult } from "../../src/integrations/test-cases/test-result";
import { using } from "../../src/helpers/using";
import { ILoggingPlugin } from "../../src/logging/plugins/ilogging-plugin";

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
        let opts: TestLogOptions = new TestLogOptions('will send logs to any registered ILoggingPlugin implementations');
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
        let opts: TestLogOptions = new TestLogOptions('will send cloned TestResult to any registered ILoggingPlugin implementations');
        let logger: TestLog = new TestLog(opts);

        let result: TestResult = new TestResult();
        result.TestId = 'C' + RandomGenerator.getInt(1000, 999999);

        // wait 0.1 second
        await new Promise((resolve, reject) => {
            setTimeout(resolve, 10);
        });

        await logger.logResult(result);

        expect(LoggingPluginStore.logs.length).toEqual(0);
        expect(LoggingPluginStore.results.length).toEqual(1);
        expect(LoggingPluginStore.results[0].TestId).toEqual(result.TestId);
        expect(LoggingPluginStore.results[0].Created).not.toEqual(result.Created); // because the TestResult is a clone created at a different time
    });

    it('calls ILoggingPlugin.finalise on TestLog.dispose', async () => {
        let opts: TestLogOptions = new TestLogOptions('calls ILoggingPlugin.finalise on TestLog.dispose');
        let logger: TestLog = new TestLog(opts);

        await logger.info(RandomGenerator.getString(18));

        expect(LoggingPluginStore.finalised).toEqual(false);

        await logger.dispose();

        expect(LoggingPluginStore.finalised).toEqual(true);
    });

    it('implements IDisposable', async () => {
        let opts: TestLogOptions = new TestLogOptions('implements IDisposable');
        let message = RandomGenerator.getString(30);

        await using(new TestLog(opts), async (logger) => {
            logger.info(message);
        });

        let actual: LogMessage = LoggingPluginStore.logs[0];
        expect(actual.level).toEqual(TestLogLevel.info);
        expect(actual.message).toEqual(message);
        expect(LoggingPluginStore.finalised).toEqual(true);
    });
});

@ILoggingPlugin.register
class FakeLogger implements ILoggingPlugin {
    name: string = 'fakelogger';
    
    async level(): Promise<TestLogLevel> {
        return LoggingPluginStore.lvl;
    }

    async enabled(): Promise<boolean> {
        return LoggingPluginStore.en;
    }

    async log(level: TestLogLevel, message: string): Promise<void> {
        LoggingPluginStore.logs.push(new LogMessage(level, message));
    }

    async logResult(result: TestResult): Promise<void> {
        LoggingPluginStore.results.push(result);
    }

    async finalise(): Promise<void> {
        LoggingPluginStore.finalised = true;
    }
}

module LoggingPluginStore {
    export var logs: LogMessage[] = [];
    export var results: TestResult[] = [];
    export var lvl: TestLogLevel = TestLogLevel.info;
    export var en: boolean = true;
    export var finalised: boolean = false;

    export function reset() {
        logs = [];
        results = [];
        lvl = TestLogLevel.info;
        en = true;
        finalised = false;
    }
}

class LogMessage {
    level: TestLogLevel;
    message: string;
    constructor(level: TestLogLevel, message: string) {
        this.level = level;
        this.message = message;
    }
}