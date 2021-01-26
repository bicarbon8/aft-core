import { IPlugin } from "../construction/iplugin";

export interface IBuildInfoHandlerPlugin extends IPlugin {
    getBuildName(): Promise<string>;
    getBuildNumber(): Promise<string>;
}