import { logger } from "../../../infrastructure/logger";
export class NotificationService {
    notificationRepository;
    notificationDispatchService;
    constructor(notificationRepository, notificationDispatchService) {
        this.notificationRepository = notificationRepository;
        this.notificationDispatchService = notificationDispatchService;
    }
    async create(dto) {
        const id = await this.notificationRepository.create(dto);
        try {
            const dispatch = await this.notificationDispatchService.dispatch(dto);
            await this.notificationRepository.markSent(id, dispatch.providerMessageId);
            await logger.info("Notification sent", {
                module: "notification.service",
                companyId: dto.companyId,
                userId: dto.userId,
                tags: ["notification", "sent"],
                payload: { id, channel: dto.channel, dispatchStatus: dispatch.status },
            });
            return { id, dispatchStatus: dispatch.status };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Dispatch failed";
            await this.notificationRepository.markFailed(id, message);
            throw error;
        }
    }
    async list(companyId, userId, limit, offset) {
        return this.notificationRepository.list(companyId, userId, limit, offset);
    }
    async createTemplate(dto) {
        const id = await this.notificationRepository.createTemplate(dto);
        await logger.info("Notification template created", {
            module: "notification.service",
            companyId: dto.companyId,
            tags: ["notification", "template", "created"],
            payload: { id, templateKey: dto.templateKey, channel: dto.channel },
        });
        return { id };
    }
    async listTemplates(companyId, limit, offset) {
        return this.notificationRepository.listTemplates(companyId, limit, offset);
    }
}
