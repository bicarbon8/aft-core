import { TestConfig } from "../../src/configuration/test-config";
import { RandomGenerator } from "../../src/helpers/random-generator";
import { LoggingLevel } from "../../src/logging/logging-level";

describe('TestConfig', () => {
    it('can read from aftconfig.json config file', async () => {
        let conf: object = await TestConfig.aftConfig();
        let level: string = conf['logging'].level;

        expect(level).not.toBeNull();
        expect(level).not.toBeUndefined();
        expect(level).toEqual(LoggingLevel.info.name);
    });

    it('can parse a json file', async () => {
        let packageJson: PackageJson = await TestConfig.loadJsonFile('package.json');

        expect(packageJson.name).toEqual('aft-core');
    });

    it('can modify loaded aftconfig.json object', async () => {
        let conf: object = await TestConfig.aftConfig();

        let key: string = RandomGenerator.getString(10);
        let val: string = RandomGenerator.getString(11);
        conf[key] = val;

        let conf2: object = await TestConfig.aftConfig();

        expect(conf2[key]).toBe(val);
        delete(conf[key]);
    });

    it('can load value from environment variable', async () => {
        let key: string = RandomGenerator.getString(12);
        let envKey: string = RandomGenerator.getString(14);
        let expected: FooBar = {
            foo: RandomGenerator.getString(9),
            bar: RandomGenerator.getInt(999, 9999)
        };
        process.env[envKey] = JSON.stringify(expected);
        await TestConfig.aftConfig()
        .then((conf) => {
            conf[key] = `%${envKey}%`;
        });

        let actual: FooBar = await TestConfig.getValueOrDefault<FooBar>(key, null);
        expect(actual).not.toBeNull();
        expect(actual.foo).toBe(expected.foo);
        expect(actual.bar).toBe(expected.bar);

        delete(process.env[envKey]);
    });

    it('will return default if environment variable contains no data', async () => {
        let key: string = RandomGenerator.getString(11);
        let envKey: string = RandomGenerator.getString(12);
        let expected: FooBar = {
            foo: RandomGenerator.getString(10),
            bar: RandomGenerator.getInt(99, 999)
        };
        await TestConfig.aftConfig()
        .then((conf) => {
            conf[key] = `%${envKey}%`;
        });

        let actual: FooBar = await TestConfig.getValueOrDefault<FooBar>(key, expected);
        expect(actual).not.toBeNull();
        expect(actual.foo).toBe(expected.foo);
        expect(actual.bar).toBe(expected.bar);
    });

    it('can get expected values from full object by keys', async () => {
        let actual: object = {
            foo: RandomGenerator.getString(12),
            bar: {
                baz: RandomGenerator.getInt(9, 99),
                asd: {
                    jkl: RandomGenerator.getGuid()
                }
            }
        };

        expect(TestConfig.getValueFromObj(actual, "bar.asd.jkl")).toBe(actual['bar']['asd']['jkl']);
        expect(TestConfig.getValueFromObj(actual, "foo")).toBe(actual['foo']);
        expect(TestConfig.getValueFromObj(actual, "bar.baz")).toBe(actual['bar']['baz']);
    });
});

class PackageJson {
    name: string;
    version: string;
    description: string;
}

interface FooBar {
    foo: string;
    bar: number;
}