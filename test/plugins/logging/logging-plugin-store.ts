import { ITestResult, LoggingLevel } from "../../../src";
import { LogMessage } from "./log-message";

class LoggingPluginStore {
    logs: LogMessage[];
    results: ITestResult[];
    lvl: LoggingLevel;
    en: boolean;
    disposed: boolean;
    onLoad: boolean;

    constructor() {
        this.reset();
    }

    reset() {
        this.logs = [];
        this.results = [];
        this.lvl = LoggingLevel.info;
        this.en = true;
        this.disposed = false;
        this.onLoad = false;
    }
}

export const LPS = new LoggingPluginStore();