import { AppError } from "../../../shared/errors/app.error";
export class ContentService {
    contentRepo;
    translationService;
    constructor(contentRepo, translationService) {
        this.contentRepo = contentRepo;
        this.translationService = translationService;
    }
    async syncBaseTranslation(entityType, entityId, fields) {
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
    getSchemes() { return this.contentRepo.getSchemes(); }
    getAllSchemesAdmin() { return this.contentRepo.getAllSchemesAdmin(); }
    async createScheme(data) {
        const result = await this.contentRepo.createScheme(data);
        await this.syncBaseTranslation("content_schemes", result.id, { title: data.title, description: data.description });
        return result;
    }
    async updateScheme(id, data) {
        const result = await this.contentRepo.updateScheme(id, data);
        await this.syncBaseTranslation("content_schemes", id, { title: data.title, description: data.description });
        return result;
    }
    deleteScheme(id) { return this.contentRepo.deleteScheme(id); }
    // ── Predictions ────────────────────────────────────────────────────────
    getPredictions(cropIds) { return this.contentRepo.getPredictions(cropIds); }
    getAllPredictionsAdmin() { return this.contentRepo.getAllPredictionsAdmin(); }
    async createPrediction(data) {
        const result = await this.contentRepo.createPrediction(data);
        await this.syncBaseTranslation("content_predictions", result.id, { notes: data.notes });
        return result;
    }
    async updatePrediction(id, data) {
        const result = await this.contentRepo.updatePrediction(id, data);
        await this.syncBaseTranslation("content_predictions", id, { notes: data.notes });
        return result;
    }
    deletePrediction(id) { return this.contentRepo.deletePrediction(id); }
    // ── Polls ─────────────────────────────────────────────────────────────
    getActivePoll(district, userId) { return this.contentRepo.getActivePoll(district, userId); }
    getAllPollsAdmin() { return this.contentRepo.getAllPollsAdmin(); }
    getPollOptions(pollId) { return this.contentRepo.getPollOptions(pollId); }
    async createPoll(pollData, optionsData) {
        const result = await this.contentRepo.createPoll(pollData, optionsData);
        await this.syncBaseTranslation("content_polls", result.id, { question: pollData.question });
        if (result.options && result.options.length > 0) {
            for (const opt of result.options) {
                await this.syncBaseTranslation("content_poll_options", opt.id, { text: opt.text });
            }
        }
        return result;
    }
    votePoll(pollId, optionId, userId) {
        if (!optionId)
            throw new AppError("option is required", 422, "POLL_OPTION_REQUIRED");
        return this.contentRepo.votePoll(pollId, optionId, userId);
    }
    deletePoll(id) { return this.contentRepo.deletePoll(id); }
    // ── Creators ──────────────────────────────────────────────────────────
    getCreators() { return this.contentRepo.getCreators(); }
    getAllCreatorsAdmin() { return this.contentRepo.getAllCreatorsAdmin(); }
    async createCreator(data) {
        const result = await this.contentRepo.createCreator(data);
        await this.syncBaseTranslation("content_creators", result.id, { bio: data.bio, specialty: data.specialty });
        return result;
    }
    async updateCreator(id, data) {
        const result = await this.contentRepo.updateCreator(id, data);
        await this.syncBaseTranslation("content_creators", id, { bio: data.bio, specialty: data.specialty });
        return result;
    }
    deleteCreator(id) { return this.contentRepo.deleteCreator(id); }
    enrollCreator(userId) { return this.contentRepo.enrollCreator(userId); }
    async getCreatorDashboard(userId) {
        const dashboard = await this.contentRepo.getCreatorDashboard(userId);
        if (!dashboard)
            throw new AppError("Creator profile not found", 404, "CREATOR_PROFILE_NOT_FOUND");
        return dashboard;
    }
    // ── Shorts ────────────────────────────────────────────────────────────
    getShorts(language, userId, search) {
        return this.contentRepo.getShorts(language, userId, search);
    }
    async toggleShortLike(shortId, userId) {
        if (!await this.contentRepo.findActiveShort(shortId))
            throw new AppError("Short video not found", 404);
        return this.contentRepo.toggleShortLike(shortId, userId);
    }
    async toggleShortSave(shortId, userId) {
        if (!await this.contentRepo.findActiveShort(shortId))
            throw new AppError("Short video not found", 404);
        return this.contentRepo.toggleShortSave(shortId, userId);
    }
    async toggleCreatorFollow(creatorId, userId) {
        if (!await this.contentRepo.findActiveCreator(creatorId))
            throw new AppError("Creator not found", 404);
        return this.contentRepo.toggleCreatorFollow(creatorId, userId);
    }
    async recordShortView(shortId) {
        const result = await this.contentRepo.incrementShortView(shortId);
        if (!result)
            throw new AppError("Short video not found", 404);
        return result;
    }
    async recordShortShare(shortId) {
        const result = await this.contentRepo.incrementShortShare(shortId);
        if (!result)
            throw new AppError("Short video not found", 404);
        return result;
    }
    async getShortComments(shortId) {
        if (!await this.contentRepo.findActiveShort(shortId))
            throw new AppError("Short video not found", 404);
        const comments = await this.contentRepo.getShortComments(shortId);
        return comments.map((comment) => ({
            id: comment.id,
            body: comment.body,
            userId: comment.userId,
            author: [comment.firstName, comment.lastName].filter(Boolean).join(" ") || "KrishiPath user",
            createdAt: comment.createdAt,
        }));
    }
    async createShortComment(shortId, userId, body) {
        const text = typeof body === "string" ? body.trim() : "";
        if (!text)
            throw new AppError("Comment is required", 400);
        if (text.length > 500)
            throw new AppError("Comment must be 500 characters or fewer", 400);
        if (!await this.contentRepo.findActiveShort(shortId))
            throw new AppError("Short video not found", 404);
        return this.contentRepo.createShortComment(shortId, userId, text);
    }
    getAllShortsAdmin() { return this.contentRepo.getAllShortsAdmin(); }
    async createShort(data) {
        const result = await this.contentRepo.createShort(data);
        await this.syncBaseTranslation("content_shorts", result.id, { title: data.title, description: data.description });
        return result;
    }
    async updateShort(id, data) {
        const result = await this.contentRepo.updateShort(id, data);
        await this.syncBaseTranslation("content_shorts", id, { title: data.title, description: data.description });
        return result;
    }
    deleteShort(id) { return this.contentRepo.deleteShort(id); }
}
