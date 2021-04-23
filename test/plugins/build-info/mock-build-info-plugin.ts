import { IBuildInfoPlugin, rand } from "../../../src";

export class MockBuildInfoPlugin implements IBuildInfoPlugin {
    name: string = 'mock-build-info-plugin';
    async isEnabled(): Promise<boolean> {
        return true;
    }
    async onLoad(): Promise<void> {
        /* do something */
    }
    async getBuildName(): Promise<string> {
        return `MockBuildName-${rand.getInt(0, 99)}`;
    }
    async getBuildNumber(): Promise<string> {
        return `MockBuildNumber-${rand.getInt(100, 999)}`;
    }
}