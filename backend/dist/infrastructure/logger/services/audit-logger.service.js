import { logger } from "../logger.service";
export class AuditLoggerService {
    async write(message, metadata) {
        await logger.info(message, metadata);
    }
}
