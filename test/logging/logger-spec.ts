import { Logger, LoggerOptions } from "../../src/logging/logger";
import { rand } from "../../src/helpers/random-generator";
import { ITestResult } from "../../src/test-cases/itest-result";
import { LPS } from "../plugins/logging/logging-plugin-store";
import { TestStatus, wait } from "../../src";

let consoleLog = console.log;
describe('TestLog', () => {
    beforeAll(() => {
        console.log = function(){};
    });

    afterAll(() => {
        console.log = consoleLog;
    });

    beforeEach(() => {
        LPS.reset();
    });

    it('will send logs to any registered ILoggingPlugin implementations', async () => {
        let opts: LoggerOptions = {
            name: 'will send logs to any registered ILoggingPlugin implementations',
            pluginNames: ['fake-logger']
        };
        let logger: Logger = new Logger(opts);

        let messages: string[] = [];
        for (var i=0; i<5; i++) {
            messages.push(rand.getString(rand.getInt(10, 30)));
        }

        for (var i=0; i<messages.length; i++) {
            await logger.trace(messages[i]);
            await logger.debug(messages[i]);
            await logger.step(messages[i]);
            await logger.info(messages[i]);
            await logger.warn(messages[i]);
            await logger.error(messages[i]);
        }

        expect(LPS.logs.length).toEqual(5 * 6);
        expect(LPS.results.length).toEqual(0);
        expect(LPS.logs[0].message).toEqual(messages[0]);
        expect(LPS.logs[LPS.logs.length - 1].message).toEqual(messages[messages.length - 1]);
    });

    it('will send cloned TestResult to any registered ILoggingPlugin implementations', async () => {
        let opts: LoggerOptions = {
            name: 'will send cloned TestResult to any registered ILoggingPlugin implementations',
            pluginNames: ['fake-logger']
        };
        let logger: Logger = new Logger(opts);

        let result: ITestResult = {
            testId: 'C' + rand.getInt(1000, 999999),
            created: new Date(),
            resultId: rand.guid,
            status: TestStatus.Untested,
            resultMessage: rand.getString(100)
        };
        
        // wait 0.1 second
        await wait.forDuration(10);

        await logger.logResult(result);

        expect(LPS.logs.length).toEqual(0);
        expect(LPS.results.length).toEqual(1);
        expect(LPS.results[0]).not.toBe(result);
        expect(LPS.results[0].testId).toEqual(result.testId);
        expect(LPS.results[0].created).toEqual(result.created);
    });

    it('calls ILoggingPlugin.finalise on TestLog.finalise', async () => {
        let opts: LoggerOptions = {
            name: 'calls ILoggingPlugin.finalise on TestLog.finalise',
            pluginNames: ['fake-logger']
        };
        let logger: Logger = new Logger(opts);

        await logger.info(rand.getString(18));

        expect(LPS.finalised).toEqual(false);

        await logger.finalise();

        expect(LPS.finalised).toEqual(true);
    });
});