import { BuildInfoManager, IBuildInfoHandlerPlugin } from "../../src";

describe('BuildInfoManager', () => {
    it('can load a specified IBuildInfoHandlerPlugin', async () => {
        let manager: BuildInfoManager = new BuildInfoManager({pluginName: './dist/test/helpers/mock-build-info-handler-plugin'});
        let actual: IBuildInfoHandlerPlugin = await manager.getPlugin();
        
        expect(actual).toBeDefined();
        expect(actual.name).toBe('mock-build-info-handler-plugin');
        expect(await actual.getBuildName()).toMatch(/MockBuildName-[0-9]{1,2}/);
        expect(await actual.getBuildNumber()).toMatch(/MockBuildNumber-[0-9]{3}/);
    });
});