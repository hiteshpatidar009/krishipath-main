const tagColors = {
    BOOTSTRAP: "\x1b[95m",
    DATABASE: "\x1b[96m",
    MONGODB: "\x1b[32m",
    POSTGRES: "\x1b[34m",
    REDIS: "\x1b[31m",
    LOGGER: "\x1b[35m",
    SERVER: "\x1b[33m",
};
export class ConsoleTagLogger {
    static reset = "\x1b[0m";
    static info(tag, message) {
        process.stdout.write(`${ConsoleTagLogger.formatTag(tag)} ${message}\n`);
    }
    static warn(tag, message) {
        process.stderr.write(`${ConsoleTagLogger.formatTag(tag)} ${message}\n`);
    }
    static error(tag, message, error) {
        if (error) {
            process.stderr.write(`${ConsoleTagLogger.formatTag(tag)} ${message} ${ConsoleTagLogger.stringify(error)}\n`);
            return;
        }
        process.stderr.write(`${ConsoleTagLogger.formatTag(tag)} ${message}\n`);
    }
    static formatTag(tag) {
        return `${tagColors[tag]}[${tag}]${ConsoleTagLogger.reset}`;
    }
    static stringify(error) {
        if (error instanceof Error) {
            return error.stack ?? error.message;
        }
        return typeof error === "string" ? error : JSON.stringify(error);
    }
}
