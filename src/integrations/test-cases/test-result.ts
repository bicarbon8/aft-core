import { TestStatus } from "./test-status";
import { IDefect } from "../defects/idefect";
import { RG } from "../../helpers/random-generator";
import { ITestResultOptions } from "./itest-result-options";
import { ITestResultMetaData } from "./itest-result-metadata";

export class TestResult {
    testId: string;
    resultMessage: string;
    status: TestStatus;
    resultId: string;
    created: Date;
    defects: IDefect[];
    metadata: ITestResultMetaData;

    constructor(options?: ITestResultOptions) {
        this.testId = options?.testId;
        this.resultMessage = options?.resultMessage;
        this.status = options?.status || TestStatus.Untested;
        this.resultId = options?.resultId || RG.getGuid();
        this.created = options?.created || new Date();
        this.defects = options?.defects || [];
        this.metadata = options?.metadata || {} as ITestResultMetaData;
    }
}