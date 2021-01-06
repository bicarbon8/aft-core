import { IDefect } from "../idefect";

export interface IDefectHandlerPlugin {
    name: string;
    enabled(): Promise<boolean>;
    getDefect(defectId: string): Promise<IDefect>;
}