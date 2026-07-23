import { eq } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { 
  rawMarketMessagesTable, 
  feedSourcesTable,
  traderParserProfilesTable 
} from "../../../infrastructure/database/postgres/schemas/db1/all.schema";

export class IngestionPipelineRepository {
  private get db() {
    return Db1Connection.getInstance();
  }

  public async getFeedSource(sourceIdentifier: string, sourceType: string) {
    const [source] = await this.db
      .select()
      .from(feedSourcesTable)
      .where(
        eq(feedSourcesTable.sourceIdentifier, sourceIdentifier)
      );
    // Note: should also filter by sourceType in a real query
    return source;
  }

  public async getTraderParserProfile(traderId: string) {
    const [profile] = await this.db
      .select()
      .from(traderParserProfilesTable)
      .where(eq(traderParserProfilesTable.traderId, traderId));
    return profile;
  }

  public async saveRawMessage(data: {
    feedSourceId: string;
    rawText: string;
    receivedAt: Date;
    status: string;
    parserVersion?: string;
  }) {
    const [message] = await this.db
      .insert(rawMarketMessagesTable)
      .values({
        id: crypto.randomUUID(),
        ...data,
      })
      .returning();
    return message;
  }

  public async updateRawMessageStatus(
    id: string, 
    status: string, 
    extractedJson?: any, 
    validationErrors?: any
  ) {
    const [updated] = await this.db
      .update(rawMarketMessagesTable)
      .set({ status, extractedJson, validationErrors })
      .where(eq(rawMarketMessagesTable.id, id))
      .returning();
    return updated;
  }
}
