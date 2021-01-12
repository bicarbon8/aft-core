import { AFT, TestWrapper } from "../../src/wrappers/test-wrapper";
import { ITestWrapperOptions } from "../../src/wrappers/itest-wrapper-options";
import { DefectStatus, IDefect, IProcessingResult } from "../../src";
import { TestCaseManager } from "../../src/integrations/test-cases/test-case-manager";
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
            let tw: TestWrapper = await AFT.tw(() => false, options);
            spyOn(tw.logger, 'fail').and.callThrough();
    
            await tw.because('false is not passing');

            expect(tw.logger.fail).toHaveBeenCalledTimes(2);
        });

        it('will skip execution if all tests should not be run', async () => {
            let options: ITestWrapperOptions = {testCases: ['C1234', 'C2345']} as ITestWrapperOptions;
            let notExpected: boolean = false;
            let tw: TestWrapper = await AFT.tw(() => notExpected = true, options);
            let spy = spyOn(TestCaseManager.instance(), 'shouldRun').and.callFake(async (testId: string): Promise<IProcessingResult> => {
                return {success: false, message: `testId '${testId}' should not be run`} as IProcessingResult;
            });

            await tw.because('neither test should be run');

            expect(TestCaseManager.instance().shouldRun).toHaveBeenCalledWith('C1234');
            expect(TestCaseManager.instance().shouldRun).toHaveBeenCalledWith('C2345');
            expect(notExpected).toBeFalsy();
            spy.and.callThrough();
        });

        it('will run if only some tests should not be run', async () => {
            let options: ITestWrapperOptions = {testCases: ['C1234', 'C2345']} as ITestWrapperOptions;
            let notExpected: boolean = false;
            let tw: TestWrapper = await AFT.tw(() => notExpected = true, options);
            let spy = spyOn(TestCaseManager.instance(), 'shouldRun').and.callFake(async (testId: string): Promise<IProcessingResult> => {
                if (testId == 'C1234') {
                    return {success: false, message: `testId '${testId}' should not be run`} as IProcessingResult;
                } else {
                    return {success: true, message: `testId '${testId}' should be run`} as IProcessingResult;
                }
            });

            await tw.because('neither test should be run');

            expect(TestCaseManager.instance().shouldRun).toHaveBeenCalledWith('C1234');
            expect(TestCaseManager.instance().shouldRun).toHaveBeenCalledWith('C2345');
            expect(notExpected).toBeTruthy();
            spy.and.callThrough();
        });

        it('will skip execution if any open defect is found referencing testIds', async () => {
            let options: ITestWrapperOptions = {testCases: ['C1234', 'C2345']} as ITestWrapperOptions;
            let notExpected: boolean = false;
            let tw: TestWrapper = await AFT.tw(() => notExpected = true, options);
            let spy = spyOn(DefectManager.instance(), 'findDefects').and.callFake(async (searchTerm: string): Promise<IDefect[]> => {
                let defects: IDefect[] = [
                    {id: 'AUTO-123', title: `[${searchTerm}] fake defect title`, status: DefectStatus.closed} as IDefect,
                    {id: 'AUTO-124', title: `[${searchTerm}] fake defect title`, status: DefectStatus.open} as IDefect,
                ];
                return defects;
            });

            await tw.because('neither there exists and open defect');

            expect(DefectManager.instance().findDefects).toHaveBeenCalledWith('C1234');
            expect(DefectManager.instance().findDefects).not.toHaveBeenCalledWith('C2345');
            expect(notExpected).toBeFalsy();
            spy.and.callThrough();
        });
    });
});