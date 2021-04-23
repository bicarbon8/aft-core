import { DefectPluginManager, IDefectPlugin } from "../../../src";
import { MockDefectPlugin } from "./mock-defect-plugin";

describe('DefectPluginManager', () => {
    it('can load a specified IDefectPlugin', async () => {
        let dpm: DefectPluginManager = new DefectPluginManager({pluginNames: ['mock-defect-plugin']});
        let actual: IDefectPlugin[] = await dpm.getPlugins();

        expect(actual).toBeDefined();
        expect(actual.length).toBeGreaterThan(0);
        expect(await actual[0].isEnabled()).toBeTruthy();
        expect(actual[0] instanceof MockDefectPlugin).toBeTruthy();
    });
});