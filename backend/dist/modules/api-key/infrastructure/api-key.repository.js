import { randomBytes, randomUUID, createHash } from "crypto";
import { and, eq } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database";
import { apiKeysTable } from "../../../infrastructure/database/postgres/schemas/db1";
export class ApiKeyRepository {
    async create(input) {
        const apiKeyId = randomUUID();
        const apiKey = `rsbc_${randomBytes(32).toString("hex")}`;
        const apiKeyHash = createHash("sha256").update(apiKey).digest("hex");
        await Db1Connection.getInstance().insert(apiKeysTable).values({
            id: apiKeyId,
            companyId: input.companyId,
            userId: input.userId,
            keyName: input.keyName,
            keyPrefix: apiKey.slice(0, 12),
            apiKeyHash,
            scopes: input.scopes,
            expiresAt: input.expiresAt,
            createdAt: new Date(),
        });
        return { apiKeyId, apiKey, keyPrefix: apiKey.slice(0, 12) };
    }
    list(companyId) {
        return Db1Connection.getInstance()
            .select({
            id: apiKeysTable.id,
            keyName: apiKeysTable.keyName,
            keyPrefix: apiKeysTable.keyPrefix,
            scopes: apiKeysTable.scopes,
            lastUsedAt: apiKeysTable.lastUsedAt,
            expiresAt: apiKeysTable.expiresAt,
            revokedAt: apiKeysTable.revokedAt,
            createdAt: apiKeysTable.createdAt,
        })
            .from(apiKeysTable)
            .where(eq(apiKeysTable.companyId, companyId));
    }
    async revoke(companyId, apiKeyId) {
        await Db1Connection.getInstance()
            .update(apiKeysTable)
            .set({ revokedAt: new Date() })
            .where(and(eq(apiKeysTable.companyId, companyId), eq(apiKeysTable.id, apiKeyId)));
    }
}
