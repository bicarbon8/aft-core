import { Cloner } from "../../src/helpers/cloner";
import { ICloneable } from "../../src/helpers/icloneable";
import { RG } from "../../src/helpers/random-generator";
import { TestException } from "../../src/integrations/test-cases/test-exception";

describe('Cloner', () => {
    it('can clone a shallow object', () => {
        let expected = {
            foo: RG.getString(7), 
            bar: RG.getInt(99, 999), 
            baz: RG.boolean,
            bof: new Date()
        };

        let actual = Cloner.clone(expected);

        expect(actual).toEqual(expected);
    });

    it('creates a clone and not a reference to the same object', () => {
        let expected = {
            foo: RG.getString(7), 
            bar: RG.getInt(99, 999), 
            baz: RG.boolean
        };

        let actual = Cloner.clone(expected);

        expect(actual).toEqual(expected);

        actual.bar = RG.getInt(-99, -9);
        expect(actual.bar).not.toBe(expected.bar);
    });

    it('can clone a multi-layered object', () => {
        let expected = {
            foo: RG.getString(7), 
            bar: RG.getInt(99, 999), 
            baz: RG.boolean,
            bof: {
                abc: RG.getFloat(1.1, 100),
                def: RG.guid
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
                {bar: RG.getInt(0, 99)},
                {bar: RG.getInt(0, 99)},
                {bar: RG.getInt(0, 99)},
            ]
        };

        let actual = Cloner.clone(expected);

        for (var i=0; i<actual.foo.length; i++) {
            expect(actual.foo[i].bar).toBe(expected.foo[i].bar);
        }

        for (var i=0; i<actual.foo.length; i++) {
            actual.foo[i].bar = RG.getInt(-99, -1);
        }

        for (var i=0; i<actual.foo.length; i++) {
            expect(actual.foo[i].bar).not.toBe(expected.foo[i].bar);
        }
    });

    it('will call the \'clone\' function of an ICloneable object', () => {
        let expected = new FooTestCloneable();
        spyOn(expected, 'clone').and.callThrough();

        let actual = Cloner.clone(expected);

        expect(expected.clone).toHaveBeenCalledTimes(1);
        expect(actual.bar).not.toBe(expected.bar);
    });
});

class FooTestCloneable implements ICloneable {
    foo: string;
    bar: number;
    baz: boolean;

    constructor() {
        this.foo = RG.getString(14);
        this.bar = RG.getInt(0, 9);
        this.baz = RG.boolean;
    }

    clone(): object {
        let clone: FooTestCloneable = new FooTestCloneable();
        clone.foo = this.foo;
        clone.bar = RG.getInt(99, 999);
        clone.baz = this.baz;
        return clone;
    }
}