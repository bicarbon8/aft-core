import { DefectPluginManager } from "../integrations/defects/defect-plugin-manager";
import { TestCasePluginManager } from "../integrations/test-cases/test-case-plugin-manager";
import { TestLog } from "../logging/test-log";

export interface TestWrapperOptions {
    defects?: string[];
    defectPluginManager?: DefectPluginManager;
    logger?: TestLog;
    testCases?: string[];
    testCasePluginManager?: TestCasePluginManager;
    description?: string;
}