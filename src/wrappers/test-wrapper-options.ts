import { TestLog } from "../logging/test-log";

export class TestWrapperOptions {
    name: string;
    logger: TestLog;
    testCases: Set<string> = new Set<string>();
    defects: Set<string> = new Set<string>();

    constructor(name: string) {
        this.name = name;
    }
}