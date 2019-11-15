import { TestStatus } from "./test-status";
import { Issue } from "../defects/issue";
import { RandomGenerator } from "../../helpers/random-generator";
import { IClonable } from "../../helpers/icloneable";

export class TestResult implements IClonable {
    TestId: string;
    ResultMessage: string;
    TestStatus: TestStatus = TestStatus.Untested;
    ResultId: string = RandomGenerator.getGuid();
    Created: Date = new Date();
    Issues: Array<Issue> = new Array<Issue>();
    MetaData: object = {};

    clone(): TestResult {
        let c: TestResult = new TestResult();
        c.TestId = this.TestId;
        c.ResultMessage = this.ResultMessage;
        c.TestStatus = this.TestStatus;
        this.Issues.forEach(issue => {
            let i: Issue = issue.clone();
            c.Issues.push(i);
        });
        for(let key of Object.keys(this.MetaData)) {
            let m = this.MetaData[key];
            if (m["clone"]) {
                m = (m as IClonable).clone();
            }
            c.MetaData[key] = m;
        };

        return c;
    }
}