import { RandomGenerator } from "../../src/helpers/random-generator";
import { TestConfig } from "../../src/configuration/test-config";
import { TestLogOptions } from "../../src/logging/test-log-options";
import { TestLogLevel } from "../../src/logging/test-log-level";

describe('TestConfig', () => {
    it('can read from environment variables', async () => {
        let key: string = RandomGenerator.getString(10);
        let expected: string = RandomGenerator.getString(12);
        process.env[key] = expected;

        let actual: string = await TestConfig.getValueOrDefault(key);

        delete process.env[key]; // cleanup

        expect(actual).toEqual(expected);
    });

    it('can read from aftconfig.json config file', async () => {
        let level: string = await TestConfig.getValueOrDefault(TestLogOptions.LOGLEVEL_KEY, 'wrong_value');

        expect(level).toEqual(TestLogLevel.info.name);
    });

    it('will override aftconfig.json values with environment variable values', async () => {
        let expected: string = TestLogLevel.warn.name;
        process.env[TestLogOptions.LOGLEVEL_KEY] = expected;

        let actual: string = await TestConfig.getValueOrDefault(TestLogOptions.LOGLEVEL_KEY);

        delete process.env[TestLogOptions.LOGLEVEL_KEY]; // cleanup

        expect(actual).toEqual(expected);
    });

    it('can return a default value if no other configuration is found', async () => {
        let key: string = RandomGenerator.getString(18);
        let expected: string = RandomGenerator.getString(22);

        let actual: string = await TestConfig.getValueOrDefault(key, expected);

        expect(actual).toEqual(expected);
    });

    it('can parse a json file', async () => {
        let packageJson: Package = await TestConfig.getConfiguration('package.json');

        expect(packageJson.name).toEqual('aft-core');
    });
});

class Package {
    name: string;
    version: string;
    description: string;
}