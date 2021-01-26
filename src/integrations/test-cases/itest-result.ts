import { TestStatus } from "./test-status";
import { IDefect } from "../defects/idefect";

export interface ITestResult {
    testId?: string;
    resultMessage?: string;
    status: TestStatus;
    resultId: string;
    created: Date;
    defects?: IDefect[];
    metadata?: {};

    // constructor(options?: TestResultOptions) {
    //     this.testId = options?.testId;
    //     this.resultMessage = options?.resultMessage;
    //     this.status = options?.status || TestStatus.Untested;
    //     this.resultId = options?.resultId || RG.getGuid();
    //     this.created = options?.created || new Date();
    //     this.defects = options?.defects || [];
    //     this.metadata = options?.metadata || {};
    // }
}