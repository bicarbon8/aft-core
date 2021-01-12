/**
 * this interface allows for more complex return values
 * to be expressed from functions that would normally
 * return a simple boolean
 */
export interface IProcessingResult {
    obj?: any;
    success?: boolean;
    message?: string
}