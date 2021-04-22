import { TestLog } from "../../src/logging/test-log";
import { RG } from "../../src/helpers/random-generator";
import { ITestResult } from "../../src/integrations/test-cases/itest-result";
import { LPS } from "./logging-plugin-store";
import { LoggingOptions, TestStatus, Wait } from "../../src";

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
        let opts: LoggingOptions = {
            name: 'will send logs to any registered ILoggingPlugin implementations',
            pluginNames: ['./dist/aft-core/test/logging/fake-logger']
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

        expect(LPS.logs.length).toEqual(5 * 6);
        expect(LPS.results.length).toEqual(0);
        expect(LPS.logs[0].message).toEqual(messages[0]);
        expect(LPS.logs[LPS.logs.length - 1].message).toEqual(messages[messages.length - 1]);
    });

    it('will send cloned TestResult to any registered ILoggingPlugin implementations', async () => {
        let opts: LoggingOptions = {
            name: 'will send cloned TestResult to any registered ILoggingPlugin implementations',
            pluginNames: ['./dist/aft-core/test/logging/fake-logger']
        };
        let logger: TestLog = new TestLog(opts);

        let result: ITestResult = {
            testId: 'C' + RG.getInt(1000, 999999),
            created: new Date(),
            resultId: RG.guid,
            status: TestStatus.Untested,
            resultMessage: RG.getString(100)
        };
        
        // wait 0.1 second
        await Wait.forDuration(10);

        await logger.logResult(result);

        expect(LPS.logs.length).toEqual(0);
        expect(LPS.results.length).toEqual(1);
        expect(LPS.results[0]).not.toBe(result);
        expect(LPS.results[0].testId).toEqual(result.testId);
        expect(LPS.results[0].created).toEqual(result.created);
    });

    it('calls ILoggingPlugin.finalise on TestLog.finalise', async () => {
        let opts: LoggingOptions = {
            name: 'calls ILoggingPlugin.finalise on TestLog.finalise',
            pluginNames: ['./dist/aft-core/test/logging/fake-logger']
        };
        let logger: TestLog = new TestLog(opts);

        await logger.info(RG.getString(18));

        expect(LPS.finalised).toEqual(false);

        await logger.finalise();

        expect(LPS.finalised).toEqual(true);
    });
});