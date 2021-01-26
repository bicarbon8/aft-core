import { TestLog } from "../logging/test-log";

export interface PluginManagerOptions {
    pluginName?: string;
    plugin?: any;
    logger?: TestLog;
}