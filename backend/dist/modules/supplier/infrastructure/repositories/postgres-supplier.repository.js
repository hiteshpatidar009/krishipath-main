import { randomUUID } from "crypto";
import { and, eq, like, desc } from "drizzle-orm";
import { Db2Connection } from "../../../../infrastructure/database";
import { suppliersTable, supplierContactsTable, supplierPriceListsTable, supplierDocumentsTable, supplierPerformanceTable, supplierNotesTable, } from "../../../../infrastructure/database/postgres/schemas/db2";
import { SupplierError } from "../../errors/supplier.error";
import { SupplierStatus } from "../../constants/supplier.constants";
export class SupplierRepository {
    async createSupplier(input) {
        const supplierId = randomUUID();
        const now = new Date();
        await Db2Connection.getInstance().insert(suppliersTable).values({
            id: supplierId,
            companyId: input.companyId,
            supplierCode: input.supplierCode,
            supplierName: input.supplierName,
            supplierType: input.supplierType,
            email: input.email,
            phone: input.phone,
            website: input.website,
            taxNumber: input.taxNumber,
            paymentTerms: input.paymentTerms,
            creditLimit: input.creditLimit,
            status: "ACTIVE",
            createdAt: now,
            updatedAt: now,
        });
        return { supplierId };
    }
    async findSupplierById(companyId, supplierId) {
        const rows = await Db2Connection.getInstance()
            .select({
            id: suppliersTable.id,
            companyId: suppliersTable.companyId,
            supplierCode: suppliersTable.supplierCode,
            supplierName: suppliersTable.supplierName,
            supplierType: suppliersTable.supplierType,
            email: suppliersTable.email,
            phone: suppliersTable.phone,
            website: suppliersTable.website,
            taxNumber: suppliersTable.taxNumber,
            paymentTerms: suppliersTable.paymentTerms,
            creditLimit: suppliersTable.creditLimit,
            rating: suppliersTable.rating,
            status: suppliersTable.status,
            createdAt: suppliersTable.createdAt,
            updatedAt: suppliersTable.updatedAt,
        })
            .from(suppliersTable)
            .where(and(eq(suppliersTable.companyId, companyId), eq(suppliersTable.id, supplierId)))
            .limit(1);
        return rows[0] ? this.toSupplierView(rows[0]) : null;
    }
    async findSupplierByCode(companyId, supplierCode) {
        const rows = await Db2Connection.getInstance()
            .select({
            id: suppliersTable.id,
            companyId: suppliersTable.companyId,
            supplierCode: suppliersTable.supplierCode,
            supplierName: suppliersTable.supplierName,
            supplierType: suppliersTable.supplierType,
            email: suppliersTable.email,
            phone: suppliersTable.phone,
            website: suppliersTable.website,
            taxNumber: suppliersTable.taxNumber,
            paymentTerms: suppliersTable.paymentTerms,
            creditLimit: suppliersTable.creditLimit,
            rating: suppliersTable.rating,
            status: suppliersTable.status,
            createdAt: suppliersTable.createdAt,
            updatedAt: suppliersTable.updatedAt,
        })
            .from(suppliersTable)
            .where(and(eq(suppliersTable.companyId, companyId), eq(suppliersTable.supplierCode, supplierCode)))
            .limit(1);
        return rows[0] ? this.toSupplierView(rows[0]) : null;
    }
    async findSupplierByEmail(companyId, email) {
        const rows = await Db2Connection.getInstance()
            .select({
            id: suppliersTable.id,
            companyId: suppliersTable.companyId,
            supplierCode: suppliersTable.supplierCode,
            supplierName: suppliersTable.supplierName,
            supplierType: suppliersTable.supplierType,
            email: suppliersTable.email,
            phone: suppliersTable.phone,
            website: suppliersTable.website,
            taxNumber: suppliersTable.taxNumber,
            paymentTerms: suppliersTable.paymentTerms,
            creditLimit: suppliersTable.creditLimit,
            rating: suppliersTable.rating,
            status: suppliersTable.status,
            createdAt: suppliersTable.createdAt,
            updatedAt: suppliersTable.updatedAt,
        })
            .from(suppliersTable)
            .where(and(eq(suppliersTable.companyId, companyId), eq(suppliersTable.email, email)))
            .limit(1);
        return rows[0] ? this.toSupplierView(rows[0]) : null;
    }
    async listSuppliers(companyId, filters, pagination) {
        const db = Db2Connection.getInstance();
        const whereConditions = [eq(suppliersTable.companyId, companyId)];
        if (filters.status) {
            whereConditions.push(eq(suppliersTable.status, filters.status));
        }
        if (filters.search) {
            whereConditions.push(like(suppliersTable.supplierName, `%${filters.search}%`));
        }
        const query = db
            .select({
            id: suppliersTable.id,
            companyId: suppliersTable.companyId,
            supplierCode: suppliersTable.supplierCode,
            supplierName: suppliersTable.supplierName,
            supplierType: suppliersTable.supplierType,
            email: suppliersTable.email,
            phone: suppliersTable.phone,
            website: suppliersTable.website,
            taxNumber: suppliersTable.taxNumber,
            paymentTerms: suppliersTable.paymentTerms,
            creditLimit: suppliersTable.creditLimit,
            rating: suppliersTable.rating,
            status: suppliersTable.status,
            createdAt: suppliersTable.createdAt,
            updatedAt: suppliersTable.updatedAt,
        })
            .from(suppliersTable)
            .where(and(...whereConditions))
            .orderBy(desc(suppliersTable.createdAt))
            .limit(pagination.limit)
            .offset(pagination.offset);
        const suppliers = (await query).map((row) => this.toSupplierView(row));
        const totalRows = await db
            .select({ count: suppliersTable.id })
            .from(suppliersTable)
            .where(and(...whereConditions));
        return {
            suppliers,
            total: totalRows.length > 0 ? parseInt(String(totalRows.length), 10) : 0,
        };
    }
    async updateSupplier(input) {
        const updates = {
            updatedAt: new Date(),
        };
        if (input.supplierName)
            updates.supplierName = input.supplierName;
        if (input.supplierType)
            updates.supplierType = input.supplierType;
        if (input.email)
            updates.email = input.email;
        if (input.phone)
            updates.phone = input.phone;
        if (input.website)
            updates.website = input.website;
        if (input.taxNumber)
            updates.taxNumber = input.taxNumber;
        if (input.paymentTerms)
            updates.paymentTerms = input.paymentTerms;
        if (input.creditLimit)
            updates.creditLimit = input.creditLimit;
        if (input.status)
            updates.status = input.status;
        const rows = await Db2Connection.getInstance()
            .update(suppliersTable)
            .set(updates)
            .where(and(eq(suppliersTable.companyId, input.companyId), eq(suppliersTable.id, input.supplierId)))
            .returning();
        return Boolean(rows[0]);
    }
    async deleteSupplier(companyId, supplierId) {
        const rows = await Db2Connection.getInstance()
            .update(suppliersTable)
            .set({ status: "INACTIVE", updatedAt: new Date() })
            .where(and(eq(suppliersTable.companyId, companyId), eq(suppliersTable.id, supplierId)))
            .returning();
        return Boolean(rows[0]);
    }
    async createSupplierContact(input) {
        const contactId = randomUUID();
        await Db2Connection.getInstance().insert(supplierContactsTable).values({
            id: contactId,
            supplierId: input.supplierId,
            contactName: input.contactName,
            designation: input.designation,
            email: input.email,
            phone: input.phone,
            isPrimary: input.isPrimary,
        });
        return { contactId };
    }
    async findSupplierContacts(supplierId) {
        const rows = await Db2Connection.getInstance()
            .select({
            id: supplierContactsTable.id,
            supplierId: supplierContactsTable.supplierId,
            contactName: supplierContactsTable.contactName,
            designation: supplierContactsTable.designation,
            email: supplierContactsTable.email,
            phone: supplierContactsTable.phone,
            isPrimary: supplierContactsTable.isPrimary,
        })
            .from(supplierContactsTable)
            .where(eq(supplierContactsTable.supplierId, supplierId));
        return rows.map((row) => this.toSupplierContactView(row));
    }
    async findSupplierContactById(supplierId, contactId) {
        const rows = await Db2Connection.getInstance()
            .select({
            id: supplierContactsTable.id,
            supplierId: supplierContactsTable.supplierId,
            contactName: supplierContactsTable.contactName,
            designation: supplierContactsTable.designation,
            email: supplierContactsTable.email,
            phone: supplierContactsTable.phone,
            isPrimary: supplierContactsTable.isPrimary,
        })
            .from(supplierContactsTable)
            .where(and(eq(supplierContactsTable.supplierId, supplierId), eq(supplierContactsTable.id, contactId)))
            .limit(1);
        return rows[0] ? this.toSupplierContactView(rows[0]) : null;
    }
    async updateSupplierContact(input) {
        const updates = {};
        if (input.contactName)
            updates.contactName = input.contactName;
        if (input.designation)
            updates.designation = input.designation;
        if (input.email)
            updates.email = input.email;
        if (input.phone)
            updates.phone = input.phone;
        if (input.isPrimary !== undefined)
            updates.isPrimary = input.isPrimary;
        const rows = await Db2Connection.getInstance()
            .update(supplierContactsTable)
            .set(updates)
            .where(and(eq(supplierContactsTable.supplierId, input.supplierId), eq(supplierContactsTable.id, input.contactId)))
            .returning();
        return Boolean(rows[0]);
    }
    async deleteSupplierContact(supplierId, contactId) {
        const rows = await Db2Connection.getInstance()
            .delete(supplierContactsTable)
            .where(and(eq(supplierContactsTable.supplierId, supplierId), eq(supplierContactsTable.id, contactId)))
            .returning();
        return Boolean(rows[0]);
    }
    async createSupplierPricing(input) {
        const pricingId = randomUUID();
        await Db2Connection.getInstance().insert(supplierPriceListsTable).values({
            id: pricingId,
            supplierId: input.supplierId,
            productId: input.productId,
            minimumQuantity: input.minimumQuantity,
            unitCost: input.unitCost,
            currencyCode: input.currencyCode,
            leadTimeDays: input.leadTimeDays,
            effectiveFrom: input.effectiveFrom,
            effectiveTo: input.effectiveTo,
        });
        return { pricingId };
    }
    async findSupplierPricing(supplierId) {
        const rows = await Db2Connection.getInstance()
            .select({
            id: supplierPriceListsTable.id,
            supplierId: supplierPriceListsTable.supplierId,
            productId: supplierPriceListsTable.productId,
            minimumQuantity: supplierPriceListsTable.minimumQuantity,
            unitCost: supplierPriceListsTable.unitCost,
            currencyCode: supplierPriceListsTable.currencyCode,
            leadTimeDays: supplierPriceListsTable.leadTimeDays,
            effectiveFrom: supplierPriceListsTable.effectiveFrom,
            effectiveTo: supplierPriceListsTable.effectiveTo,
        })
            .from(supplierPriceListsTable)
            .where(eq(supplierPriceListsTable.supplierId, supplierId));
        return rows.map((row) => this.toSupplierPricingView(row));
    }
    async findSupplierPricingById(pricingId) {
        const rows = await Db2Connection.getInstance()
            .select({
            id: supplierPriceListsTable.id,
            supplierId: supplierPriceListsTable.supplierId,
            productId: supplierPriceListsTable.productId,
            minimumQuantity: supplierPriceListsTable.minimumQuantity,
            unitCost: supplierPriceListsTable.unitCost,
            currencyCode: supplierPriceListsTable.currencyCode,
            leadTimeDays: supplierPriceListsTable.leadTimeDays,
            effectiveFrom: supplierPriceListsTable.effectiveFrom,
            effectiveTo: supplierPriceListsTable.effectiveTo,
        })
            .from(supplierPriceListsTable)
            .where(eq(supplierPriceListsTable.id, pricingId))
            .limit(1);
        return rows[0] ? this.toSupplierPricingView(rows[0]) : null;
    }
    async updateSupplierPricing(input) {
        const updates = {};
        if (input.minimumQuantity)
            updates.minimumQuantity = input.minimumQuantity;
        if (input.unitCost)
            updates.unitCost = input.unitCost;
        if (input.currencyCode)
            updates.currencyCode = input.currencyCode;
        if (input.leadTimeDays !== undefined)
            updates.leadTimeDays = input.leadTimeDays;
        if (input.effectiveFrom)
            updates.effectiveFrom = input.effectiveFrom;
        if (input.effectiveTo)
            updates.effectiveTo = input.effectiveTo;
        const rows = await Db2Connection.getInstance()
            .update(supplierPriceListsTable)
            .set(updates)
            .where(eq(supplierPriceListsTable.id, input.pricingId))
            .returning();
        return Boolean(rows[0]);
    }
    async createSupplierDocument(input) {
        const documentId = randomUUID();
        await Db2Connection.getInstance().insert(supplierDocumentsTable).values({
            id: documentId,
            supplierId: input.supplierId,
            documentType: input.documentType,
            fileName: input.fileName,
            fileKey: input.fileKey,
            fileSize: input.fileSize,
            mimeType: input.mimeType,
            uploadedBy: input.uploadedBy,
            uploadedAt: new Date(),
            expiresAt: input.expiresAt,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return { documentId };
    }
    async findSupplierDocuments(supplierId) {
        const rows = await Db2Connection.getInstance()
            .select({
            id: supplierDocumentsTable.id,
            supplierId: supplierDocumentsTable.supplierId,
            documentType: supplierDocumentsTable.documentType,
            fileName: supplierDocumentsTable.fileName,
            fileKey: supplierDocumentsTable.fileKey,
            fileSize: supplierDocumentsTable.fileSize,
            mimeType: supplierDocumentsTable.mimeType,
            uploadedBy: supplierDocumentsTable.uploadedBy,
            uploadedAt: supplierDocumentsTable.uploadedAt,
            expiresAt: supplierDocumentsTable.expiresAt,
        })
            .from(supplierDocumentsTable)
            .where(and(eq(supplierDocumentsTable.supplierId, supplierId), eq(supplierDocumentsTable.isArchived, false)));
        return rows.map((row) => this.toSupplierDocumentView(row));
    }
    async deleteSupplierDocument(documentId) {
        const rows = await Db2Connection.getInstance()
            .update(supplierDocumentsTable)
            .set({ isArchived: true, updatedAt: new Date() })
            .where(eq(supplierDocumentsTable.id, documentId))
            .returning();
        return Boolean(rows[0]);
    }
    async updateSupplierPerformance(input) {
        const existing = await Db2Connection.getInstance()
            .select()
            .from(supplierPerformanceTable)
            .where(eq(supplierPerformanceTable.supplierId, input.supplierId))
            .limit(1);
        const updates = {
            updatedAt: new Date(),
        };
        if (input.deliveryDelayDays !== undefined)
            updates.deliveryDelayDays = input.deliveryDelayDays;
        if (input.qualityScore !== undefined)
            updates.qualityScore = input.qualityScore;
        if (input.returnRate !== undefined)
            updates.returnRate = input.returnRate;
        if (input.orderFulfillmentAccuracy !== undefined)
            updates.orderFulfillmentAccuracy = input.orderFulfillmentAccuracy;
        if (input.overallRating !== undefined)
            updates.overallRating = input.overallRating;
        updates.lastAssessmentDate = new Date();
        if (existing[0]) {
            await Db2Connection.getInstance()
                .update(supplierPerformanceTable)
                .set(updates)
                .where(eq(supplierPerformanceTable.supplierId, input.supplierId));
        }
        else {
            await Db2Connection.getInstance().insert(supplierPerformanceTable).values({
                id: randomUUID(),
                supplierId: input.supplierId,
                ...updates,
            });
        }
    }
    async findSupplierPerformance(supplierId) {
        const rows = await Db2Connection.getInstance()
            .select({
            id: supplierPerformanceTable.id,
            supplierId: supplierPerformanceTable.supplierId,
            deliveryDelayDays: supplierPerformanceTable.deliveryDelayDays,
            qualityScore: supplierPerformanceTable.qualityScore,
            returnRate: supplierPerformanceTable.returnRate,
            orderFulfillmentAccuracy: supplierPerformanceTable.orderFulfillmentAccuracy,
            overallRating: supplierPerformanceTable.overallRating,
            lastAssessmentDate: supplierPerformanceTable.lastAssessmentDate,
        })
            .from(supplierPerformanceTable)
            .where(eq(supplierPerformanceTable.supplierId, supplierId))
            .limit(1);
        return rows[0] ? this.toSupplierPerformanceView(rows[0]) : null;
    }
    async createSupplierNote(input) {
        const noteId = randomUUID();
        await Db2Connection.getInstance().insert(supplierNotesTable).values({
            id: noteId,
            supplierId: input.supplierId,
            content: input.content,
            createdBy: input.createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return { noteId };
    }
    async findSupplierNotes(supplierId) {
        const rows = await Db2Connection.getInstance()
            .select({
            id: supplierNotesTable.id,
            supplierId: supplierNotesTable.supplierId,
            content: supplierNotesTable.content,
            createdBy: supplierNotesTable.createdBy,
            createdAt: supplierNotesTable.createdAt,
            updatedAt: supplierNotesTable.updatedAt,
        })
            .from(supplierNotesTable)
            .where(eq(supplierNotesTable.supplierId, supplierId))
            .orderBy(desc(supplierNotesTable.createdAt));
        return rows.map((row) => this.toSupplierNoteView(row));
    }
    toSupplierView(row) {
        return {
            id: this.requiredString(row.id, "supplier.id"),
            companyId: this.requiredString(row.companyId, "supplier.companyId"),
            supplierCode: this.requiredString(row.supplierCode, "supplier.supplierCode"),
            supplierName: this.requiredString(row.supplierName, "supplier.supplierName"),
            supplierType: this.requiredString(row.supplierType, "supplier.supplierType"),
            email: this.requiredString(row.email, "supplier.email"),
            phone: this.requiredString(row.phone, "supplier.phone"),
            website: this.optionalString(row.website),
            taxNumber: this.optionalString(row.taxNumber),
            paymentTerms: this.optionalString(row.paymentTerms),
            creditLimit: this.optionalNumber(row.creditLimit),
            rating: this.optionalNumber(row.rating),
            status: (this.optionalString(row.status) ?? SupplierStatus.ACTIVE),
            createdAt: this.requiredDate(row.createdAt, "supplier.createdAt"),
            updatedAt: this.requiredDate(row.updatedAt, "supplier.updatedAt"),
        };
    }
    toSupplierContactView(row) {
        return {
            id: this.requiredString(row.id, "supplierContact.id"),
            supplierId: this.requiredString(row.supplierId, "supplierContact.supplierId"),
            contactName: this.requiredString(row.contactName, "supplierContact.contactName"),
            designation: this.optionalString(row.designation),
            email: this.requiredString(row.email, "supplierContact.email"),
            phone: this.requiredString(row.phone, "supplierContact.phone"),
            isPrimary: Boolean(row.isPrimary),
        };
    }
    toSupplierPricingView(row) {
        return {
            id: this.requiredString(row.id, "supplierPricing.id"),
            supplierId: this.requiredString(row.supplierId, "supplierPricing.supplierId"),
            productId: this.requiredString(row.productId, "supplierPricing.productId"),
            minimumQuantity: this.requiredNumber(row.minimumQuantity, "supplierPricing.minimumQuantity"),
            unitCost: this.requiredNumber(row.unitCost, "supplierPricing.unitCost"),
            currencyCode: this.requiredString(row.currencyCode, "supplierPricing.currencyCode"),
            leadTimeDays: this.requiredNumber(row.leadTimeDays, "supplierPricing.leadTimeDays"),
            effectiveFrom: this.requiredDate(row.effectiveFrom, "supplierPricing.effectiveFrom"),
            effectiveTo: this.optionalDate(row.effectiveTo),
        };
    }
    toSupplierDocumentView(row) {
        return {
            id: this.requiredString(row.id, "supplierDocument.id"),
            supplierId: this.requiredString(row.supplierId, "supplierDocument.supplierId"),
            documentType: this.requiredString(row.documentType, "supplierDocument.documentType"),
            fileName: this.requiredString(row.fileName, "supplierDocument.fileName"),
            fileKey: this.requiredString(row.fileKey, "supplierDocument.fileKey"),
            fileSize: this.requiredNumber(row.fileSize, "supplierDocument.fileSize"),
            mimeType: this.requiredString(row.mimeType, "supplierDocument.mimeType"),
            uploadedBy: this.requiredString(row.uploadedBy, "supplierDocument.uploadedBy"),
            uploadedAt: this.requiredDate(row.uploadedAt, "supplierDocument.uploadedAt"),
            expiresAt: this.optionalDate(row.expiresAt),
        };
    }
    toSupplierPerformanceView(row) {
        return {
            id: this.requiredString(row.id, "supplierPerformance.id"),
            supplierId: this.requiredString(row.supplierId, "supplierPerformance.supplierId"),
            deliveryDelayDays: this.optionalNumber(row.deliveryDelayDays),
            qualityScore: this.optionalNumber(row.qualityScore),
            returnRate: this.optionalNumber(row.returnRate),
            orderFulfillmentAccuracy: this.optionalNumber(row.orderFulfillmentAccuracy),
            overallRating: this.optionalNumber(row.overallRating),
            lastAssessmentDate: this.optionalDate(row.lastAssessmentDate),
        };
    }
    toSupplierNoteView(row) {
        return {
            id: this.requiredString(row.id, "supplierNote.id"),
            supplierId: this.requiredString(row.supplierId, "supplierNote.supplierId"),
            content: this.optionalString(row.content) ?? "",
            createdBy: this.requiredString(row.createdBy, "supplierNote.createdBy"),
            createdAt: this.requiredDate(row.createdAt, "supplierNote.createdAt"),
            updatedAt: this.requiredDate(row.updatedAt, "supplierNote.updatedAt"),
        };
    }
    requiredString(value, field) {
        if (typeof value === "string" && value.length > 0) {
            return value;
        }
        throw new SupplierError(500, `Invalid supplier persistence field: ${field}`);
    }
    optionalString(value) {
        return typeof value === "string" && value.length > 0 ? value : undefined;
    }
    requiredNumber(value, field) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
        throw new SupplierError(500, `Invalid supplier numeric field: ${field}`);
    }
    optionalNumber(value) {
        if (value === null || value === undefined || value === "") {
            return undefined;
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    requiredDate(value, field) {
        const parsed = this.optionalDate(value);
        if (parsed) {
            return parsed;
        }
        throw new SupplierError(500, `Invalid supplier date field: ${field}`);
    }
    optionalDate(value) {
        if (!value) {
            return undefined;
        }
        if (value instanceof Date) {
            return value;
        }
        const parsed = new Date(String(value));
        return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    }
}
