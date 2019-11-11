import { IClonable } from "../../helpers/icloneable";

export class Issue implements IClonable {
    
    clone(): Issue {
        let c: Issue = new Issue();

        return c;
    }
}