import { eq, and } from "drizzle-orm";
import { BaseService } from "../../../core/base/base.service";
import { AppError } from "../../../shared/errors/app.error";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { conceptDictionaryTable } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";

export class UniversalConceptDictionaryService extends BaseService {
  constructor() {
    super("UniversalConceptDictionaryService");
  }

  private get db() {
    return Db1Connection.getInstance();
  }

  /**
   * Add a new mapping for a term to a canonical entity ID.
   */
  public async addMapping(input: {
    entityType: string;
    entityId: string;
    term: string;
    languageCode?: string;
    confidenceWeight?: number;
  }) {
    const { entityType, entityId, term, languageCode, confidenceWeight = 100 } = input;
    
    if (!entityType || !entityId || !term) {
      throw new AppError("entityType, entityId, and term are required", 400);
    }

    const [mapping] = await this.db
      .insert(conceptDictionaryTable)
      .values({
        id: crypto.randomUUID(),
        entityType,
        entityId,
        term: term.toLowerCase().trim(),
        languageCode,
        confidenceWeight,
      })
      .returning();

    return mapping;
  }

  /**
   * Resolves a raw text term to a canonical entity ID.
   */
  public async resolveTerm(term: string, entityType?: string): Promise<string | null> {
    if (!term) return null;

    const normalizedTerm = term.toLowerCase().trim();

    let query = this.db.select().from(conceptDictionaryTable).where(
      eq(conceptDictionaryTable.term, normalizedTerm)
    );

    const results = await query;
    if (results.length === 0) return null;

    // Filter by entityType if provided
    const filtered = entityType 
      ? results.filter((r: any) => r.entityType === entityType)
      : results;

    if (filtered.length === 0) return null;

    // Return the entity ID of the mapping with the highest confidence weight
    const bestMatch = filtered.sort((a: any, b: any) => (b.confidenceWeight || 0) - (a.confidenceWeight || 0))[0];
    return bestMatch.entityId;
  }
}
