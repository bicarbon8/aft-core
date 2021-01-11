import { ISafeStringOption } from "./isafe-string-option";

export module Convert {
    /**
     * function will Base64 encode the passed in string
     * @param input a string to be Base64 encoded
     */
    export function toBase64Encoded(input: string) {
        return Buffer.from(input).toString('base64');
    }

    /**
     * function will decode a Base64 encoded string to ASCII
     * @param base64Str a Base64 encoded string to be decoded
     */
    export function fromBase64Encoded(base64Str: string) {
        return Buffer.from(base64Str, 'base64').toString('ascii');
    }

    /**
     * function will return the number of milliseconds elapsed since the 
     * passed in timestamp
     * @param startTime the value from calling 'new Date().getTime()' at the
     * point in time when some event has started.
     */
    export function toElapsedMs(startTime: number): number {
        return new Date().getTime() - startTime;
    }

    /**
     * function will replace any occurrences of the passed in 'excludes' strings with
     * the value of the passed in 'replaceWith' string
     * @param input the original string to process
     * @param options an array of {exclude: string | RegExp, replaceWith: string} objects to 
     * use in processing the input string
     */
    export function toSafeString(input: string, options: ISafeStringOption[] = ISafeStringOption.defaults): string {
        for (var i=0; i<options.length; i++) {
            let o: ISafeStringOption = options[i];
            input = input.replace(o.exclude, o.replaceWith);
        }
        return input;
    }
}