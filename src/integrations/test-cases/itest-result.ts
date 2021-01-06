import { IDefect } from "../defects/idefect";
import { TestStatus } from "./test-status";

export interface ITestResult {
    testId: string;
    resultMessage: string;
    status: TestStatus;
    resultId: string;
    created: Date;
    defects: Array<IDefect>;
    metadata: object;
}