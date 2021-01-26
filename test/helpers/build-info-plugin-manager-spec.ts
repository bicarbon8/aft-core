import { BuildInfoPluginManager, IBuildInfoHandlerPlugin, LoggingLevel, TestLog } from "../../src";
import { MockBuildInfoHandlerPlugin } from "./mock-build-info-handler-plugin";

describe('BuildInfoPluginManager', () => {
    it('can load a specified IBuildInfoHandlerPlugin', async () => {
        let manager: BuildInfoPluginManager = new BuildInfoPluginManager({pluginName: './dist/test/helpers/mock-build-info-handler-plugin'});
        let actual: IBuildInfoHandlerPlugin = await manager.getPlugin();
        
        expect(actual).toBeDefined();
        expect(actual.name).toBe('mock-build-info-handler-plugin');
        expect(await actual.getBuildName()).toMatch(/MockBuildName-[0-9]{1,2}/);
        expect(await actual.getBuildNumber()).toMatch(/MockBuildNumber-[0-9]{3}/);
    });

    it('can handle errors in loaded IBuildInfoHandlerPlugin', async () => {
        let p: IBuildInfoHandlerPlugin = new MockBuildInfoHandlerPlugin();
        let err: string = 'Mock Exception on getBuildInfo';
        spyOn(p, 'getBuildName').and.callFake(() => {
            throw err;
        });
        let l: TestLog = new TestLog({name: 'silent logger'});
        let warnMessage: string = null;
        spyOn(l, 'warn').and.callFake(async (message: string) => {
            warnMessage = message;
        });
        let manager: BuildInfoPluginManager = new BuildInfoPluginManager({plugin: p, logger: l});
        
        expect(await manager.getBuildName()).toBe('');
        expect(p.getBuildName).toHaveBeenCalled();
        expect(l.warn).toHaveBeenCalled();
        expect(warnMessage).toBe(err);
    });
});