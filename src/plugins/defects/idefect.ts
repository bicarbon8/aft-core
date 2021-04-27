import { DefectStatus } from "./defect-status";

export interface IDefect {
    id: string;
    title?: string;
    description?: string;
    status: DefectStatus;
}