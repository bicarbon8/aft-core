import { IProcessingResult, ITestWrapperOptions, should, TestWrapper } from "../../src";

let consoleLog = console.log;
describe('should', () => {
    beforeAll(() => {
        console.log = function(){};
    });

    afterAll(() => {
        console.log = consoleLog;
    });
    
    it('returns an IProcessingResult', async () => {
        let expected: IProcessingResult = await should(() => expect(true).toBeTruthy());

        expect(expected).toBeDefined();
    });
    
    it('supports passing in ITestWrapperOptions', async () => {
        let options: ITestWrapperOptions = {
            testCases: ['C1234'],
            defects: ['AUTO-123'],
            description: 'false should always be falsy'
        };
        let expected: IProcessingResult = await should(() => expect(false).toBeFalsy(), options);

        expect(expected).toBeDefined();
    });
});