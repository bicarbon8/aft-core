import { TestConfig } from "../configuration/test-config";

export module BuildInfo {
    export async function name(): Promise<string> {
        // TODO: use Build Server plugin to get value
        return TestConfig.getValueOrDefault('JOB_NAME');
    }

    export async function number(): Promise<string> {
        // TODO: use Build Server plugin to get value
        return TestConfig.getValueOrDefault('BUILD_NUMBER');
    }
}