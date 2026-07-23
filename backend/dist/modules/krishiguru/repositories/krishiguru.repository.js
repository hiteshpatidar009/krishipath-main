import { eq, and, desc, sql } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { aiChatsTable, aiMessagesTable, aiUsageLogsTable, farmersTable } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
export class KrishiGuruRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    async resolveFarmerId(userId, claimedFarmerId) {
        if (claimedFarmerId) {
            const [claimed] = await this.db
                .select({ id: farmersTable.id })
                .from(farmersTable)
                .where(and(eq(farmersTable.id, claimedFarmerId), eq(farmersTable.userId, userId)))
                .limit(1);
            if (claimed)
                return claimed.id;
        }
        const [farmer] = await this.db
            .select({ id: farmersTable.id })
            .from(farmersTable)
            .where(eq(farmersTable.userId, userId))
            .limit(1);
        return farmer?.id || null;
    }
    async getTodayUsage(farmerId) {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const result = await this.db
            .select({ count: aiUsageLogsTable.requestCount })
            .from(aiUsageLogsTable)
            .where(and(eq(aiUsageLogsTable.farmerId, farmerId), eq(aiUsageLogsTable.date, today)))
            .limit(1);
        return result.length > 0 ? result[0].count : 0;
    }
    async incrementUsage(farmerId) {
        const today = new Date().toISOString().split("T")[0];
        await this.db
            .insert(aiUsageLogsTable)
            .values({
            id: crypto.randomUUID(),
            farmerId,
            date: today,
            requestCount: 1,
        })
            .onConflictDoUpdate({
            target: [aiUsageLogsTable.farmerId, aiUsageLogsTable.date],
            set: {
                requestCount: sql `${aiUsageLogsTable.requestCount} + 1`,
                updatedAt: new Date(),
            },
        });
    }
    async getChatHistory(farmerId, limit = 50) {
        // Basic implementation to get the most recent chat and its messages
        // Or we can return all messages for this farmer across their chats in V1
        const chats = await this.db
            .select()
            .from(aiChatsTable)
            .where(eq(aiChatsTable.farmerId, farmerId))
            .orderBy(desc(aiChatsTable.updatedAt))
            .limit(1);
        if (chats.length === 0)
            return [];
        const messages = await this.db
            .select()
            .from(aiMessagesTable)
            .where(eq(aiMessagesTable.chatId, chats[0].id))
            .orderBy(desc(aiMessagesTable.createdAt))
            .limit(limit);
        return messages.reverse();
    }
    async saveMessage(farmerId, role, content) {
        // Find or create chat
        let chats = await this.db
            .select()
            .from(aiChatsTable)
            .where(eq(aiChatsTable.farmerId, farmerId))
            .limit(1);
        let chatId;
        if (chats.length === 0) {
            chatId = crypto.randomUUID();
            await this.db.insert(aiChatsTable).values({
                id: chatId,
                farmerId,
                title: "KrishiGuru Chat",
            });
        }
        else {
            chatId = chats[0].id;
            // Update chat updatedAt
            await this.db
                .update(aiChatsTable)
                .set({ updatedAt: new Date() })
                .where(eq(aiChatsTable.id, chatId));
        }
        const [created] = await this.db.insert(aiMessagesTable).values({
            id: crypto.randomUUID(),
            chatId,
            role,
            content,
        }).returning();
        return created;
    }
}
