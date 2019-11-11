import { IInitialiseOptions } from "../construction/iinitialise-options";
import { TestLogLevel } from "./test-log-level";
import { TestConfig } from "../configuration/test-config";
import { RandomGenerator } from "../helpers/random-generator";
import { EllipsisLocation } from "../extensions/ellipsis-location";
import '../extensions/string-extensions';

export class TestLogOptions implements IInitialiseOptions {
    name: string;
    level: TestLogLevel;

    constructor(name: string) {
        this.name = this.formatName(name);
    }

    private formatName(input: string): string {
        if (input) {
            input = input.replace(/[\s]/g, '_')
                .replace(/[\[\]\/\{\}\(\)\*\?\\\^\$\|]/g, '');
            return input.ellide(100, EllipsisLocation.middle);
        }
        return RandomGenerator.getGuid();
    }
}

export module TestLogOptions {
    export var LOGLEVEL_KEY: string = 'testloglevel';

    export async function level(lvl?: TestLogLevel): Promise<TestLogLevel> {
        if (lvl) {
            TestConfig.setGlobalValue(LOGLEVEL_KEY, lvl.name);
        }
        
        let levelStr: string = await TestConfig.getValueOrDefault('testloglevel', TestLogLevel.info.name);
        let level = TestLogLevel.parse(levelStr);
        
        return level;
    }
}