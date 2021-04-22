import { ProcessingResult, TestWrapperOptions, should } from "../../src";

let consoleLog = console.log;
describe('should', () => {
    beforeAll(() => {
        console.log = function(){};
    });

    afterAll(() => {
        console.log = consoleLog;
    });
    
    it('returns an IProcessingResult', async () => {
        let expected: ProcessingResult = await should({expect: () => expect(true).toBeTruthy()});

        expect(expected).toBeDefined();
        expect(expected.success).toBeTruthy();
    });
    
    it('supports passing in ITestWrapperOptions', async () => {
        let options: TestWrapperOptions = {
            expect: () => expect(false).toBeFalsy(),
            testCases: ['C1234'],
            defects: ['AUTO-123'],
            description: 'false should always be falsy'
        };
        let expected: ProcessingResult = await should(options);

        expect(expected).toBeDefined();
        expect(expected).toBeTruthy();
    });
});