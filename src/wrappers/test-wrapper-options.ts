import { BuildInfoPluginManager } from "../helpers/build-info-plugin-manager";
import { DefectPluginManager } from "../integrations/defects/defect-plugin-manager";
import { TestCasePluginManager } from "../integrations/test-cases/test-case-plugin-manager";
import { TestLog } from "../logging/test-log";

export interface TestWrapperOptions {
    buildInfoPluginManager?: BuildInfoPluginManager;
    defects?: string[];
    defectPluginManager?: DefectPluginManager;
    logger?: TestLog;
    testCases?: string[];
    testCasePluginManager?: TestCasePluginManager;
    description?: string;
}