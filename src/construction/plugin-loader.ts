import * as path from 'path';
import { IPlugin } from './iplugin';

export module PluginLoader {
    export async function load<T extends IPlugin>(pluginName: string): Promise<T> {
        let p: T = await validatePlugin<T>(pluginName);
        return p;
    }

    async function validatePlugin<T extends IPlugin>(pluginName: string): Promise<T> {
        var plugin;

        try {
            plugin  = await import(pluginName);
        } catch (e) {
            try {
                let pathToPlugin: string = path.resolve(process.cwd(), pluginName);
                plugin = await import(pathToPlugin);
            } catch (ee) {
                console.warn(`unable to load plugin: '${pluginName}' due to: ${ee}`);
            }
        }
        if (plugin) {
            try {
                let constructorName: string = Object.keys(plugin)[0];
                let p: T = new plugin[constructorName]();
                await p.onLoad();
                return p;
            } catch (e) {
                console.warn(`unable to create instance of loaded plugin '${pluginName}' due to: ${e}`);
            }
        }
        return null as T;
    }
}