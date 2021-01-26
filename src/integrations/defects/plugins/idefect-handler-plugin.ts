import { IPlugin } from "../../../construction/iplugin";
import { IDefect } from "../idefect";

export interface IDefectHandlerPlugin extends IPlugin {
    getDefect(defectId: string): Promise<IDefect>;
    findDefects(searchTerm: string): Promise<IDefect[]>;
}