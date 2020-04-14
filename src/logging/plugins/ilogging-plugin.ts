import { TestLogLevel } from "../test-log-level";
import { TestResult } from "../../integrations/test-cases/test-result";

export interface ILoggingPlugin {
    name: string;
    
    level(): Promise<TestLogLevel>;
    enabled(): Promise<boolean>;
    log(level: TestLogLevel, message: string): Promise<void>;
    logResult(result: TestResult): Promise<void>;
    finalise(): Promise<void>;
}