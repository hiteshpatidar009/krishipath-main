import { logger } from "../../../infrastructure/logger";
import { NotificationDto } from "../dto/notification.dto";
import { TemplateDto } from "../dto/template.dto";
import { NotificationRepository } from "../repositories/notification.repository";
import { NotificationDispatchService } from "./notification-dispatch.service";

export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationDispatchService: NotificationDispatchService,
  ) {}

  public async create(
    dto: NotificationDto,
  ): Promise<{ id: string; dispatchStatus: string }> {
    const id = await this.notificationRepository.create(dto);

    try {
      const dispatch = await this.notificationDispatchService.dispatch(dto);
      await this.notificationRepository.markSent(
        id,
        dispatch.providerMessageId,
      );
      await logger.info("Notification sent", {
        module: "notification.service",
        companyId: dto.companyId,
        userId: dto.userId,
        tags: ["notification", "sent"],
        payload: { id, channel: dto.channel, dispatchStatus: dispatch.status },
      });
      return { id, dispatchStatus: dispatch.status };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Dispatch failed";
      await this.notificationRepository.markFailed(id, message);
      throw error;
    }
  }

  public async list(
    companyId: string,
    userId: string,
    limit: number,
    offset: number,
  ): Promise<unknown[]> {
    return this.notificationRepository.list(companyId, userId, limit, offset);
  }

  public async createTemplate(dto: TemplateDto): Promise<{ id: string }> {
    const id = await this.notificationRepository.createTemplate(dto);
    await logger.info("Notification template created", {
      module: "notification.service",
      companyId: dto.companyId,
      tags: ["notification", "template", "created"],
      payload: { id, templateKey: dto.templateKey, channel: dto.channel },
    });
    return { id };
  }

  public async listTemplates(
    companyId: string,
    limit: number,
    offset: number,
  ): Promise<unknown[]> {
    return this.notificationRepository.listTemplates(companyId, limit, offset);
  }
}
