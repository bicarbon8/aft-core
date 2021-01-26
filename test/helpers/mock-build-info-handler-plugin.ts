import { IBuildInfoHandlerPlugin, RG } from "../../src";

export class MockBuildInfoHandlerPlugin implements IBuildInfoHandlerPlugin {
    name: string = 'mock-build-info-handler-plugin';

    async isEnabled(): Promise<boolean> {
        return true;
    }

    async onLoad(): Promise<void> {
        
    }

    async getBuildName(): Promise<string> {
        return `MockBuildName-${RG.getInt(0, 99)}`;
    }

    async getBuildNumber(): Promise<string> {
        return `MockBuildNumber-${RG.getInt(100, 999)}`;
    }
}