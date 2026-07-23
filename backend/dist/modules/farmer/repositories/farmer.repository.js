import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { farmersTable, farmerCropsTable, farmerMandisTable, mandisTable, productsTable, farmerCalendarEventsTable, farmerTasksTable, farmerMarketWatchlistTable, contentCreatorsTable, contentCreatorFollowsTable, contentShortsTable, usersTable, userProfilesTable, } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
export class FarmerRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    async findByUserId(userId) {
        const result = await this.db
            .select()
            .from(farmersTable)
            .where(eq(farmersTable.userId, userId))
            .limit(1);
        const profile = result[0];
        if (!profile)
            return null;
        const [mandiRows, cropRows, creatorRows] = await Promise.all([
            this.db
                .select({
                mandiId: farmerMandisTable.mandiId,
                name: mandisTable.name,
            })
                .from(farmerMandisTable)
                .innerJoin(mandisTable, eq(farmerMandisTable.mandiId, mandisTable.id))
                .where(eq(farmerMandisTable.farmerId, profile.id))
                .orderBy(asc(farmerMandisTable.createdAt)),
            this.db
                .select({
                productId: farmerCropsTable.productId,
                name: productsTable.name,
                code: productsTable.code,
            })
                .from(farmerCropsTable)
                .innerJoin(productsTable, eq(farmerCropsTable.productId, productsTable.id))
                .where(eq(farmerCropsTable.farmerId, profile.id))
                .orderBy(asc(farmerCropsTable.createdAt)),
            this.db
                .select({ id: contentCreatorsTable.id, status: contentCreatorsTable.status, name: contentCreatorsTable.name })
                .from(contentCreatorsTable)
                .where(eq(contentCreatorsTable.ownerUserId, userId))
                .limit(1),
        ]);
        const creator = creatorRows[0] || null;
        let creatorStats = null;
        if (creator) {
            const [shortStats, followerStats] = await Promise.all([
                this.db
                    .select({
                    videos: sql `count(*)::int`,
                    views: sql `coalesce(sum(${contentShortsTable.views}), 0)::int`,
                    likes: sql `coalesce(sum(${contentShortsTable.likes}), 0)::int`,
                })
                    .from(contentShortsTable)
                    .where(eq(contentShortsTable.creatorId, creator.id)),
                this.db
                    .select({ followers: sql `count(*)::int` })
                    .from(contentCreatorFollowsTable)
                    .where(eq(contentCreatorFollowsTable.creatorId, creator.id)),
            ]);
            creatorStats = {
                followers: Number(followerStats[0]?.followers || 0),
                videos: Number(shortStats[0]?.videos || 0),
                views: Number(shortStats[0]?.views || 0),
                likes: Number(shortStats[0]?.likes || 0),
            };
        }
        const primaryMandi = mandiRows.find((row) => row.mandiId === profile.preferredMandiId) || mandiRows[0];
        return {
            ...profile,
            preferredMandis: mandiRows.map((row) => row.mandiId),
            preferredMandiDetails: mandiRows,
            preferredMandiName: primaryMandi?.name || "",
            trackedCrops: cropRows.map((row) => row.productId),
            trackedCropDetails: cropRows,
            primaryCrop: cropRows[0]?.productId || null,
            primaryCropName: cropRows[0]?.name || "",
            isCreator: Boolean(creator),
            creatorProfile: creator,
            creatorStats,
        };
    }
    async findFarmerId(userId) {
        const [farmer] = await this.db
            .select({ id: farmersTable.id })
            .from(farmersTable)
            .where(eq(farmersTable.userId, userId))
            .limit(1);
        return farmer?.id || null;
    }
    async getNotificationPreferences(userId) {
        const [user] = await this.db
            .select({ notificationPreferences: userProfilesTable.notificationPreferences })
            .from(userProfilesTable)
            .where(eq(userProfilesTable.userId, userId))
            .limit(1);
        return user?.notificationPreferences || null;
    }
    async updateNotificationPreferences(userId, notificationPreferences) {
        const [existing] = await this.db
            .select({ id: userProfilesTable.id })
            .from(userProfilesTable)
            .where(eq(userProfilesTable.userId, userId))
            .limit(1);
        if (existing) {
            const [updated] = await this.db
                .update(userProfilesTable)
                .set({ notificationPreferences, updatedAt: new Date() })
                .where(eq(userProfilesTable.userId, userId))
                .returning({ notificationPreferences: userProfilesTable.notificationPreferences });
            return updated?.notificationPreferences || null;
        }
        const [created] = await this.db
            .insert(userProfilesTable)
            .values({ id: crypto.randomUUID(), userId, notificationPreferences, createdAt: new Date(), updatedAt: new Date() })
            .returning({ notificationPreferences: userProfilesTable.notificationPreferences });
        return created?.notificationPreferences || null;
    }
    async getMarketWatchlist(userId) {
        const farmerId = await this.findFarmerId(userId);
        if (!farmerId)
            return [];
        return this.db
            .select({
            id: farmerMarketWatchlistTable.id,
            mandiId: farmerMarketWatchlistTable.mandiId,
            mandiName: mandisTable.name,
            productId: farmerMarketWatchlistTable.productId,
            productName: productsTable.name,
            productCode: productsTable.code,
            createdAt: farmerMarketWatchlistTable.createdAt,
        })
            .from(farmerMarketWatchlistTable)
            .innerJoin(mandisTable, eq(farmerMarketWatchlistTable.mandiId, mandisTable.id))
            .innerJoin(productsTable, eq(farmerMarketWatchlistTable.productId, productsTable.id))
            .where(eq(farmerMarketWatchlistTable.farmerId, farmerId))
            .orderBy(desc(farmerMarketWatchlistTable.createdAt));
    }
    async saveMarketWatch(userId, mandiId, productId) {
        const farmerId = await this.findFarmerId(userId);
        if (!farmerId)
            return null;
        const [created] = await this.db
            .insert(farmerMarketWatchlistTable)
            .values({ farmerId, mandiId, productId })
            .onConflictDoNothing()
            .returning();
        if (created)
            return created;
        const [existing] = await this.db
            .select()
            .from(farmerMarketWatchlistTable)
            .where(and(eq(farmerMarketWatchlistTable.farmerId, farmerId), eq(farmerMarketWatchlistTable.mandiId, mandiId), eq(farmerMarketWatchlistTable.productId, productId)))
            .limit(1);
        return existing || null;
    }
    async removeMarketWatch(userId, mandiId, productId) {
        const farmerId = await this.findFarmerId(userId);
        if (!farmerId)
            return false;
        const removed = await this.db
            .delete(farmerMarketWatchlistTable)
            .where(and(eq(farmerMarketWatchlistTable.farmerId, farmerId), eq(farmerMarketWatchlistTable.mandiId, mandiId), eq(farmerMarketWatchlistTable.productId, productId)))
            .returning({ id: farmerMarketWatchlistTable.id });
        return removed.length > 0;
    }
    async getCalendarEvents(userId, fromDate, toDate) {
        const farmerId = await this.findFarmerId(userId);
        if (!farmerId)
            return [];
        return this.db
            .select({
            id: farmerCalendarEventsTable.id,
            productId: farmerCalendarEventsTable.productId,
            cropName: productsTable.name,
            cropCode: productsTable.code,
            eventDate: farmerCalendarEventsTable.eventDate,
            eventType: farmerCalendarEventsTable.eventType,
            title: farmerCalendarEventsTable.title,
            description: farmerCalendarEventsTable.description,
            status: farmerCalendarEventsTable.status,
        })
            .from(farmerCalendarEventsTable)
            .leftJoin(productsTable, eq(farmerCalendarEventsTable.productId, productsTable.id))
            .where(and(eq(farmerCalendarEventsTable.farmerId, farmerId), gte(farmerCalendarEventsTable.eventDate, fromDate), lte(farmerCalendarEventsTable.eventDate, toDate)))
            .orderBy(asc(farmerCalendarEventsTable.eventDate));
    }
    async createCalendarEvent(userId, data) {
        const farmerId = await this.findFarmerId(userId);
        if (!farmerId)
            return null;
        const [created] = await this.db.insert(farmerCalendarEventsTable).values({
            farmerId,
            productId: data.productId || null,
            eventDate: data.eventDate,
            eventType: data.eventType || "FARM_ACTIVITY",
            title: data.title,
            description: data.description || null,
            status: data.status || "SCHEDULED",
        }).returning();
        return created;
    }
    async getTasks(userId) {
        const farmerId = await this.findFarmerId(userId);
        if (!farmerId)
            return [];
        return this.db
            .select({
            id: farmerTasksTable.id,
            productId: farmerTasksTable.productId,
            cropName: productsTable.name,
            cropCode: productsTable.code,
            title: farmerTasksTable.title,
            description: farmerTasksTable.description,
            dueDate: farmerTasksTable.dueDate,
            priority: farmerTasksTable.priority,
            status: farmerTasksTable.status,
            completedAt: farmerTasksTable.completedAt,
        })
            .from(farmerTasksTable)
            .leftJoin(productsTable, eq(farmerTasksTable.productId, productsTable.id))
            .where(eq(farmerTasksTable.farmerId, farmerId))
            .orderBy(asc(farmerTasksTable.dueDate))
            .limit(20);
    }
    async createTask(userId, data) {
        const farmerId = await this.findFarmerId(userId);
        if (!farmerId)
            return null;
        const [created] = await this.db.insert(farmerTasksTable).values({
            farmerId,
            productId: data.productId || null,
            title: data.title,
            description: data.description || null,
            dueDate: data.dueDate,
            priority: data.priority || "MEDIUM",
            status: "PENDING",
        }).returning();
        return created;
    }
    async completeTask(userId, taskId) {
        const farmerId = await this.findFarmerId(userId);
        if (!farmerId)
            return null;
        const [updated] = await this.db
            .update(farmerTasksTable)
            .set({ status: "COMPLETED", completedAt: new Date(), updatedAt: new Date() })
            .where(and(eq(farmerTasksTable.id, taskId), eq(farmerTasksTable.farmerId, farmerId)))
            .returning();
        return updated || null;
    }
    async upsertProfile(userId, data) {
        const existing = await this.findByUserId(userId);
        if (existing) {
            await this.db
                .update(farmersTable)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(farmersTable.userId, userId));
            return this.findByUserId(userId);
        }
        else {
            const [account] = await this.db
                .select({
                phone: usersTable.phone,
                firstName: usersTable.firstName,
                lastName: usersTable.lastName,
            })
                .from(usersTable)
                .where(eq(usersTable.id, userId))
                .limit(1);
            const phone = data.phone || account?.phone;
            if (!phone) {
                throw new Error("Verified farmer phone is required to create a profile");
            }
            const newId = crypto.randomUUID();
            await this.db.insert(farmersTable).values({
                id: newId,
                userId,
                phone,
                firstName: data.firstName || account?.firstName || null,
                lastName: data.lastName || account?.lastName || null,
                ...data,
            });
            return this.findByUserId(userId);
        }
    }
    async setPreferredMandis(farmerId, mandiIds) {
        // Delete existing
        await this.db
            .delete(farmerMandisTable)
            .where(eq(farmerMandisTable.farmerId, farmerId));
        // Insert new
        if (mandiIds.length > 0) {
            await this.db.insert(farmerMandisTable).values(mandiIds.map((id, index) => ({
                id: crypto.randomUUID(),
                farmerId,
                mandiId: id,
                createdAt: new Date(Date.now() + index),
            })));
        }
    }
    async setTrackedCrops(farmerId, productIds) {
        // Delete existing
        await this.db
            .delete(farmerCropsTable)
            .where(eq(farmerCropsTable.farmerId, farmerId));
        // Insert new
        if (productIds.length > 0) {
            await this.db.insert(farmerCropsTable).values(productIds.map((id, index) => ({
                id: crypto.randomUUID(),
                farmerId,
                productId: id,
                createdAt: new Date(Date.now() + index),
            })));
        }
    }
}
