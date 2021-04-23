import { OptionsManager } from "../../configuration/options-manager";
import { rand } from "../../helpers/random-generator";
import { LoggerOptions } from "../../logging/logger";
import { LoggingLevel } from "../../logging/logging-level";
import { ITestResult } from "../../test-cases/itest-result";
import { ILoggingPlugin } from "./ilogging-plugin";
import * as colors from "colors";

export class ConsoleLogger extends OptionsManager<LoggerOptions> implements ILoggingPlugin {
    private _level: LoggingLevel;
    private _enabled: boolean;

    readonly name: string;

    constructor(options?: LoggerOptions) {
        super(options);
        this.name = options.name || rand.guid;
    }
    
    async level(): Promise<LoggingLevel> {
        if (!this._level) {
            this._level = LoggingLevel.parse((await this.getOption<string>('level', LoggingLevel.info.name)));
        }
        return this._level;
    }

    async log(level: LoggingLevel, message: string): Promise<void> {
        let l: LoggingLevel = await this.level();
        if (level.value >= l.value && level != LoggingLevel.none) {
            this._format(level, message);
        }
    }

    async logResult(result: ITestResult): Promise<void> {
        /* do nothing */
    }

    async finalise(): Promise<void> {
        /* do nothing */
    }
    
    async isEnabled(): Promise<boolean> {
        if (this._enabled === undefined) {
            this._enabled = await this.getOption<boolean>('enabled', true);
        }
        return this._enabled;
    }

    async onLoad(): Promise<void> {
        /* do nothing */
    }

    private _format(level: LoggingLevel, message: string): void {
        let d: string = new Date().toLocaleTimeString();
        let out: string = `${d} - ${this.name} - ${level.logString} - ${message}`;
        switch (level) {
            case LoggingLevel.error:
            case LoggingLevel.fail:
                console.log(out.red);
                break;
            case LoggingLevel.warn:
                console.log(out.yellow);
                break;
            case LoggingLevel.pass:
                console.log(out.green);
                break;
            case LoggingLevel.trace:
            case LoggingLevel.debug:
                console.log(out.blue);
                break;
            default:
                console.log(out.white);
        }
    }
}