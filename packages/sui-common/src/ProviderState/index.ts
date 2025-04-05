/**
 * @typedef {Object} FlagConfig - Configuration for a flag
 * @property {boolean} [defaultValue] - Default value of the flag
 * @property {Array<string | string[] | {[key: string]: any}>} [removeTriggers] - Array of flag or setting paths for removal triggers
 * @property {Array<string | string[] | {[key: string]: any}>} [addTriggers] - Array of flag or setting paths for addition triggers
 */

/**
 * @typedef {Object} IProviderStateProps - Properties for ProviderState
 * @property {Record<string, any>} settings - Settings object
 * @property {FlagData[]} flags - Array of flag data
 */

/**
 * @typedef {Object} Flags - Record of flag names to boolean values
 */

/**
 * @typedef {Object} FlagData - Data for a flag
 * @property {string} flag - Flag name
 * @property {FlagConfig} config - Configuration for the flag
 */

/**
 * @typedef {Object} ProviderState - State object for flag management
 * @property {Flags} flags - Record of flag names to boolean values
 * @property {Record<string, FlagConfig>} flagConfigs - Record of flag names to flag configurations
 * @property {Settings<any>} settings - Settings object
 * @property {Function} toggleFlags - Function to toggle flags
 * @property {Function} enableFlags - Function to enable flags
 * @property {Function} disableFlags - Function to disable flags
 * @property {Function} removeFlags - Function to remove flags
 * @property {Function} createFlags - Function to create flags
 * @property {Function} checkTriggers - Function to check triggers based on flag value
 */

/**
 * Creates a ProviderState object based on the provided properties.
 * @param {IProviderStateProps} props - Provider state properties
 * @returns {ProviderState} The created ProviderState object
 */
export function createProviderState({
  flags = [],
  settings = {},
}: IProviderStateProps): ProviderState {
  const instance: ProviderState = {
    flags: {}, flagConfigs: {}, settings: createSettings(settings),

    /**
     * Toggles the specified flags.
     * @param {string | string[]} flagNames - Flag name or array of flag names to toggle
     */
    toggleFlags(flagNames: string | string[]): void {
      if (!Array.isArray(flagNames)) {
        flagNames = [flagNames];
      }
      flagNames.forEach((flag) => {
        this.flags[flag] = !this.flags[flag];
        this.checkTriggers(flag, this.flags[flag]);
      });
    },

    /**
     * Enables the specified flags.
     * @param {string | string[]} flagNames - Flag name or array of flag names to enable
     */
    enableFlags(flagNames: string | string[]): void {
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

    /**
     * Disables the specified flags.
     * @param {string | string[]} flagNames - Flag name or array of flag names to disable
     */
    disableFlags(flagNames: string | string[]): void {
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

    /**
     * Removes the specified flags.
     * @param {string | string[]} flagNames - Flag name or array of flag names to remove
     */
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

    /**
     * Creates flags based on the provided data.
     * @param {FlagData[]} flagDataList - Array of flag data to create
     */
    createFlags(flagDataList: FlagData[]): void {
      flagDataList.forEach((flagData) => {
        this.flags[flagData.flag] = flagData.config.defaultValue ?? false;
        this.flagConfigs[flagData.flag] = flagData.config;
      });
    },

    /**
     * Checks triggers based on the flag value.
     * @param {string} flagName - Name of the flag to check triggers for
     * @param {boolean} value - Value of the flag
     */
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

      // Handle add triggers
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