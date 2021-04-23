import { BuildInfoPluginManager, IBuildInfoPlugin } from "../../../src";

describe('BuildInfoPluginManager', () => {
    it('assigns a configuration key based on the class name', () => {
        let mgr: BuildInfoPluginManager = new BuildInfoPluginManager();
        let actual: string = mgr.key;

        expect(actual).toEqual(mgr.constructor.name.toLowerCase());
    });
    
    it('can load a specified IBuildInfoHandlerPlugin', async () => {
        let manager: BuildInfoPluginManager = new BuildInfoPluginManager({pluginNames: ['mock-build-info-plugin']});
        let actual: IBuildInfoPlugin[] = await manager.getPlugins();
        
        expect(actual).toBeDefined();
        expect(actual.length).toBeGreaterThan(0);
        expect(actual[0].name).toBe('mock-build-info-plugin');
        expect(await actual[0].getBuildName()).toMatch(/MockBuildName-[0-9]{1,2}/);
        expect(await actual[0].getBuildNumber()).toMatch(/MockBuildNumber-[0-9]{3}/);
    });
});