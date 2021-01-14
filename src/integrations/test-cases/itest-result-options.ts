import { IDefect } from "../defects/idefect";
import { ITestResultMetaData } from "./itest-result-metadata";
import { TestStatus } from "./test-status";

export interface ITestResultOptions {
    testId?: string;
    resultMessage?: string;
    status?: TestStatus;
    resultId?: string;
    created?: Date;
    defects?: IDefect[];
    metadata?: ITestResultMetaData;
}