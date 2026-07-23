import { logger } from "../logger.service";
export class ErrorLoggerService {
    async write(error, metadata) {
        await logger.error(error, metadata);
    }
}
