import { Wait } from "../../src/helpers/wait";
import { Convert } from "../../src";

describe('Wait', () => {
    beforeEach(() => {
        TestHelper.reset();
    });

    it('can wait for a less than the maximum duration if action returns true', async () => {
        let now: number = new Date().getTime();
        
        await Wait.forCondition(async (): Promise<boolean> => {
            // wait 1 ms and return false 2 times, then true
            await new Promise<boolean>((resolve, reject) => {
                setTimeout(resolve, 1);
            });
            TestHelper.count += 1;
            if (TestHelper.count > 2) {
                return true;
            }
            return false;
        }, 2000);

        let elapsed: number = Convert.toElapsedMs(now);
        expect(elapsed).toBeGreaterThan(3);
        expect(elapsed).toBeLessThan(2000);
        expect(TestHelper.count).toEqual(3);
    });
    
    it('can wait for a condition with a maximum duration', async () => {
        let now: number = new Date().getTime();
        try
        {
            await Wait.forCondition(async (): Promise<boolean> => {
                // always wait 1 ms and return false
                await new Promise<boolean>((resolve, reject) => {
                    setTimeout(resolve, 1);
                });
                TestHelper.count += 1;
                return false;
            }, 200);

            expect(true).toEqual(false); // force failure
        } catch (err) {
            expect(true).toEqual(true);
        }

        let elapsed: number = Convert.toElapsedMs(now);
        expect(elapsed).toBeGreaterThan(200);
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