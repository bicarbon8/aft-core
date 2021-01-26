import { IPlugin } from "../../../construction/iplugin";
import { ProcessingResult } from "../../../helpers/processing-result";
import { ITestCase } from "../itest-case";

export interface ITestCaseHandlerPlugin extends IPlugin {
    getTestCase(testId: string): Promise<ITestCase>;
    findTestCases(searchTerm: string): Promise<ITestCase[]>;
    shouldRun(testId: string): Promise<ProcessingResult>;
}