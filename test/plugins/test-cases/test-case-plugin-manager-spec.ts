import { AbstractTestCasePlugin, TestCasePluginManager } from "../../../src";
import { MockTestCasePlugin } from "./mock-test-case-plugin";

describe('TestCasePluginManager', () => {
    it('can load a specified IDefectPlugin', async () => {
        let tcpm: TestCasePluginManager = new TestCasePluginManager({pluginNames: ['mock-test-case-plugin']});
        let actual: AbstractTestCasePlugin[] = await tcpm.getPlugins();

        expect(actual).toBeDefined();
        expect(actual.length).toBeGreaterThan(0);
        expect(await actual[0].enabled()).toBeTruthy();
        expect(actual[0] instanceof MockTestCasePlugin).toBeTruthy();
    });
});