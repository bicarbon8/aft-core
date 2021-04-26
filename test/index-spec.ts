import { rand, should } from "../src";

var consoleLog = console.log;
describe('AFT', () => {
    /* comment `beforeAll` and `afterAll` out to see actual test output */
    beforeAll(() => {
        console.log = function(){};
    });

    afterAll(() => {
        console.log = consoleLog;
    });

    it('is simple to integrate into existing expectations', async () => {
        await should({expect: () => expect(1 + 1).toBe(2), description: '1 plus 1 is 2'});
    });

    it('can be used to wrap large blocks of code', async () => {
        await should({
            expect: async (tw) => {
                let count: number = 10;
                let result: boolean = true;
                for (var i=0; i<count; i++) {
                    await tw.logMgr.info(`running count: ${i}`);
                    await tw.logMgr.warn(`random string: ${rand.getString()}`);
                    result = result && expect(i).not.toBeNaN();
                }
                return result;
            }, 
            testCases: ['C1234', 'C2345'], 
            description: 'some tests require lots of actions'
        });
    });
});