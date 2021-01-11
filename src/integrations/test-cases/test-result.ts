import { TestStatus } from "./test-status";
import { IDefect } from "../defects/idefect";
import { RandomGenerator } from "../../helpers/random-generator";
import { IClonable } from "../../helpers/icloneable";
import { ITestResult } from "./itest-result";
import { ITestResultMetaData } from "./itest-result-metadata";

export class TestResult implements ITestResult, IClonable {
    testId: string;
    resultMessage: string;
    status: TestStatus;
    resultId: string;
    created: Date;
    defects: IDefect[];
    metadata: ITestResultMetaData;

    constructor(resultMessage?: string) {
        this.resultMessage = resultMessage;
        this.status = TestStatus.Untested;
        this.resultId = RandomGenerator.getGuid();
        this.created = new Date();
        this.defects = [];
        this.metadata = {} as ITestResultMetaData;
    }

    clone(): TestResult {
        let c: TestResult = new TestResult();
        c.testId = this.testId;
        c.resultMessage = this.resultMessage;
        c.status = this.status;
        this.defects.forEach(defect => {
            let i: any = defect;
            if (i["clone"]) {
                i = (i as IClonable).clone();
            }
            c.defects.push(i);
        });
        for(let key of Object.keys(this.metadata)) {
            let m = this.metadata[key];
            if (m["clone"]) {
                m = (m as IClonable).clone();
            }
            c.metadata[key] = m;
        };

        return c;
    }
}