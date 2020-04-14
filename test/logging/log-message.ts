import { TestLogLevel } from "../../src/logging/test-log-level";

export class LogMessage {
    level: TestLogLevel;
    message: string;
    constructor(level: TestLogLevel, message: string) {
        this.level = level;
        this.message = message;
    }
}