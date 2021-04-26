import { AbstractLoggingPlugin, ILoggingPluginOptions } from "../../../src/plugins/logging/abstract-logging-plugin";
import { LPS } from "./logging-plugin-store";
import { LoggingLevel } from "../../../src/plugins/logging/logging-level";
import { LogMessage } from "./log-message";
import { ITestResult } from "../../../src/test-cases/itest-result";
import { nameof } from "ts-simple-nameof";

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
    async finalise(): Promise<void> {
        LPS.finalised = true;
    }
}