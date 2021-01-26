import { Constructor, RG } from "../../src";

describe('Constructor', () => {
    it('can create object from type', async () => {
        let sample: FooSampleClass = get(FooSampleClass);

        expect(sample).toBeDefined();
        expect(sample.foo).toBe('foo');
        expect(sample.bar(1)).toBe(1);
    });

    it('can create object from type with arguments', async () => {
        let expected: number = RG.getInt(1, 99);
        let sample: BarSampleClass = get(BarSampleClass, expected);

        expect(sample).toBeDefined();
        expect(sample.foo('foo')).toBe('foo');
        expect(sample.bar).toBe(expected);
    });
});

var get = function<T>(type: Constructor<T>, ...args: any[]): T {
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