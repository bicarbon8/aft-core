import { ProcessingResult, RG, TestStatus, ITestCase, ITestCaseHandlerPlugin } from "../../../../src";

export class MockTestCaseHandlerPlugin implements ITestCaseHandlerPlugin {
    name: string = 'mock-test-case-handler-plugin';
    async isEnabled(): Promise<boolean> {
        return true;
    }
    async onLoad(): Promise<void> {
        
    }
    async getTestCase(testId: string): Promise<ITestCase> {
        return {
            id: testId,
            title: RG.getString(8),
            description: RG.getString(100),
            status: RG.getEnum(TestStatus)
        } as ITestCase;
    }
    async findTestCases(searchTerm: string): Promise<ITestCase[]> {
        let cases: ITestCase[] = [];
        let resultCount: number = RG.getInt(1, 5);
        for (var i=0; i<resultCount; i++) {
            let c: ITestCase = {
                id: 'C' + RG.getInt(100, 999),
                title: RG.getString(8),
                description: RG.getString(100),
                status: RG.getEnum(TestStatus)
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
                return {obj: c3, message: RG.getString(22), success: RG.boolean};
        }
    }
}