import { LoggingLevel } from "../../../src/plugins/logging/logging-level";
import { ITestResult } from "../../../src/test-cases/itest-result";
import { LogMessage } from "./log-message";

class LoggingPluginStore {
    logs: LogMessage[];
    results: ITestResult[];
    lvl: LoggingLevel;
    en: boolean;
    finalised: boolean;
    onLoad: boolean;

    constructor() {
        this.reset();
    }

    reset() {
        this.logs = [];
        this.results = [];
        this.lvl = LoggingLevel.info;
        this.en = true;
        this.finalised = false;
        this.onLoad = false;
    }
}

export const LPS = new LoggingPluginStore();