import { DefectPluginManager, AbstractDefectPlugin } from "../../../src";
import { MockDefectPlugin } from "./mock-defect-plugin";

describe('DefectPluginManager', () => {
    it('can load a specified IDefectPlugin implementation', async () => {
        let dpm: DefectPluginManager = new DefectPluginManager({pluginNames: ['mock-defect-plugin']});
        let actual: AbstractDefectPlugin[] = await dpm.getPlugins();

        expect(actual).toBeDefined();
        expect(actual.length).toBeGreaterThan(0);
        expect(await actual[0].enabled()).toBeTruthy();
        expect(actual[0] instanceof MockDefectPlugin).toBeTruthy();
    });
});