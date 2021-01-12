import { DefectManager } from "../integrations/defects/defect-manager";
import { TestCaseManager } from "../integrations/test-cases/test-case-manager";
import { TestLog } from "../logging/test-log";

export interface ITestWrapperOptions {
    defects?: string[];
    defectManager?: DefectManager;
    logger?: TestLog;
    testCases?: string[];
    testCaseManager?: TestCaseManager;
    because?: string;
}