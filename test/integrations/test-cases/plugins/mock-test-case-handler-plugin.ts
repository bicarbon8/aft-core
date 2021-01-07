import { IProcessingResult, RandomGenerator, TestStatus } from "../../../../src";
import { ITestCase } from "../../../../src/integrations/test-cases/itest-case";
import { ITestCaseHandlerPlugin } from "../../../../src/integrations/test-cases/plugins/itest-case-handler-plugin";

export class MockTestCaseHandlerPlugin implements ITestCaseHandlerPlugin {
    name: string = 'mock-test-case-handler-plugin';
    async enabled(): Promise<boolean> {
        return true;
    }
    async getTestCase(testId: string): Promise<ITestCase> {
        return {
            id: testId,
            title: RandomGenerator.getString(8),
            description: RandomGenerator.getString(100),
            status: RandomGenerator.getEnum(TestStatus)
        } as ITestCase;
    }
    async findTestCases(searchTerm: string): Promise<ITestCase[]> {
        let cases: ITestCase[] = [];
        let resultCount: number = RandomGenerator.getInt(1, 5);
        for (var i=0; i<resultCount; i++) {
            let c: ITestCase = {
                id: 'C' + RandomGenerator.getInt(100, 999),
                title: RandomGenerator.getString(8),
                description: RandomGenerator.getString(100),
                status: RandomGenerator.getEnum(TestStatus)
            } as ITestCase;
            cases.push(c);
        }
        return cases;
    }
    async shouldRun(testId: string): Promise<IProcessingResult> {
        switch(testId) {
            case 'C1234':
                let c1: ITestCase = await this.getTestCase(testId);
                return {obj: c1, message: 'do not run C1234', success: false};
            case 'C2345':
                let c2: ITestCase = await this.getTestCase(testId);
                return {obj: c2, success: true} as IProcessingResult;
            default:
                let c3: ITestCase = await this.getTestCase(testId);
                return {obj: c3, message: RandomGenerator.getString(22), success: RandomGenerator.getBoolean()};
        }
    }
}