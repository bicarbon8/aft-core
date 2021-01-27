import { PluginManager } from "../construction/plugin-manager";
import { TestLog } from "../logging/test-log";
import { BuildInfoManagerOptions } from "./build-info-manager-options";
import { IBuildInfoHandlerPlugin } from "./ibuild-info-handler-plugin";

/**
 * loads and provides an interface between any `IBuildInfoHandlerPlugin`
 * to specify a plugin use the following `aftconfig.json` key:
 * ```
 * {
 *   ...
 *   "buildInfoManager": {
 *     "pluginName": "./path/to/plugin"
 *   }
 *   ...
 * }
 * ```
 */
export class BuildInfoManager extends PluginManager<IBuildInfoHandlerPlugin, BuildInfoManagerOptions> {
    private logger: TestLog;

    constructor(options?: BuildInfoManagerOptions) {
        super(options);
        this.logger = this.options['logger'] || new TestLog({name: 'BuildInfoManager', pluginNames: []});
    }
    
    getOptionsConfigurationKey(): string {
        return 'buildInfoManager';
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
export module BuildInfoManager {
    var _inst: BuildInfoManager = null;

    export function instance(): BuildInfoManager {
        if (!_inst) {
            _inst = new BuildInfoManager();
        }
        return _inst;
    }
}

/**
 * [OBSOLETE] use `BuildInfoManager` instead
 */
export var BuildInfoPluginManager = BuildInfoManager;