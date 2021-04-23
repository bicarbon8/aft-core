import { LoggingLevel } from "./logging-level";

export interface FormatOptions {
    name?: string;
    level: LoggingLevel;
    message: string;
}