import { TestResult } from "../integrations/test-cases/test-result";
import { ILoggingPlugin } from "./plugins/ilogging-plugin";
import { LoggingLevel } from "./logging-level";
import { PluginLoader } from "../construction/plugin-loader";
import { ILoggingOptions } from "./ilogging-options";
import { TestConfig } from "../configuration/test-config";
import { Convert } from "../helpers/convert";
import { Cloner } from "../helpers/cloner";
import { RG } from "../helpers/random-generator";

export class TestLog {
    private _name: string;
    private _stepCount: number = 0;
    private _options: ILoggingOptions;
    private _level: LoggingLevel;
    private _plugins: ILoggingPlugin[];
    
    constructor(options?: ILoggingOptions) {
        this._options = options;
        this.initName(this._options?.name || `TestLog_${RG.getGuid()}`);
    }

    name(): string {
        return this._name;
    }

    stepCount(): number {
        return this._stepCount;
    }

    initName(name: string): void {
        this._name = Convert.toSafeString(name);
    }

    async options(): Promise<ILoggingOptions> {
        if (!this._options) {
            this._options = await TestConfig.get<ILoggingOptions>("logging", null);
        }
        return this._options;
    }

    async level(): Promise<LoggingLevel> {
        if (!this._level) {
            this._level = LoggingLevel.parse((await this.options()).level || LoggingLevel.info.name);
        }
        return this._level;
    }

    async plugins(): Promise<ILoggingPlugin[]> {
        if (!this._plugins) {
            let names: string[] = (await this.options()).pluginNames || [];
            this._plugins = await PluginLoader.load<ILoggingPlugin>(...names);
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
            console.log(TestLog.format(this.name(), level, message));
        }
        
        let plugins: ILoggingPlugin[] = await this.plugins();
        for (var i=0; i<plugins.length; i++) {
            let p: ILoggingPlugin = plugins[i];
            try {
                let enabled: boolean = await p.enabled();
                if (enabled) {
                    await p.log(level, message);
                }
            } catch (e) {
                console.log(TestLog.format(this.name(), LoggingLevel.warn, "unable to send log message to '" + p.name + "' plugin due to: " + e));
            }
        }
    }

    /**
     * function will send the passed in `TestResult` to any loaded `ILoggingPlugin` objects
     * allowing them to process the result
     * @param result a `TestResult` object to be sent
     */
    async logResult(result: TestResult): Promise<void> {
        let plugins: ILoggingPlugin[] = await this.plugins();
        for (var i=0; i<plugins.length; i++) {
            let p: ILoggingPlugin = plugins[i];
            if (p) {
                try {
                    let enabled: boolean = await p.enabled();
                    if (enabled) {
                        let r: TestResult = Cloner.clone(result);
                        await p.logResult(r);
                    }
                } catch (e) {
                    console.log(TestLog.format(this._name, LoggingLevel.warn, 
                        `unable to send result to '${p.name || 'unknown'}' plugin due to: ${e}`));
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
                let enabled: boolean = await p.enabled();
                if (enabled) {
                    await plugins[i].finalise();
                }
            } catch (e) {
                console.log(TestLog.format(this.name(), LoggingLevel.warn, `unable to call finalise on ${p.name} due to: ${e}`))
            }
        }
    }
}

export module TestLog {
    export function format(name: string, level: LoggingLevel, message: string) {
        let d: string = new Date().toLocaleTimeString();
        return d + ' ' + level.logString + '[' + name + '] ' + message;
    }
}