import { KrishiGuruRepository } from "../repositories/krishiguru.repository";
import { GeminiGateway, IAiGateway } from "../gateway/ai-gateway";
import { EventDispatcher } from "../../../core/events";
import { KrishiGuruUsedEvent } from "../../../core/events/types/krishiguru-used.event";
import { AppError } from "../../../shared/errors/app.error";

export class KrishiGuruService {
  private readonly aiGateway: IAiGateway;
  
  constructor(
    private readonly krishiGuruRepository: KrishiGuruRepository,
    private readonly eventDispatcher: EventDispatcher
  ) {
    this.aiGateway = new GeminiGateway();
  }

  private async farmerId(userId: string, claimedFarmerId?: string): Promise<string> {
    const farmerId = await this.krishiGuruRepository.resolveFarmerId(userId, claimedFarmerId);
    if (!farmerId) {
      throw new AppError("Complete the farmer profile before using KrishiGuru", 409, "FARMER_PROFILE_REQUIRED");
    }
    return farmerId;
  }

  public async getHistory(userId: string, claimedFarmerId?: string) {
    const DAILY_LIMIT = 100;
    const farmerId = await this.farmerId(userId, claimedFarmerId);
    const [messages, used] = await Promise.all([
      this.krishiGuruRepository.getChatHistory(farmerId),
      this.krishiGuruRepository.getTodayUsage(farmerId),
    ]);
    return {
      messages,
      usage: { used, limit: DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - used) },
      providerConfigured: this.aiGateway.isConfigured(),
    };
  }

  public async chat(userId: string, claimedFarmerId: string | undefined, rawMessage: string, language: string) {
    const DAILY_LIMIT = 100;
    const message = String(rawMessage || "").trim();
    if (!message) throw new AppError("Message is required", 400, "MESSAGE_REQUIRED");
    if (message.length > 2000) throw new AppError("Message is too long", 422, "MESSAGE_TOO_LONG");

    const farmerId = await this.farmerId(userId, claimedFarmerId);

    const usageCount = await this.krishiGuruRepository.getTodayUsage(farmerId);
    if (usageCount >= DAILY_LIMIT) {
      throw new AppError("Daily AI request limit reached", 429, "AI_DAILY_LIMIT_REACHED");
    }

    const history = await this.krishiGuruRepository.getChatHistory(farmerId);
    const pastMessages = history.map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const responseContent = await this.aiGateway.chat(message, {
      history: pastMessages,
      language,
    });

    // Persist only successful conversations. Provider failures never create fake or half-finished chats.
    const userMessage = await this.krishiGuruRepository.saveMessage(farmerId, "user", message);
    const assistantMessage = await this.krishiGuruRepository.saveMessage(farmerId, "assistant", responseContent);
    await this.krishiGuruRepository.incrementUsage(farmerId);
    await this.eventDispatcher.dispatch(new KrishiGuruUsedEvent({ farmerId }));

    return {
      reply: responseContent,
      userMessage,
      assistantMessage,
      usage: {
        used: usageCount + 1,
        limit: DAILY_LIMIT,
        remaining: Math.max(0, DAILY_LIMIT - usageCount - 1),
      },
    };
  }
}
