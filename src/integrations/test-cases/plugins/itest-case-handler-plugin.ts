import { ITestCase } from "../itest-case";

export interface ITestCaseHandlerPlugin {
    name: string;
    enabled(): Promise<boolean>;
    getTestCase(testId: string): Promise<ITestCase>;
}