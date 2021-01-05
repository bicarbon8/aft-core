import { LoggingLevel } from "../../src/logging/logging-level";
import { TestResult } from "../../src/integrations/test-cases/test-result";
import { LogMessage } from "./log-message";

export module LoggingPluginStore {
    export var logs: LogMessage[] = [];
    export var results: TestResult[] = [];
    export var lvl: LoggingLevel = LoggingLevel.info;
    export var en: boolean = true;
    export var finalised: boolean = false;

    export function reset() {
        logs = [];
        results = [];
        lvl = LoggingLevel.info;
        en = true;
        finalised = false;
    }
}