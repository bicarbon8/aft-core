import { IPlugin } from "../iplugin";
import { IDefect } from "../../defects/idefect";

export interface IDefectPlugin extends IPlugin {
    getDefect(defectId: string): Promise<IDefect>;
    findDefects(searchTerm: string): Promise<IDefect[]>;
}