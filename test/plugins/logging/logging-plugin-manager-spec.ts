import { LoggingPluginManager, logMgrOptions } from "../../../src/plugins/logging/logging-plugin-manager";
import { rand } from "../../../src/helpers/random-generator";
import { ITestResult } from "../../../src/test-cases/itest-result";
import { LPS } from "./logging-plugin-store";
import { TestStatus, wait } from "../../../src";

let consoleLog = console.log;
describe('LoggingPluginManager', () => {
    beforeAll(() => {
        console.log = function(){};
    });

    afterAll(() => {
        console.log = consoleLog;
    });

    beforeEach(() => {
        LPS.reset();
    });

    it('will send logs to any registered AbstractLoggingPlugin implementations', async () => {
        let opts: logMgrOptions = {
            name: 'will send logs to any registered AbstractLoggingPlugin implementations',
            pluginNames: ['fake-logging-plugin']
        };
        let logMgr: LoggingPluginManager = new LoggingPluginManager(opts);

        let messages: string[] = [];
        for (var i=0; i<5; i++) {
            messages.push(rand.getString(rand.getInt(10, 30)));
        }

        for (var i=0; i<messages.length; i++) {
            await logMgr.trace(messages[i]);
            await logMgr.debug(messages[i]);
            await logMgr.step(messages[i]);
            await logMgr.info(messages[i]);
            await logMgr.warn(messages[i]);
            await logMgr.error(messages[i]);
        }

        expect(LPS.logs.length).toEqual(5 * 6);
        expect(LPS.results.length).toEqual(0);
        expect(LPS.logs[0].message).toEqual(messages[0]);
        expect(LPS.logs[LPS.logs.length - 1].message).toEqual(messages[messages.length - 1]);
    });

    it('will send cloned TestResult to any registered AbstractLoggingPlugin implementations', async () => {
        let opts: logMgrOptions = {
            name: 'will send cloned TestResult to any registered AbstractLoggingPlugin implementations',
            pluginNames: ['fake-logging-plugin']
        };
        let logMgr: LoggingPluginManager = new LoggingPluginManager(opts);

        let result: ITestResult = {
            testId: 'C' + rand.getInt(1000, 999999),
            created: new Date(),
            resultId: rand.guid,
            status: TestStatus.Untested,
            resultMessage: rand.getString(100)
        };
        
        // wait 0.1 second
        await wait.forDuration(10);

        await logMgr.logResult(result);

        expect(LPS.logs.length).toEqual(0);
        expect(LPS.results.length).toEqual(1);
        expect(LPS.results[0]).not.toBe(result);
        expect(LPS.results[0].testId).toEqual(result.testId);
        expect(LPS.results[0].created).toEqual(result.created);
    });

    it('calls AbstractLoggingPlugin.finalise on TestLog.finalise', async () => {
        let opts: logMgrOptions = {
            name: 'calls AbstractLoggingPlugin.finalise on TestLog.finalise',
            pluginNames: ['fake-logging-plugin']
        };
        let logMgr: LoggingPluginManager = new LoggingPluginManager(opts);

        await logMgr.info(rand.getString(18));

        expect(LPS.finalised).toEqual(false);

        await logMgr.finalise();

        expect(LPS.finalised).toEqual(true);
    });
});