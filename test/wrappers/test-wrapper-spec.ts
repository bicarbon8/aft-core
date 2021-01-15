import { TestWrapper } from "../../src/wrappers/test-wrapper";
import { ITestWrapperOptions } from "../../src/wrappers/itest-wrapper-options";
import { DefectStatus, IDefect, IProcessingResult, TestLog } from "../../src";
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
        let tw: TestWrapper = new TestWrapper();
        await tw.run(() => expect(true).toBeTruthy());
        
        expect(tw.logger()).not.toBeNull();
        expect(tw.logger().name()).toMatch(/(TestWrapper_)[0-9a-z]+/g);
    });

    it('uses \'description\' as logger name if provided in options', async () => {
        let tw: TestWrapper = new TestWrapper();
        await tw.run(() => expect(true).toBeTruthy(), {description: 'true is always true', testCases: ['C1234']});
        
        expect(tw.logger()).not.toBeNull();
        expect(tw.logger().name()).toBe('true_is_always_true');
    });

    it('uses \'testCases\' as logger name if no description provided in options', async () => {
        let tw: TestWrapper = new TestWrapper();
        await tw.run(() => expect(true).toBeTruthy(), {testCases: ['C1234', 'C2345']});
        
        expect(tw.logger()).not.toBeNull();
        expect(tw.logger().name()).toBe('Tests_C1234_C2345');
    });

    it('creates unique logger name if no description or testCases provided in options', async () => {
        let tw: TestWrapper = new TestWrapper();
        await tw.run(() => expect(true).toBeTruthy());
        
        expect(tw.logger()).not.toBeNull();
        expect(tw.logger().name()).toMatch(/(TestWrapper_)[0-9a-z]+/g);
    });

    it('can supply itself to the expectation function', async () => {
        let testWrapper: TestWrapper = new TestWrapper();
        await testWrapper.run((tw) => {
            tw.logger().step('expect true to not be falsy');
            expect(true).not.toBeFalsy();
            tw.logger().step('profit!');
            expect(false).not.toBeTruthy();
        }, {description: 'expect true is not false and false is not true'});
    });

    it('will log success result for passed in testIds on successful completion', async () => {
        let logger: TestLog = new TestLog({pluginNames: []});
        spyOn(logger, 'pass').and.callThrough();
        let options: ITestWrapperOptions = {testCases: ['C1234', 'C2345'], logger: logger};
        let tw: TestWrapper = new TestWrapper();
        
        await tw.run(() => expect(false).toBeFalsy(), options);
        
        expect(tw.logger().pass).toHaveBeenCalledTimes(2);
    });

    it('will log failed result for passed in testIds on a failed completion', async () => {
        let logger: TestLog = new TestLog({pluginNames: []});
        spyOn(logger, 'fail').and.callThrough();
        let options: ITestWrapperOptions = {testCases: ['C1234', 'C2345'], logger: logger};
        let tw: TestWrapper = new TestWrapper();

        await tw.run(() => false, options);

        expect(tw.logger().fail).toHaveBeenCalledTimes(2);
    });

    it('will skip execution if all tests should not be run', async () => {
        let options: ITestWrapperOptions = {testCases: ['C1234', 'C2345']};
        let notExpected: boolean = false;
        let tw: TestWrapper = new TestWrapper();
        let spy = spyOn(TestCaseManager.instance(), 'shouldRun').and.callFake(async (testId: string): Promise<IProcessingResult> => {
            return {success: false, message: `testId '${testId}' should not be run`};
        });

        await tw.run(() => notExpected = true, options);

        expect(TestCaseManager.instance().shouldRun).toHaveBeenCalledWith('C1234');
        expect(TestCaseManager.instance().shouldRun).toHaveBeenCalledWith('C2345');
        expect(notExpected).toBeFalsy();
        spy.and.callThrough();
    });

    it('will run if only some tests should not be run', async () => {
        let options: ITestWrapperOptions = {testCases: ['C1234', 'C2345']};
        let notExpected: boolean = false;
        let tw: TestWrapper = await new TestWrapper();
        let spy = spyOn(TestCaseManager.instance(), 'shouldRun').and.callFake(async (testId: string): Promise<IProcessingResult> => {
            if (testId == 'C1234') {
                return {success: false, message: `testId '${testId}' should not be run`};
            } else {
                return {success: true, message: `testId '${testId}' should be run`};
            }
        });

        await tw.run(() => notExpected = true, options);

        expect(TestCaseManager.instance().shouldRun).toHaveBeenCalledWith('C1234');
        expect(TestCaseManager.instance().shouldRun).toHaveBeenCalledWith('C2345');
        expect(notExpected).toBeTruthy();
        spy.and.callThrough();
    });

    it('will skip execution if any open defect is found referencing testIds', async () => {
        let options: ITestWrapperOptions = {testCases: ['C1234', 'C2345']};
        let notExpected: boolean = false;
        let tw: TestWrapper = await new TestWrapper();
        let spy = spyOn(DefectManager.instance(), 'findDefects').and.callFake(async (searchTerm: string): Promise<IDefect[]> => {
            let defects: IDefect[] = [
                {id: 'AUTO-123', title: `[${searchTerm}] fake defect title`, status: DefectStatus.closed} as IDefect,
                {id: 'AUTO-124', title: `[${searchTerm}] fake defect title`, status: DefectStatus.open} as IDefect,
            ];
            return defects;
        });

        await tw.run(() => notExpected = true, options);

        expect(DefectManager.instance().findDefects).toHaveBeenCalledWith('C1234');
        expect(DefectManager.instance().findDefects).not.toHaveBeenCalledWith('C2345');
        expect(notExpected).toBeFalsy();
        spy.and.callThrough();
    });
});