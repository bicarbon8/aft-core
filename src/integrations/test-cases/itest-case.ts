import { ITestResult } from "./itest-result";

export interface ITestCase {
    id: string;
    title: string;
    description: string;
    result: ITestResult;
}