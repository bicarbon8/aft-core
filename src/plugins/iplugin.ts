export interface IPlugin {
    readonly name: string;
    isEnabled(): Promise<boolean>;
    onLoad(): Promise<void>;
}