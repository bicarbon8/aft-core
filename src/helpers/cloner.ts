import { ICloneable } from "./icloneable";

export module Cloner {
    export function clone<T extends Object>(input: T): T {
        if (input['clone'] && typeof input['clone'] == 'function') {
            return (input as unknown as ICloneable).clone() as T;
        }
        let output: T = new Object() as T;
        for(const key in input) {
            const element = input[key];
            switch (typeof element) {
                case 'object':
                    if (Array.isArray(element)) {
                        (output[key] as unknown) = [];
                        for (var i=0; i<element.length; i++) {
                            output[key][i] = clone(element[i]);
                        }
                    } else {
                        output[key] = clone(element);
                    }
                    break;
                default:
                    output[key] = element;
                    break;
            }
        }
        return output;
    }
}