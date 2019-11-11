import { TestLogLevel } from "../test-log-level";
import { TestResult } from "../../integrations/test-cases/test-result";

export interface ILoggingPlugin {
    name: string;
    
    level(): Promise<TestLogLevel>;
    enabled(): Promise<boolean>;
    log(level: TestLogLevel, message: string): Promise<void>;
    logResult(result: TestResult): Promise<void>;
    finalise(): Promise<void>;
}

export namespace ILoggingPlugin {
    type Constructor<T> = {
        new (...args: any[]): T;
        readonly prototype: T;
    }
    const plugins: ILoggingPlugin[] = [];
    export function getPlugins(): ILoggingPlugin[] {
        return plugins;
    }
    export function register<T extends Constructor<ILoggingPlugin>>(ctor: T) {
        plugins.push(new ctor());
        return ctor;
    }
}