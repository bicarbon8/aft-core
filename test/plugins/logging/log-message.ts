import { LoggingLevel } from "../../../src/plugins/logging/logging-level";

export class LogMessage {
    level: LoggingLevel;
    message: string;
    constructor(level: LoggingLevel, message: string) {
        this.level = level;
        this.message = message;
    }
}