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
}