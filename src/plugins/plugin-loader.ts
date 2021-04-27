import * as fs from 'fs';
import * as path from 'path';
import { AbstractPlugin } from './abstract-plugin';

class Loader {
    /**
     * attempts to load a package named `pluginName` and if
     * that fails will search the filesystem, starting at the current
     * execution directory and searching all subdirectories, for a file
     * named `custom-plugin.js` which, if found, will be imported and a 
     * new instance will be created followed by calling the {onLoad} function.
     * 
     * NOTE: each time this is called a new instance of the Plugin is created.
     * @param pluginName the name of the plugin package or file to be imported
     * @param options [optional] object containing options passed to the plugin constructor
     * @returns an instance of the plugin
     */
    async load<T extends AbstractPlugin<any>>(pluginName: string, options?: any): Promise<T> {
        let p: T = await this._validatePlugin<T>(pluginName, options);
        return p;
    }

    private async _validatePlugin<T extends AbstractPlugin<any>>(pluginName: string, options?: any): Promise<T> {
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

/**
 * responsible for finding and loading plugins based on a passed in 
 * {pluginName} and optional {options}. any plugin loaded by this
 * class must extend from {AbstractPlugin<any>} and would be expected
 * to accept an {options} object in its constructor.
 * ```typescript
 * let plugin: CustomPlugin = await PluginLoader.load<CustomPlugin>('custom-plugin', {foo: 'bar'});
 * ```
 * NOTE: the above will attempt to load `custom-plugin` package and if
 * that fails will search the filesystem, starting at the current
 * execution directory and searching all subdirectories, for a file
 * named `custom-plugin.js` which, if found, will be imported and a 
 * new instance will be created followed by calling the {onLoad} function
 */
export const pluginLoader = new Loader();