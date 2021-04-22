import { BuildInfoManager } from "../helpers/build-info-manager";
import { Func } from "../helpers/func";
import { DefectManager } from "../integrations/defects/defect-manager";
import { TestCaseManager } from "../integrations/test-cases/test-case-manager";
import { TestLog } from "../logging/test-log";
import { TestWrapper } from "./test-wrapper";

export interface TestWrapperOptions {
    expect: Func<TestWrapper, boolean | PromiseLike<boolean>>;
    buildInfoManager?: BuildInfoManager;
    defects?: string[];
    defectManager?: DefectManager;
    logger?: TestLog;
    testCases?: string[];
    testCaseManager?: TestCaseManager;
    description?: string;
}