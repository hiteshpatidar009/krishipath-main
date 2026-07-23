import { ContentRepository } from "../repositories/content.repository";
import { TranslationService } from "../../localization/services/translation.service";
import crypto from "crypto";
import { AppError } from "../../../shared/errors/app.error";

export class ContentService {
  constructor(
    private readonly contentRepo: ContentRepository,
    private readonly translationService: TranslationService
  ) {}

  private async syncBaseTranslation(entityType: string, entityId: string, fields: { [key: string]: string | undefined }) {
    for (const [fieldName, value] of Object.entries(fields)) {
      if (value) {
        await this.translationService.upsert({
          entityType,
          entityId,
          fieldName,
          languageCode: "en",
          value
        });
      }
    }
  }

  // ── Schemes ───────────────────────────────────────────────────────────
  public getSchemes() { return this.contentRepo.getSchemes(); }
  public getAllSchemesAdmin() { return this.contentRepo.getAllSchemesAdmin(); }
  public async createScheme(data: any) { 
    const result = await this.contentRepo.createScheme(data) as any;
    await this.syncBaseTranslation("content_schemes", result.id, { title: data.title, description: data.description });
    return result;
  }
  public async updateScheme(id: string, data: any) {
    const result = await this.contentRepo.updateScheme(id, data);
    await this.syncBaseTranslation("content_schemes", id, { title: data.title, description: data.description });
    return result;
  }
  public deleteScheme(id: string) { return this.contentRepo.deleteScheme(id); }

  // ── Predictions ────────────────────────────────────────────────────────
  public getPredictions(cropIds?: string[]) { return this.contentRepo.getPredictions(cropIds); }
  public getAllPredictionsAdmin() { return this.contentRepo.getAllPredictionsAdmin(); }
  public async createPrediction(data: any) { 
    const result = await this.contentRepo.createPrediction(data);
    await this.syncBaseTranslation("content_predictions", result.id, { notes: data.notes });
    return result;
  }
  public async updatePrediction(id: string, data: any) { 
    const result = await this.contentRepo.updatePrediction(id, data);
    await this.syncBaseTranslation("content_predictions", id, { notes: data.notes });
    return result;
  }
  public deletePrediction(id: string) { return this.contentRepo.deletePrediction(id); }

  // ── Polls ─────────────────────────────────────────────────────────────
  public getActivePoll(district?: string, userId?: string) { return this.contentRepo.getActivePoll(district, userId); }
  public getAllPollsAdmin() { return this.contentRepo.getAllPollsAdmin(); }
  public getPollOptions(pollId: string) { return this.contentRepo.getPollOptions(pollId); }
  public async createPoll(pollData: any, optionsData: string[]) { 
    const result = await this.contentRepo.createPoll(pollData, optionsData) as any;
    await this.syncBaseTranslation("content_polls", result.id, { question: pollData.question });
    if (result.options && result.options.length > 0) {
      for (const opt of result.options) {
        await this.syncBaseTranslation("content_poll_options", opt.id, { text: opt.text });
      }
    }
    return result;
  }
  public votePoll(pollId: string, optionId: string, userId: string) {
    if (!optionId) throw new AppError("option is required", 422, "POLL_OPTION_REQUIRED");
    return this.contentRepo.votePoll(pollId, optionId, userId);
  }
  public deletePoll(id: string) { return this.contentRepo.deletePoll(id); }

  // ── Creators ──────────────────────────────────────────────────────────
  public getCreators() { return this.contentRepo.getCreators(); }
  public getAllCreatorsAdmin() { return this.contentRepo.getAllCreatorsAdmin(); }
  public async createCreator(data: any) { 
    const result = await this.contentRepo.createCreator(data);
    await this.syncBaseTranslation("content_creators", result.id, { bio: data.bio, specialty: data.specialty });
    return result;
  }
  public async updateCreator(id: string, data: any) { 
    const result = await this.contentRepo.updateCreator(id, data);
    await this.syncBaseTranslation("content_creators", id, { bio: data.bio, specialty: data.specialty });
    return result;
  }
  public deleteCreator(id: string) { return this.contentRepo.deleteCreator(id); }
  public enrollCreator(userId: string) { return this.contentRepo.enrollCreator(userId); }
  public async getCreatorDashboard(userId: string) {
    const dashboard = await this.contentRepo.getCreatorDashboard(userId);
    if (!dashboard) throw new AppError("Creator profile not found", 404, "CREATOR_PROFILE_NOT_FOUND");
    return dashboard;
  }

  // ── Shorts ────────────────────────────────────────────────────────────
  public getShorts(language?: string, userId?: string, search?: string) {
    return this.contentRepo.getShorts(language, userId, search);
  }
  public async toggleShortLike(shortId: string, userId: string) {
    if (!await this.contentRepo.findActiveShort(shortId)) throw new AppError("Short video not found", 404);
    return this.contentRepo.toggleShortLike(shortId, userId);
  }
  public async toggleShortSave(shortId: string, userId: string) {
    if (!await this.contentRepo.findActiveShort(shortId)) throw new AppError("Short video not found", 404);
    return this.contentRepo.toggleShortSave(shortId, userId);
  }
  public async toggleCreatorFollow(creatorId: string, userId: string) {
    if (!await this.contentRepo.findActiveCreator(creatorId)) throw new AppError("Creator not found", 404);
    return this.contentRepo.toggleCreatorFollow(creatorId, userId);
  }
  public async recordShortView(shortId: string) {
    const result = await this.contentRepo.incrementShortView(shortId);
    if (!result) throw new AppError("Short video not found", 404);
    return result;
  }
  public async recordShortShare(shortId: string) {
    const result = await this.contentRepo.incrementShortShare(shortId);
    if (!result) throw new AppError("Short video not found", 404);
    return result;
  }
  public async getShortComments(shortId: string) {
    if (!await this.contentRepo.findActiveShort(shortId)) throw new AppError("Short video not found", 404);
    const comments = await this.contentRepo.getShortComments(shortId);
    return comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      userId: comment.userId,
      author: [comment.firstName, comment.lastName].filter(Boolean).join(" ") || "KrishiPath user",
      createdAt: comment.createdAt,
    }));
  }
  public async createShortComment(shortId: string, userId: string, body: unknown) {
    const text = typeof body === "string" ? body.trim() : "";
    if (!text) throw new AppError("Comment is required", 400);
    if (text.length > 500) throw new AppError("Comment must be 500 characters or fewer", 400);
    if (!await this.contentRepo.findActiveShort(shortId)) throw new AppError("Short video not found", 404);
    return this.contentRepo.createShortComment(shortId, userId, text);
  }
  public getAllShortsAdmin() { return this.contentRepo.getAllShortsAdmin(); }
  public async createShort(data: any) { 
    const result = await this.contentRepo.createShort(data);
    await this.syncBaseTranslation("content_shorts", result.id, { title: data.title, description: data.description });
    return result;
  }
  public async updateShort(id: string, data: any) { 
    const result = await this.contentRepo.updateShort(id, data);
    await this.syncBaseTranslation("content_shorts", id, { title: data.title, description: data.description });
    return result;
  }
  public deleteShort(id: string) { return this.contentRepo.deleteShort(id); }
}
