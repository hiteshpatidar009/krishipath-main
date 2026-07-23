import { eq } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { rawMarketMessagesTable, feedSourcesTable, traderParserProfilesTable } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
export class IngestionPipelineRepository {
    get db() {
        return Db1Connection.getInstance();
    }
    async getFeedSource(sourceIdentifier, sourceType) {
        const [source] = await this.db
            .select()
            .from(feedSourcesTable)
            .where(eq(feedSourcesTable.sourceIdentifier, sourceIdentifier));
        // Note: should also filter by sourceType in a real query
        return source;
    }
    async getTraderParserProfile(traderId) {
        const [profile] = await this.db
            .select()
            .from(traderParserProfilesTable)
            .where(eq(traderParserProfilesTable.traderId, traderId));
        return profile;
    }
    async saveRawMessage(data) {
        const [message] = await this.db
            .insert(rawMarketMessagesTable)
            .values({
            id: crypto.randomUUID(),
            ...data,
        })
            .returning();
        return message;
    }
    async updateRawMessageStatus(id, status, extractedJson, validationErrors) {
        const [updated] = await this.db
            .update(rawMarketMessagesTable)
            .set({ status, extractedJson, validationErrors })
            .where(eq(rawMarketMessagesTable.id, id))
            .returning();
        return updated;
    }
}
