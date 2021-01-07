import { IProcessingResult } from "../../../helpers/iprocessing-result";
import { ITestCase } from "../itest-case";

export interface ITestCaseHandlerPlugin {
    name: string;
    enabled(): Promise<boolean>;
    getTestCase(testId: string): Promise<ITestCase>;
    findTestCases(searchTerm: string): Promise<ITestCase[]>;
    shouldRun(testId: string): Promise<IProcessingResult>;
}