import { TestResult, RandomGenerator, TestStatus } from "../../../src";

describe('TestResult', () => {
    it('copies all MetaData when cloning', async () => {
        let expected: TestResult = new TestResult();
        expected.TestId = 'C' + RandomGenerator.getInt(100, 9999);
        expected.TestStatus = TestStatus.Retest;
        expected.ResultMessage = RandomGenerator.getString(100);
        for (var i=0; i<5; i++) {
            expected.MetaData[RandomGenerator.getString(5)] = RandomGenerator.getString(10, true, true);
        }

        let actual: TestResult = expected.clone();

        expect(actual.TestId).toEqual(expected.TestId);
        expect(actual.ResultId).not.toEqual(expected.ResultId);
        expect(actual.TestStatus).toEqual(expected.TestStatus);
        expect(actual.ResultMessage).toEqual(expected.ResultMessage);
        for(let key of Object.keys(expected.MetaData)) {
            expect(actual.MetaData[key]).toEqual(expected.MetaData[key]);
        }
    });
});