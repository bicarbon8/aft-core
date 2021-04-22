import { ITestResult } from "../integrations/test-cases/itest-result";
import { ILoggingPlugin } from "./plugins/ilogging-plugin";
import { LoggingLevel } from "./logging-level";
import { PluginLoader } from "../construction/plugin-loader";
import { LoggingOptions } from "./logging-options";
import { Convert } from "../helpers/convert";
import { Cloner } from "../helpers/cloner";
import { RG } from "../helpers/random-generator";
import { EllipsisLocation } from "../extensions/ellipsis-location";
import { OptionsManager } from "../construction/options-manager";
import { SE } from "../extensions/string-extensions";
import { TestLogFormatOptions } from "./test-log-format-options";

/**
 * a logging class that uses configuration to determine what
 * should be logged to the console and formats the logging output
 * to indicate the source of the logging data. Additionally this
 * class manages logging plugins and serves as the interface for 
 * sending `ITestResult` data to `ILoggingPlugin` instances.
 * Configuration for this class can be passed in directly or 
 * specified in `aftconfig.json` like:
 * ```
 * {
 *   ...
 *   "logging": {
 *     "level": "info",
 *     "pluginNames": [
 *       "./relative/path/to/logging-plugin1",
 *       "/full/path/to/logging-plugin2"
 *     ]
 *   }
 *   ...
 * }
 * ```
 */
export class TestLog extends OptionsManager<LoggingOptions> {
    private _name: string;
    private _stepCount: number = 0;
    private _level: LoggingLevel;
    private _plugins: ILoggingPlugin[];

    getOptionsConfigurationKey(): string {
        return 'logging';
    }

    async name(): Promise<string> {
        if (!this._name) {
            let n: string = await this.getOption('name', RG.getString(8, true, true));
            this._name = Convert.toSafeString(n);
        }
        return this._name;
    }

    stepCount(): number {
        return this._stepCount;
    }

    async level(): Promise<LoggingLevel> {
        if (!this._level) {
            this._level = LoggingLevel.parse((await this.getOption<string>('level', LoggingLevel.info.name)));
        }
        return this._level;
    }

    async plugins(): Promise<ILoggingPlugin[]> {
        if (!this._plugins) {
            this._plugins = [];
            let names: string[] = await this.getOption<string[]>('pluginNames', []);
            for (var i=0; i<names.length; i++) {
                let name: string = names[i];
                if (name) {
                    let p: ILoggingPlugin = await PluginLoader.load<ILoggingPlugin>(name);
                    if (p) {
                        this._plugins.push(p);
                    }
                }
            }
        }
        return this._plugins;
    }

    /**
     * calls the `log` function with a `level` of `LoggingLevel.Trace`
     * @param message the message to be logged
     */
    async trace(message: string): Promise<void> {
        await this.log(LoggingLevel.trace, message);
    }

    /**
     * calls the `log` function with a `level` of `LoggingLevel.Debug`
     * @param message the message to be logged
     */
    async debug(message: string): Promise<void> {
        await this.log(LoggingLevel.debug, message);
    }

    /**
     * calls the `log` function with a `level` of `LoggingLevel.Info`
     * @param message the message to be logged
     */
    async info(message: string): Promise<void> {
        await this.log(LoggingLevel.info, message);
    }

    /**
     * calls the `log` function with a `level` of `LoggingLevel.Step`
     * @param message the message to be logged
     */
    async step(message: string): Promise<void> {
        await this.log(LoggingLevel.step, ++this._stepCount + ': ' + message);
    }

    /**
     * calls the `log` function with a `level` of `LoggingLevel.Warn`
     * @param message the message to be logged
     */
    async warn(message: string): Promise<void> {
        await this.log(LoggingLevel.warn, message);
    }

    /**
     * calls the `log` function with a `level` of `LoggingLevel.Pass`
     * @param message the message to be logged
     */
    async pass(message: string): Promise<void> {
        await this.log(LoggingLevel.pass, message);
    }

    /**
     * calls the `log` function with a `level` of `LoggingLevel.Fail`
     * @param message the message to be logged
     */
    async fail(message: string): Promise<void> {
        await this.log(LoggingLevel.fail, message);
    }

    /**
     * calls the `log` function with a `level` of `LoggingLevel.Error`
     * @param message the message to be logged
     */
    async error(message: string): Promise<void> {
        await this.log(LoggingLevel.error, message);
    }

    /**
     * function will log the passed in `message` if its `level` is equal to
     * or higher than the configured `logging.level` before sending the `level`
     * and `message` on to any loaded `ILoggingPlugin` objects
     * @param level the `LoggingLevel` of this message
     * @param message the string to be logged
     */
    async log(level: LoggingLevel, message: string): Promise<void> {
        let l: LoggingLevel = await this.level();
        if (level.value >= l.value && level != LoggingLevel.none) {
            console.log(TestLog.format({
                name: await this.name(), 
                level: level, 
                message: message
            }));
        }
        
        let plugins: ILoggingPlugin[] = await this.plugins();
        for (var i=0; i<plugins.length; i++) {
            let p: ILoggingPlugin = plugins[i];
            if (p) {
                try {
                    let enabled: boolean = await p.isEnabled();
                    if (enabled) {
                        await p.log(level, message);
                    }
                } catch (e) {
                    console.warn(TestLog.format({
                        name: await this.name(), 
                        level: LoggingLevel.warn, 
                        message: `unable to send log message to '${p.name || 'unknown'}' plugin due to: ${e}`
                    }));
                }
            }
        }
    }

    /**
     * function will send the passed in `TestResult` to any loaded `ILoggingPlugin` objects
     * allowing them to process the result
     * @param result a `TestResult` object to be sent
     */
    async logResult(result: ITestResult): Promise<void> {
        let plugins: ILoggingPlugin[] = await this.plugins();
        for (var i=0; i<plugins.length; i++) {
            let p: ILoggingPlugin = plugins[i];
            if (p) {
                try {
                    let enabled: boolean = await p.isEnabled();
                    if (enabled) {
                        let r: ITestResult = Cloner.clone(result);
                        await p.logResult(r);
                    }
                } catch (e) {
                    console.warn(TestLog.format({
                        name: await this.name(), 
                        level: LoggingLevel.warn, 
                        message: `unable to send result to Logging Plugin: '${p.name || 'unknown'}' due to: ${e}`
                    }));
                }
            }
        }
    }

    /**
     * loops through any loaded `ILoggingPlugin` objects and calls
     * their `finalise` function. This should be called upon completion
     * of any logging actions before destroying the `TestLog` instance
     */
    async finalise(): Promise<void> {
        let plugins: ILoggingPlugin[] = await this.plugins();
        for (var i=0; i<plugins.length; i++) {
            let p: ILoggingPlugin = plugins[i];
            try {
                let enabled: boolean = await p.isEnabled();
                if (enabled) {
                    await plugins[i].finalise();
                }
            } catch (e) {
                console.log(TestLog.format({
                    name: await this.name(), 
                    level: LoggingLevel.warn, 
                    message: `unable to call finalise on Logging Plugin: ${p.name || 'unknown'} due to: ${e}`
                }));
            }
        }
    }
}

export module TestLog {
    export function format(options: TestLogFormatOptions) {
        if (!options.name) { options.name = 'unknown_name'; }
        if (!options.message) { options.message = ''; }
        if (!options.level) { options.level = LoggingLevel.none }
        let d: string = new Date().toLocaleTimeString();
        let out: string = `${d} - ${options.name} - ${options.level.logString} - ${options.message}`;
        return out;
    }
}