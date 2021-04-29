import { ellide } from '../../helpers/ellide';

export class TestException {
    Type: string;
    Message: string;
    StackTrace: string;

    constructor(err: Error, full: boolean = true) {
        if (err) {
            let message: string = this.removeBadCharacters(err.message);
            let stack: string = this.removeBadCharacters(err.stack);

            let msg = (full) ? message : ellide(message, 100);
            let stk = (full) ? stack : ellide(stack, 100);

            this.Type = err.name;
            this.Message = msg;
            this.StackTrace = stk;
        }
    }

    private removeBadCharacters(input: string): string {
        return (input) ? input.replace('`', '').replace('<', '&lt;').replace('>', '&gt;') : '';
    }

    asSimpleString() {
        return this.Type + ': ' + this.Message + ' --- ' + this.StackTrace;
    }
}

export module TestException {
    export function generate(err: Error): TestException {
        return new TestException(err, false);
    }

    export function generateFull(err: Error): TestException {
        return new TestException(err, true);
    }
}