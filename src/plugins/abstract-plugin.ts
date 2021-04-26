import { nameof } from "ts-simple-nameof";
import { OptionsManager } from "../configuration/options-manager";

export interface IPluginOptions {
    enabled?: boolean;
}

export abstract class AbstractPlugin<T extends IPluginOptions> {
    private _enabled: boolean;
    readonly optionsMgr: OptionsManager;
    constructor(key: string, options?: T) {
        this.optionsMgr = new OptionsManager(key, options);
    }
    async enabled(): Promise<boolean> {
        if (this._enabled === undefined) {
            this._enabled = await this.optionsMgr.getOption(nameof<IPluginOptions>(p => p.enabled), true);
        }
        return this._enabled;
    }
    abstract onLoad(): Promise<void>
}