import * as uuid from 'uuid';

export class RandomGenerator {
    readonly ALPHAS: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    readonly NUMERICS: string = "0123456789";
    readonly SPECIALS: string = "!£$%^&*()_+=-[];'#,./{}:@~<>?";
    readonly EXTENDED: string = "ÀÁÂÃÄÅĀƁƂÇĈĊĎĐÈÉÊËƑĜĞĠĤĦÌÍÎÏĴĶĹĿŁÑŃÒÓÔÕÖƤɊŔŖŚŜŢŤŦÙÚÛÜŴŶŽ";

    getString(length?: number, alphas: boolean = true, numerics: boolean = false, specials: boolean = false, extended: boolean = false): string {
        let choices: string = '';
        if (alphas) { choices += this.ALPHAS; }
        if (numerics) { choices += this.NUMERICS; }
        if (specials) { choices += this.SPECIALS; }
        if (extended) { choices += this.EXTENDED; }

        return this.getStringFrom(length, choices);
    }

    getInt(min: number, max: number): number {
        return Math.floor(this.getFloat(min, max));
    }

    getFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    getStringFrom(length?: number, selectionCharacters: string = this.ALPHAS + this.NUMERICS + this.SPECIALS + this.EXTENDED): string {
        if (length === undefined) {
            length = this.getInt(1, 101);
        }
        let characters: string = '';

        for (var i = 0; i < length; i++) {
            let ch: string;
            if (selectionCharacters) {
                ch = selectionCharacters[this.getInt(0, selectionCharacters.length)];
            } else {
                ch = ' '; // use empty string if no characters supplied
            }
            characters += ch;
        }

        return characters;
    }

    getEnum<T>(anEnum: T): T[keyof T] {
        let enumValues: T[keyof T][] = Object.keys(anEnum)
          .map(n => Number.parseInt(n))
          .filter(n => !Number.isNaN(n)) as any as T[keyof T][];
        let randomIndex: number = Math.floor(Math.random() * enumValues.length);
        let randomEnumValue: T[keyof T] = enumValues[randomIndex];
        return randomEnumValue;
    }

    get guid(): string {
        return uuid.v4();
    }

    get boolean(): boolean {
        let i: number = this.getInt(0, 100);
        return i < 50;
    }
}

export const rand = new RandomGenerator();