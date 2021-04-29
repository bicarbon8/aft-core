import { AbstractPlugin, IPluginOptions } from "../abstract-plugin";
import { ITestResult } from "../test-cases/itest-result";
import { LoggingLevel } from "./logging-level";
import { rand } from "../../helpers/random-generator";
import { nameof } from "ts-simple-nameof";

export interface ILoggingPluginOptions extends IPluginOptions {
    logName?: string;
    level?: string;
}

export abstract class AbstractLoggingPlugin extends AbstractPlugin<ILoggingPluginOptions> {
    private _name: string;
    private _level: LoggingLevel;
    constructor(key: string, options?: ILoggingPluginOptions) {
        super(key, options);
    }
    async logName(): Promise<string> {
        if (!this._name) {
            this._name = await this.optionsMgr.getOption(nameof<ILoggingPluginOptions>(p => p.logName), `${this.constructor.name}_${rand.guid}`);
        }
        return this._name;
    }
    async level(): Promise<LoggingLevel> {
        if (!this._level) {
            let lvl: string = await this.optionsMgr.getOption(nameof<ILoggingPluginOptions>(p => p.level), LoggingLevel.none.name);
            this._level = LoggingLevel.parse(lvl);
        }
        return this._level;
    }
    abstract log(level: LoggingLevel, message: string): Promise<void>;
    abstract logResult(result: ITestResult): Promise<void>;
}