import { ITestWrapperOptions, should, TestWrapper } from "../../src";

let consoleLog = console.log;
describe('should', () => {
    beforeAll(() => {
        console.log = function(){};
    });

    afterAll(() => {
        console.log = consoleLog;
    });
    
    it('returns a new initialised TestWrapper', async () => {
        let expected: TestWrapper = await should(() => expect(true).toBeTruthy());

        expect(expected).toBeDefined();
    });
    
    it('supports passing in ITestWrapperOptions', async () => {
        let options: ITestWrapperOptions = {
            testCases: ['C1234'],
            defects: ['AUTO-123'],
            because: 'false should always be falsy'
        };
        let expected: TestWrapper = await should(() => expect(false).toBeFalsy(), options);

        expect(expected.testCases()).toContain('C1234');
        expect(expected.defects()).toContain('AUTO-123');
    });
});