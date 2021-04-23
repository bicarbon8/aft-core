import { convert } from "../../src/helpers/converter";
import { wait } from "../../src/helpers/wait";

describe('Wait', () => {
    beforeEach(() => {
        TestHelper.reset();
    });

    it('can wait for a less than the maximum duration if action returns true', async () => {
        let now: number = new Date().getTime();
        
        await wait.untilTrue(async () => {
            // wait 1 ms and return false 2 times, then true
            await new Promise<void>((resolve, reject) => {
                setTimeout(resolve, 1);
            });
            TestHelper.count += 1;
            return TestHelper.count > 2;
        }, 2000);

        let elapsed: number = convert.toElapsedMs(now);
        expect(elapsed).toBeGreaterThan(3);
        expect(elapsed).toBeLessThan(2000);
        expect(TestHelper.count).toEqual(3);
    });
    
    it('can wait for a condition with a maximum duration', async () => {
        let now: number = new Date().getTime();
        try
        {
            await wait.untilTrue(async () => {
                // always wait 1 ms and return false
                await new Promise<void>((resolve, reject) => {
                    setTimeout(resolve, 1);
                });
                TestHelper.count += 1;
                return false;
            }, 200);

            expect(true).toEqual(false); // force failure
        } catch (err) {
            expect(true).toEqual(true);
        }

        let elapsed: number = convert.toElapsedMs(now);
        expect(elapsed).toBeGreaterThanOrEqual(200);
        expect(elapsed).toBeLessThan(1000);
        expect(TestHelper.count).toBeGreaterThan(10);
    });
});

module TestHelper {
    export var count: number = 0;

    export function reset(): void {
        count = 0;
    }
}