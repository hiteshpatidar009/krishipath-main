import { logger } from "../../../infrastructure/logger";
import { SubscriptionLimitService } from "../../subscription";
import { SupplierError } from "../errors/supplier.error";
import { CreateSupplierValidator, UpdateSupplierValidator, CreateSupplierContactValidator, UpdateSupplierContactValidator, CreateSupplierPricingValidator, UpdateSupplierPricingValidator, UploadSupplierDocumentValidator, } from "../validators";
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT, } from "../constants/supplier.constants";
export class SuppliersService {
    supplierRepository;
    constructor(supplierRepository) {
        this.supplierRepository = supplierRepository;
    }
    async createSupplier(companyId, input) {
        await SubscriptionLimitService.assertCanCreateSupplier(companyId);
        await logger.info("supplier.create started", {
            module: "supplier.service",
            companyId,
            tags: ["supplier", "create", "start"],
        });
        try {
            CreateSupplierValidator.validate(input);
            const existingByCode = await this.supplierRepository.findSupplierByCode(companyId, input.supplierCode);
            if (existingByCode) {
                throw new SupplierError(409, "Supplier code already exists for this company");
            }
            const existingByEmail = await this.supplierRepository.findSupplierByEmail(companyId, input.email);
            if (existingByEmail) {
                throw new SupplierError(409, "Supplier with this mail already exists for this company");
            }
            const { supplierId } = await this.supplierRepository.createSupplier({
                companyId,
                supplierCode: input.supplierCode,
                supplierName: input.supplierName,
                supplierType: input.supplierType,
                email: input.email,
                phone: input.phone,
                website: input.website,
                taxNumber: input.taxNumber,
                paymentTerms: input.paymentTerms,
                creditLimit: input.creditLimit ? String(input.creditLimit) : undefined,
            });
            const supplier = await this.supplierRepository.findSupplierById(companyId, supplierId);
            if (!supplier) {
                throw new SupplierError(500, "Failed to retrieve created supplier");
            }
            await logger.info("supplier.create succeeded", {
                module: "supplier.service",
                companyId,
                supplierId,
                tags: ["supplier", "create", "success"],
            });
            await SubscriptionLimitService.checkSupplierLimit(companyId, undefined);
            return this.mapSupplierToDto(supplier);
        }
        catch (error) {
            if (error instanceof SupplierError) {
                await logger.warn(`supplier.create failed: ${error.message}`, {
                    module: "supplier.service",
                    companyId,
                    tags: ["supplier", "create", "failed"],
                    code: error.code,
                });
                throw error;
            }
            await logger.error(error, {
                module: "supplier.service",
                companyId,
                tags: ["supplier", "create", "error"],
            });
            throw error;
        }
    }
    async getSupplier(companyId, supplierId) {
        await logger.info("supplier.read started", {
            module: "supplier.service",
            companyId,
            supplierId,
            tags: ["supplier", "read", "start"],
        });
        const supplier = await this.supplierRepository.findSupplierById(companyId, supplierId);
        if (!supplier) {
            throw new SupplierError(404, "Supplier not found");
        }
        await logger.info("supplier.read succeeded", {
            module: "supplier.service",
            companyId,
            supplierId,
            tags: ["supplier", "read", "success"],
        });
        return this.mapSupplierToDto(supplier);
    }
    async listSuppliers(companyId, filters, pagination) {
        await logger.info("supplier.list started", {
            module: "supplier.service",
            companyId,
            tags: ["supplier", "list", "start"],
        });
        const { suppliers, total } = await this.supplierRepository.listSuppliers(companyId, filters, pagination);
        const hasMore = pagination.offset + pagination.limit < total;
        await logger.info("supplier.list succeeded", {
            module: "supplier.service",
            companyId,
            count: suppliers.length,
            total,
            tags: ["supplier", "list", "success"],
        });
        return {
            items: suppliers.map((s) => this.mapSupplierToDto(s)),
            total,
            limit: pagination.limit,
            offset: pagination.offset,
            hasMore,
        };
    }
    async updateSupplier(companyId, supplierId, input) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await logger.info("supplier.update started", {
            module: "supplier.service",
            companyId,
            supplierId,
            tags: ["supplier", "update", "start"],
        });
        try {
            UpdateSupplierValidator.validate(input);
            const existing = await this.supplierRepository.findSupplierById(companyId, supplierId);
            if (!existing) {
                throw new SupplierError(404, "Supplier not found");
            }
            // % supplier's email can be updated too..
            // if (input.email && input.email !== existing.email) {
            //   const emailExists = await this.supplierRepository.findSupplierByEmail(
            //     companyId,
            //     input.email,
            //   );
            //   if (emailExists) {
            //     throw new SupplierError(409, "Email already in use for this company");
            //   }
            // }
            await this.supplierRepository.updateSupplier({
                companyId,
                supplierId,
                supplierName: input.supplierName,
                supplierType: input.supplierType,
                email: input.email,
                phone: input.phone,
                website: input.website,
                taxNumber: input.taxNumber,
                paymentTerms: input.paymentTerms,
                creditLimit: input.creditLimit ? String(input.creditLimit) : undefined,
                status: input.status,
            });
            const updated = await this.supplierRepository.findSupplierById(companyId, supplierId);
            if (!updated) {
                throw new SupplierError(500, "Failed to retrieve updated supplier");
            }
            await logger.info("supplier.update succeeded", {
                module: "supplier.service",
                companyId,
                supplierId,
                tags: ["supplier", "update", "success"],
            });
            return this.mapSupplierToDto(updated);
        }
        catch (error) {
            if (error instanceof SupplierError) {
                await logger.warn(`supplier.update failed: ${error.message}`, {
                    module: "supplier.service",
                    companyId,
                    supplierId,
                    tags: ["supplier", "update", "failed"],
                });
                throw error;
            }
            await logger.error(error, {
                module: "supplier.service",
                companyId,
                supplierId,
                tags: ["supplier", "update", "error"],
            });
            throw error;
        }
    }
    async deleteSupplier(companyId, supplierId) {
        await logger.info("supplier.delete started", {
            module: "supplier.service",
            companyId,
            supplierId,
            tags: ["supplier", "delete", "start"],
        });
        try {
            const existing = await this.supplierRepository.findSupplierById(companyId, supplierId);
            if (!existing) {
                throw new SupplierError(404, "Supplier not found");
            }
            await this.supplierRepository.deleteSupplier(companyId, supplierId);
            await logger.info("supplier.delete succeeded", {
                module: "supplier.service",
                companyId,
                supplierId,
                tags: ["supplier", "delete", "success"],
            });
        }
        catch (error) {
            if (error instanceof SupplierError) {
                await logger.warn(`supplier.delete failed: ${error.message}`, {
                    module: "supplier.service",
                    companyId,
                    supplierId,
                    tags: ["supplier", "delete", "failed"],
                });
                throw error;
            }
            await logger.error(error, {
                module: "supplier.service",
                companyId,
                supplierId,
                tags: ["supplier", "delete", "error"],
            });
            throw error;
        }
    }
    async addSupplierContact(companyId, supplierId, input) {
        await logger.info("supplier.contact.create started", {
            module: "supplier.service",
            companyId,
            supplierId,
            tags: ["supplier", "contact", "create", "start"],
        });
        try {
            CreateSupplierContactValidator.validate(input);
            const supplier = await this.supplierRepository.findSupplierById(companyId, supplierId);
            if (!supplier) {
                throw new SupplierError(404, "Supplier not found");
            }
            const { contactId } = await this.supplierRepository.createSupplierContact({
                supplierId,
                contactName: input.contactName,
                designation: input.designation,
                email: input.email,
                phone: input.phone,
                isPrimary: input.isPrimary,
            });
            const contacts = await this.supplierRepository.findSupplierContacts(supplierId);
            const contact = contacts.find((c) => c.id === contactId);
            if (!contact) {
                throw new SupplierError(500, "Failed to retrieve created contact");
            }
            await logger.info("supplier.contact.create succeeded", {
                module: "supplier.service",
                companyId,
                supplierId,
                contactId,
                tags: ["supplier", "contact", "create", "success"],
            });
            return {
                id: contact.id,
                contactName: contact.contactName,
                designation: contact.designation,
                email: contact.email,
                phone: contact.phone,
                isPrimary: contact.isPrimary,
            };
        }
        catch (error) {
            if (error instanceof SupplierError) {
                await logger.warn(`supplier.contact.create failed: ${error.message}`, {
                    module: "supplier.service",
                    companyId,
                    supplierId,
                    tags: ["supplier", "contact", "create", "failed"],
                });
                throw error;
            }
            await logger.error(error, {
                module: "supplier.service",
                companyId,
                supplierId,
                tags: ["supplier", "contact", "create", "error"],
            });
            throw error;
        }
    }
    async getSupplierContacts(companyId, supplierId) {
        const supplier = await this.supplierRepository.findSupplierById(companyId, supplierId);
        if (!supplier) {
            throw new SupplierError(404, "Supplier not found");
        }
        const contacts = await this.supplierRepository.findSupplierContacts(supplierId);
        return contacts.map((c) => ({
            id: c.id,
            contactName: c.contactName,
            designation: c.designation,
            email: c.email,
            phone: c.phone,
            isPrimary: c.isPrimary,
        }));
    }
    async updateSupplierContact(companyId, supplierId, contactId, input) {
        try {
            UpdateSupplierContactValidator.validate(input);
            const supplier = await this.supplierRepository.findSupplierById(companyId, supplierId);
            if (!supplier) {
                throw new SupplierError(404, "Supplier not found");
            }
            const contact = await this.supplierRepository.findSupplierContactById(supplierId, contactId);
            if (!contact) {
                throw new SupplierError(404, "Contact not found");
            }
            await this.supplierRepository.updateSupplierContact({
                supplierId,
                contactId,
                contactName: input.contactName,
                designation: input.designation,
                email: input.email,
                phone: input.phone,
                isPrimary: input.isPrimary,
            });
            const updated = await this.supplierRepository.findSupplierContactById(supplierId, contactId);
            if (!updated) {
                throw new SupplierError(500, "Failed to retrieve updated contact");
            }
            return {
                id: updated.id,
                contactName: updated.contactName,
                designation: updated.designation,
                email: updated.email,
                phone: updated.phone,
                isPrimary: updated.isPrimary,
            };
        }
        catch (error) {
            if (error instanceof SupplierError) {
                throw error;
            }
            throw error;
        }
    }
    async deleteSupplierContact(companyId, supplierId, contactId) {
        const supplier = await this.supplierRepository.findSupplierById(companyId, supplierId);
        if (!supplier) {
            throw new SupplierError(404, "Supplier not found");
        }
        const contact = await this.supplierRepository.findSupplierContactById(supplierId, contactId);
        if (!contact) {
            throw new SupplierError(404, "Contact not found");
        }
        if (contact.isPrimary) {
            throw new SupplierError(403, "Cannot delete primary contact");
        }
        await this.supplierRepository.deleteSupplierContact(supplierId, contactId);
    }
    async setPricing(companyId, supplierId, input) {
        try {
            CreateSupplierPricingValidator.validate(input);
            const supplier = await this.supplierRepository.findSupplierById(companyId, supplierId);
            if (!supplier) {
                throw new SupplierError(404, "Supplier not found");
            }
            const { pricingId } = await this.supplierRepository.createSupplierPricing({
                supplierId,
                productId: input.productId,
                minimumQuantity: String(input.minimumQuantity),
                unitCost: String(input.unitCost),
                currencyCode: input.currencyCode,
                leadTimeDays: input.leadTimeDays,
                effectiveFrom: input.effectiveFrom,
                effectiveTo: input.effectiveTo,
            });
            const pricing = await this.supplierRepository.findSupplierPricingById(pricingId);
            if (!pricing) {
                throw new SupplierError(500, "Failed to retrieve created pricing");
            }
            return {
                id: pricing.id,
                productId: pricing.productId,
                minimumQuantity: Number(pricing.minimumQuantity),
                unitCost: Number(pricing.unitCost),
                currencyCode: pricing.currencyCode,
                leadTimeDays: pricing.leadTimeDays,
                effectiveFrom: pricing.effectiveFrom.toISOString().split("T")[0],
                effectiveTo: pricing.effectiveTo ?
                    pricing.effectiveTo.toISOString().split("T")[0]
                    : undefined,
            };
        }
        catch (error) {
            if (error instanceof SupplierError) {
                throw error;
            }
            throw error;
        }
    }
    async getPricing(companyId, supplierId) {
        const supplier = await this.supplierRepository.findSupplierById(companyId, supplierId);
        if (!supplier) {
            throw new SupplierError(404, "Supplier not found");
        }
        const pricings = await this.supplierRepository.findSupplierPricing(supplierId);
        return pricings.map((p) => ({
            id: p.id,
            productId: p.productId,
            minimumQuantity: Number(p.minimumQuantity),
            unitCost: Number(p.unitCost),
            currencyCode: p.currencyCode,
            leadTimeDays: p.leadTimeDays,
            effectiveFrom: p.effectiveFrom.toISOString().split("T")[0],
            effectiveTo: p.effectiveTo ? p.effectiveTo.toISOString().split("T")[0] : undefined,
        }));
    }
    async updatePricing(companyId, supplierId, pricingId, input) {
        try {
            UpdateSupplierPricingValidator.validate(input);
            const supplier = await this.supplierRepository.findSupplierById(companyId, supplierId);
            if (!supplier) {
                throw new SupplierError(404, "Supplier not found");
            }
            const pricing = await this.supplierRepository.findSupplierPricingById(pricingId);
            if (!pricing || pricing.supplierId !== supplierId) {
                throw new SupplierError(404, "Pricing not found");
            }
            await this.supplierRepository.updateSupplierPricing({
                pricingId,
                minimumQuantity: input.minimumQuantity ? String(input.minimumQuantity) : undefined,
                unitCost: input.unitCost ? String(input.unitCost) : undefined,
                currencyCode: input.currencyCode,
                leadTimeDays: input.leadTimeDays,
                effectiveFrom: input.effectiveFrom,
                effectiveTo: input.effectiveTo,
            });
            const updated = await this.supplierRepository.findSupplierPricingById(pricingId);
            if (!updated) {
                throw new SupplierError(500, "Failed to retrieve updated pricing");
            }
            return {
                id: updated.id,
                productId: updated.productId,
                minimumQuantity: Number(updated.minimumQuantity),
                unitCost: Number(updated.unitCost),
                currencyCode: updated.currencyCode,
                leadTimeDays: updated.leadTimeDays,
                effectiveFrom: updated.effectiveFrom.toISOString().split("T")[0],
                effectiveTo: updated.effectiveTo ?
                    updated.effectiveTo.toISOString().split("T")[0]
                    : undefined,
            };
        }
        catch (error) {
            if (error instanceof SupplierError) {
                throw error;
            }
            throw error;
        }
    }
    async uploadDocument(companyId, supplierId, input, fileKey, fileName, fileSize, mimeType, userId) {
        try {
            UploadSupplierDocumentValidator.validate(input);
            const supplier = await this.supplierRepository.findSupplierById(companyId, supplierId);
            if (!supplier) {
                throw new SupplierError(404, "Supplier not found");
            }
            const { documentId } = await this.supplierRepository.createSupplierDocument({
                supplierId,
                documentType: input.documentType,
                fileName,
                fileKey,
                fileSize,
                mimeType,
                uploadedBy: userId,
                expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
            });
            const documents = await this.supplierRepository.findSupplierDocuments(supplierId);
            const doc = documents.find((d) => d.id === documentId);
            if (!doc) {
                throw new SupplierError(500, "Failed to retrieve created document");
            }
            return {
                id: doc.id,
                documentType: doc.documentType,
                fileName: doc.fileName,
                fileKey: doc.fileKey,
                fileSize: Number(doc.fileSize),
                mimeType: doc.mimeType,
                uploadedBy: doc.uploadedBy,
                uploadedAt: doc.uploadedAt.toISOString(),
                expiresAt: doc.expiresAt ? doc.expiresAt.toISOString() : undefined,
            };
        }
        catch (error) {
            if (error instanceof SupplierError) {
                throw error;
            }
            throw error;
        }
    }
    async getDocuments(companyId, supplierId) {
        const supplier = await this.supplierRepository.findSupplierById(companyId, supplierId);
        if (!supplier) {
            throw new SupplierError(404, "Supplier not found");
        }
        const documents = await this.supplierRepository.findSupplierDocuments(supplierId);
        return documents.map((d) => ({
            id: d.id,
            documentType: d.documentType,
            fileName: d.fileName,
            fileKey: d.fileKey,
            fileSize: Number(d.fileSize),
            mimeType: d.mimeType,
            uploadedBy: d.uploadedBy,
            uploadedAt: d.uploadedAt.toISOString(),
            expiresAt: d.expiresAt ? d.expiresAt.toISOString() : undefined,
        }));
    }
    async deleteDocument(companyId, supplierId, documentId) {
        const supplier = await this.supplierRepository.findSupplierById(companyId, supplierId);
        if (!supplier) {
            throw new SupplierError(404, "Supplier not found");
        }
        const documents = await this.supplierRepository.findSupplierDocuments(supplierId);
        const doc = documents.find((d) => d.id === documentId);
        if (!doc) {
            throw new SupplierError(404, "Document not found");
        }
        await this.supplierRepository.deleteSupplierDocument(documentId);
    }
    async getPerformance(companyId, supplierId) {
        const supplier = await this.supplierRepository.findSupplierById(companyId, supplierId);
        if (!supplier) {
            throw new SupplierError(404, "Supplier not found");
        }
        const performance = await this.supplierRepository.findSupplierPerformance(supplierId);
        return {
            id: performance?.id || "",
            supplierId,
            deliveryDelayDays: performance?.deliveryDelayDays ?
                Number(performance.deliveryDelayDays)
                : undefined,
            qualityScore: performance?.qualityScore ?
                Number(performance.qualityScore)
                : undefined,
            returnRate: performance?.returnRate ? Number(performance.returnRate) : undefined,
            orderFulfillmentAccuracy: performance?.orderFulfillmentAccuracy ?
                Number(performance.orderFulfillmentAccuracy)
                : undefined,
            overallRating: performance?.overallRating ?
                Number(performance.overallRating)
                : undefined,
            lastAssessmentDate: performance?.lastAssessmentDate?.toISOString(),
        };
    }
    async recordDeliveryDelay(supplierId, daysLate) {
        await this.supplierRepository.updateSupplierPerformance({
            supplierId,
            deliveryDelayDays: daysLate,
        });
    }
    async addNote(companyId, supplierId, input, userId) {
        const content = input.content ?? input.note;
        if (!content?.trim()) {
            throw new SupplierError(400, "Note content is required");
        }
        const supplier = await this.supplierRepository.findSupplierById(companyId, supplierId);
        if (!supplier) {
            throw new SupplierError(404, "Supplier not found");
        }
        const { noteId } = await this.supplierRepository.createSupplierNote({
            supplierId,
            content: content.trim(),
            createdBy: userId,
        });
        const notes = await this.supplierRepository.findSupplierNotes(supplierId);
        const note = notes.find((n) => n.id === noteId);
        if (!note) {
            throw new SupplierError(500, "Failed to retrieve created note");
        }
        return {
            id: note.id,
            content: note.content,
            createdBy: note.createdBy,
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt.toISOString(),
        };
    }
    async getNotes(companyId, supplierId) {
        const supplier = await this.supplierRepository.findSupplierById(companyId, supplierId);
        if (!supplier) {
            throw new SupplierError(404, "Supplier not found");
        }
        const notes = await this.supplierRepository.findSupplierNotes(supplierId);
        return notes.map((n) => ({
            id: n.id,
            content: n.content,
            createdBy: n.createdBy,
            createdAt: n.createdAt.toISOString(),
            updatedAt: n.updatedAt.toISOString(),
        }));
    }
    mapSupplierToDto(supplier) {
        return {
            id: supplier.id,
            supplierCode: supplier.supplierCode,
            supplierName: supplier.supplierName,
            supplierType: supplier.supplierType,
            email: supplier.email,
            phone: supplier.phone,
            website: supplier.website,
            taxNumber: supplier.taxNumber,
            paymentTerms: supplier.paymentTerms,
            creditLimit: supplier.creditLimit ? Number(supplier.creditLimit) : undefined,
            rating: supplier.rating ? Number(supplier.rating) : undefined,
            status: supplier.status,
            createdAt: supplier.createdAt.toISOString(),
            updatedAt: supplier.updatedAt.toISOString(),
        };
    }
    parsePaginationParams(query) {
        let limit = PAGINATION_DEFAULT_LIMIT;
        let offset = 0;
        if (query.limit) {
            limit = Math.min(parseInt(String(query.limit), 10), PAGINATION_MAX_LIMIT);
        }
        if (query.offset) {
            offset = Math.max(0, parseInt(String(query.offset), 10));
        }
        return { limit, offset };
    }
}
