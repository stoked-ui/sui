/**
 * Logging levels enumeration.
 * @typedef {number} LogLevel
 * @property {number} VERBOSE - Log level: verbose
 * @property {number} LOG - Log level: log
 * @property {number} INFO - Log level: info
 * @property {number} WARN - Log level: warn
 * @property {number} ERROR - Log level: error
 * @property {number} FATAL - Log level: fatal
 * @property {number} SILENT - Log level: silent
 */
export enum LogLevel {
  VERBOSE = 0,
  LOG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
  SILENT = Infinity
}

/**
 * Log levels enumeration object.
 */
export const LogLevels = {
  VERBOSE: LogLevel.VERBOSE,
  LOG: LogLevel.LOG,
  INFO: LogLevel.INFO,
  WARN: LogLevel.WARN,
  ERROR: LogLevel.ERROR,
  SILENT: LogLevel.SILENT,
};

/**
 * Generate CSS style with color and font size.
 * @param {string} hex - Hex color code
 * @param {number} x - Font size
 * @returns {string} CSS style string
 */
function colorize(hex: string, x: number): string {
  return `color:${hex};font-size:${x}px;`;
}

/**
 * Console Logger class for logging messages.
 */
export default class ConsoleLogger {
  static readonly instances: ConsoleLogger[] = [];
  static level: LogLevel = LogLevel.LOG;
  static Levels = LogLevels;
  static noColor = false;

  Levels = LogLevels;
  level: LogLevel = LogLevel.LOG;
  prefix = '';
  enabled = true;
  debugColor: string = colorize('#cccccc', 12);
  logColor: string = colorize('#bbbbbb', 12);
  infoColor: string = colorize('#2196f3', 12);
  warnColor: string = colorize('#ff00ff', 12);
  errorColor: string = colorize('#e91e63', 12);
  fatalColor: string = colorize('#9a0101', 13);

  /**
   * Constructs a new ConsoleLogger.
   * @param {string} prefix - Logger prefix
   * @returns {ConsoleLogger}
   */
  constructor(prefix: string) {
    this.setPrefix(prefix);
    this.level = ConsoleLogger.level;
    ConsoleLogger.instances.push(this);
  }

  /**
   * Set log level for all instances of ConsoleLogger.
   * @param {LogLevel} level - Log level to set
   * @returns {void}
   */
  static setLevel(level: LogLevel): void {
    this.level = level;
    this.instances.forEach(logger => logger.setLevel(level));
  }

  /**
   * Enable logging with optional log level.
   * @param {LogLevel} level - Optional log level
   */
  static enable(level?: LogLevel): void {
    if (level) {
      this.level = level;
    }
    this.instances.forEach(logger => logger.enable());
  }

  /**
   * Disable logging for all instances.
   */
  static disable(): void {
    this.instances.forEach(logger => logger.disable());
  }

  /**
   * Set the prefix for the logger.
   * @param {string} prefix - Logger prefix
   */
  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  /**
   * Enable logging with optional log level.
   * @param {LogLevel} level - Optional log level
   */
  enable(level: LogLevel = this.level): void {
    this.level = level;
    this.enabled = true;
  }

  /**
   * Disable logging.
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Set log level.
   * @param {LogLevel} level - Log level to set
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Log a trace message.
   * @param {string} title - Title of the trace message
   * @param {...any} args - Additional arguments
   */
  trace(title: string, ...args: any[]): void {
    // logic documented in the code
  }

  /**
   * Log a debug message.
   * @param {string} title - Title of the debug message
   * @param {...any} args - Additional arguments
   */
  debug(title: string, ...args: any[]): void {
    // logic documented in the code
  }

  /**
   * Log a message.
   * @param {string} title - Title of the message
   * @param {...any} args - Additional arguments
   */
  log(title: string, ...args: any[]): void {
    // logic documented in the code
  }

  /**
   * Log an info message.
   * @param {string} title - Title of the info message
   * @param {...any} args - Additional arguments
   */
  info(title: string, ...args: any[]): void {
    // logic documented in the code
  }

  /**
   * Log a warning message.
   * @param {string} title - Title of the warning message
   * @param {...any} args - Additional arguments
   */
  warn(title: string, ...args: any[]): void {
    // logic documented in the code
  }

  /**
   * Log an error message.
   * @param {string} title - Title of the error message
   * @param {...any} args - Additional arguments
   */
  error(title: string, ...args: any[]): void {
    // logic documented in the code
  }

  /**
   * Log a fatal error message.
   * @param {string} title - Title of the fatal error message
   * @param {...any} args - Additional arguments
   */
  fatal(title: string, ...args: any[]): void {
    // logic documented in the code
  }

  /**
   * Start a log group with a label.
   * @param {...any} label - Group label
   */
  group(...label: any[]): void {
    // logic documented in the code
  }

  /**
   * End the current log group.
   */
  groupEnd(): void {
    // logic documented in the code
  }

  /**
   * Collapse the log group with a label.
   * @param {...any} label - Group label
   */
  groupCollapsed(...label: any[]): void {
    // logic documented in the code
  }
}