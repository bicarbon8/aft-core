import { cloneDeep } from "lodash";
import { ITestResult } from "../../test-cases/itest-result";
import { AbstractLoggingPlugin, ILoggingPluginOptions } from "./abstract-logging-plugin";
import { LoggingLevel } from "./logging-level";
import { FormatOptions } from "./format-options";
import { AbstractPluginManager, IPluginManagerOptions } from "../abstract-plugin-manager";
import { rand } from "../../helpers/random-generator";
import { convert } from "../../helpers/converter";
import { nameof } from "ts-simple-nameof";

export interface logMgrOptions extends IPluginManagerOptions, ILoggingPluginOptions {

}

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
 *   "logMgr": {
 *     "level": "info",
 *     "pluginNames": [
 *       "logging-plugin1",
 *       "logging-plugin2"
 *     ]
 *   }
 *   ...
 * }
 * ```
 */
export class LoggingPluginManager extends AbstractPluginManager<AbstractLoggingPlugin, ILoggingPluginOptions> {
    private _name: string;
    private _stepCount: number = 0;

    constructor(options?: logMgrOptions) {
        super(nameof(LoggingPluginManager).toLowerCase(), options);
    }

    async name(): Promise<string> {
        if (!this._name) {
            this._name = convert.toSafeString(await this.optionsMgr.getOption(nameof<logMgrOptions>(o => o.name), rand.guid));
        }
        return this._name;
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
        let plugins: AbstractLoggingPlugin[] = await this.getPlugins();
        for (var i=0; i<plugins.length; i++) {
            let p: AbstractLoggingPlugin = plugins[i];
            if (p) {
                try {
                    if (await p.enabled()) {
                        await p.log(level, message);
                    }
                } catch (e) {
                    console.warn(LoggingPluginManager.format({
                        name: await this.name(), 
                        level: LoggingLevel.warn, 
                        message: `unable to send log message to '${p.constructor.name || 'unknown'}' plugin due to: ${e}`
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
        let plugins: AbstractLoggingPlugin[] = await this.getPlugins();
        for (var i=0; i<plugins.length; i++) {
            let p: AbstractLoggingPlugin = plugins[i];
            if (p) {
                try {
                    if (await p.enabled()) {
                        let r: ITestResult = cloneDeep(result);
                        await p.logResult(r);
                    }
                } catch (e) {
                    console.warn(LoggingPluginManager.format({
                        name: await this.name(),
                        level: LoggingLevel.warn, 
                        message: `unable to send result to Logging Plugin: '${p.constructor.name || 'unknown'}' due to: ${e}`
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
        let plugins: AbstractLoggingPlugin[] = await this.getPlugins();
        for (var i=0; i<plugins.length; i++) {
            let p: AbstractLoggingPlugin = plugins[i];
            try {
                if (await p.enabled()) {
                    await plugins[i].finalise();
                }
            } catch (e) {
                console.warn(LoggingPluginManager.format({
                    name: await this.name(), 
                    level: LoggingLevel.warn, 
                    message: `unable to call finalise on Logging Plugin: ${p.constructor.name || 'unknown'} due to: ${e}`
                }));
            }
        }
    }
}

export module LoggingPluginManager {
    export function format(options: FormatOptions) {
        if (!options.name) { options.name = 'unknown_name'; }
        if (!options.message) { options.message = ''; }
        if (!options.level) { options.level = LoggingLevel.none }
        let d: string = new Date().toLocaleTimeString();
        let out: string = `${d} - ${options.name} - ${options.level.logString} - ${options.message}`;
        return out;
    }
}