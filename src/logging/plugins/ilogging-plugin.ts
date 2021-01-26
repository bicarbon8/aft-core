import { IPlugin } from "../../construction/iplugin";
import { ITestResult } from "../../integrations/test-cases/itest-result";
import { LoggingLevel } from "../logging-level";

export interface ILoggingPlugin extends IPlugin {
    level(): Promise<LoggingLevel>;
    log(level: LoggingLevel, message: string): Promise<void>;
    logResult(result: ITestResult): Promise<void>;
    finalise(): Promise<void>;
}