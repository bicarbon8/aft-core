import { LoggingLevel } from "./logging-level";

export interface TestLogFormatOptions {
    name?: string;
    level: LoggingLevel;
    message: string;
}