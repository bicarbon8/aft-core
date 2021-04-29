import { nameof } from "ts-simple-nameof";
import { AbstractPlugin, IPluginOptions } from "../abstract-plugin";

export interface IBuildInfoPluginOptions extends IPluginOptions {
    buildName?: string;
    buildNumber?: string;
}

export abstract class AbstractBuildInfoPlugin extends AbstractPlugin<IBuildInfoPluginOptions> {
    private _buildName: string;
    private _buildNumber: string;
    async getBuildName(): Promise<string> {
        if (!this._buildName) {
            this._buildName = await this.optionsMgr.getOption(nameof<IBuildInfoPluginOptions>(p => p.buildName));
        }
        return this._buildName;
    }
    async getBuildNumber(): Promise<string> {
        if (!this._buildNumber) {
            this._buildNumber = await this.optionsMgr.getOption(nameof<IBuildInfoPluginOptions>(p => p.buildNumber));
        }
        return this._buildNumber;
    }
}