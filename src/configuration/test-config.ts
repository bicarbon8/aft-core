import * as fs from 'fs';
import * as path from 'path';
import { TestLog } from '../logging/test-log';
import { LoggingLevel } from '../logging/logging-level';
import { ProcessingResult } from '../helpers/processing-result';

export module TestConfig {
    var _aftConfig: object;
    var _testLog: TestLog;

    function _logger(): TestLog {
        if (!_testLog) {
            _testLog = new TestLog({name: 'TestConfig', pluginNames: []});
        }
        return _testLog;
    }

    /**
     * loads the specified file and attempts to return it as the declared type
     * @param jsonFile full path and filename to JSON file to be parsed
     */
    export async function loadJsonFile<T>(jsonFile: string): Promise<T> {
        let config: T = await new Promise((resolve, reject) => {
            try {
                fs.readFile(jsonFile, function(err, data) {
                    if (err) {
                        reject(err.toString());
                    }
                    if (data) {
                        let fileContents: string = data.toString('utf8');
                        let jsonRes: ProcessingResult = isJsonString(fileContents);
                        if (jsonRes.success) {
                            resolve(jsonRes.obj as T);
                        } else {
                            reject(jsonRes.message);
                        }
                    }
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
            _aftConfig = await loadJsonFile<object>(currentDir + 'aftconfig.json')
                .catch(async (err) => {
                    await _logger().warn(err);
                    return {}; // empty config
                });
        }
        return _aftConfig;
    }

    /**
     * function will lookup the value for a specified set of keys within the aftconfig.json
     * by recursing down until the last key is used. for example to get the value of "baz" from
     * {"foo": {"bar": {"baz": 123}}} you would specify a key of 'foo.bar.baz' which would 
     * return 123. alternatively, to get the value of "bar" you would specify a key of
     * 'foo.bar' which would return {"baz": 123}
     * @param keys the keys to be used in looking up values separated by the . character
     * @param defaultVal if no value found for the specified keys then this will be returned instead; default null
     */
    export async function get<T>(keys: string, defaultVal?: T): Promise<T> {
        let conf: object = await aftConfig();
        let val: any = await getFrom(conf, keys)
        
        return val || defaultVal as T;
    }

    /**
     * function will lookup the value for a specified set of keys within the passed in object
     * by recursing down until the last key is used. for example to get the value of "baz" from
     * {"foo": {"bar": {"baz": 123}}} you would specify a key of 'foo.bar.baz' which would 
     * return 123. alternatively, to get the value of "bar" you would specify a key of
     * 'foo.bar' which would return {"baz": 123}
     * @param obj the object to search for values within
     * @param keys the keys to be used in looking up values separated by the . character
     */
    export async function getFrom(obj: any, keys: string): Promise<any> {
        let result: any = null;
        let keysArray: string[] = keys.split('.');
        let currentKey: string = keysArray.shift();

        if (currentKey.length > 0) {
            switch(typeof obj) {
                case "object":
                    result = await getFrom(obj[currentKey], keysArray.join('.'));
                    break;
                case "string":
                    let envRes: ProcessingResult = isEnvVar(obj);
                    if (envRes.success) {
                        let jsonRes: ProcessingResult = isJsonString(envRes.obj);
                        if (jsonRes.success) {
                            result = await getFrom(jsonRes.obj, keys);
                            break;
                        }
                    }
                default:
                    result = null;
                    await _logger().log(LoggingLevel.trace, `invalid Argument: ${obj}, Type: ${typeof obj} passed to getFrom}`);
                    break;
            }
        } else {
            switch(typeof obj) {
                case "string":
                    let envRes: ProcessingResult = isEnvVar(obj);
                    if (envRes.success) {
                        let jsonRes: ProcessingResult = isJsonString(envRes.obj);
                        if (jsonRes.success) {
                            result = jsonRes.obj;
                        } else {
                            result = envRes.obj;
                        }
                    } else {
                        result = obj;
                    }
                    break;
                default:
                    result = obj;
                    break;
            }
        }
        return result;
    }

    /**
     * function will check if the passed in 'str' string is a 
     * reference to an environment variable key and if so will
     * lookup the value and return otherwise it will return null
     * @param str the value to be parsed to determine if it is an
     * Environment Variable reference
     */
    export function isEnvVar(str: string): ProcessingResult {
        if (str) {
            let matchResults = str.match(/^%(.*)%$/);
            if (matchResults && matchResults.length > 0) {
                let envValStr: string = process.env[matchResults[1]];
                return {obj: envValStr, success: true};
            }
        }
        return {success: false};
    }

    /**
     * function verifies that the passed in string is a valid
     * JSON object that can successfully be parsed with the 
     * JSON.parse command
     * @param str the string to be tested for validity
     */
    export function isJsonString(str: string): ProcessingResult {
        let err: string = null;
        if (str) {        
            try {
                let jsonObj: object = JSON.parse(str);
                return {obj: jsonObj, success: true};
            } catch (e) { 
                err = `[isJsonString] for string value of '${str}' threw an error of: ${e}`;
            }
        } else {
            err = `[isJsonString] for string value of '${str}' is not valid.`
        }
        return {success: false, message: err};
    }
}