import { TestLogLevel } from "../test-log-level";
import { TestResult } from "../../integrations/test-cases/test-result";
import { Constructor } from "../../construction/constructor";

export interface ILoggingPlugin {
    name: string;
    
    level(): Promise<TestLogLevel>;
    enabled(): Promise<boolean>;
    log(level: TestLogLevel, message: string): Promise<void>;
    logResult(result: TestResult): Promise<void>;
    finalise(): Promise<void>;
}

export namespace ILoggingPlugin {
    const pluginConstructors: Constructor<ILoggingPlugin>[] = [];
    export function getPluginConstructors(): Constructor<ILoggingPlugin>[] {
        return pluginConstructors;
    }
    export function register<T extends Constructor<ILoggingPlugin>>(ctor: T) {
        pluginConstructors.push(ctor);
        return ctor;
    }
}