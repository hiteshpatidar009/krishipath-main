import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";
import { Db2Connection } from "../../../infrastructure/database/postgres/connections/db2.connection";
import { SqlResult } from "../../../shared/db/sql-result";
export class DocumentRepository {
    async create(dto) {
        const id = randomUUID();
        await Db2Connection.getInstance().execute(sql `
      INSERT INTO documents (
        id, company_id, entity_type, entity_id, document_type, file_name,
        file_url, mime_type, file_size, uploaded_by, created_at
      ) VALUES (
        ${id}, ${dto.companyId}, ${dto.ownerType}, ${dto.ownerId}, ${dto.documentType},
        ${dto.fileName}, ${dto.storageKey}, ${dto.mimeType}, ${dto.sizeBytes},
        ${dto.uploadedBy}, NOW()
      )
    `);
        return id;
    }
    async list(companyId, limit, offset) {
        const result = await Db2Connection.getInstance().execute(sql `
      SELECT id, company_id, entity_type, entity_id, document_type, file_name,
             file_url, mime_type, file_size, uploaded_by, created_at
      FROM documents
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
        return SqlResult.rows(result);
    }
    async findById(companyId, id) {
        const result = await Db2Connection.getInstance().execute(sql `
      SELECT id, company_id, entity_type, entity_id, document_type, file_name,
             file_url, mime_type, file_size, uploaded_by, created_at
      FROM documents
      WHERE company_id = ${companyId} AND id = ${id}
      LIMIT 1
    `);
        return SqlResult.rows(result)[0] ?? null;
    }
}
