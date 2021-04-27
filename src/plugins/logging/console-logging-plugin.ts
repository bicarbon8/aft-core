import { LoggingLevel } from "./logging-level";
import { AbstractLoggingPlugin, ILoggingPluginOptions } from "./abstract-logging-plugin";
import * as colors from "colors";
import { nameof } from "ts-simple-nameof";
import { ITestResult } from "../test-cases/itest-result";

export interface ConsoleLoggingPluginOptions extends ILoggingPluginOptions {
    // TODO: allow specifying colours for different {LoggingLevel} values
}

export class ConsoleLoggingPlugin extends AbstractLoggingPlugin {
    constructor(options?: ConsoleLoggingPluginOptions) {
        super(nameof(ConsoleLoggingPlugin).toLowerCase(), options);
    }
    
    async log(level: LoggingLevel, message: string): Promise<void> {
        if (await this.enabled()) {
            let lvl: LoggingLevel = await this.level();
            if (level.value >= lvl.value && level != LoggingLevel.none) {
                await this._out(level, message);
            }
        }
    }

    async onLoad(): Promise<void> {
        /* do nothing */
    }

    async logResult(result: ITestResult): Promise<void> {
        /* do nothing */
    }

    async dispose(error?: Error): Promise<void> {
        /* do nothing */
    }

    private async _out(level: LoggingLevel, message: string): Promise<void> {
        let d: string = new Date().toLocaleTimeString();
        let out: string = `${d} - ${await this.logName()} - ${level.logString} - ${message}`;
        switch (level) {
            case LoggingLevel.error:
            case LoggingLevel.fail:
                console.log(colors.red(out));
                break;
            case LoggingLevel.warn:
                console.log(colors.yellow(out));
                break;
            case LoggingLevel.info:
                console.log(colors.white(out));
                break;
            case LoggingLevel.pass:
                console.log(colors.green(out));
                break;
            case LoggingLevel.step:
                console.log(colors.magenta(out));
                break;
            case LoggingLevel.trace:
            case LoggingLevel.debug:
                console.log(colors.blue(out));
                break;
            default:
                console.log(colors.gray(out));
                break;
        }
    }
}