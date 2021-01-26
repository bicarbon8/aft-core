import { ProcessingResult, TestWrapperOptions, should, TestWrapper } from "../../src";

let consoleLog = console.log;
describe('should', () => {
    beforeAll(() => {
        console.log = function(){};
    });

    afterAll(() => {
        console.log = consoleLog;
    });
    
    it('returns an IProcessingResult', async () => {
        let expected: ProcessingResult = await should(() => expect(true).toBeTruthy());

        expect(expected).toBeDefined();
    });
    
    it('supports passing in ITestWrapperOptions', async () => {
        let options: TestWrapperOptions = {
            testCases: ['C1234'],
            defects: ['AUTO-123'],
            description: 'false should always be falsy'
        };
        let expected: ProcessingResult = await should(() => expect(false).toBeFalsy(), options);

        expect(expected).toBeDefined();
    });
});