import { IPlugin } from "../iplugin";
import { ITestResult } from "../../test-cases/itest-result";
import { LoggingLevel } from "../../logging/logging-level";

export interface ILoggingPlugin extends IPlugin {
    level(): Promise<LoggingLevel>;
    log(level: LoggingLevel, message: string): Promise<void>;
    logResult(result: ITestResult): Promise<void>;
    finalise(): Promise<void>;
}