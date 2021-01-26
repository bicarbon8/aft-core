import { TestConfig } from "../configuration/test-config";
import { TestLog } from "../logging/test-log";
import { IPlugin } from "./iplugin";
import { PluginLoader } from "./plugin-loader";
import { PluginManagerOptions } from "./plugin-manager-options";

export abstract class PluginManager<T extends IPlugin> {
    protected pluginName: string;
    protected plugin: T;
    protected logger: TestLog;

    constructor(options?: PluginManagerOptions) {
        this.pluginName = options?.pluginName;
        this.plugin = options?.plugin;
        let typeName = Object.getPrototypeOf(this).constructor.name;
        this.logger = options?.logger || new TestLog({name: typeName});
    }

    abstract getConfigurationKey(): string;

    async getPluginName(): Promise<string> {
        if (!this.pluginName) {
            this.pluginName = await TestConfig.get(this.getConfigurationKey());
        }
        return this.pluginName;
    }

    async getPlugin(): Promise<T> {
        if (!this.plugin) {
            let pluginName: string = await this.getPluginName();
            if (pluginName) {
                let plugin: T = await PluginLoader.load<T>(pluginName);
                if (plugin) {
                    this.plugin = plugin;
                }
            }
        }
        return this.plugin;
    }
}