import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { contentSchemesTable, contentPredictionsTable, contentPollsTable, contentPollOptionsTable, contentPollVotesTable, contentCreatorsTable, contentShortsTable, contentShortReactionsTable, contentShortSavesTable, contentCreatorFollowsTable, contentShortCommentsTable, productsTable, mandisTable, usersTable, farmersTable, } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
import { eq, desc, and, sql, inArray, ilike } from "drizzle-orm";
import { AppError } from "../../../shared/errors/app.error";
export class ContentRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    // ── Schemes ───────────────────────────────────────────────────────────
    async getSchemes() {
        return this.db
            .select()
            .from(contentSchemesTable)
            .where(eq(contentSchemesTable.status, "ACTIVE"))
            .orderBy(desc(contentSchemesTable.createdAt));
    }
    async getAllSchemesAdmin() {
        return this.db.select().from(contentSchemesTable).orderBy(desc(contentSchemesTable.createdAt));
    }
    async createScheme(data) {
        const [inserted] = await this.db.insert(contentSchemesTable).values(data).returning();
        return inserted;
    }
    async updateScheme(id, data) {
        const [updated] = await this.db
            .update(contentSchemesTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(contentSchemesTable.id, id))
            .returning();
        return updated;
    }
    async deleteScheme(id) {
        await this.db.delete(contentSchemesTable).where(eq(contentSchemesTable.id, id));
    }
    // ── Predictions ────────────────────────────────────────────────────────
    async getPredictions(cropIds) {
        const query = this.db
            .select({
            id: contentPredictionsTable.id,
            cropId: contentPredictionsTable.cropId,
            cropCode: productsTable.code,
            cropName: productsTable.name,
            mandiId: contentPredictionsTable.mandiId,
            mandiName: mandisTable.name,
            predictedPrice: contentPredictionsTable.predictedPrice,
            direction: contentPredictionsTable.direction,
            period: contentPredictionsTable.period,
            confidence: contentPredictionsTable.confidence,
            notes: contentPredictionsTable.notes,
            createdAt: contentPredictionsTable.createdAt,
            updatedAt: contentPredictionsTable.updatedAt,
        })
            .from(contentPredictionsTable)
            .innerJoin(productsTable, eq(contentPredictionsTable.cropId, productsTable.id))
            .leftJoin(mandisTable, eq(contentPredictionsTable.mandiId, mandisTable.id))
            .$dynamic();
        if (cropIds?.length)
            query.where(inArray(contentPredictionsTable.cropId, cropIds));
        return query.orderBy(desc(contentPredictionsTable.createdAt));
    }
    async getAllPredictionsAdmin() {
        return this.db.select().from(contentPredictionsTable).orderBy(desc(contentPredictionsTable.createdAt));
    }
    async createPrediction(data) {
        const [inserted] = await this.db.insert(contentPredictionsTable).values(data).returning();
        return inserted;
    }
    async updatePrediction(id, data) {
        const [updated] = await this.db
            .update(contentPredictionsTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(contentPredictionsTable.id, id))
            .returning();
        return updated;
    }
    async deletePrediction(id) {
        await this.db.delete(contentPredictionsTable).where(eq(contentPredictionsTable.id, id));
    }
    // ── Polls ─────────────────────────────────────────────────────────────
    async getActivePoll(district, userId) {
        const query = this.db
            .select()
            .from(contentPollsTable)
            .where(district
            ? and(eq(contentPollsTable.isActive, true), sql `(${contentPollsTable.targetDistricts} @> ${JSON.stringify([district])}::jsonb OR ${contentPollsTable.targetDistricts} IS NULL OR jsonb_array_length(${contentPollsTable.targetDistricts}) = 0)`)
            : eq(contentPollsTable.isActive, true))
            .orderBy(desc(contentPollsTable.createdAt))
            .limit(1);
        const [poll] = await query;
        if (!poll)
            return null;
        const [options, userVotes] = await Promise.all([
            this.db.select().from(contentPollOptionsTable).where(eq(contentPollOptionsTable.pollId, poll.id)),
            userId
                ? this.db.select({ optionId: contentPollVotesTable.optionId })
                    .from(contentPollVotesTable)
                    .where(and(eq(contentPollVotesTable.pollId, poll.id), eq(contentPollVotesTable.userId, userId)))
                    .limit(1)
                : Promise.resolve([]),
        ]);
        return { ...poll, options, userVote: userVotes[0]?.optionId || null };
    }
    async getAllPollsAdmin() {
        return this.db.select().from(contentPollsTable).orderBy(desc(contentPollsTable.createdAt));
    }
    async getPollOptions(pollId) {
        return this.db.select().from(contentPollOptionsTable).where(eq(contentPollOptionsTable.pollId, pollId));
    }
    async createPoll(pollData, optionsData) {
        const [poll] = await this.db.insert(contentPollsTable).values(pollData).returning();
        if (optionsData.length > 0) {
            await this.db.insert(contentPollOptionsTable).values(optionsData.map((opt) => ({ pollId: poll.id, text: opt })));
        }
        return poll;
    }
    async votePoll(pollId, optionId, userId) {
        return this.db.transaction(async (tx) => {
            const [poll] = await tx.select().from(contentPollsTable)
                .where(and(eq(contentPollsTable.id, pollId), eq(contentPollsTable.isActive, true)))
                .limit(1);
            if (!poll)
                throw new AppError("Active poll not found", 404, "POLL_NOT_FOUND");
            const [option] = await tx.select().from(contentPollOptionsTable)
                .where(and(eq(contentPollOptionsTable.id, optionId), eq(contentPollOptionsTable.pollId, pollId)))
                .limit(1);
            if (!option)
                throw new AppError("Poll option not found", 404, "POLL_OPTION_NOT_FOUND");
            const [existing] = await tx.select().from(contentPollVotesTable)
                .where(and(eq(contentPollVotesTable.pollId, pollId), eq(contentPollVotesTable.userId, userId)))
                .limit(1);
            if (!existing) {
                await tx.insert(contentPollVotesTable).values({ pollId, optionId, userId });
                await tx.update(contentPollOptionsTable)
                    .set({ votes: sql `${contentPollOptionsTable.votes} + 1` })
                    .where(eq(contentPollOptionsTable.id, optionId));
                await tx.update(contentPollsTable)
                    .set({ totalVotes: sql `${contentPollsTable.totalVotes} + 1` })
                    .where(eq(contentPollsTable.id, pollId));
            }
            else if (existing.optionId !== optionId) {
                await tx.update(contentPollOptionsTable)
                    .set({ votes: sql `greatest(${contentPollOptionsTable.votes} - 1, 0)` })
                    .where(eq(contentPollOptionsTable.id, existing.optionId));
                await tx.update(contentPollOptionsTable)
                    .set({ votes: sql `${contentPollOptionsTable.votes} + 1` })
                    .where(eq(contentPollOptionsTable.id, optionId));
                await tx.update(contentPollVotesTable)
                    .set({ optionId, updatedAt: new Date() })
                    .where(eq(contentPollVotesTable.id, existing.id));
            }
            const [[updatedPoll], options] = await Promise.all([
                tx.select().from(contentPollsTable).where(eq(contentPollsTable.id, pollId)).limit(1),
                tx.select().from(contentPollOptionsTable).where(eq(contentPollOptionsTable.pollId, pollId)),
            ]);
            return { pollId, userVote: optionId, totalVotes: updatedPoll.totalVotes, options };
        });
    }
    async deletePoll(id) {
        await this.db.delete(contentPollsTable).where(eq(contentPollsTable.id, id));
    }
    // ── Creators ──────────────────────────────────────────────────────────
    async getCreators() {
        return this.db
            .select()
            .from(contentCreatorsTable)
            .where(eq(contentCreatorsTable.status, "ACTIVE"))
            .orderBy(desc(contentCreatorsTable.createdAt));
    }
    async getAllCreatorsAdmin() {
        return this.db.select().from(contentCreatorsTable).orderBy(desc(contentCreatorsTable.createdAt));
    }
    async createCreator(data) {
        const [inserted] = await this.db.insert(contentCreatorsTable).values(data).returning();
        return inserted;
    }
    async findCreatorByOwnerUserId(userId) {
        const [creator] = await this.db
            .select()
            .from(contentCreatorsTable)
            .where(eq(contentCreatorsTable.ownerUserId, userId))
            .limit(1);
        return creator || null;
    }
    async enrollCreator(userId) {
        const existing = await this.findCreatorByOwnerUserId(userId);
        if (existing)
            return existing;
        const [user] = await this.db
            .select({
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
            displayName: usersTable.displayName,
            farmerFirstName: farmersTable.firstName,
            farmerLastName: farmersTable.lastName,
        })
            .from(usersTable)
            .leftJoin(farmersTable, eq(farmersTable.userId, usersTable.id))
            .where(eq(usersTable.id, userId))
            .limit(1);
        const accountName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
        const farmerName = [user?.farmerFirstName, user?.farmerLastName].filter(Boolean).join(" ");
        const name = user?.displayName || accountName || farmerName || "KrishiPath Creator";
        const [created] = await this.db.insert(contentCreatorsTable).values({
            ownerUserId: userId,
            name,
            status: "PENDING",
            followersK: "0",
        }).returning();
        return created;
    }
    async getCreatorDashboard(userId) {
        const creator = await this.findCreatorByOwnerUserId(userId);
        if (!creator)
            return null;
        const [shorts, followerRows] = await Promise.all([
            this.db.select().from(contentShortsTable)
                .where(eq(contentShortsTable.creatorId, creator.id))
                .orderBy(desc(contentShortsTable.createdAt)),
            this.db.select({ count: sql `count(*)::int` })
                .from(contentCreatorFollowsTable)
                .where(eq(contentCreatorFollowsTable.creatorId, creator.id)),
        ]);
        return {
            creator,
            shorts,
            stats: {
                followers: Number(followerRows[0]?.count || 0),
                videos: shorts.length,
                views: shorts.reduce((total, item) => total + Number(item.views || 0), 0),
                likes: shorts.reduce((total, item) => total + Number(item.likes || 0), 0),
                shares: shorts.reduce((total, item) => total + Number(item.shares || 0), 0),
            },
        };
    }
    async updateCreator(id, data) {
        const [updated] = await this.db
            .update(contentCreatorsTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(contentCreatorsTable.id, id))
            .returning();
        return updated;
    }
    async deleteCreator(id) {
        await this.db.delete(contentCreatorsTable).where(eq(contentCreatorsTable.id, id));
    }
    // ── Shorts ────────────────────────────────────────────────────────────
    async getShorts(language, userId, search) {
        const query = this.db
            .select({
            id: contentShortsTable.id,
            title: contentShortsTable.title,
            videoUrl: contentShortsTable.videoUrl,
            thumbnailUrl: contentShortsTable.thumbnailUrl,
            creatorId: contentShortsTable.creatorId,
            creatorName: contentCreatorsTable.name,
            creatorAvatarUrl: contentCreatorsTable.avatarUrl,
            creatorSpecialty: contentCreatorsTable.specialty,
            views: contentShortsTable.views,
            likes: contentShortsTable.likes,
            shares: contentShortsTable.shares,
            language: contentShortsTable.language,
            createdAt: contentShortsTable.createdAt,
        })
            .from(contentShortsTable)
            .leftJoin(contentCreatorsTable, eq(contentShortsTable.creatorId, contentCreatorsTable.id))
            .$dynamic();
        const conditions = [eq(contentShortsTable.status, "ACTIVE")];
        if (language)
            conditions.push(eq(contentShortsTable.language, language));
        if (search?.trim())
            conditions.push(ilike(contentShortsTable.title, `%${search.trim()}%`));
        const shorts = await query
            .where(and(...conditions))
            .orderBy(desc(contentShortsTable.createdAt));
        if (shorts.length === 0)
            return [];
        const shortIds = shorts.map((short) => short.id);
        const creatorIds = shorts.map((short) => short.creatorId).filter((id) => Boolean(id));
        const [commentCounts, saveCounts, userReactions, userSaves, userFollows] = await Promise.all([
            this.db
                .select({ shortId: contentShortCommentsTable.shortId, count: sql `count(*)::int` })
                .from(contentShortCommentsTable)
                .where(and(inArray(contentShortCommentsTable.shortId, shortIds), eq(contentShortCommentsTable.status, "ACTIVE")))
                .groupBy(contentShortCommentsTable.shortId),
            this.db
                .select({ shortId: contentShortSavesTable.shortId, count: sql `count(*)::int` })
                .from(contentShortSavesTable)
                .where(inArray(contentShortSavesTable.shortId, shortIds))
                .groupBy(contentShortSavesTable.shortId),
            userId
                ? this.db.select({ shortId: contentShortReactionsTable.shortId }).from(contentShortReactionsTable)
                    .where(and(eq(contentShortReactionsTable.userId, userId), inArray(contentShortReactionsTable.shortId, shortIds)))
                : Promise.resolve([]),
            userId
                ? this.db.select({ shortId: contentShortSavesTable.shortId }).from(contentShortSavesTable)
                    .where(and(eq(contentShortSavesTable.userId, userId), inArray(contentShortSavesTable.shortId, shortIds)))
                : Promise.resolve([]),
            userId && creatorIds.length
                ? this.db.select({ creatorId: contentCreatorFollowsTable.creatorId }).from(contentCreatorFollowsTable)
                    .where(and(eq(contentCreatorFollowsTable.userId, userId), inArray(contentCreatorFollowsTable.creatorId, creatorIds)))
                : Promise.resolve([]),
        ]);
        const commentsByShort = new Map(commentCounts.map((row) => [row.shortId, Number(row.count)]));
        const savesByShort = new Map(saveCounts.map((row) => [row.shortId, Number(row.count)]));
        const likedIds = new Set(userReactions.map((row) => row.shortId));
        const savedIds = new Set(userSaves.map((row) => row.shortId));
        const followedCreatorIds = new Set(userFollows.map((row) => row.creatorId));
        return shorts.map((short) => ({
            ...short,
            comments: commentsByShort.get(short.id) || 0,
            saves: savesByShort.get(short.id) || 0,
            isLiked: likedIds.has(short.id),
            isSaved: savedIds.has(short.id),
            isFollowingCreator: short.creatorId ? followedCreatorIds.has(short.creatorId) : false,
        }));
    }
    async findActiveShort(id) {
        const [short] = await this.db
            .select({ id: contentShortsTable.id, creatorId: contentShortsTable.creatorId })
            .from(contentShortsTable)
            .where(and(eq(contentShortsTable.id, id), eq(contentShortsTable.status, "ACTIVE")))
            .limit(1);
        return short || null;
    }
    async findActiveCreator(id) {
        const [creator] = await this.db
            .select({ id: contentCreatorsTable.id })
            .from(contentCreatorsTable)
            .where(and(eq(contentCreatorsTable.id, id), eq(contentCreatorsTable.status, "ACTIVE")))
            .limit(1);
        return creator || null;
    }
    async toggleShortLike(shortId, userId) {
        return this.db.transaction(async (tx) => {
            const [existing] = await tx
                .select({ id: contentShortReactionsTable.id })
                .from(contentShortReactionsTable)
                .where(and(eq(contentShortReactionsTable.shortId, shortId), eq(contentShortReactionsTable.userId, userId)))
                .limit(1);
            if (existing) {
                await tx.delete(contentShortReactionsTable).where(eq(contentShortReactionsTable.id, existing.id));
                const [short] = await tx.update(contentShortsTable)
                    .set({ likes: sql `greatest(${contentShortsTable.likes} - 1, 0)`, updatedAt: new Date() })
                    .where(eq(contentShortsTable.id, shortId))
                    .returning({ likes: contentShortsTable.likes });
                return { liked: false, likes: short?.likes ?? 0 };
            }
            await tx.insert(contentShortReactionsTable).values({ shortId, userId });
            const [short] = await tx.update(contentShortsTable)
                .set({ likes: sql `${contentShortsTable.likes} + 1`, updatedAt: new Date() })
                .where(eq(contentShortsTable.id, shortId))
                .returning({ likes: contentShortsTable.likes });
            return { liked: true, likes: short?.likes ?? 1 };
        });
    }
    async toggleShortSave(shortId, userId) {
        const [existing] = await this.db
            .select({ id: contentShortSavesTable.id })
            .from(contentShortSavesTable)
            .where(and(eq(contentShortSavesTable.shortId, shortId), eq(contentShortSavesTable.userId, userId)))
            .limit(1);
        if (existing) {
            await this.db.delete(contentShortSavesTable).where(eq(contentShortSavesTable.id, existing.id));
        }
        else {
            await this.db.insert(contentShortSavesTable).values({ shortId, userId });
        }
        const [countRow] = await this.db
            .select({ count: sql `count(*)::int` })
            .from(contentShortSavesTable)
            .where(eq(contentShortSavesTable.shortId, shortId));
        return { saved: !existing, saves: Number(countRow?.count || 0) };
    }
    async toggleCreatorFollow(creatorId, userId) {
        const [existing] = await this.db
            .select({ id: contentCreatorFollowsTable.id })
            .from(contentCreatorFollowsTable)
            .where(and(eq(contentCreatorFollowsTable.creatorId, creatorId), eq(contentCreatorFollowsTable.userId, userId)))
            .limit(1);
        if (existing)
            await this.db.delete(contentCreatorFollowsTable).where(eq(contentCreatorFollowsTable.id, existing.id));
        else
            await this.db.insert(contentCreatorFollowsTable).values({ creatorId, userId });
        const [countRow] = await this.db
            .select({ count: sql `count(*)::int` })
            .from(contentCreatorFollowsTable)
            .where(eq(contentCreatorFollowsTable.creatorId, creatorId));
        return { following: !existing, followers: Number(countRow?.count || 0) };
    }
    async incrementShortView(shortId) {
        const [short] = await this.db.update(contentShortsTable)
            .set({ views: sql `${contentShortsTable.views} + 1`, updatedAt: new Date() })
            .where(and(eq(contentShortsTable.id, shortId), eq(contentShortsTable.status, "ACTIVE")))
            .returning({ views: contentShortsTable.views });
        return short || null;
    }
    async incrementShortShare(shortId) {
        const [short] = await this.db.update(contentShortsTable)
            .set({ shares: sql `${contentShortsTable.shares} + 1`, updatedAt: new Date() })
            .where(and(eq(contentShortsTable.id, shortId), eq(contentShortsTable.status, "ACTIVE")))
            .returning({ shares: contentShortsTable.shares });
        return short || null;
    }
    async getShortComments(shortId) {
        return this.db
            .select({
            id: contentShortCommentsTable.id,
            body: contentShortCommentsTable.body,
            userId: contentShortCommentsTable.userId,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
            createdAt: contentShortCommentsTable.createdAt,
        })
            .from(contentShortCommentsTable)
            .innerJoin(usersTable, eq(contentShortCommentsTable.userId, usersTable.id))
            .where(and(eq(contentShortCommentsTable.shortId, shortId), eq(contentShortCommentsTable.status, "ACTIVE")))
            .orderBy(desc(contentShortCommentsTable.createdAt))
            .limit(100);
    }
    async createShortComment(shortId, userId, body) {
        const [created] = await this.db
            .insert(contentShortCommentsTable)
            .values({ shortId, userId, body })
            .returning();
        return created;
    }
    async getAllShortsAdmin() {
        return this.db.select().from(contentShortsTable).orderBy(desc(contentShortsTable.createdAt));
    }
    async createShort(data) {
        const [inserted] = await this.db.insert(contentShortsTable).values(data).returning();
        return inserted;
    }
    async updateShort(id, data) {
        const [updated] = await this.db
            .update(contentShortsTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(contentShortsTable.id, id))
            .returning();
        return updated;
    }
    async deleteShort(id) {
        await this.db.delete(contentShortsTable).where(eq(contentShortsTable.id, id));
    }
}
