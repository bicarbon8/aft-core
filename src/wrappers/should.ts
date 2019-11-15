import { Validator } from "./validator";
import { Func } from "../helpers/func";

export function should(result: Func<void, boolean>): Validator {
    return new Validator(result);
}