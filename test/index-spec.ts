import { RandomGenerator, should, TestLog } from "../src";

describe('AFT', () => {
    it('is simple to integrate into existing expectations', async () => {
        await should(() => expect(1 + 1).toBe(2), {description: '1 plus 1 is 2'});
    });

    it('can be used to wrap large blocks of code', async () => {
        await should(async (tw) => {
            let count: number = 10;
            for (var i=0; i<count; i++) {
                await tw.logger().info(`running count: ${i}`);
                await tw.logger().warn(`random string: ${RandomGenerator.getString()}`);
                expect(i).not.toBeNaN();
            }
        }, {testCases: ['C1234', 'C2345'], description: 'some tests require lots of actions'});
    })
});