import { DefectManager } from "../integrations/defects/defect-manager";
import { TestCaseManager } from "../integrations/test-cases/test-case-manager";
import { TestLog } from "../logging/test-log";

export interface ITestWrapperOptions {
    logger: TestLog;
    testCases: string[];
    testCaseManager: TestCaseManager;
    defects: string[];
    defectManager: DefectManager;
}