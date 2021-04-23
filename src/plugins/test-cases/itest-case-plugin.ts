import { IPlugin } from "../iplugin";
import { ProcessingResult } from "../../helpers/processing-result";
import { ITestCase } from "../../test-cases/itest-case";

export interface ITestCasePlugin extends IPlugin {
    getTestCase(testId: string): Promise<ITestCase>;
    findTestCases(searchTerm: string): Promise<ITestCase[]>;
    shouldRun(testId: string): Promise<ProcessingResult>;
}