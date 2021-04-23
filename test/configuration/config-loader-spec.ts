import { config } from "../../src/configuration/config-loader";
import { rand } from "../../src/helpers/random-generator";
import { LoggingLevel } from "../../src/logging/logging-level";

describe('TestConfig', () => {
    describe('loadJsonFile', () => {
        it('can parse a json file', async () => {
            let packageJson: PackageJson = await config.loadJsonFile<PackageJson>('package.json');
    
            expect(packageJson.name).toMatch(/(aft-)[a-z\-]+/);
        });

        it('returns a meaningful error if file is not found', async () => {
            await config.loadJsonFile<object>('doesnotexist.json')
            .catch((reason: string) => {
                expect(reason).not.toBeNull();
                expect(reason).toContain('no such file');
            });
        });

        it('returns a meaningful error if file is not valid JSON', async () => {
            await config.loadJsonFile<object>('LICENSE')
            .catch((reason: string) => {
                expect(reason).not.toBeNull();
                expect(reason).toContain('Unexpected token');
            });
        });
    });

    describe('aftConfig', () => {
        it('can read from aftconfig.json config file', async () => {
            let conf: object = await config.aftConfig();
            let level: string = conf['logging'].level;
    
            expect(level).not.toBeNull();
            expect(level).not.toBeUndefined();
            expect(level).toEqual(LoggingLevel.info.name);
        });

        it('can modify loaded aftconfig.json object', async () => {
            let conf: object = await config.aftConfig();
    
            let key: string = rand.getString(10);
            let val: string = rand.getString(11);
            conf[key] = val;
    
            let conf2: object = await config.aftConfig();
    
            expect(conf2[key]).toBe(val);
            delete(conf[key]);
        });
    });

    describe('get', () => {
        it('can load values from environment variables', async () => {
            let key: string = rand.getString(12);
            let envKey: string = rand.getString(14);
            let expected: FooBar = {
                foo: rand.getString(9),
                bar: rand.getInt(999, 9999)
            };
            process.env[envKey] = JSON.stringify(expected);
            await config.aftConfig()
            .then((conf) => {
                conf[key] = `%${envKey}%`;
            });
    
            let actual: FooBar = await config.get<FooBar>(key, null);
            expect(actual).not.toBeNull();
            expect(actual.foo).toBe(expected.foo);
            expect(actual.bar).toBe(expected.bar);
    
            delete(process.env[envKey]);
        });

        it('will return default if environment variable contains no data', async () => {
            let key: string = rand.getString(11);
            let envKey: string = rand.getString(12);
            let expected: FooBar = {
                foo: rand.getString(10),
                bar: rand.getInt(99, 999)
            };
            await config.aftConfig()
            .then((conf) => {
                conf[key] = `%${envKey}%`;
            });
    
            let actual: FooBar = await config.get<FooBar>(key, expected);
            expect(actual).not.toBeNull();
            expect(actual.foo).toBe(expected.foo);
            expect(actual.bar).toBe(expected.bar);
        });
    });

    describe('getFrom', () => {
        it('can get expected values from full object by keys', async () => {
            let actual: object = {
                foo: rand.getString(12),
                bar: {
                    baz: rand.getInt(9, 99),
                    asd: {
                        jkl: rand.guid
                    }
                }
            };
    
            expect(await config.getFrom(actual, "bar.asd.jkl")).toBe(actual['bar']['asd']['jkl']);
            expect(await config.getFrom(actual, "foo")).toBe(actual['foo']);
            expect(await config.getFrom(actual, "bar.baz")).toBe(actual['bar']['baz']);
        });
    
        it('will return null if passed in key does not exist', async () => {
            let actual: object = {
                foo: rand.getString(12),
                bar: {
                    baz: rand.getInt(9, 99),
                    asd: {
                        jkl: rand.guid
                    }
                }
            };

            expect(await config.getFrom(actual, "foo.bar")).toBeNull();
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