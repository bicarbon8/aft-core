import { PluginManager } from "../construction/plugin-manager";
import { PluginManagerOptions } from "../construction/plugin-manager-options";
import { TestLog } from "../logging/test-log";
import { IBuildInfoHandlerPlugin } from "./ibuild-info-handler-plugin";

/**
 * loads in a specified plugin using configuration key of
 * `build-info-handler-plugin` and supplies this information
 * via the `getPlugin` function which returns a `IBuildInfoHandlerPlugin`
 * instance
 */
export class BuildInfoPluginManager extends PluginManager<IBuildInfoHandlerPlugin> {
    getConfigurationKey(): string {
        return 'build-info-handler-plugin';
    }

    async getBuildName(): Promise<string> {
        return await this.getPlugin()
        .then(async (p) => {
            if (p && await p.isEnabled()) {
                return await p.getBuildName();
            } else {
                return null;
            }
        }).catch(async (err) => {
            await this.logger.warn(err);
            return null;
        });
    }

    async getBuildNumber(): Promise<string> {
        return await this.getPlugin()
        .then(async (p) => {
            if (p && await p.isEnabled()) {
                return await p.getBuildNumber();
            } else {
                return null;
            }
        }).catch(async (err) => {
            await this.logger.warn(err);
            return null;
        });
    }
}

/**
 * loads in a specified plugin using configuration key of
 * `build-info-handler-plugin` and supplies this information
 * via the `getPlugin` function which returns a `IBuildInfoHandlerPlugin`
 * instance
 */
export module BuildInfoPluginManager {
    var _inst: BuildInfoPluginManager = null;

    export function instance(): BuildInfoPluginManager {
        if (!_inst) {
            _inst = new BuildInfoPluginManager();
        }
        return _inst;
    }
}