import { RetryEngine } from "../../../core";
import { logger } from "../../../infrastructure/logger";
import { MessageDto } from "../../../shared/messages/message.dto";
import { MessageProviderFactory } from "../../../shared/messages/message-provider.factory";
import { IMessageProvider } from "../../../shared/messages/message-provider.interface";
import { PushDto } from "../dto/push.dto";

export class PushService {
  private readonly retryEngine = new RetryEngine();
  private provider?: IMessageProvider;

  public async send(dto: PushDto): Promise<{ messageId: string; status: string }> {
    return this.retryEngine.execute(
      async () => {
        const delivery = await this.getProvider().send(new MessageDto({
          channel: "push",
          recipient: dto.userId,
          subject: dto.title,
          body: dto.message,
          companyId: dto.companyId,
          userId: dto.userId,
          metadata: dto.data,
        }));

        await logger.info("Push notification sent", {
          module: "push.service",
          companyId: dto.companyId,
          userId: dto.userId,
          tags: ["push", "sent"],
          payload: { messageId: delivery.messageId, title: dto.title },
        });

        return { messageId: delivery.messageId, status: delivery.status };
      },
      {
        attempts: 3,
        baseDelayMs: 250,
        maxDelayMs: 2000,
      },
    );
  }

  private getProvider(): IMessageProvider {
    if (!this.provider) {
      this.provider = new MessageProviderFactory().create("push");
    }

    return this.provider;
  }
}
