import { ITestResultOptions } from "./itest-result-options";
import { TestStatus } from "./test-status";

export interface ITestCase {
    id: string;
    title: string;
    description: string;
    status: TestStatus;
}