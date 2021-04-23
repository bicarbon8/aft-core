import { Func } from "./custom-types";

export class Wait {
    /**
     * function will execute an asynchronous action and await a result repeating execution every 1 millisecond until a 
     * result of 'true' is returned or the 'msDuration' specified has elapsed. If the action never returns 'true' and 
     * the 'msDuration' elapses, an Error will be thrown by way of a Promise.reject
     * @param condition an asynchronous action that should be executed until it returns 'true' or the 'msDuration' has expired
     * @param msDuration the maximum amount of time to wait for the 'condition' to return 'true'
     * @param onFailAction an action to perform on each attempt resulting in failure ('Error' or 'false') of the 'condition'
     */
    async untilTrue(condition: Func<void, boolean | PromiseLike<boolean>>, msDuration: number, onFailAction?: Func<void, any>) : Promise<void> {
        let result: boolean = false;
        let attempts: number = 0;
        let startTime: number = new Date().getTime();
        let now: number;
        let elapsed: number;
        let exMessage: string;
        let exStack: string;

        do {
            try {
                attempts++;
                result = await Promise.resolve(condition());
            } catch (e) {
                exMessage = (e as Error).message;
                exStack = (e as Error).stack;
                try {
                    if (onFailAction) {onFailAction();}
                } catch {}
            }
            await this.forDuration(1);
            now = new Date().getTime();
            elapsed = now - startTime;
        } while (result !== true && elapsed < msDuration);

        if (result) {
            return Promise.resolve();
        }
            
        return Promise.reject(`unable to successfully execute Wait.forCondition(() => {...}) within '${attempts}' attempts due to: '${exMessage}' at:\n${exStack}`);
    }

    /**
     * function will wait for the specified amount of time
     * @param msDuration the amount of time to wait before resuming
     */
    async forDuration(msDuration: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, msDuration);
        });
    }
}

export const wait = new Wait();