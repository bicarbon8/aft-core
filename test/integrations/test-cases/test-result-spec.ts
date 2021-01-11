import { TestResult, RandomGenerator, TestStatus } from "../../../src";

describe('TestResult', () => {
    it('copies all MetaData when cloning', async () => {
        let expected: TestResult = new TestResult(RandomGenerator.getString(100));
        expected.testId = 'C' + RandomGenerator.getInt(100, 9999);
        expected.status = TestStatus.Retest;
        for (var i=0; i<5; i++) {
            expected.metadata[RandomGenerator.getString(5)] = RandomGenerator.getString(10, true, true);
        }

        let actual: TestResult = expected.clone();

        expect(actual.testId).toEqual(expected.testId);
        expect(actual.resultId).not.toEqual(expected.resultId);
        expect(actual.status).toEqual(expected.status);
        expect(actual.resultMessage).toEqual(expected.resultMessage);
        for(let key of Object.keys(expected.metadata)) {
            expect(actual.metadata[key]).toEqual(expected.metadata[key]);
        }
    });
});