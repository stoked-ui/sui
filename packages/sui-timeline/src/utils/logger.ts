/**
 * ConsoleLogger
 *
 * A class for logging messages to the console.
 *
 * @class ConsoleLogger
 */

export enum LogLevel {
  /**
   * Verbose level.
   */
  VERBOSE = 0,
  /**
   * Log level.
   */
  LOG = 1,
  /**
   * Info level.
   */
  INFO = 2,
  /**
   * Warn level.
   */
  WARN = 3,
  /**
   * Error level.
   */
  ERROR = 4,
  /**
   * Fatal level.
   */
  FATAL = 5,
  /**
   * Silent level (Infinity).
   */
  SILENT = Infinity
}

export const LogLevels = {
  VERBOSE: LogLevel.VERBOSE,
  LOG: LogLevel.LOG,
  INFO: LogLevel.INFO,
  WARN: LogLevel.WARN,
  ERROR: LogLevel.ERROR,
  SILENT: LogLevel.SILENT,
};

/**
 * colorize function.
 *
 * Returns a CSS style string for coloring text.
 *
 * @param {string} hex - Hexadecimal color code.
 * @param {number} x - Font size in pixels.
 * @return {string} CSS style string.
 */
function colorize(hex: string, x: number) {
  return `color:${hex};font-size:${x}px;`;
}

export default class ConsoleLogger {
  /**
   * Array of all instances.
   *
   * @type {ConsoleLogger[]}
   */
  static readonly instances: ConsoleLogger[] = [];

  /**
   * Current logging level.
   *
   * @type {LogLevel}
   */
  static level: LogLevel = LogLevel.LOG;

  /**
   * Mapping of log levels to their corresponding numbers.
   *
   * @type {Object<string, number>}
   */
  static Levels = LogLevels;

  /**
   * Flag to toggle coloring.
   *
   * @type {boolean}
   */
  static noColor = true; // default

  /**
   * Creates a new ConsoleLogger instance.
   */
  constructor() {
    if (!ConsoleLogger.instances) {
      ConsoleLogger.instances = [];
    }
    ConsoleLogger.instances.push(this);
  }

  /**
   * Log a message to the console.
   *
   * @param {string} title - Message title.
   * @param {...*} args - Arguments to pass to the logging function.
   */
  log(title: string, ...args: any[]) {
    if (this.enabled(this.level)) {
      if (ConsoleLogger.noColor) {
        console.log(`[${this.prefix}] ${title}`, ...args);
      } else {
        console.log(`%c[${this.prefix}] ${title}`, this.logColor, ...args);
      }
    }
  }

  /**
   * Log a message to the console.
   *
   * @param {string} title - Message title.
   * @param {...*} args - Arguments to pass to the logging function.
   */
  info(title: string, ...args: any[]) {
    if (this.enabled(this.level)) {
      if (ConsoleLogger.noColor) {
        console.info(`[${this.prefix}] ${title}`, ...args);
      } else {
        console.info(`%c[${this.prefix}] ${title}`, this.infoColor, ...args);
      }
    }
  }

  /**
   * Log a message to the console.
   *
   * @param {string} title - Message title.
   * @param {...*} args - Arguments to pass to the logging function.
   */
  warn(title: string, ...args: any[]) {
    if (this.enabled(this.level)) {
      if (ConsoleLogger.noColor) {
        console.warn(`[${this.prefix}] ${title}`, ...args);
      } else {
        console.warn(`%c[${this.prefix}] ${title}`, this.warnColor, ...args);
      }
    }
  }

  /**
   * Log a message to the console.
   *
   * @param {string} title - Message title.
   * @param {...*} args - Arguments to pass to the logging function.
   */
  error(title: string, ...args: any[]) {
    if (this.enabled(this.level)) {
      if (ConsoleLogger.noColor) {
        console.error(`[${this.prefix}] ${title}`, ...args);
      } else {
        console.error(`%c[${this.prefix}] ${title}`, this.errorColor, ...args);
      }
    }
  }

  /**
   * Log a fatal error to the console.
   *
   * @param {string} title - Message title.
   * @param {...*} args - Arguments to pass to the logging function.
   */
  fatal(title: string, ...args: any[]) {
    if (this.enabled(this.level)) {
      if (ConsoleLogger.noColor) {
        console.error(`[${this.prefix}] ${title}`, ...args);
      } else {
        console.error(`%c[${this.prefix}] ${title}`, this.fatalColor, ...args);
      }
    }
  }

  /**
   * Log a message to the console.
   *
   * @param {string} title - Message title.
   * @param {...*} args - Arguments to pass to the logging function.
   */
  groupCollapsed(...label: any[]) {
    if (console.groupCollapsed) {
      console.groupCollapsed(...label);
    }
  }

  /**
   * End a log group.
   */
  groupEnd() {
    if (console.groupEnd) {
      console.groupEnd();
    }
  }

  /**
   * Start a log group.
   *
   * @param {...*} args - Arguments to pass to the logging function.
   */
  group(...label: any[]) {
    if (console.group) {
      console.group(...label);
    }
  }

  /**
   * Checks if the current logging level is enabled for this logger instance.
   *
   * @param {number} level - Level number.
   * @return {boolean} True if the level is enabled, false otherwise.
   */
  enabled(level: number): boolean {
    return level <= this.level;
  }

  /**
   * Gets the prefix used in logging messages.
   *
   * @type {string}
   */
  get prefix() {
    // TO DO: implement prefix logic
    return '';
  }
}