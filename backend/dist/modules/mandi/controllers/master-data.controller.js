import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { masterDataItemsTable } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
import { ApiResponse } from "../../../shared/http/api-response";
const allowedTypes = new Set(["crop_category", "crop_subcategory", "grade", "unit", "language"]);
const valid = (type) => allowedTypes.has(type);
const param = (value) => Array.isArray(value) ? value[0] : value ?? "";
/** CRUD for small platform reference lists used by products and mandis. */
export class MasterDataController {
    translationService;
    constructor(translationService) {
        this.translationService = translationService;
    }
    list = async (req, res) => {
        const type = param(req.params.type);
        if (!valid(type))
            return ApiResponse.badRequest(res, "Unsupported master-data type");
        const data = await Db1Connection.getInstance().select().from(masterDataItemsTable)
            .where(eq(masterDataItemsTable.type, type)).orderBy(masterDataItemsTable.name);
        ApiResponse.ok(res, data, "Master data loaded");
    };
    create = async (req, res) => {
        const type = param(req.params.type);
        if (!valid(type))
            return ApiResponse.badRequest(res, "Unsupported master-data type");
        const { name, code, description, status = "ACTIVE", translations } = req.body;
        if (!name || !code)
            return ApiResponse.badRequest(res, "name and code are required");
        const now = new Date();
        const item = { id: randomUUID(), type, name: String(name).trim(), code: String(code).trim().toUpperCase(), description: description ? String(description).trim() : null, status, createdAt: now, updatedAt: now };
        await Db1Connection.getInstance().insert(masterDataItemsTable).values(item);
        if (translations && this.translationService) {
            const records = [];
            for (const [lang, val] of Object.entries(translations)) {
                if (typeof val === 'string' && val.trim()) {
                    records.push({
                        entityType: type.toUpperCase(),
                        entityId: item.id,
                        fieldName: "name",
                        languageCode: lang,
                        value: val.trim(),
                        translatedBy: req.user?.id,
                    });
                }
            }
            if (records.length > 0) {
                await this.translationService.bulkUpsert(records);
            }
        }
        ApiResponse.created(res, item, "Master data created");
    };
    update = async (req, res) => {
        const type = param(req.params.type);
        const id = param(req.params.id);
        if (!valid(type))
            return ApiResponse.badRequest(res, "Unsupported master-data type");
        const { name, code, description, status, translations } = req.body;
        const values = { updatedAt: new Date() };
        if (name !== undefined)
            values.name = String(name).trim();
        if (code !== undefined)
            values.code = String(code).trim().toUpperCase();
        if (description !== undefined)
            values.description = description ? String(description).trim() : null;
        if (status !== undefined)
            values.status = status;
        await Db1Connection.getInstance().update(masterDataItemsTable).set(values).where(and(eq(masterDataItemsTable.id, id), eq(masterDataItemsTable.type, type)));
        if (translations && this.translationService) {
            const records = [];
            for (const [lang, val] of Object.entries(translations)) {
                if (typeof val === 'string' && val.trim()) {
                    records.push({
                        entityType: type.toUpperCase(),
                        entityId: id,
                        fieldName: "name",
                        languageCode: lang,
                        value: val.trim(),
                        translatedBy: req.user?.id,
                    });
                }
            }
            if (records.length > 0) {
                await this.translationService.bulkUpsert(records);
            }
        }
        ApiResponse.ok(res, { id }, "Master data updated");
    };
    remove = async (req, res) => {
        const type = param(req.params.type);
        const id = param(req.params.id);
        if (!valid(type))
            return ApiResponse.badRequest(res, "Unsupported master-data type");
        await Db1Connection.getInstance().delete(masterDataItemsTable).where(and(eq(masterDataItemsTable.id, id), eq(masterDataItemsTable.type, type)));
        ApiResponse.ok(res, { id }, "Master data deleted");
    };
}
