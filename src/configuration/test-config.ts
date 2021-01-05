import * as fs from 'fs';
import * as path from 'path';
import { TestLog } from '../logging/test-log';
import { LoggingLevel } from '../logging/logging-level';
import { IProcessingResult } from '../helpers/iprocessing-result';

export module TestConfig {
    var _aftConfig: object;

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
            _aftConfig = await loadJsonFile<object>(currentDir + 'aftconfig.json') || {};
        }
        return _aftConfig;
    }

    export async function getValueOrDefault<T>(keys: string, defaultVal?: T): Promise<T> {
        let conf: object = await aftConfig();
        let val: any = getValueFromObj(conf, keys)
        
        return val || defaultVal as T;
    }

    export function getValueFromObj(obj: any, keys: string): any {
        let result: any = null;
        let keysArray: string[] = keys.split('.');
        let currentKey: string = keysArray.shift();

        if (currentKey.length > 0) {
            switch(typeof obj) {
                case "object":
                    result = getValueFromObj(obj[currentKey], keysArray.join('.'));
                    break;
                case "string":
                    let envRes: IProcessingResult = isEnvVar(obj);
                    if (envRes.success) {
                        let jsonRes: IProcessingResult = isJsonString(envRes.obj);
                        if (jsonRes.success) {
                            result = getValueFromObj(jsonRes.obj, keys);
                            break;
                        }
                    }
                default:
                    result = null;
                    TestLog.log(LoggingLevel.trace, `invalid Argument: ${obj}, Type: ${typeof obj} passed to getValueFromObj}`);
                    break;
            }
        } else {
            switch(typeof obj) {
                case "string":
                    let envRes: IProcessingResult = isEnvVar(obj);
                    if (envRes.success) {
                        let jsonRes: IProcessingResult = isJsonString(envRes.obj);
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
    export function isEnvVar(str: string): IProcessingResult {
        if (str) {
            let matchResults = str.match(/^%(.*)%$/);
            if (matchResults && matchResults.length > 0) {
                let envValStr: string = process.env[matchResults[1]];
                return {obj: envValStr, success: true} as IProcessingResult;
            }
        }
        return {obj: null, success: false} as IProcessingResult;
    }

    /**
     * function verifies that the passed in string is a valid
     * JSON object that can successfully be parsed with the 
     * JSON.parse command
     * @param str the string to be tested for validity
     */
    export function isJsonString(str: string): IProcessingResult {
        let err: string = null;
        if (str) {        
            let match: RegExpMatchArray = str.match(/^{(([\s]*["]+.*["]+[\s]*)(:)(.*)[,]?)+}$/);
            if (match && match.length > 0) {
                try {
                    let jsonObj: object = JSON.parse(str);
                    return {obj: jsonObj, success: true} as IProcessingResult;
                } catch (e) { 
                    err = `[isJsonString] for string value of '${str}' threw an error of: ${e}`;
                }
            }
        } else {
            err = `[isJsonString] for string value of '${str}' is not valid.`
        }
        return {obj: null, success: false, message: err};
    }
}