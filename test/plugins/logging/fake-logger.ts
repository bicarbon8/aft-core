import { ILoggingPlugin } from "../../../src/plugins/logging/ilogging-plugin";
import { LPS } from "./logging-plugin-store";
import { LoggingLevel } from "../../../src/logging/logging-level";
import { LogMessage } from "./log-message";
import { ITestResult } from "../../../src/test-cases/itest-result";

export class FakeLogger implements ILoggingPlugin {
    name: string = 'fakelogger';
    
    async level(): Promise<LoggingLevel> {
        return LPS.lvl;
    }

    async isEnabled(): Promise<boolean> {
        return LPS.en;
    }

    async onLoad(): Promise<void> {
        LPS.onLoad = true;
    }

    async log(level: LoggingLevel, message: string): Promise<void> {
        LPS.logs.push(new LogMessage(level, message));
    }

    async logResult(result: ITestResult): Promise<void> {
        LPS.results.push(result);
    }

    async finalise(): Promise<void> {
        LPS.finalised = true;
    }
}