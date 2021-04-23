import * as fs from 'fs';
import * as path from 'path';
import { IPlugin } from './iplugin';

class Loader {
    async load<T extends IPlugin>(pluginName: string, options?: any): Promise<T> {
        let p: T = await this._validatePlugin<T>(pluginName, options);
        return p;
    }

    private async _validatePlugin<T extends IPlugin>(pluginName: string, options?: any): Promise<T> {
        let plugin: T;

        try {
            plugin  = await import(pluginName);
        } catch (e) {
            try {
                let pathToPlugin: string = await this._findPlugin(process.cwd(), `${pluginName}.js`);
                pathToPlugin = pathToPlugin.replace('.js', '');
                plugin = await import(pathToPlugin);
            } catch (ee) {
                console.warn(`unable to load plugin: '${pluginName}' due to: ${ee}`);
            }
        }
        if (plugin) {
            try {
                let constructorName: string = Object.keys(plugin)[0];
                let p: T = new plugin[constructorName](options);
                await p.onLoad();
                return p;
            } catch (e) {
                console.warn(`unable to create instance of loaded plugin '${pluginName}' due to: ${e}`);
            }
        }
        return null as T;
    }

    private async _findPlugin(dir: string, name: string): Promise<string> {
        let filePath: string = await new Promise((resolve, reject) => {
            try {
                fs.readdir(dir, async (err, files: string[]) => {
                    if (files) {
                        for (var i=0; i<files.length; i++) {
                            let file: string = files[i];
                            let fileAndPath: string = path.resolve(dir, file);
                            let isDir: boolean = await this._isDir(fileAndPath);
                            if (isDir) {
                                let found: string = await this._findPlugin(fileAndPath, name);
                                if (found) {
                                    resolve(found);
                                }
                            } else {
                                if (file == name) {
                                    resolve(fileAndPath);
                                    break;
                                }
                            }
                        }
                    }
                    resolve(null);
                });
            } catch (e) {
                reject(e);
            }
        });
        return filePath;
    }

    private async _isDir(fullFileAndPath: string): Promise<boolean> {
        return await new Promise((resolve, reject) => {
            try {
                fs.stat(fullFileAndPath, (err, stats: fs.Stats) => {
                    let isDir: boolean = stats?.isDirectory() || false;
                    resolve(isDir);
                });
            } catch (e) {
                reject(e);
            }
        });
    }
}

export const PluginLoader = new Loader();