import { TestException } from "./test-exception";

export interface ITestResultMetaData {
    durationMs?: number;
    statusStr?: string;
    logs?: string;
    errors?: string;
}