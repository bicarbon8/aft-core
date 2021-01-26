import { RG, should } from "../src";

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
        await should(() => expect(1 + 1).toBe(2), {description: '1 plus 1 is 2'});
    });

    it('can be used to wrap large blocks of code', async () => {
        await should(async (tw) => {
            let count: number = 10;
            for (var i=0; i<count; i++) {
                await tw.logger().info(`running count: ${i}`);
                await tw.logger().warn(`random string: ${RG.getString()}`);
                expect(i).not.toBeNaN();
            }
        }, {testCases: ['C1234', 'C2345'], description: 'some tests require lots of actions'});
    });
});