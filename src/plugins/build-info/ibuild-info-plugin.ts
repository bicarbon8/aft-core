import { IPlugin } from "../iplugin";

export interface IBuildInfoPlugin extends IPlugin {
    getBuildName(): Promise<string>;
    getBuildNumber(): Promise<string>;
}