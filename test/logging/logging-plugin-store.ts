import { LoggingLevel } from "../../src/logging/logging-level";
import { ITestResult } from "../../src/integrations/test-cases/itest-result";
import { LogMessage } from "./log-message";

export module LoggingPluginStore {
    export var logs: LogMessage[] = [];
    export var results: ITestResult[] = [];
    export var lvl: LoggingLevel = LoggingLevel.info;
    export var en: boolean = true;
    export var finalised: boolean = false;
    export var onLoad: boolean = false;

    export function reset() {
        logs = [];
        results = [];
        lvl = LoggingLevel.info;
        en = true;
        finalised = false;
        onLoad = false;
    }
}