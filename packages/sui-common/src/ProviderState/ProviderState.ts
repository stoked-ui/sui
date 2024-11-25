import Settings, { createSettings } from "./Settings";

export interface FlagConfig {
  defaultValue?: boolean;
  removeTriggers?: Array<string | string[] | {[key: string]: any } >; // Array of flag or setting paths
  addTriggers?: Array<string | string[] | {[key: string]: any } >;    // Array of flag or setting paths
}

export interface IProviderStateProps {
  settings: Record<string, any>;
  flags: FlagData[];
}

export type Flags = Record<string, boolean>;

export type FlagData = {flag: string, config: FlagConfig}

export default interface ProviderState {
  flags: Flags;
  flagConfigs: Record<string, FlagConfig>;
  settings: Settings<any>;

  toggleFlags(flags: string | string[]): void;
  enableFlags(flags: string | string[]): void;
  disableFlags(flags: string | string[]): void;
  removeFlags(flags: string | string[]): void;
  createFlags(flags: FlagData[]): void;
  checkTriggers(flagName: string, value: boolean): void;
}

export function createProviderState({
  flags = [],
  settings = {},
}: IProviderStateProps): ProviderState {
  const instance: ProviderState = {
    flags: {}, flagConfigs: {}, settings: createSettings(settings),

    toggleFlags(flagNames: string | string[]): void {
      if (!Array.isArray(flagNames)) {
        flagNames = [flagNames];
      }
      flagNames.forEach((flag) => {
        this.flags[flag] = !this.flags[flag];
        this.checkTriggers(flag, this.flags[flag]);
      });
    },

    enableFlags(flagNames: string | string[]): void {
      if (!Array.isArray(flagNames)) {
        flagNames = [flagNames];
      }
      flagNames.forEach((flag) => {
        this.flags[flag] = true;
        this.checkTriggers(flag, true);
      });
    },

    disableFlags(flagNames: string | string[]): void {
      if (!Array.isArray(flagNames)) {
        flagNames = [flagNames];
      }
      flagNames.forEach((flag) => {
        this.flags[flag] = false;
        this.checkTriggers(flag, false);
      });
    },

    removeFlags(flagNames: string | string[]): void {
      if (!Array.isArray(flagNames)) {
        flagNames = [flagNames];
      }
      flagNames.forEach((flag) => {
        if (flag in this.flags) {
          delete this.flags[flag];
          delete this.flagConfigs[flag];
        } else {
          throw new Error(`Flag "${flag}" does not exist.`);
        }
      });
    },

    createFlags(flagDataList: FlagData[]): void {
      flagDataList.forEach((flagData) => {
        this.flags[flagData.flag] = flagData.config.defaultValue ?? false;
        this.flagConfigs[flagData.flag] = flagData.config;
      });
    },

    checkTriggers(flagName: string, value: boolean): void {
      const config = this.flagConfigs[flagName];
      if (!config) {
        return;
      }

      // Handle remove triggers
      if (value && config.removeTriggers) {
        for (let i = 0; i < config.removeTriggers.length; i += 1) {
          const trigger = config.removeTriggers[i];
          const isString = typeof trigger === 'string';
          if (isString || Array.isArray(trigger)) {
            const arrayTriggers = isString ? [trigger] : trigger;
            this.disableFlags(arrayTriggers);
          } else {
            Object.entries(trigger).forEach(([key, val]: [string, any]) => {
              settings[key] = val
            })
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
          } else {
            Object.entries(trigger).forEach(([key, val]: [string, any]) => {
              settings[key] = val
            })
          }
        }
      }
    }
  };

  instance.createFlags(flags);
  return instance;
}
/*

// Usage
import { createProviderState } from "./ProviderState";

const providerState = createProviderState({
  flags: [
    { flag: "isDarkMode", config: { defaultValue: false } },
    { flag: "isAdmin", config: { defaultValue: true } },
  ],
  settings: { theme: "light" },
});

console.log(providerState.flags); // Output: { isDarkMode: false, isAdmin: true }
providerState.toggleFlags("isDarkMode");
console.log(providerState.flags); // Output: { isDarkMode: true, isAdmin: true }
*/
