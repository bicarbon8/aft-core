import { LoggingLevel } from "../logging-level";
import { ITestResultOptions } from "../../integrations/test-cases/itest-result-options";

export interface ILoggingPlugin {
    name: string;
    
    level(): Promise<LoggingLevel>;
    enabled(): Promise<boolean>;
    log(level: LoggingLevel, message: string): Promise<void>;
    logResult(result: ITestResultOptions): Promise<void>;
    finalise(): Promise<void>;
}