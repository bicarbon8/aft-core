import { TestLog } from "../logging/test-log";

export interface ITestWrapperOptions {
    logger: TestLog;
    testCases: string[];
    defects: string[];
}