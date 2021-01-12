import { TestResult } from "../integrations/test-cases/test-result";
import { ILoggingPlugin } from "./plugins/ilogging-plugin";
import { IDisposable } from "../helpers/idisposable";
import { LoggingLevel } from "./logging-level";
import { PluginLoader } from "../construction/plugin-loader";
import { ILoggingOptions } from "./ilogging-options";
import { TestConfig } from "../configuration/test-config";
import { ITestResult } from "../integrations/test-cases/itest-result";
import { ICloneable } from "../helpers/icloneable";
import { Convert } from "../helpers/convert";
import { ISafeStringOption } from "../helpers/isafe-string-option";

export class TestLog implements IDisposable {
    name: string;
    stepCount: number = 0;
    
    constructor(name: string, options?: ILoggingOptions) {
        this._options = options;
        this.initName(name);
    }

    initName(name: string): void {
        let opts: ISafeStringOption[] = ISafeStringOption.defaults;
        opts.push({exclude: 'function', replaceWith: ''});
        opts.push({exclude: 'return', replaceWith: ''});
        this.name = Convert.toSafeString(name, opts);
    }

    private _options: ILoggingOptions;
    async options(): Promise<ILoggingOptions> {
        if (!this._options) {
            this._options = await TestConfig.get<ILoggingOptions>("logging", null);
        }
        return this._options;
    }

    private _level: LoggingLevel;
    async level(): Promise<LoggingLevel> {
        if (!this._level) {
            this._level = LoggingLevel.parse(this._options?.level || LoggingLevel.info.name);
        }
        return this._level;
    }

    private _plugins: ILoggingPlugin[];
    async plugins(): Promise<ILoggingPlugin[]> {
        if (!this._plugins) {
            let names: string[] = this._options?.pluginNames || [];
            this._plugins = await PluginLoader.load<ILoggingPlugin>(...names);
        }
        return this._plugins;
    }

    async trace(message: string): Promise<void> {
        await this.log(LoggingLevel.trace, message);
    }

    async debug(message: string): Promise<void> {
        await this.log(LoggingLevel.debug, message);
    }

    async info(message: string): Promise<void> {
        await this.log(LoggingLevel.info, message);
    }

    async step(message: string): Promise<void> {
        await this.log(LoggingLevel.step, ++this.stepCount + ': ' + message);
    }

    async warn(message: string): Promise<void> {
        await this.log(LoggingLevel.warn, message);
    }

    async pass(message: string): Promise<void> {
        await this.log(LoggingLevel.pass, message);
    }

    async fail(message: string): Promise<void> {
        await this.log(LoggingLevel.fail, message);
    }

    async error(message: string): Promise<void> {
        await this.log(LoggingLevel.error, message);
    }

    async log(level: LoggingLevel, message: string): Promise<void> {
        let l: LoggingLevel = await this.level();
        if (level.value >= l.value && level != LoggingLevel.none) {
            console.log(TestLog.format(this.name, level, message));
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
                console.log(TestLog.format(this.name, LoggingLevel.warn, "unable to send log message to '" + p.name + "' plugin due to: " + e));
            }
        }
    }

    async logResult(result: ITestResult): Promise<void> {
        let plugins: ILoggingPlugin[] = await this.plugins();
        for (var i=0; i<plugins.length; i++) {
            let p: ILoggingPlugin = plugins[i];
            if (p) {
                try {
                    let enabled: boolean = await p.enabled();
                    if (enabled) {
                        let r: ITestResult;
                        if (result["clone"]) {
                            r = (result as unknown as ICloneable).clone() as ITestResult;
                        }
                        await p.logResult(r);
                    }
                } catch (e) {
                    console.log(TestLog.format(this.name, LoggingLevel.warn, 
                        `unable to send result to '${p.name || 'unknown'}' plugin due to: ${e}`));
                }
            }
        }
    }

    async dispose(error?: Error): Promise<void> {
        let plugins: ILoggingPlugin[] = await this.plugins();
        for (var i=0; i<plugins.length; i++) {
            let p: ILoggingPlugin = plugins[i];
            try {
                let enabled: boolean = await p.enabled();
                if (enabled) {
                    await plugins[i].finalise();
                }
            } catch (e) {
                console.log(TestLog.format(this.name, LoggingLevel.warn, `unable to call finalise on ${p.name} due to: ${e}`))
            }
        }
    }
}

export module TestLog {
    var _globalLogger: TestLog;

    export function format(name: string, level: LoggingLevel, message: string) {
        let d: string = new Date().toLocaleTimeString();
        return d + ' ' + level.logString + '[' + name + '] ' + message;
    }

    /**
     * a global static TestLog object that does NOT load any logging
     * plugins and is set to a LoggingLevel of 'trace'. this is intended
     * for use by systems internal to AFT and not by functional tests
     * @param message the message to be logged in the global static logger
     */
    export async function log(level: LoggingLevel, message: string): Promise<void> {
        if (!_globalLogger) {
            _globalLogger = new TestLog('TestLog', {level: LoggingLevel.trace.name, pluginNames: []});
        }
        await _globalLogger.log(level, message);
    }
}