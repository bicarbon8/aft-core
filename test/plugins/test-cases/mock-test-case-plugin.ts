import { nameof } from "ts-simple-nameof";
import { ProcessingResult, rand, TestStatus, ITestCase, AbstractTestCasePlugin, ITestCasePluginOptions } from "../../../src";

export class MockTestCasePlugin extends AbstractTestCasePlugin {
    constructor(options?: ITestCasePluginOptions) {
        super(nameof(MockTestCasePlugin).toLowerCase(), options);
    }
    async onLoad(): Promise<void> {
        /* do nothing */
    }
    async getTestCase(testId: string): Promise<ITestCase> {
        return {
            id: testId,
            title: rand.getString(8),
            description: rand.getString(100),
            status: rand.getEnum(TestStatus)
        } as ITestCase;
    }
    async findTestCases(searchTerm: string): Promise<ITestCase[]> {
        let cases: ITestCase[] = [];
        let resultCount: number = rand.getInt(1, 5);
        for (var i=0; i<resultCount; i++) {
            let c: ITestCase = {
                id: 'C' + rand.getInt(100, 999),
                title: rand.getString(8),
                description: rand.getString(100),
                status: rand.getEnum(TestStatus)
            } as ITestCase;
            cases.push(c);
        }
        return cases;
    }
    async shouldRun(testId: string): Promise<ProcessingResult> {
        switch(testId) {
            case 'C1234':
                let c1: ITestCase = await this.getTestCase(testId);
                return {obj: c1, message: 'do not run C1234', success: false};
            case 'C2345':
                let c2: ITestCase = await this.getTestCase(testId);
                return {obj: c2, success: true};
            default:
                let c3: ITestCase = await this.getTestCase(testId);
                return {obj: c3, message: rand.getString(22), success: rand.boolean};
        }
    }
    async dispose(error?: Error): Promise<void> {
        /* do nothing */
    }
}