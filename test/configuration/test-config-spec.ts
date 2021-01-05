import { TestConfig } from "../../src/configuration/test-config";
import { RandomGenerator } from "../../src/helpers/random-generator";
import { LoggingLevel } from "../../src/logging/logging-level";

describe('TestConfig', () => {
    describe('loadJsonFile', () => {
        it('can parse a json file', async () => {
            let packageJson: PackageJson = await TestConfig.loadJsonFile<PackageJson>('package.json');
    
            expect(packageJson.name).toEqual('aft-core');
        });

        it('returns a meaningful error if file is not found', async () => {
            await TestConfig.loadJsonFile<object>('doesnotexist.json')
            .catch((reason: string) => {
                expect(reason).not.toBeNull();
                expect(reason).toContain('no such file');
            });
        });

        it('returns a meaningful error if file is not valid JSON', async () => {
            await TestConfig.loadJsonFile<object>('LICENSE')
            .catch((reason: string) => {
                expect(reason).not.toBeNull();
                expect(reason).toContain('Unexpected token');
            });
        });
    });

    describe('aftConfig', () => {
        it('can read from aftconfig.json config file', async () => {
            let conf: object = await TestConfig.aftConfig();
            let level: string = conf['logging'].level;
    
            expect(level).not.toBeNull();
            expect(level).not.toBeUndefined();
            expect(level).toEqual(LoggingLevel.info.name);
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
    });

    describe('get', () => {
        it('can load values from environment variables', async () => {
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
    
            let actual: FooBar = await TestConfig.get<FooBar>(key, null);
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
    
            let actual: FooBar = await TestConfig.get<FooBar>(key, expected);
            expect(actual).not.toBeNull();
            expect(actual.foo).toBe(expected.foo);
            expect(actual.bar).toBe(expected.bar);
        });
    });

    describe('getFrom', () => {
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
    
            expect(TestConfig.getFrom(actual, "bar.asd.jkl")).toBe(actual['bar']['asd']['jkl']);
            expect(TestConfig.getFrom(actual, "foo")).toBe(actual['foo']);
            expect(TestConfig.getFrom(actual, "bar.baz")).toBe(actual['bar']['baz']);
        });
    
        it('will return null if passed in key does not exist', async () => {

        });
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