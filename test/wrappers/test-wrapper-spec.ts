import { TestWrapper } from "../../src/wrappers/test-wrapper";
import { ITestWrapperOptions } from "../../src/wrappers/itest-wrapper-options";
import { TestStatus } from "../../src/integrations/test-cases/test-status";
import { should } from "../../src/wrappers/should";
import { RandomGenerator, TestResult, Wait } from "../../src";
import { TestCaseManager } from "../../src/integrations/test-cases/test-case-manager";
import { ITestCaseManagerOptions } from "../../src/integrations/test-cases/itest-case-manager-options";
import { DefectManager } from "../../src/integrations/defects/defect-manager";

let consoleLog = console.log;
describe('TestWrapper instantiation', () => {
    beforeAll(() => {
        console.log = function(){};
    });

    afterAll(() => {
        console.log = consoleLog;
    });
    
    it('creates a new TestLog instance', () => {
        let expectedName: string = 'creates a new TestLog instance';

        let tw: TestWrapper = new TestWrapper(expectedName);
        
        expect(tw.logger).not.toBeNull();
        expect(tw.logger.name).toEqual(expectedName);
    });

    describe('addTestResult', () => {
        it('will log warning on calling AddTestResult for non-existing TestId', async () => {
            let name: string = 'will log warning on calling AddTestResult for non-existing TestId';
            let options: ITestWrapperOptions = {testCases: ['C1234']} as ITestWrapperOptions;
            let tw: TestWrapper = new TestWrapper(name, options);
            spyOn(tw.logger, 'warn').and.callThrough();
    
            await tw.addTestResult('C4321', TestStatus.Passed, 'should NOT throw');
            
            expect(tw.logger.warn).toHaveBeenCalledWith("test 'C4321' is not a valid test ID; please use one of [C1234] instead; no result will be submitted.");
        });
    });
    
    describe('check', () => {
        it('will log test result on successful completion of TestWrapper.check method call', async () => {
            let name: string = 'will log test result on successful completion of TestWrapper.check method call';
            let options: ITestWrapperOptions = {testCases: ['C1234', 'C2345']} as ITestWrapperOptions;
            let tw: TestWrapper = new TestWrapper(name, options);
            spyOn(tw, 'addTestResult').and.callThrough();
    
            await tw.check('C1234', () => {
                should(() => expect(true).toBe(true))
                .because('true is true so why did we get an error?');
            });
    
            expect(tw.addTestResult).toHaveBeenCalledWith('C1234', TestStatus.Passed);
        });

        it('will add any new test ids to the TestWrapper.testCases set', async () => {
            let wrapper: TestWrapper = new TestWrapper(RandomGenerator.getString(9));

            expect(wrapper.testCases.size).toBe(0);

            wrapper.check('C1234', () => {
                should(() => expect(true).toBe(true)).because('true is true');
            });

            expect(wrapper.testCases.size).toBe(1);
            expect(wrapper.testCases.has('C1234')).toBeTruthy();
        });
    
        it('will catch any Errors thrown inside a TestWrapper.check call', async () => {
            let name: string = 'will log test result on successful completion of TestWrapper.check method call';
            let options: ITestWrapperOptions = {testCases: ['C1234', 'C2345']} as ITestWrapperOptions;
            let tw: TestWrapper = new TestWrapper(name, options);
            spyOn(tw, 'addTestResult').and.callThrough();
    
            let expectedErr: Error = new Error('fake error');
            try {
                await tw.check('C1234', () => {
                    throw expectedErr;
                });
            } catch (e) {
                expect(true).toBe(false); // error if we threw
            }
    
            expect(tw.addTestResult).toHaveBeenCalledWith('C1234', TestStatus.Failed, jasmine.any(String));
            expect(tw.errors).toContain(expectedErr);
        });
    
        it('can use Validator to catch any failed expectations inside a TestWrapper.check call', async () => {
            let name: string = 'will log test result on successful completion of TestWrapper.check method call';
            let options: ITestWrapperOptions = {testCases: ['C1234', 'C2345']} as ITestWrapperOptions;
            let tw: TestWrapper = new TestWrapper(name, options);
            spyOn(tw, 'addTestResult').and.callThrough();
    
            let expectedErr: Error = new Error('true is not equal to false');
            try {
                await tw.check('C1234', () => {
                    should(() => false) // simulate 'expect(true).toBe(false)' result
                    .because('true is not equal to false');
                });
            } catch (e) {
                expect(true).toBe(false); // error if we threw
            }
    
            expect(tw.addTestResult).toHaveBeenCalledWith('C1234', TestStatus.Failed, jasmine.any(String));
            expect(tw.errors).toContain(expectedErr);
        });
    
        it('can handle async function', async () => {
            let opts: ITestWrapperOptions = {testCases: ['C1234']} as ITestWrapperOptions;
            let tw: TestWrapper = new TestWrapper('can handle async function', opts);
            let foo: number = 0;
    
            await tw.check('C1234', async () => {
                await Wait.forDuration(1000);
                foo++;
            });
    
            expect(foo).toEqual(1);
        });
    
        it('can handle synchronous function', async () => {
            let opts: ITestWrapperOptions = {testCases: ['C1234']} as ITestWrapperOptions;
            let tw: TestWrapper = new TestWrapper('can handle synchronous function', opts);
            let foo: number = 0;
    
            await tw.check('C1234', () => {
                foo++;
            });
    
            expect(foo).toEqual(1);
        });

        it('will not run test if TestCaseManager.shouldRun returns false', async () => {
            let tcManager: TestCaseManager = new TestCaseManager({
                pluginName: './dist/test/integrations/test-cases/plugins/mock-test-case-handler-plugin'
            } as ITestCaseManagerOptions);
            let wrapper: TestWrapper = new TestWrapper('will not run test if TestCaseManager.shouldRun returns false', {
                testCaseManager: tcManager
            } as ITestWrapperOptions);
            let tRes: TestResult = null;
            spyOn(wrapper.logger, 'logResult').and.callFake(async (result: TestResult) => {
                tRes = result;
            });
            let expected: string = RandomGenerator.getString(22);
            let actual: string = expected;

            await wrapper.check('C1234', () => {
                actual = null;
            });

            expect(actual).not.toBeNull();
            expect(actual).toBe(expected);
            expect(tRes.resultMessage).toBe("Skipped - C1234: do not run C1234"); // message from 'mock-test-case-handler-plugin'
        });

        it('will run test if TestCaseManager.shouldRun returns true', async () => {
            let tcManager: TestCaseManager = new TestCaseManager({
                pluginName: './dist/test/integrations/test-cases/plugins/mock-test-case-handler-plugin'
            } as ITestCaseManagerOptions);
            let wrapper: TestWrapper = new TestWrapper('will run test if TestCaseManager.shouldRun returns true', {
                testCaseManager: tcManager
            } as ITestWrapperOptions);
            let expected: string = RandomGenerator.getString(22);
            let actual: string = expected;

            await wrapper.check('C2345', () => {
                actual = null;
            });

            expect(actual).toBeNull();
        });

        it('will not run test if DefectManager.findDefects returns open defects', async () => {
            let dManager: DefectManager = new DefectManager({
                pluginName: './dist/test/integrations/defects/plugins/mock-defect-handler-plugin'
            } as ITestCaseManagerOptions);
            let wrapper: TestWrapper = new TestWrapper('will not run test if TestCaseManager.shouldRun returns false', {
                defectManager: dManager
            } as ITestWrapperOptions);
            let tRes: TestResult = null;
            spyOn(wrapper.logger, 'logResult').and.callFake(async (result: TestResult) => {
                tRes = result;
            });
            let expected: string = RandomGenerator.getString(22);
            let actual: string = expected;

            await wrapper.check('C1234', () => {
                actual = null;
            });

            expect(actual).not.toBeNull();
            expect(actual).toBe(expected);
            expect(tRes.resultMessage).toBe("Skipped - C1234: defect: 'AUTO-123' referencing testId: 'C1234' is open so test should not be run");
        });
    });
    
    describe('runAction', () => {
        it('can handle async function', async () => {
            let tw: TestWrapper = new TestWrapper('can handle async function');
            let foo: number = 0;
    
            let e: Error = await tw.runAction(async () => {
                await Wait.forDuration(1000);
                foo++;
            });
    
            expect(e).toBeNull();
            expect(foo).toEqual(1);
        });
    
        it('can handle synchronous function', async () => {
            let tw: TestWrapper = new TestWrapper('can handle synchronous function');
            let foo: number = 0;
    
            let e: Error = await tw.runAction(() => {
                foo++;
            });
    
            expect(e).toBeNull();
            expect(foo).toEqual(1);
        });
    });
});