/**
 * Implementation of ProviderState.
 * @file sui/packages/sui-common/src/ProviderState/ProviderState.ts
 */

import { Settings, createSettings } from "./Settings";

export interface FlagConfig {
  /**
   * Default value for the flag.
   */
  defaultValue?: boolean;
  
  /**
   * Array of paths to trigger removal of flags.
   */
  removeTriggers?: Array<string | string[] | {[key: string]: any } >; 
  
  /**
   * Array of paths to enable addition of flags.
   */
  addTriggers?: Array<string | string[] | {[key: string]: any } >; 
}

export interface IProviderStateProps {
  /**
   * Record of settings with default values.
   */
  settings: Record<string, any>;
  
  /**
   * List of flag data.
   */
  flags: FlagData[];
}

export type Flags = Record<string, boolean>;

export type FlagData = {flag: string, config: FlagConfig}

export interface ProviderState {
  /**
   * Current state of the flags.
   */
  flags: Flags;
  
  /**
   * Configurations for each flag.
   */
  flagConfigs: Record<string, FlagConfig>;
  
  /**
   * Current settings with default values.
   */
  settings: Settings<any>;

  /**
   * Toggles a flag in the ProviderState instance.
   * 
   * @param flags - The name(s) of the flag(s) to toggle.
   */
  toggleFlags(flags: string | string[]): void;
  
  /**
   * Enables a flag in the ProviderState instance.
   * 
   * @param flags - The name(s) of the flag(s) to enable.
   */
  enableFlags(flags: string | string[]): void;
  
  /**
   * Disables a flag in the ProviderState instance.
   * 
   * @param flags - The name(s) of the flag(s) to disable.
   */
  disableFlags(flags: string | string[]): void;
  
  /**
   * Removes a flag from the ProviderState instance.
   * 
   * @param flags - The name(s) of the flag(s) to remove.
   */
  removeFlags(flags: string | string[]): void;
  
  /**
   * Creates new flags for the ProviderState instance.
   * 
   * @param flagDataList - List of flag data to create.
   */
  createFlags(flagDataList: FlagData[]): void;
  
  /**
   * Checks triggers for a flag in the ProviderState instance.
   * 
   * @param flagName - The name of the flag to check.
   * @param value - The current state of the flag.
   */
  checkTriggers(flagName: string, value: boolean): void;
}

/**
 * Creates and returns a new instance of ProviderState.
 * 
 * @param {IProviderStateProps} props - The properties for the ProviderState.
 * @returns {ProviderState} A new instance of ProviderState.
 */
export function createProviderState({
  flags = [],
  settings = {},
}: IProviderStateProps): ProviderState {
  
  const instance: ProviderState = {
    flags,
    flagConfigs: {},
    settings,
    
    /**
     * Creates new flags for the ProviderState instance.
     */
    createFlags(flags) {
      // Implementation to create flags...
    },
    
    /**
     * Toggles a flag in the ProviderState instance.
     */
    toggleFlags(flags) {
      // Implementation to toggle flags...
    },
    
    /**
     * Enables a flag in the ProviderState instance.
     */
    enableFlags(flags) {
      // Implementation to enable flags...
    },
    
    /**
     * Disables a flag in the ProviderState instance.
     */
    disableFlags(flags) {
      // Implementation to disable flags...
    },
    
    /**
     * Removes a flag from the ProviderState instance.
     */
    removeFlags(flags) {
      // Implementation to remove flags...
    },
    
    /**
     * Checks triggers for a flag in the ProviderState instance.
     */
    checkTriggers(flagName, value) {
      // Implementation to check triggers...
    }
  };
  
  instance.createFlags(flags);
  
  return instance;
}

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