import { TestResult, RandomGenerator, TestStatus } from "../../../src";
import { ITestResultOptions } from "../../../src/integrations/test-cases/itest-result-options";

describe('TestResult', () => {
    it('sets default values for resultId created and status', async () => {
        let options: ITestResultOptions = {
            resultMessage: RandomGenerator.getString(100),
            testId: 'C' + RandomGenerator.getInt(100, 9999)
        };
        let actual: TestResult = new TestResult(options);

        expect(actual.testId).toEqual(options.testId);
        expect(actual.resultId).toBeDefined();
        expect(actual.created).toBeDefined();
        expect(actual.status).toEqual(TestStatus.Untested);
        expect(actual.resultMessage).toEqual(options.resultMessage);
    });
});