import { DefectStatus, IDefect, ProcessingResult, TestLog, TestWrapperOptions, TestWrapper, TestCaseManager, DefectManager, RG } from "../../src";

let consoleLog = console.log;
describe('TestWrapper', () => {
    beforeAll(() => {
        console.log = function(){};
    });

    afterAll(() => {
        console.log = consoleLog;
    });
    
    it('creates a new TestLog instance with GUID name if no description or test cases provided', async () => {
        let tw: TestWrapper = new TestWrapper({
            expect: () => expect(true).toBeTruthy()
        });
        
        expect(tw.logger).toBeDefined();
        expect(await tw.logger.name()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('uses \'description\' as logger name if provided in options', async () => {
        let tw: TestWrapper = new TestWrapper({
            expect: () => expect(true).toBeTruthy(),
            description: 'true is always true', 
            testCases: ['C1234']
        });
        
        expect(tw.logger).toBeDefined();
        expect(await tw.logger.name()).toBe('true_is_always_true');
    });

    it('uses \'testCases\' as logger name if no description provided in options', async () => {
        let tw: TestWrapper = new TestWrapper({
            expect: () => expect(true).toBeTruthy(),
            testCases: ['C1234', 'C2345']
        });
        
        expect(tw.logger).toBeDefined();
        expect(await tw.logger.name()).toBe('C1234_C2345');
    });

    it('can supply itself to the expectation function', async () => {
        let testWrapper: TestWrapper = new TestWrapper({
            expect: (tw) => {
                tw.logger.step('expect true to not be falsy');
                expect(true).not.toBeFalsy();
                tw.logger.step('profit!');
                return expect(false).not.toBeTruthy();
            }, 
            description: 'expect true is not false and false is not true'});
        
        let result: ProcessingResult = await testWrapper.run();

        expect(result.success).toBeTruthy();
    });

    it('will log success result for passed in testIds on successful completion', async () => {
        let logger: TestLog = new TestLog({pluginNames: []});
        spyOn(logger, 'pass').and.callThrough();
        let options: TestWrapperOptions = {
            expect: () => expect(false).toBeFalsy(),
            testCases: ['C1234', 'C2345'], 
            logger: logger
        };
        let tw: TestWrapper = new TestWrapper(options);
        
        await tw.run();
        
        expect(tw.logger.pass).toHaveBeenCalledTimes(2);
    });

    it('will log failed result for passed in testIds on a failed completion', async () => {
        let logger: TestLog = new TestLog({pluginNames: []});
        spyOn(logger, 'fail').and.callThrough();
        let options: TestWrapperOptions = {
            expect: () => false,
            testCases: ['C1234', 'C2345'], 
            logger: logger
        };
        let tw: TestWrapper = new TestWrapper(options);

        await tw.run();

        expect(tw.logger.fail).toHaveBeenCalledTimes(2);
    });

    it('treats exceptions in the expectation as a failure', async () => {
        let logger: TestLog = new TestLog({pluginNames: []});
        spyOn(logger, 'fail').and.callThrough();
        let options: TestWrapperOptions = {
            expect: () => {
                throw 'mock failure exception';
            },
            testCases: ['C1234', 'C2345'],
            logger: logger
        };
        let tw: TestWrapper = new TestWrapper(options);

        await tw.run();

        expect(tw.logger.fail).toHaveBeenCalledTimes(2);
    });

    it('will skip execution if all tests should not be run', async () => {
        let options: TestWrapperOptions = {
            expect: () => notExpected = true,
            testCases: ['C1234', 'C2345'], 
            testCaseManager: new TestCaseManager()
        };
        let notExpected: boolean = false;
        let tw: TestWrapper = new TestWrapper(options);
        let spy = spyOn(options.testCaseManager, 'shouldRun').and.callFake(async (testId: string): Promise<ProcessingResult> => {
            return {success: false, message: `testId '${testId}' should not be run`};
        });

        await tw.run();

        expect(options.testCaseManager.shouldRun).toHaveBeenCalledWith('C1234');
        expect(options.testCaseManager.shouldRun).toHaveBeenCalledWith('C2345');
        expect(notExpected).toBeFalsy();
    });

    it('will run if only some tests should not be run', async () => {
        let options: TestWrapperOptions = {
            expect: () => notExpected = true,
            testCases: ['C1234', 'C2345'], 
            testCaseManager: new TestCaseManager()
        };
        let notExpected: boolean = false;
        let tw: TestWrapper = new TestWrapper(options);
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
        let options: TestWrapperOptions = {
            expect: () => notExpected = true,
            defects: ['AUTO-123', 'AUTO-222'], 
            defectManager: new DefectManager()
        };
        let notExpected: boolean = false;
        let tw: TestWrapper = new TestWrapper(options);
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
        let options: TestWrapperOptions = {
            expect: () => notExpected = true,
            defects: ['AUTO-123', 'AUTO-222'],
            defectManager: new DefectManager()
        };
        let notExpected: boolean = false;
        let tw: TestWrapper = new TestWrapper(options);
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
        let options: TestWrapperOptions = {
            expect: () => notExpected = true,
            testCases: ['C1234', 'C2345'],
            defectManager: new DefectManager()
        };
        let notExpected: boolean = false;
        let tw: TestWrapper = new TestWrapper(options);
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