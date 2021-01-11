import { LoggingLevel } from "../logging-level";
import { ITestResult } from "../../integrations/test-cases/itest-result";

export interface ILoggingPlugin {
    name: string;
    
    level(): Promise<LoggingLevel>;
    enabled(): Promise<boolean>;
    log(level: LoggingLevel, message: string): Promise<void>;
    logResult(result: ITestResult): Promise<void>;
    finalise(): Promise<void>;
}