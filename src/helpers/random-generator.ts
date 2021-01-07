import * as uuid from 'uuid';

export module RandomGenerator {
    export var ALPHAS: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    export var NUMERICS: string = "0123456789";
    export var SPECIALS: string = "!£$%^&*()_+=-[];'#,./{}:@~<>?";
    export var EXTENDED: string = "ÀÁÂÃÄÅĀƁƂÇĈĊĎĐÈÉÊËƑĜĞĠĤĦÌÍÎÏĴĶĹĿŁÑŃÒÓÔÕÖƤɊŔŖŚŜŢŤŦÙÚÛÜŴŶŽ";
    export var RANDOM_LENGTH: number = -1;

    export function getString(length: number, alphas?: boolean, numerics?: boolean, specials?: boolean, extended?: boolean): string {
        if (alphas === undefined) { alphas = true; }
        if (numerics === undefined) { numerics = false; }
        if (specials === undefined) { specials = false; }
        if (extended === undefined) { extended = false; }
        let choices: string = '';
        if (alphas) { choices += RandomGenerator.ALPHAS; }
        if (numerics) { choices += RandomGenerator.NUMERICS; }
        if (specials) { choices += RandomGenerator.SPECIALS; }
        if (extended) { choices += RandomGenerator.EXTENDED; }

        return getStringFrom(length, choices);
    };

    export function getInt(min: number, max: number): number {
        return Math.floor(RandomGenerator.getFloat(min, max));
    };

    export function getFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    export function getStringFrom(length: number, selectionCharacters: string): string {
        if (length <= RandomGenerator.RANDOM_LENGTH) {
            length = RandomGenerator.getInt(1, 101);
        }
        let characters: string = '';

        for (var i = 0; i < length; i++) {
            let ch: string;
            if (selectionCharacters) {
                ch = selectionCharacters[getInt(0, selectionCharacters.length)];
            } else {
                ch = ' '; // use empty string if no characters supplied
            }
            characters += ch;
        }

        return characters;
    }

    export function getGuid(): string {
        return uuid.v4();
    }

    export function getEnum<T>(anEnum: T): T[keyof T] {
        let enumValues: T[keyof T][] = Object.keys(anEnum)
          .map(n => Number.parseInt(n))
          .filter(n => !Number.isNaN(n)) as any as T[keyof T][];
        let randomIndex: number = Math.floor(Math.random() * enumValues.length);
        let randomEnumValue: T[keyof T] = enumValues[randomIndex];
        return randomEnumValue;
    }

    export function getBoolean(): boolean {
        let i: number = getInt(0, 100);
        return i < 50;
    }
}