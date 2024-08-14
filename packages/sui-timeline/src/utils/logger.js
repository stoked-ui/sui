export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["VERBOSE"] = 0] = "VERBOSE";
    LogLevel[LogLevel["LOG"] = 1] = "LOG";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 5] = "FATAL";
    LogLevel[LogLevel["SILENT"] = Infinity] = "SILENT";
})(LogLevel || (LogLevel = {}));
export const LogLevels = {
    VERBOSE: LogLevel.VERBOSE,
    LOG: LogLevel.LOG,
    INFO: LogLevel.INFO,
    WARN: LogLevel.WARN,
    ERROR: LogLevel.ERROR,
    SILENT: LogLevel.SILENT,
};
function colorize(hex, x) {
    return `color:${hex};font-size:${x}px;`;
}
export default class ConsoleLogger {
    static instances = [];
    static level = LogLevel.LOG;
    static Levels = LogLevels;
    static noColor = false;
    Levels = LogLevels;
    level = LogLevel.LOG;
    prefix = '';
    enabled = true;
    debugColor = colorize('#cccccc', 12);
    logColor = colorize('#bbbbbb', 12);
    infoColor = colorize('#2196f3', 12);
    warnColor = colorize('#ff00ff', 12);
    errorColor = colorize('#e91e63', 12);
    fatalColor = colorize('#9a0101', 13);
    /**
     * ConsoleLogger
     * @param   {string}  prefix  Logger prefix
     * @return  {ConsoleLogger}
     */
    constructor(prefix) {
        this.setPrefix(prefix);
        this.level = ConsoleLogger.level;
        ConsoleLogger.instances.push(this);
    }
    static setLevel(level) {
        this.level = level;
        this.instances.forEach(logger => logger.setLevel(level));
    }
    static enable(level) {
        if (level) {
            this.level = level;
        }
        this.instances.forEach(logger => logger.enable());
    }
    static disable() {
        this.instances.forEach(logger => logger.disable());
    }
    /**
     * set logger prefix
     * @param prefix
     */
    setPrefix(prefix) {
        this.prefix = prefix;
    }
    /**
     * enable logger with optional log level
     * @param level
     */
    enable(level = this.level) {
        this.level = level;
        this.enabled = true;
    }
    /**
     * disable logger
     */
    disable() {
        this.enabled = false;
    }
    /**
     * Set log level
     * @param   {LogLevel}  level
     * @return  {void}
     */
    setLevel(level) {
        this.level = level;
    }
    /**
     * trace
     * @param title
     * @param args
     */
    trace(title, ...args) {
        if (!this.enabled || this.level > LogLevel.VERBOSE) {
            return;
        }
        if (ConsoleLogger.noColor) {
            console.trace(`[${this.prefix}] ${title}`, ...args);
        }
        else {
            console.trace(`%c[${this.prefix}] ${title}`, this.debugColor, ...args);
        }
    }
    /**
     * debug
     * @param title
     * @param args
     */
    debug(title, ...args) {
        if (!this.enabled || this.level > LogLevel.VERBOSE) {
            return;
        }
        if (ConsoleLogger.noColor) {
            console.debug(`[${this.prefix}] ${title}`, ...args);
        }
        else {
            console.debug(`%c[${this.prefix}] ${title}`, this.debugColor, ...args);
        }
    }
    /**
     * log
     * @param title
     * @param args
     */
    log(title, ...args) {
        if (!this.enabled || this.level > LogLevel.LOG) {
            return;
        }
        if (ConsoleLogger.noColor) {
            console.log(`[${this.prefix}] ${title}`, ...args);
        }
        else {
            console.log(`%c[${this.prefix}] ${title}`, this.logColor, ...args);
        }
    }
    /**
     * info
     * @param title
     * @param args
     */
    info(title, ...args) {
        if (!this.enabled || this.level > LogLevel.INFO) {
            return;
        }
        if (ConsoleLogger.noColor) {
            console.info(`[${this.prefix}] ${title}`, ...args);
        }
        else {
            console.info(`%c[${this.prefix}] ${title}`, this.infoColor, ...args);
        }
    }
    /**
     * warn
     * @param title
     * @param args
     */
    warn(title, ...args) {
        if (!this.enabled || this.level > LogLevel.WARN) {
            return;
        }
        if (ConsoleLogger.noColor) {
            console.warn(`[${this.prefix}] ${title}`, ...args);
        }
        else {
            console.warn(`%c[${this.prefix}] ${title}`, this.warnColor, ...args);
        }
    }
    /**
     * error
     * @param title
     * @param args
     */
    error(title, ...args) {
        if (!this.enabled || this.level > LogLevel.ERROR) {
            return;
        }
        if (ConsoleLogger.noColor) {
            console.error(`[${this.prefix}] ${title}`, ...args);
        }
        else {
            console.error(`%c[${this.prefix}] ${title}`, this.errorColor, ...args);
        }
    }
    /**
     * fatal error
     * @param title
     * @param args
     */
    fatal(title, ...args) {
        if (!this.enabled || this.level > LogLevel.FATAL) {
            return;
        }
        if (ConsoleLogger.noColor) {
            console.error(`[${this.prefix}] ${title}`, ...args);
        }
        else {
            console.error(`%c[${this.prefix}] ${title}`, this.fatalColor, ...args);
        }
    }
    /**
     * start a group with label
     * @param label
     */
    group(...label) {
        if (console.group) {
            console.group(...label);
        }
    }
    /**
     * end a group
     */
    groupEnd() {
        if (console.groupEnd) {
            console.groupEnd();
        }
    }
    /**
     * collapse log group
     * @param label
     */
    groupCollapsed(...label) {
        if (console.groupCollapsed) {
            console.groupCollapsed(...label);
        }
    }
}
//# sourceMappingURL=logger.js.map