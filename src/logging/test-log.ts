import { TestLogOptions } from "./test-log-options";
import { TestResult } from "../integrations/test-cases/test-result";
import { ILoggingPlugin } from "./plugins/ilogging-plugin";
import { IDisposable } from "../helpers/idisposable";
import { TestLogLevel } from "./test-log-level";

export class TestLog implements IDisposable {
    name: string;
    stepCount: number = 0;
    options: TestLogOptions;
    
    constructor(options: TestLogOptions) {
        this.name = options.name;
        this.options = options;
    }

    private _lvl: TestLogLevel;
    async level(): Promise<TestLogLevel> {
        if (!this._lvl) {
            this._lvl = this.options.level || await TestLogOptions.level();
        }
        return this._lvl;
    }

    async trace(message: string): Promise<void> {
        await this.log(TestLogLevel.trace, message);
    }

    async debug(message: string): Promise<void> {
        await this.log(TestLogLevel.debug, message);
    }

    async info(message: string): Promise<void> {
        await this.log(TestLogLevel.info, message);
    }

    async step(message: string): Promise<void> {
        await this.log(TestLogLevel.step, ++this.stepCount + ': ' + message);
    }

    async warn(message: string): Promise<void> {
        await this.log(TestLogLevel.warn, message);
    }

    async pass(message: string): Promise<void> {
        await this.log(TestLogLevel.pass, message);
    }

    async fail(message: string): Promise<void> {
        await this.log(TestLogLevel.fail, message);
    }

    async error(message: string): Promise<void> {
        await this.log(TestLogLevel.error, message);
    }

    async log(level: TestLogLevel, message: string): Promise<void> {
        let l: TestLogLevel = await this.level();
        if (level.value >= l.value && level != TestLogLevel.none) {
            console.log(TestLog.format(this.name, level, message));
        }
        
        let plugins: ILoggingPlugin[] = ILoggingPlugin.getPlugins();
        for (var i=0; i<plugins.length; i++) {
            try {
                await plugins[i].log(level, message);
            } catch (e) {
                console.log(TestLog.format(this.name, TestLogLevel.warn, "unable to send log message to '" + plugins[i].name + "' plugin due to: " + e));
            }
        };
    }

    async logResult(result: TestResult): Promise<void> {
        let plugins: ILoggingPlugin[] = ILoggingPlugin.getPlugins();
        for (var i=0; i<plugins.length; i++) {
            try {
                let r: TestResult = result.clone();
                await plugins[i].logResult(r);
            } catch (e) {
                console.log(TestLog.format(this.name, TestLogLevel.warn, "unable to send result to '" + plugins[i].name + "' plugin due to: " + e));
            }
        };
    }

    async dispose(error?: Error): Promise<void> {
        let plugins: ILoggingPlugin[] = ILoggingPlugin.getPlugins();
        for (var i=0; i<plugins.length; i++) {
            await plugins[i].finalise();
        };
    }
}

export module TestLog {
    export function format(name: string, level: TestLogLevel, message: string) {
        let d: string = new Date().toLocaleTimeString();
        return d + ' ' + level.logString + '[' + name + '] ' + message;
    }
}