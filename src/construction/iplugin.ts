export interface IPlugin {
    name: string;
    isEnabled(): Promise<boolean>;
    onLoad(): Promise<void>;
}