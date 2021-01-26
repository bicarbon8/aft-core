import { IDisposable, using } from "../../src";

describe('using', () => {
    it('calls dispose function on completion', async () => {
        let disposable: UsingExample = new UsingExample();
        spyOn(disposable, 'dispose').and.callThrough();

        await using(disposable, (disp) => {
            disp.increaseCount();
        });

        expect(disposable.count).toBe(1);
        expect(disposable.dispose).toHaveBeenCalledTimes(1);
    });

    it('handles async functions', async () => {
        let disposable: UsingExample = new UsingExample();
        spyOn(disposable, 'dispose').and.callThrough();

        await using(disposable, async (disp) => {
            await disp.decreaseCount();
        });

        expect(disposable.count).toBe(-1);
        expect(disposable.dispose).toHaveBeenCalledTimes(1);
    });

    it('handles exceptions', async () => {
        let disposable: UsingExample = new UsingExample();
        let err: Error = new Error('fake exception');
        spyOn(disposable, 'dispose').and.callThrough();

        try {
            await using(disposable, async (disp) => {
                throw err;
                disp.increaseCount();
            });
            expect(false).toBeTruthy();
        } catch (e) {
            expect((e as Error).message).toBe(err.message);
        }

        expect(disposable.count).toBe(0);
        expect(disposable.dispose).toHaveBeenCalledTimes(1);
        expect(disposable.dispose).toHaveBeenCalledWith(err);
    });
});

class UsingExample implements IDisposable {
    err: Error;
    count: number = 0;
    async dispose(error?: Error): Promise<void> {
        this.err = error;
    }

    increaseCount(): void {
        this.count++;
    }

    async decreaseCount(): Promise<void> {
        this.count--;
    }
}