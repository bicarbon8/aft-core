import { ValidationError } from "./validation-error";
import { Func } from "../helpers/func";

/**
 * class used to validate that the value passed in to
 * the constructor is true. upon calling the 'because'
 * method this value will be checked and a ValidatorError
 * will be thrown if not true
 */
export class Validator {
    private result: boolean = true;

    constructor(result: Func<void, boolean>) {
        this.result = result() !== false;
    }

    /**
     * function will throw a ValidationError if the 
     * specified result is false, otherwise no action
     * is taken
     * @param reason reason why result should be true
     */
    because(reason?: string): void {
        if (!this.result) {
            throw new ValidationError(reason);
        }
    }
}