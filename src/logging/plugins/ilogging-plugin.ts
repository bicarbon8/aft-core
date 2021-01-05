import { LoggingLevel } from "../logging-level";
import { TestResult } from "../../integrations/test-cases/test-result";

export interface ILoggingPlugin {
    name: string;
    
    level(): Promise<LoggingLevel>;
    enabled(): Promise<boolean>;
    log(level: LoggingLevel, message: string): Promise<void>;
    logResult(result: TestResult): Promise<void>;
    finalise(): Promise<void>;
}