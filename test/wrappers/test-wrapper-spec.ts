import { TestWrapper } from "../../src/wrappers/test-wrapper";
import { TestWrapperOptions } from "../../src/wrappers/test-wrapper-options";
import { TestStatus } from "../../src/integrations/test-cases/test-status";

let consoleLog = console.log;
describe('TestWrapper instantiation', () => {
    beforeAll(() => {
        console.log = function(){};
    });

    afterAll(() => {
        console.log = consoleLog;
    });
    
    it('creates a new TestLog instance', () => {
        let name: string = 'creates a new TestLog instance';
        let expectedName: string = 'creates_a_new_TestLog_instance';

        let tw: TestWrapper = new TestWrapper(new TestWrapperOptions(name));
        
        expect(tw.logger).not.toBeNull();
        expect(tw.logger.name).toEqual(expectedName);
    });

    it('will log warning on calling AddTestResult for non-existing TestId', async () => {
        let name: string = 'will log warning on calling AddTestResult for non-existing TestId';
        let options: TestWrapperOptions = new TestWrapperOptions(name);
        options.testCases.add('C1234');
        let tw: TestWrapper = new TestWrapper(options);
        spyOn(tw.logger, 'warn').and.callThrough();

        await tw.addTestResult('C4321', TestStatus.Passed, 'should NOT throw');
        
        expect(tw.logger.warn).toHaveBeenCalledWith("test 'C4321' is not a valid test ID; please use one of [C1234] instead; no result will be submitted.");
    });

    it('will log test result on successful completion of TestWrapper.check method call', async () => {
        let name: string = 'will log test result on successful completion of TestWrapper.check method call';
        let options: TestWrapperOptions = new TestWrapperOptions(name);
        options.testCases.addRange('C1234', 'C2345');
        let tw: TestWrapper = new TestWrapper(options);
        spyOn(tw, 'addTestResult').and.callThrough();

        await tw.check('C1234', () => {
            expect(true).toBe(true);
        });

        expect(tw.addTestResult).toHaveBeenCalledWith('C1234', TestStatus.Passed);
    });

    it('will catch any Errors thrown inside a TestWrapper.check call', async () => {
        let name: string = 'will log test result on successful completion of TestWrapper.check method call';
        let options: TestWrapperOptions = new TestWrapperOptions(name);
        options.testCases.addRange('C1234', 'C2345');
        let tw: TestWrapper = new TestWrapper(options);
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
});