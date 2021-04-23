import { Action, Clazz, Func, rand } from "../../src";

describe('custom-types', () => {
    describe('Clazz<T>', () => {
        it('can create object from type', async () => {
            let sample: FooSampleClass = get(FooSampleClass);

            expect(sample).toBeDefined();
            expect(sample.foo).toBe('foo');
            expect(sample.bar(1)).toBe(1);
        });

        it('can create object from type with arguments', async () => {
            let expected: number = rand.getInt(1, 99);
            let sample: BarSampleClass = get(BarSampleClass, expected);

            expect(sample).toBeDefined();
            expect(sample.foo('foo')).toBe('foo');
            expect(sample.bar).toBe(expected);
        });
    });

    describe('Func<T,TResult>', () => {
        it('can describe a function taking in and returning types', () => {
            let voidBoolean: Func<void, boolean> = () => {
                return true;
            };
            expect(voidBoolean()).toBeTruthy();

            let booleanVoid: Func<boolean, void> = (bool: boolean) => {
                /* no return */
            }
            expect(booleanVoid(true)).toBeUndefined();

            let voidVoid: Func<void, void> = () => {
                /* no ins and outs */
            }
            expect(voidVoid()).toBeUndefined();
        });
    });

    describe('Action<T>', () => {
        it('can describe a function taking in certain types', () => {
            let nada: Action<void> = () => {
                /* no return */
            };
            expect(nada()).toBeUndefined();

            let bool: Action<boolean> = (bool: boolean) => {
                /* no return */
            }
            expect(bool(true)).toBeUndefined();
        });
    });
});

var get = function<T>(type: Clazz<T>, ...args: any[]): T {
    return new type(...args);
};

class FooSampleClass {
    foo: string = 'foo';
    bar(input: number): number {
        return input;
    }
}

class BarSampleClass {
    bar: number;
    constructor(bar: number) {
        this.bar = bar;
    }
    foo(input: string): string {
        return input;
    }
}