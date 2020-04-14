import * as path from 'path';

export module PluginLoader {
    export async function load<T>(...pluginNames: string[]): Promise<T[]> {
        let plugins: T[] = [];
        for (var i=0; i<pluginNames.length; i++) {
            let p: T = await validatePlugin<T>(pluginNames[i]);
            if (p) {
                plugins.push(p);
            }
        }
        return plugins;
    }

    async function validatePlugin<T>(pluginName: string): Promise<T> {
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
                return new plugin[constructorName]();
            } catch (e) {
                console.warn(`unable to create instance of loaded plugin '${pluginName}' due to: ${e}`);
            }
        }
        return null as T;
    }
}