import * as fs from 'fs';
import * as path from 'path';

export module TestConfig {
    var _aftConfig: object;

    /**
     * loads the specified file and attempts to return it as the declared type
     * @param jsonFile full path and filename to JSON file to be parsed
     */
    export async function getConfiguration<T>(jsonFile: string): Promise<T> {
        let config: T = await new Promise((resolve, reject) => {
            try {
                fs.readFile(jsonFile, function(err, data) {
                    if (err) {
                        reject(err.toString());
                    }
                    resolve(JSON.parse(data.toString('utf8')) as T);
                });
            } catch (e) {
                reject(e);
            }
        });
        return config;
    }

    /**
     * parses a 'aftconfig.json' file from the local execution directory
     * and returns it as a JavaScript object
     */
    export async function aftConfig(): Promise<object> {
        if (!_aftConfig) {
            let currentDir: string = process.cwd();
            if (!currentDir.endsWith('/') && !currentDir.endsWith('\\')) {
                currentDir += path.sep;
            }
            _aftConfig = await getConfiguration<object>(currentDir + 'aftconfig.json') || {};
        }
        return _aftConfig;
    }

    /**
     * will look for the specified configuration value in the environment variables
     * and then in the 'aftconfig.json' file and if not found will return the passed
     * in 'defaultVal' or null.
     * @param key the property name or environment variable to get the value from
     * @param defaultVal if no value set in config or environment vars, this is returned instead
     */
    export async function getValueOrDefault(key: string, defaultVal?: string): Promise<string> {
        let val: string = null;
        if (defaultVal === undefined) {
            defaultVal = null;
        }

        // check in environment vars
        val = process.env[key] || null;

        if (val === null) {
            let c: object = await this.aftConfig();
            val = c[key] || null;
        }

        if (val === null) {
            val = defaultVal;
        }

        return val;
    }

    /**
     * will set an environment variable for the specified key value pair
     * @param key the property name to set
     * @param val the value to set for the specified key
     */
    export function setGlobalValue(key: string, val: string): void {
        process.env[key] = val;
    }
}