"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProviderState = createProviderState;
const Settings_1 = require("./Settings");
function createProviderState({ flags = [], settings = {}, }) {
    const instance = {
        flags: {}, flagConfigs: {}, settings: (0, Settings_1.createSettings)(settings),
        toggleFlags(flagNames) {
            if (!Array.isArray(flagNames)) {
                flagNames = [flagNames];
            }
            flagNames.forEach((flag) => {
                this.flags[flag] = !this.flags[flag];
                this.checkTriggers(flag, this.flags[flag]);
            });
        },
        enableFlags(flagNames) {
            if (!Array.isArray(flagNames)) {
                flagNames = [flagNames];
            }
            flagNames.forEach((flag) => {
                if (process.env.FLAG_DEBUGGING) {
                    console.info('ENABLE FLAG', flag, 'config', this.flagConfigs[flag]);
                }
                this.flags[flag] = true;
                this.checkTriggers(flag, true);
            });
        },
        disableFlags(flagNames) {
            if (!Array.isArray(flagNames)) {
                flagNames = [flagNames];
            }
            flagNames.forEach((flag) => {
                if (process.env.FLAG_DEBUGGING) {
                    console.info('DISABLE FLAG', flag, 'config', this.flagConfigs[flag]);
                }
                this.flags[flag] = false;
                this.checkTriggers(flag, false);
            });
        },
        removeFlags(flagNames) {
            if (!Array.isArray(flagNames)) {
                flagNames = [flagNames];
            }
            flagNames.forEach((flag) => {
                if (flag in this.flags) {
                    delete this.flags[flag];
                    delete this.flagConfigs[flag];
                }
                else {
                    throw new Error(`Flag "${flag}" does not exist.`);
                }
            });
        },
        createFlags(flagDataList) {
            flagDataList.forEach((flagData) => {
                this.flags[flagData.flag] = flagData.config.defaultValue ?? false;
                this.flagConfigs[flagData.flag] = flagData.config;
            });
        },
        checkTriggers(flagName, value) {
            const config = this.flagConfigs[flagName];
            if (!config) {
                return;
            }
            if (value && config.removeTriggers) {
                for (let i = 0; i < config.removeTriggers.length; i += 1) {
                    const trigger = config.removeTriggers[i];
                    const isString = typeof trigger === 'string';
                    if (isString || Array.isArray(trigger)) {
                        const arrayTriggers = isString ? [trigger] : trigger;
                        this.disableFlags(arrayTriggers);
                    }
                    else {
                        Object.entries(trigger).forEach(([key, val]) => {
                            settings[key] = val;
                        });
                    }
                }
            }
            if (value && config.addTriggers) {
                for (let i = 0; i < config.addTriggers.length; i += 1) {
                    const trigger = config.addTriggers[i];
                    const isString = typeof trigger === 'string';
                    if (isString || Array.isArray(trigger)) {
                        const arrayTriggers = isString ? [trigger] : trigger;
                        this.enableFlags(arrayTriggers);
                    }
                    else {
                        Object.entries(trigger).forEach(([key, val]) => {
                            settings[key] = val;
                        });
                    }
                }
            }
        }
    };
    instance.createFlags(flags);
    return instance;
}
//# sourceMappingURL=ProviderState.js.map