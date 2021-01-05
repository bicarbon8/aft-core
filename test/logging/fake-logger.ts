import { ILoggingPlugin } from "../../src/logging/plugins/ilogging-plugin";
import { LoggingPluginStore } from "./logging-plugin-store";
import { LoggingLevel } from "../../src/logging/logging-level";
import { LogMessage } from "./log-message";
import { TestResult } from "../../src/integrations/test-cases/test-result";

export class FakeLogger implements ILoggingPlugin {
    name: string = 'fakelogger';
    
    async level(): Promise<LoggingLevel> {
        return LoggingPluginStore.lvl;
    }

    async enabled(): Promise<boolean> {
        return LoggingPluginStore.en;
    }

    async log(level: LoggingLevel, message: string): Promise<void> {
        LoggingPluginStore.logs.push(new LogMessage(level, message));
    }

    async logResult(result: TestResult): Promise<void> {
        LoggingPluginStore.results.push(result);
    }

    async finalise(): Promise<void> {
        LoggingPluginStore.finalised = true;
    }
}