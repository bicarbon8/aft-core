export class TestLogLevel {
    name: string;
    value: number;
    logString: string;
    constructor(name: string, value: number) {
        this.name = name;
        this.value = value;
        this.logString = name.toLocaleUpperCase();
        if (this.logString.length < 5) {
            this.logString += ' ';
        }
        this.logString += ' - ';
    }
}

export module TestLogLevel {
    export var none = new TestLogLevel('none', Number.MIN_VALUE);
    export var trace = new TestLogLevel('trace', -1);
    export var debug = new TestLogLevel('debug', 0);
    export var info = new TestLogLevel('info', 1);
    export var step = new TestLogLevel('step', 2);
    export var warn = new TestLogLevel('warn', 3);
    export var pass = new TestLogLevel('pass', 4);
    export var fail = new TestLogLevel('fail', 5);
    export var error = new TestLogLevel('error', 6);

    export function parse(level: string): TestLogLevel {
        switch (level.toLocaleLowerCase()) {
            case 'trace':
                return TestLogLevel.trace;
            case 'debug':
                return TestLogLevel.debug;
            case 'info':
                return TestLogLevel.info;
            case 'step':
                return TestLogLevel.step;
            case 'warn':
                return TestLogLevel.warn;
            case 'pass':
                return TestLogLevel.pass;
            case 'fail':
                return TestLogLevel.fail;
            case 'error':
                return TestLogLevel.error;
            default:
                return TestLogLevel.none;
        }
    }
}