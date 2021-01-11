import { AFT, TestWrapper } from "../../src/wrappers/test-wrapper";
import { ITestWrapperOptions } from "../../src/wrappers/itest-wrapper-options";
import { TestStatus } from "../../src/integrations/test-cases/test-status";
import { should } from "../../src/wrappers/should";
import { RandomGenerator, TestResult, Wait } from "../../src";
import { TestCaseManager } from "../../src/integrations/test-cases/test-case-manager";
import { ITestCaseManagerOptions } from "../../src/integrations/test-cases/itest-case-manager-options";
import { DefectManager } from "../../src/integrations/defects/defect-manager";

let consoleLog = console.log;
describe('TestWrapper', () => {
    beforeAll(() => {
        console.log = function(){};
    });

    afterAll(() => {
        console.log = consoleLog;
    });
    
    it('creates a new TestLog instance with name matching expectation', async () => {
        let tw: TestWrapper = await AFT.tw(() => expect(true).toBeTruthy());
        
        expect(tw.logger).not.toBeNull();
        expect(tw.logger.name).toBe('_______expect_true_toBeTruthy____');
    });

    it('appends \'because\' reason to logger name if specified in options', async () => {
        let tw: TestWrapper = await AFT.tw(() => expect(true).toBeTruthy(), {because: 'true is always true'} as ITestWrapperOptions);
        
        expect(tw.logger).not.toBeNull();
        expect(tw.logger.name).toBe('_______expect_true_toBeTruthy_____because_true_is_always_true');
    });

    describe('because method', () => {
        it('will log success result for passed in testIds on successful completion', async () => {
            let options: ITestWrapperOptions = {testCases: ['C1234', 'C2345']} as ITestWrapperOptions;
            let tw: TestWrapper = await AFT.tw(() => expect(false).toBeFalsy(), options);
            spyOn(tw.logger, 'pass').and.callThrough();
    
            await tw.because('false is false');
            
            expect(tw.logger.pass).toHaveBeenCalledTimes(2);
        });

        it('will log failed result for passed in testIds on a failed completion', async () => {
            let options: ITestWrapperOptions = {testCases: ['C1234', 'C2345']} as ITestWrapperOptions;
            let tw: TestWrapper = await AFT.tw(() => expect(false).toBeTruthy(), options);
            spyOn(tw.logger, 'fail').and.callThrough();
    
            expect(async () => {await tw.because('false is not true');}).toThrow();
            expect(tw.logger.fail).toHaveBeenCalledTimes(2);
        });
    });
});