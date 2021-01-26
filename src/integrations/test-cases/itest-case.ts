import { ITestResult } from "./itest-result";
import { TestStatus } from "./test-status";

export interface ITestCase {
    id: string;
    created?: Date;
    title?: string;
    description?: string;
    status: TestStatus;
    result?: ITestResult;
}