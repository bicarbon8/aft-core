import { TestResult, TestStatus, RG, ITestResultOptions } from "../../../src";

describe('TestResult', () => {
    it('sets default values for resultId created and status', async () => {
        let options: ITestResultOptions = {
            resultMessage: RG.getString(100),
            testId: 'C' + RG.getInt(100, 9999)
        };
        let actual: TestResult = new TestResult(options);

        expect(actual.testId).toEqual(options.testId);
        expect(actual.resultId).toBeDefined();
        expect(actual.created).toBeDefined();
        expect(actual.status).toEqual(TestStatus.Untested);
        expect(actual.resultMessage).toEqual(options.resultMessage);
    });
});