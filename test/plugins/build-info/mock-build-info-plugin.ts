import { nameof } from "ts-simple-nameof";
import { AbstractBuildInfoPlugin, IBuildInfoPluginOptions, rand } from "../../../src";

export class MockBuildInfoPlugin extends AbstractBuildInfoPlugin {
    constructor(options?: IBuildInfoPluginOptions) {
        super(nameof(MockBuildInfoPlugin).toLowerCase(), options);
    }
    async onLoad(): Promise<void> {
        /* do nothing */
    }
    async getBuildName(): Promise<string> {
        return `MockBuildName-${rand.getInt(0, 99)}`;
    }
    async getBuildNumber(): Promise<string> {
        return `MockBuildNumber-${rand.getInt(100, 999)}`;
    }
    async dispose(error?: Error): Promise<void> {
        /* do nothing */
    }
}