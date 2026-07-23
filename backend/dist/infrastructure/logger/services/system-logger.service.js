import { logger } from "../logger.service";
export class SystemLoggerService {
    async write(message, metadata) {
        await logger.debug(message, metadata);
    }
}
