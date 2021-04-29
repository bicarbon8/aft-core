import { AbstractPlugin, IPluginOptions } from "../abstract-plugin";
import { ProcessingResult } from "../../helpers/processing-result";
import { ITestCase } from "./itest-case";

export interface ITestCasePluginOptions extends IPluginOptions {
    
}

export abstract class AbstractTestCasePlugin extends AbstractPlugin<ITestCasePluginOptions> {
    abstract getTestCase(testId: string): Promise<ITestCase>;
    abstract findTestCases(searchTerm: string): Promise<ITestCase[]>;
    abstract shouldRun(testId: string): Promise<ProcessingResult>;
}