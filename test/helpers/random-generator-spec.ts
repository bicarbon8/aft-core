import { rand } from "../../src/helpers/random-generator";

describe('RandomGenerator tests', () => {
    it('can generate a random string of alpha only characters', () => {
        let actual: string = rand.getString(10);
        expect(actual).not.toBeNull();
        expect(actual).not.toBeUndefined();
        expect(actual.length).toBe(10);
        expect(actual).toMatch(/[A-Z]/);
    });

    it('can generate a random string of numeric only characters', () => {
        let actual: string = rand.getString(15, false, true);
        expect(actual).not.toBeNull();
        expect(actual).not.toBeUndefined();
        expect(actual.length).toBe(15);
        expect(actual).toMatch(/[0-9]/);
    });

    it('can generate a random string of special only characters', () => {
        let actual: string = rand.getString(12, false, false, true);
        expect(actual).not.toBeNull();
        expect(actual).not.toBeUndefined();
        expect(actual.length).toBe(12);
        expect(actual).toMatch(/[\!£\$%\^&*\(\)_+=-\[\];'#,\.\/\{\}:@~<>\?]/);
    });

    it('can generate a random string of extended only characters', () => {
        let actual: string = rand.getString(12, false, false, false, true);
        expect(actual).not.toBeNull();
        expect(actual).not.toBeUndefined();
        expect(actual.length).toBe(12);
        expect(actual).toMatch(/[ÀÁÂÃÄÅĀƁƂÇĈĊĎĐÈÉÊËƑĜĞĠĤĦÌÍÎÏĴĶĹĿŁÑŃÒÓÔÕÖƤɊŔŖŚŜŢŤŦÙÚÛÜŴŶŽ]/);
    });
});