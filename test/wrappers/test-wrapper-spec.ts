import { DefectStatus, IDefect, ProcessingResult, TestLog, TestWrapperOptions, TestWrapper, TestCaseManager, DefectManager } from "../../src";

let consoleLog = console.log;
describe('TestWrapper', () => {
    beforeAll(() => {
        console.log = function(){};
    });

    afterAll(() => {
        console.log = consoleLog;
    });
    
    it('creates a new TestLog instance with name matching expectation', async () => {
        let tw: TestWrapper = new TestWrapper(() => expect(true).toBeTruthy());
        
        expect(tw.logger()).not.toBeNull();
        expect(await tw.logger().name()).toMatch(/(TestWrapper_)[0-9a-z]+/g);
    });

    it('uses \'description\' as logger name if provided in options', async () => {
        let tw: TestWrapper = new TestWrapper(() => expect(true).toBeTruthy(), {
            description: 'true is always true', 
            testCases: ['C1234']
        });
        
        expect(tw.logger()).not.toBeNull();
        expect(await tw.logger().name()).toBe('true_is_always_true');
    });

    it('uses \'testCases\' as logger name if no description provided in options', async () => {
        let tw: TestWrapper = new TestWrapper(() => expect(true).toBeTruthy(), {testCases: ['C1234', 'C2345']});
        
        expect(tw.logger()).not.toBeNull();
        expect(await tw.logger().name()).toBe('Tests_C1234_C2345');
    });

    it('creates unique logger name if no description or testCases provided in options', async () => {
        let tw: TestWrapper = new TestWrapper(() => expect(true).toBeTruthy());
        
        expect(tw.logger()).not.toBeNull();
        expect(await tw.logger().name()).toMatch(/(TestWrapper_)[0-9a-z]+/g);
    });

    it('can supply itself to the expectation function', async () => {
        let testWrapper: TestWrapper = new TestWrapper((tw) => {
            tw.logger().step('expect true to not be falsy');
            expect(true).not.toBeFalsy();
            tw.logger().step('profit!');
            expect(false).not.toBeTruthy();
        }, {description: 'expect true is not false and false is not true'});
        
        let result: ProcessingResult = await testWrapper.run();

        expect(result.success).toBeTruthy();
    });

    it('will log success result for passed in testIds on successful completion', async () => {
        let logger: TestLog = new TestLog({pluginNames: []});
        spyOn(logger, 'pass').and.callThrough();
        let options: TestWrapperOptions = {testCases: ['C1234', 'C2345'], logger: logger};
        let tw: TestWrapper = new TestWrapper(() => expect(false).toBeFalsy(), options);
        
        await tw.run();
        
        expect(tw.logger().pass).toHaveBeenCalledTimes(2);
    });

    it('will log failed result for passed in testIds on a failed completion', async () => {
        let logger: TestLog = new TestLog({pluginNames: []});
        spyOn(logger, 'fail').and.callThrough();
        let options: TestWrapperOptions = {testCases: ['C1234', 'C2345'], logger: logger};
        let tw: TestWrapper = new TestWrapper(() => false, options);

        await tw.run();

        expect(tw.logger().fail).toHaveBeenCalledTimes(2);
    });

    it('treats exceptions in the expectation as a failure', async () => {
        let logger: TestLog = new TestLog({pluginNames: []});
        spyOn(logger, 'fail').and.callThrough();
        let options: TestWrapperOptions = {testCases: ['C1234', 'C2345'], logger: logger};
        let tw: TestWrapper = new TestWrapper(() => {
            throw 'mock failure exception';
        }, options);

        await tw.run();

        expect(tw.logger().fail).toHaveBeenCalledTimes(2);
    });

    it('will skip execution if all tests should not be run', async () => {
        let options: TestWrapperOptions = {testCases: ['C1234', 'C2345'], testCaseManager: new TestCaseManager()};
        let notExpected: boolean = false;
        let tw: TestWrapper = new TestWrapper(() => notExpected = true, options);
        let spy = spyOn(options.testCaseManager, 'shouldRun').and.callFake(async (testId: string): Promise<ProcessingResult> => {
            return {success: false, message: `testId '${testId}' should not be run`};
        });

        await tw.run();

        expect(options.testCaseManager.shouldRun).toHaveBeenCalledWith('C1234');
        expect(options.testCaseManager.shouldRun).toHaveBeenCalledWith('C2345');
        expect(notExpected).toBeFalsy();
    });

    it('will run if only some tests should not be run', async () => {
        let options: TestWrapperOptions = {testCases: ['C1234', 'C2345'], testCaseManager: new TestCaseManager()};
        let notExpected: boolean = false;
        let tw: TestWrapper = new TestWrapper(() => notExpected = true, options);
        spyOn(options.testCaseManager, 'shouldRun').and.callFake(async (testId: string): Promise<ProcessingResult> => {
            if (testId == 'C1234') {
                return {success: false, message: `testId '${testId}' should not be run`};
            } else {
                return {success: true, message: `testId '${testId}' should be run`};
            }
        });

        await tw.run();

        expect(options.testCaseManager.shouldRun).toHaveBeenCalledWith('C1234');
        expect(options.testCaseManager.shouldRun).toHaveBeenCalledWith('C2345');
        expect(notExpected).toBeTruthy();
    });

    it('will skip execution if any specified defect is open', async () => {
        let options: TestWrapperOptions = {defects: ['AUTO-123', 'AUTO-222'], defectManager: new DefectManager()};
        let notExpected: boolean = false;
        let tw: TestWrapper = new TestWrapper(() => notExpected = true, options);
        spyOn(options.defectManager, 'getDefect').and.callFake(async (defectId: string): Promise<IDefect> => {
            let d: IDefect = {id: defectId, title: `[${defectId}] fake defect title`} as IDefect;
            if (defectId == 'AUTO-123') {
                d.status = DefectStatus.open;
            } else {
                d.status = DefectStatus.closed;
            }
            return d;
        });
        spyOn(options.defectManager, 'findDefects').and.callThrough();

        await tw.run();

        expect(options.defectManager.getDefect).toHaveBeenCalledWith('AUTO-123');
        expect(options.defectManager.getDefect).not.toHaveBeenCalledWith('AUTO-222');
        expect(options.defectManager.findDefects).not.toHaveBeenCalled();
        expect(notExpected).toBeFalsy();
    });

    it('will run expectation if all defects are closed', async () => {
        let options: TestWrapperOptions = {defects: ['AUTO-123', 'AUTO-222'], defectManager: new DefectManager()};
        let notExpected: boolean = false;
        let tw: TestWrapper = new TestWrapper(() => notExpected = true, options);
        spyOn(options.defectManager, 'getDefect').and.callFake(async (defectId: string): Promise<IDefect> => {
            let d: IDefect = {id: defectId, title: `[${defectId}] fake defect title`, status: DefectStatus.closed} as IDefect;
            return d;
        });
        spyOn(options.defectManager, 'findDefects').and.callThrough();

        await tw.run();

        expect(options.defectManager.getDefect).toHaveBeenCalledWith('AUTO-123');
        expect(options.defectManager.getDefect).toHaveBeenCalledWith('AUTO-222');
        expect(options.defectManager.findDefects).not.toHaveBeenCalled();
        expect(notExpected).toBeTruthy();
    });

    it('will skip execution if any open defect is found referencing testIds', async () => {
        let options: TestWrapperOptions = {testCases: ['C1234', 'C2345'], defectManager: new DefectManager()};
        let notExpected: boolean = false;
        let tw: TestWrapper = new TestWrapper(() => notExpected = true, options);
        spyOn(options.defectManager, 'findDefects').and.callFake(async (searchTerm: string): Promise<IDefect[]> => {
            let defects: IDefect[] = [
                {id: 'AUTO-123', title: `[${searchTerm}] fake defect title`, status: DefectStatus.closed} as IDefect,
                {id: 'AUTO-124', title: `[${searchTerm}] fake defect title`, status: DefectStatus.open} as IDefect,
            ];
            return defects;
        });

        await tw.run();

        expect(options.defectManager.findDefects).toHaveBeenCalledWith('C1234');
        expect(options.defectManager.findDefects).not.toHaveBeenCalledWith('C2345');
        expect(notExpected).toBeFalsy();
    });
});