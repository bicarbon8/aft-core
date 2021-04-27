import { DefectStatus, IDefect, ProcessingResult, LoggingPluginManager, TestWrapperOptions, TestWrapper, TestCasePluginManager, DefectPluginManager, rand } from "../../src";

let consoleLog = console.log;
describe('TestWrapper', () => {
    beforeAll(() => {
        console.log = function(){};
    });

    afterAll(() => {
        console.log = consoleLog;
    });
    
    it('does not initialise properties on creating a new instance', async () => {
        let tw: TestWrapper = new TestWrapper({
            expect: () => expect(true).toBeTruthy()
        });
        
        expect(tw.logMgr).toBeDefined();
        expect(await tw.logMgr.logName()).toMatch(/^[0-9a-f]{8}_[0-9a-f]{4}_[0-9a-f]{4}_[0-9a-f]{4}_[0-9a-f]{12}$/i);
    });

    it('uses \'description\' as logMgr name if provided in options', async () => {
        let tw: TestWrapper = new TestWrapper({
            expect: () => expect(true).toBeTruthy(),
            description: 'true is always true', 
            testCases: ['C1234']
        });
        
        expect(tw.logMgr).toBeDefined();
        expect(await tw.logMgr.logName()).toBe('true_is_always_true');
    });

    it('uses \'testCases\' as logMgr name if no description provided in options', async () => {
        let tw: TestWrapper = new TestWrapper({
            expect: () => expect(true).toBeTruthy(),
            testCases: ['C1234', 'C2345']
        });
        
        expect(tw.logMgr).toBeDefined();
        expect(await tw.logMgr.logName()).toBe('C1234_C2345');
    });

    it('can supply itself to the expectation function', async () => {
        let testWrapper: TestWrapper = new TestWrapper({
            expect: (tw) => {
                tw.logMgr.step('expect true to not be falsy');
                expect(true).not.toBeFalsy();
                tw.logMgr.step('profit!');
                return expect(false).not.toBeTruthy();
            }, 
            description: 'expect true is not false and false is not true'});
        
        let result: ProcessingResult = await testWrapper.run();

        expect(result.success).toBeTruthy();
    });

    it('will log success result for passed in testIds on successful completion', async () => {
        let logMgr: LoggingPluginManager = new LoggingPluginManager({pluginNames: []});
        spyOn(logMgr, 'pass').and.callThrough();
        let options: TestWrapperOptions = {
            expect: () => expect(false).toBeFalsy(),
            testCases: ['C1234', 'C2345'], 
            _logMgr: logMgr
        };
        let tw: TestWrapper = new TestWrapper(options);
        
        await tw.run();
        
        expect(tw.logMgr.pass).toHaveBeenCalledTimes(2);
    });

    it('will log failed result for passed in testIds on a failed completion', async () => {
        let logMgr: LoggingPluginManager = new LoggingPluginManager({pluginNames: []});
        spyOn(logMgr, 'fail').and.callThrough();
        let options: TestWrapperOptions = {
            expect: () => false,
            testCases: ['C1234', 'C2345'], 
            _logMgr: logMgr
        };
        let tw: TestWrapper = new TestWrapper(options);

        await tw.run();

        expect(tw.logMgr.fail).toHaveBeenCalledTimes(2);
    });

    it('treats exceptions in the expectation as a failure', async () => {
        let logMgr: LoggingPluginManager = new LoggingPluginManager({pluginNames: []});
        spyOn(logMgr, 'fail').and.callThrough();
        let options: TestWrapperOptions = {
            expect: () => {
                throw 'mock failure exception';
            },
            testCases: ['C1234', 'C2345'],
            _logMgr: logMgr
        };
        let tw: TestWrapper = new TestWrapper(options);

        await tw.run();

        expect(tw.logMgr.fail).toHaveBeenCalledTimes(2);
    });

    it('will skip execution if all tests should not be run', async () => {
        let options: TestWrapperOptions = {
            expect: () => notExpected = true,
            testCases: ['C1234', 'C2345'], 
            _testCaseManager: new TestCasePluginManager()
        };
        let notExpected: boolean = false;
        let tw: TestWrapper = new TestWrapper(options);
        let spy = spyOn(options._testCaseManager, 'shouldRun').and.callFake(async (testId: string): Promise<ProcessingResult> => {
            return {success: false, message: `testId '${testId}' should not be run`};
        });

        await tw.run();

        expect(options._testCaseManager.shouldRun).toHaveBeenCalledWith('C1234');
        expect(options._testCaseManager.shouldRun).toHaveBeenCalledWith('C2345');
        expect(notExpected).toBeFalsy();
    });

    it('will run if only some tests should not be run', async () => {
        let options: TestWrapperOptions = {
            expect: () => notExpected = true,
            testCases: ['C1234', 'C2345'], 
            _testCaseManager: new TestCasePluginManager()
        };
        let notExpected: boolean = false;
        let tw: TestWrapper = new TestWrapper(options);
        spyOn(options._testCaseManager, 'shouldRun').and.callFake(async (testId: string): Promise<ProcessingResult> => {
            if (testId == 'C1234') {
                return {success: false, message: `testId '${testId}' should not be run`};
            } else {
                return {success: true, message: `testId '${testId}' should be run`};
            }
        });

        await tw.run();

        expect(options._testCaseManager.shouldRun).toHaveBeenCalledWith('C1234');
        expect(options._testCaseManager.shouldRun).toHaveBeenCalledWith('C2345');
        expect(notExpected).toBeTruthy();
    });

    it('will skip execution if any specified defect is open', async () => {
        let options: TestWrapperOptions = {
            expect: () => notExpected = true,
            defects: ['AUTO-123', 'AUTO-222'], 
            _defectManager: new DefectPluginManager()
        };
        let notExpected: boolean = false;
        let tw: TestWrapper = new TestWrapper(options);
        spyOn(options._defectManager, 'getDefect').and.callFake(async (defectId: string): Promise<IDefect> => {
            let d: IDefect = {id: defectId, title: `[${defectId}] fake defect title`} as IDefect;
            if (defectId == 'AUTO-123') {
                d.status = DefectStatus.open;
            } else {
                d.status = DefectStatus.closed;
            }
            return d;
        });
        spyOn(options._defectManager, 'findDefects').and.callThrough();

        await tw.run();

        expect(options._defectManager.getDefect).toHaveBeenCalledWith('AUTO-123');
        expect(options._defectManager.getDefect).not.toHaveBeenCalledWith('AUTO-222');
        expect(options._defectManager.findDefects).not.toHaveBeenCalled();
        expect(notExpected).toBeFalsy();
    });

    it('will run expectation if all defects are closed', async () => {
        let options: TestWrapperOptions = {
            expect: () => notExpected = true,
            defects: ['AUTO-123', 'AUTO-222'],
            _defectManager: new DefectPluginManager()
        };
        let notExpected: boolean = false;
        let tw: TestWrapper = new TestWrapper(options);
        spyOn(options._defectManager, 'getDefect').and.callFake(async (defectId: string): Promise<IDefect> => {
            let d: IDefect = {id: defectId, title: `[${defectId}] fake defect title`, status: DefectStatus.closed} as IDefect;
            return d;
        });
        spyOn(options._defectManager, 'findDefects').and.callThrough();

        await tw.run();

        expect(options._defectManager.getDefect).toHaveBeenCalledWith('AUTO-123');
        expect(options._defectManager.getDefect).toHaveBeenCalledWith('AUTO-222');
        expect(options._defectManager.findDefects).not.toHaveBeenCalled();
        expect(notExpected).toBeTruthy();
    });

    it('will skip execution if any open defect is found referencing testIds', async () => {
        let options: TestWrapperOptions = {
            expect: () => notExpected = true,
            testCases: ['C1234', 'C2345'],
            _defectManager: new DefectPluginManager()
        };
        let notExpected: boolean = false;
        let tw: TestWrapper = new TestWrapper(options);
        spyOn(options._defectManager, 'findDefects').and.callFake(async (searchTerm: string): Promise<IDefect[]> => {
            let defects: IDefect[] = [
                {id: 'AUTO-123', title: `[${searchTerm}] fake defect title`, status: DefectStatus.closed} as IDefect,
                {id: 'AUTO-124', title: `[${searchTerm}] fake defect title`, status: DefectStatus.open} as IDefect,
            ];
            return defects;
        });

        await tw.run();

        expect(options._defectManager.findDefects).toHaveBeenCalledWith('C1234');
        expect(options._defectManager.findDefects).not.toHaveBeenCalledWith('C2345');
        expect(notExpected).toBeFalsy();
    });

    it('does not allow modification to the testCases array once initialised', async () => {
        let options: TestWrapperOptions = {expect: ()=> true, testCases: ['C1234']};
        let tw: TestWrapper = new TestWrapper(options);

        tw.testCases.push('C2345');
        tw.testCases[0] = 'C2345';

        expect(tw.testCases.length).toBe(1);
        expect(tw.testCases).not.toContain('C2345');
        expect(tw.testCases).toContain('C1234');
    });

    it('does not allow modification to the defects array once initialised', async () => {
        let options: TestWrapperOptions = {expect: ()=> true, defects: ['JIRA-1234']};
        let tw: TestWrapper = new TestWrapper(options);

        tw.defects.push('JIRA-2345');
        tw.defects[0] = 'JIRA-2345';

        expect(tw.defects.length).toBe(1);
        expect(tw.defects).not.toContain('JIRA-2345');
        expect(tw.defects).toContain('JIRA-1234');
    });

    it('does not allow modification to the errors array once initialised', async () => {
        let options: TestWrapperOptions = {expect: ()=> true};
        let tw: TestWrapper = new TestWrapper(options);

        tw.errors.push('fake error');

        expect(tw.errors.length).toBe(0);
    });
});