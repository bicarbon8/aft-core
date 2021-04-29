export class LoggingLevel {
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
    }
}

export module LoggingLevel {
    export var none = new LoggingLevel('none', Number.MIN_VALUE);
    export var trace = new LoggingLevel('trace', -1);
    export var debug = new LoggingLevel('debug', 0);
    export var info = new LoggingLevel('info', 1);
    export var step = new LoggingLevel('step', 2);
    export var warn = new LoggingLevel('warn', 3);
    export var pass = new LoggingLevel('pass', 4);
    export var fail = new LoggingLevel('fail', 5);
    export var error = new LoggingLevel('error', 6);

    export function parse(level: string): LoggingLevel {
        if (level) {
            switch (level.toLocaleLowerCase()) {
                case 'trace':
                    return LoggingLevel.trace;
                case 'debug':
                    return LoggingLevel.debug;
                case 'info':
                    return LoggingLevel.info;
                case 'step':
                    return LoggingLevel.step;
                case 'warn':
                    return LoggingLevel.warn;
                case 'pass':
                    return LoggingLevel.pass;
                case 'fail':
                    return LoggingLevel.fail;
                case 'error':
                    return LoggingLevel.error;
                default:
                    return LoggingLevel.none;
            }
        }
        return LoggingLevel.none;
    }
}