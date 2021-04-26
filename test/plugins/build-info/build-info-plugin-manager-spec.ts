import { nameof } from "ts-simple-nameof";
import { BuildInfoPluginManager, AbstractBuildInfoPlugin } from "../../../src";
import { MockBuildInfoPlugin } from "./mock-build-info-plugin";

describe('BuildInfoPluginManager', () => {
    it('assigns a configuration key based on the class name', () => {
        let mgr: BuildInfoPluginManager = new BuildInfoPluginManager();
        let actual: string = mgr.optionsMgr.key;

        expect(actual).toEqual(nameof(BuildInfoPluginManager).toLowerCase());
    });
    
    it('can load a specified IBuildInfoHandlerPlugin', async () => {
        let manager: BuildInfoPluginManager = new BuildInfoPluginManager({pluginNames: ['mock-build-info-plugin']});
        let actual: AbstractBuildInfoPlugin[] = await manager.getPlugins();
        
        expect(actual).toBeDefined();
        expect(actual.length).toBeGreaterThan(0);
        expect(actual[0].optionsMgr.key).toBe(nameof(MockBuildInfoPlugin).toLowerCase());
        expect(await actual[0].getBuildName()).toMatch(/MockBuildName-[0-9]{1,2}/);
        expect(await actual[0].getBuildNumber()).toMatch(/MockBuildNumber-[0-9]{3}/);
    });

    it('returns the build name from the first enabled plugin', async () => {
        let mgr: BuildInfoPluginManager = new BuildInfoPluginManager({pluginNames: ['mock-build-info-plugin']});

        expect(await mgr.getBuildName()).toMatch(/MockBuildName-[0-9]{1,2}/);
    });

    it('returns the build number from the first enabled plugin', async () => {
        let mgr: BuildInfoPluginManager = new BuildInfoPluginManager({pluginNames: ['mock-build-info-plugin']});

        expect(await mgr.getBuildNumber()).toMatch(/MockBuildNumber-[0-9]{3}/);
    });
});