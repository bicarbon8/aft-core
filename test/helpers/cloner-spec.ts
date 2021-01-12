import { RandomGenerator, TestResult } from "../../src";
import { Cloner } from "../../src/helpers/cloner";
import { TestException } from "../../src/integrations/test-cases/test-exception";

describe('Cloner', () => {
    it('can clone a shallow object', () => {
        let expected = {
            foo: RandomGenerator.getString(7), 
            bar: RandomGenerator.getInt(99, 999), 
            baz: RandomGenerator.getBoolean()
        };

        let actual = Cloner.clone(expected);

        expect(actual).toEqual(expected);
    });

    it('creates a clone and not a reference to the same object', () => {
        let expected = {
            foo: RandomGenerator.getString(7), 
            bar: RandomGenerator.getInt(99, 999), 
            baz: RandomGenerator.getBoolean()
        };

        let actual = Cloner.clone(expected);

        expect(actual).toEqual(expected);

        actual.bar = RandomGenerator.getInt(-99, -9);
        expect(actual.bar).not.toBe(expected.bar);
    });

    it('can clone a multi-layered object', () => {
        let expected = {
            foo: RandomGenerator.getString(7), 
            bar: RandomGenerator.getInt(99, 999), 
            baz: RandomGenerator.getBoolean(),
            bof: {
                abc: RandomGenerator.getFloat(1.1, 100),
                def: RandomGenerator.getGuid()
            }
        };

        let actual = Cloner.clone(expected);

        expect(actual).toEqual(expected);
    });

    it('can clone an object containing functions', () => {
        let expected = new TestException(new Error('fake error'));

        let actual = Cloner.clone(expected);

        expect(actual.asSimpleString).toBeDefined();
        expect(actual.asSimpleString()).toBe(expected.asSimpleString());
    });

    it('will clone each element of an array instead of copying the array', () => {
        let expected = {
            foo: [
                {bar: RandomGenerator.getInt(0, 99)},
                {bar: RandomGenerator.getInt(0, 99)},
                {bar: RandomGenerator.getInt(0, 99)},
            ]
        };

        let actual = Cloner.clone(expected);

        for (var i=0; i<actual.foo.length; i++) {
            expect(actual.foo[i].bar).toBe(expected.foo[i].bar);
        }

        for (var i=0; i<actual.foo.length; i++) {
            actual.foo[i].bar = RandomGenerator.getInt(-99, -1);
        }

        for (var i=0; i<actual.foo.length; i++) {
            expect(actual.foo[i].bar).not.toBe(expected.foo[i].bar);
        }
    });

    it('will call the \'clone\' function of an ICloneable object', () => {
        let expected = new TestResult(RandomGenerator.getString(22));
        spyOn(expected, 'clone').and.callThrough();

        let actual = Cloner.clone(expected);

        expect(expected.clone).toHaveBeenCalledTimes(1);
        expect(actual.created).not.toBe(expected.created);
    });
});