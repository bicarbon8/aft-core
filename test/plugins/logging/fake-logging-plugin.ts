import { LPS } from "./logging-plugin-store";
import { LogMessage } from "./log-message";
import { nameof } from "ts-simple-nameof";
import { AbstractLoggingPlugin, ILoggingPluginOptions, ITestResult, LoggingLevel } from "../../../src";

export class FakeLoggingPlugin extends AbstractLoggingPlugin {
    constructor(options?: ILoggingPluginOptions) {
        LPS.onLoad = true;
        LPS.lvl = LoggingLevel.parse(options?.level);
        super(nameof(FakeLoggingPlugin), options);
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
    async dispose(error?: Error): Promise<void> {
        LPS.disposed = true;
    }
}