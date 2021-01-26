import { BuildInfoPluginManager } from "./build-info-plugin-manager";

/**
 * [OBSOLETE] use `BuildInfoPluginManager.instance()` instead
 */
export module BuildInfo {
    /**
     * returns the build name as supplied by any loaded
     * `IBuildInfoHandlerPlugin` or empty string if none
     * loaded
     */
    export async function name(): Promise<string> {
        return await BuildInfoPluginManager.instance().getBuildName();
    }

    /**
     * returns the build number as supplied by any loaded
     * `IBuildInfoHandlerPlugin` or empty string if none
     * loaded
     */
    export async function number(): Promise<string> {
        return await BuildInfoPluginManager.instance().getBuildNumber();
    }
}