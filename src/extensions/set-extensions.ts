export {};

declare global {
    interface Set<T> {
        /**
         * outputs a string containing each value from the Set, separated
         * by the passed in separator
         * @param separator the string with which to separate each value
         */
        join(separator: string): string;
        /**
         * adds a range of values all at once to a Set
         * @param inputs the values to add to the set
         */
        addRange(...inputs: T[]): void;
    }
}

Set.prototype.join = function(separator: string): string {
    let str: string = '';
    let i: number = 0;
    this.forEach((entry: any) => {
        if (i > 0) {
            str += separator;
        }
        if (entry) {
            str += entry.toString();
        }
        i++;
    });
    return str;
}

Set.prototype.addRange = function<T>(...inputs: T[]): Set<T> {
    inputs.forEach((input) => {
        this.add(input);
    });
    return this;
}