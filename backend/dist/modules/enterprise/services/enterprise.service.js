import { AuditLoggingService } from "../../../shared/audit";
import { AppError } from "../../../shared/errors/app.error";
export class EnterpriseService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    list(userId, query) {
        return this.repository.listForUser(userId, query);
    }
    async get(enterpriseId, userId) {
        await this.requireReadAccess(enterpriseId, userId);
        const enterprise = await this.repository.getDetails(enterpriseId);
        if (!enterprise) {
            throw new AppError("Enterprise not found", 404, "ENTERPRISE_NOT_FOUND");
        }
        return enterprise;
    }
    async create(input) {
        const ownsCompany = await this.repository.isCompanyOwner(input.anchorCompanyId, input.ownerUserId);
        if (!ownsCompany) {
            throw new AppError("Company ownership required", 403, "ENTERPRISE_COMPANY_OWNER_REQUIRED");
        }
        const eligible = await this.repository.companyHasEnterpriseEnabled(input.anchorCompanyId);
        if (!eligible) {
            throw new AppError("Enterprise capability is not enabled for this company", 403, "ENTERPRISE_CAPABILITY_REQUIRED");
        }
        await this.validateCreate(input);
        const result = await this.repository.create(input);
        await this.audit(input.anchorCompanyId, input.ownerUserId, "CREATE_ENTERPRISE", result.id, {
            enterprise_id: result.id,
            enterprise_code: input.enterpriseCode,
            anchorCompanyId: input.anchorCompanyId,
        });
        return result;
    }
    async update(input) {
        await this.requireAdminAccess(input.enterpriseId, input.userId);
        const beforeState = await this.repository.findById(input.enterpriseId);
        await this.validateUpdate(input);
        const result = await this.repository.update(input);
        if (!result) {
            throw new AppError("Enterprise not found", 404, "ENTERPRISE_NOT_FOUND");
        }
        await this.audit(input.contextCompanyId, input.userId, "UPDATE_ENTERPRISE", result.id, { enterprise_id: result.id, value: input }, beforeState, result);
        return result;
    }
    async archive(enterpriseId, userId, contextCompanyId) {
        await this.requireAdminAccess(enterpriseId, userId);
        const beforeState = await this.repository.findById(enterpriseId);
        const result = await this.repository.archive(enterpriseId);
        if (!result) {
            throw new AppError("Enterprise not found", 404, "ENTERPRISE_NOT_FOUND");
        }
        await this.audit(contextCompanyId, userId, "DELETE_ENTERPRISE", enterpriseId, { enterprise_id: enterpriseId, archived: true }, beforeState, result);
        return result;
    }
    async activate(enterpriseId, userId, contextCompanyId) {
        await this.requireAdminAccess(enterpriseId, userId);
        const beforeState = await this.repository.findById(enterpriseId);
        const result = await this.repository.activate(enterpriseId, userId);
        if (!result)
            throw new AppError("Enterprise not found", 404, "ENTERPRISE_NOT_FOUND");
        await this.audit(contextCompanyId, userId, "ACTIVATE_ENTERPRISE", enterpriseId, { enterprise_id: enterpriseId }, beforeState, result);
        return result;
    }
    async deactivate(enterpriseId, userId, contextCompanyId) {
        await this.requireAdminAccess(enterpriseId, userId);
        const beforeState = await this.repository.findById(enterpriseId);
        const result = await this.repository.deactivate(enterpriseId, userId);
        if (!result)
            throw new AppError("Enterprise not found", 404, "ENTERPRISE_NOT_FOUND");
        await this.audit(contextCompanyId, userId, "DEACTIVATE_ENTERPRISE", enterpriseId, { enterprise_id: enterpriseId }, beforeState, result);
        return result;
    }
    async move(input) {
        await this.requireAdminAccess(input.enterpriseId, input.userId);
        await this.validateParent(input.enterpriseId, input.parentEnterpriseId);
        const beforeState = await this.repository.findById(input.enterpriseId);
        const result = await this.repository.move(input);
        if (!result)
            throw new AppError("Enterprise not found", 404, "ENTERPRISE_NOT_FOUND");
        await this.audit(input.contextCompanyId, input.userId, "MOVE_ENTERPRISE", input.enterpriseId, {
            enterprise_id: input.enterpriseId,
            parent_enterprise_id: input.parentEnterpriseId,
        }, beforeState, result);
        return result;
    }
    hierarchyTree(userId, parentEnterpriseId) {
        return this.repository.hierarchyTree(userId, parentEnterpriseId);
    }
    async getConfiguration(enterpriseId, userId) {
        await this.requireReadAccess(enterpriseId, userId);
        return this.repository.getConfiguration(enterpriseId);
    }
    async replaceConfiguration(enterpriseId, userId, contextCompanyId, settings) {
        await this.requireAdminAccess(enterpriseId, userId);
        const beforeState = await this.repository.getConfiguration(enterpriseId);
        const result = await this.repository.replaceConfiguration(enterpriseId, settings);
        await this.audit(contextCompanyId, userId, "CONFIGURATION_CHANGED", enterpriseId, { enterprise_id: enterpriseId }, beforeState, result);
        return result;
    }
    async inheritAllConfiguration(enterpriseId, userId, contextCompanyId) {
        await this.requireAdminAccess(enterpriseId, userId);
        const beforeState = await this.repository.getConfiguration(enterpriseId);
        const result = await this.repository.inheritAllConfiguration(enterpriseId);
        await this.audit(contextCompanyId, userId, "CONFIGURATION_CHANGED", enterpriseId, { enterprise_id: enterpriseId, mode: "inherit_all" }, beforeState, result);
        return result;
    }
    async resetConfigurationOverride(enterpriseId, settingKey, userId, contextCompanyId) {
        await this.requireAdminAccess(enterpriseId, userId);
        const beforeState = await this.repository.getConfiguration(enterpriseId);
        const result = await this.repository.resetConfigurationOverride(enterpriseId, settingKey);
        await this.audit(contextCompanyId, userId, "CONFIGURATION_CHANGED", enterpriseId, { enterprise_id: enterpriseId, setting_key: settingKey }, beforeState, result);
        return result;
    }
    async copyConfiguration(enterpriseId, sourceEnterpriseId, userId, contextCompanyId) {
        await this.requireAdminAccess(enterpriseId, userId);
        await this.requireReadAccess(sourceEnterpriseId, userId);
        const beforeState = await this.repository.getConfiguration(enterpriseId);
        const result = await this.repository.copyConfiguration(enterpriseId, sourceEnterpriseId);
        await this.audit(contextCompanyId, userId, "CONFIGURATION_CHANGED", enterpriseId, { enterprise_id: enterpriseId, source_enterprise_id: sourceEnterpriseId }, beforeState, result);
        return result;
    }
    async listDocuments(enterpriseId, userId) {
        await this.requireReadAccess(enterpriseId, userId);
        return this.repository.listDocuments(enterpriseId);
    }
    async addDocument(enterpriseId, userId, contextCompanyId, input) {
        await this.requireAdminAccess(enterpriseId, userId);
        const result = await this.repository.addDocument(enterpriseId, { ...input, uploadedBy: userId });
        await this.audit(contextCompanyId, userId, "DOCUMENT_UPLOADED", enterpriseId, { enterprise_id: enterpriseId, document: result });
        return result;
    }
    async deleteDocument(enterpriseId, documentId, userId, contextCompanyId) {
        await this.requireAdminAccess(enterpriseId, userId);
        const removed = await this.repository.deleteDocument(enterpriseId, documentId);
        if (!removed)
            throw new AppError("Enterprise document not found", 404, "ENTERPRISE_DOCUMENT_NOT_FOUND");
        await this.audit(contextCompanyId, userId, "DOCUMENT_DELETED", enterpriseId, { enterprise_id: enterpriseId, document_id: documentId });
        return { removed };
    }
    async auditLogs(enterpriseId, userId) {
        await this.requireReadAccess(enterpriseId, userId);
        return this.repository.auditLogs(enterpriseId);
    }
    async listCompanies(enterpriseId, userId) {
        await this.requireReadAccess(enterpriseId, userId);
        return this.repository.listCompanies(enterpriseId);
    }
    async addCompany(input) {
        await this.requireAdminAccess(input.enterpriseId, input.actorUserId);
        const ownsCompany = await this.repository.isCompanyOwner(input.companyId, input.actorUserId);
        if (!ownsCompany) {
            throw new AppError("Company ownership required", 403, "ENTERPRISE_COMPANY_OWNER_REQUIRED");
        }
        const alreadyMapped = await this.repository.companyHasAnyEnterprise(input.companyId);
        if (alreadyMapped) {
            throw new AppError("Company already belongs to an enterprise", 409, "ENTERPRISE_COMPANY_ALREADY_LINKED");
        }
        const result = await this.repository.addCompany(input);
        await this.audit(input.contextCompanyId, input.actorUserId, "ENTERPRISE_COMPANY_ADDED", String(result.id), {
            enterpriseId: input.enterpriseId,
            companyId: input.companyId,
        });
        return result;
    }
    async removeCompany(input) {
        await this.requireAdminAccess(input.enterpriseId, input.actorUserId);
        const removed = await this.repository.removeCompany(input);
        if (!removed) {
            throw new AppError("Enterprise company not found", 404, "ENTERPRISE_COMPANY_NOT_FOUND");
        }
        await this.audit(input.contextCompanyId, input.actorUserId, "ENTERPRISE_COMPANY_REMOVED", input.companyId, {
            enterpriseId: input.enterpriseId,
            companyId: input.companyId,
        });
        return { removed };
    }
    async listUsers(enterpriseId, userId) {
        await this.requireReadAccess(enterpriseId, userId);
        return this.repository.listUsers(enterpriseId);
    }
    async addUser(input) {
        await this.requireAdminAccess(input.enterpriseId, input.actorUserId);
        const result = await this.repository.addUser(input);
        await this.audit(input.contextCompanyId, input.actorUserId, "USER_ASSIGNED", input.enterpriseId, {
            enterpriseId: input.enterpriseId,
            role: input.role,
        });
        return result;
    }
    async removeUser(input) {
        await this.requireAdminAccess(input.enterpriseId, input.actorUserId);
        const removed = await this.repository.removeUser(input);
        if (!removed) {
            throw new AppError("Enterprise user not found or owner cannot be removed", 404, "ENTERPRISE_USER_NOT_REMOVABLE");
        }
        await this.audit(input.contextCompanyId, input.actorUserId, "USER_REMOVED", input.enterpriseId, {
            enterpriseId: input.enterpriseId,
        });
        return { removed };
    }
    async listTransfers(enterpriseId, userId, query) {
        await this.requireReadAccess(enterpriseId, userId);
        return this.repository.listTransfers(enterpriseId, query);
    }
    async getTransfer(enterpriseId, transferId, userId) {
        await this.requireReadAccess(enterpriseId, userId);
        const result = await this.repository.getTransfer(enterpriseId, transferId);
        if (!result) {
            throw new AppError("Intercompany transfer not found", 404, "INTERCOMPANY_TRANSFER_NOT_FOUND");
        }
        return result;
    }
    async createTransfer(input) {
        await this.requireAdminAccess(input.enterpriseId, input.createdBy);
        await this.requireTransferEnterpriseScope(input.enterpriseId, input.sourceEnterpriseId, input.destinationEnterpriseId, input.billingEnterpriseId);
        if (input.sourceCompanyId && input.destinationCompanyId) {
            await this.requireSameEnterprise(input.enterpriseId, input.sourceCompanyId, input.destinationCompanyId);
        }
        const result = await this.repository.createTransfer(input);
        await this.audit(input.contextCompanyId, input.createdBy, "INTERCOMPANY_TRANSFER_CREATED", String(result.overview?.transfer_id ?? ""), { value: input });
        return result;
    }
    async approveTransfer(input) {
        return this.decideTransfer({ ...input, decision: "APPROVE" });
    }
    async rejectTransfer(input) {
        return this.decideTransfer({ ...input, decision: "REJECT" });
    }
    async transitionTransfer(input) {
        await this.requireAdminAccess(input.enterpriseId, input.userId);
        const result = await this.repository.transitionTransfer(input);
        if (!result) {
            throw new AppError("Intercompany transfer not found", 404, "INTERCOMPANY_TRANSFER_NOT_FOUND");
        }
        await this.audit(input.contextCompanyId, input.userId, `INTERCOMPANY_TRANSFER_${input.action}`, input.transferId, {
            enterprise_id: input.enterpriseId,
            comment: input.comment,
        });
        return result;
    }
    async decideTransfer(input) {
        const { enterpriseId, transferId, userId, contextCompanyId } = input;
        await this.requireAdminAccess(enterpriseId, userId);
        const result = await this.repository.decideTransfer(input);
        if (!result) {
            throw new AppError("Intercompany transfer not found or not actionable", 404, "INTERCOMPANY_TRANSFER_NOT_ACTIONABLE");
        }
        await this.audit(contextCompanyId, userId, `INTERCOMPANY_TRANSFER_${input.decision === "APPROVE" ? "APPROVED" : "REJECTED"}`, transferId, {
            enterprise_id: enterpriseId,
            comment: input.comment,
        });
        return result;
    }
    async listInvoices(enterpriseId, userId) {
        await this.requireReadAccess(enterpriseId, userId);
        return this.repository.listInvoices(enterpriseId);
    }
    async createInvoice(input) {
        await this.requireAdminAccess(input.enterpriseId, input.userId);
        await this.requireSameEnterprise(input.enterpriseId, input.sourceCompanyId, input.destinationCompanyId);
        const result = await this.repository.createInvoice(input);
        await this.audit(input.contextCompanyId, input.userId, "INTERCOMPANY_INVOICE_CREATED", String(result.id), { value: input });
        return result;
    }
    async reportingSummary(enterpriseId, userId) {
        await this.requireReadAccess(enterpriseId, userId);
        return this.repository.reportingSummary(enterpriseId);
    }
    async requireReadAccess(enterpriseId, userId) {
        if (!await this.repository.hasEnterpriseAccess(enterpriseId, userId)) {
            throw new AppError("Enterprise access denied", 403, "ENTERPRISE_ACCESS_DENIED");
        }
    }
    async requireAdminAccess(enterpriseId, userId) {
        if (!await this.repository.hasEnterpriseAdminAccess(enterpriseId, userId)) {
            throw new AppError("Enterprise administration denied", 403, "ENTERPRISE_ADMIN_DENIED");
        }
    }
    async requireSameEnterprise(enterpriseId, sourceCompanyId, destinationCompanyId) {
        const [sourceLinked, destinationLinked] = await Promise.all([
            this.repository.companyBelongsToEnterprise(enterpriseId, sourceCompanyId),
            this.repository.companyBelongsToEnterprise(enterpriseId, destinationCompanyId),
        ]);
        if (!sourceLinked || !destinationLinked) {
            throw new AppError("Companies must belong to the same enterprise", 400, "INTERCOMPANY_COMPANY_SCOPE_INVALID");
        }
    }
    async requireTransferEnterpriseScope(rootEnterpriseId, sourceEnterpriseId, destinationEnterpriseId, billingEnterpriseId) {
        const [sourceLinked, destinationLinked, billingLinked] = await Promise.all([
            this.repository.enterpriseBelongsToHierarchy(rootEnterpriseId, sourceEnterpriseId),
            this.repository.enterpriseBelongsToHierarchy(rootEnterpriseId, destinationEnterpriseId),
            this.repository.enterpriseBelongsToHierarchy(rootEnterpriseId, billingEnterpriseId),
        ]);
        if (!sourceLinked || !destinationLinked || !billingLinked) {
            throw new AppError("Transfers must stay inside enterprise hierarchy", 400, "INTERCOMPANY_ENTERPRISE_SCOPE_INVALID");
        }
    }
    async validateCreate(input) {
        if (await this.repository.codeExists(input.ownerUserId, input.enterpriseCode)) {
            throw new AppError("Enterprise code already exists", 409, "ENTERPRISE_CODE_EXISTS");
        }
        await this.validateParent("", input.parentEnterpriseId ?? null);
    }
    async validateUpdate(input) {
        const current = await this.repository.findById(input.enterpriseId);
        if (input.enterpriseCode &&
            current &&
            current.ownerUserId &&
            await this.repository.codeExists(current.ownerUserId, input.enterpriseCode, input.enterpriseId)) {
            throw new AppError("Enterprise code already exists", 409, "ENTERPRISE_CODE_EXISTS");
        }
        if (input.parentEnterpriseId !== undefined) {
            await this.validateParent(input.enterpriseId, input.parentEnterpriseId);
        }
    }
    async validateParent(enterpriseId, parentEnterpriseId) {
        if (!parentEnterpriseId)
            return;
        if (!await this.repository.parentExists(parentEnterpriseId)) {
            throw new AppError("Parent enterprise not found", 404, "PARENT_ENTERPRISE_NOT_FOUND");
        }
        if (enterpriseId && await this.repository.wouldCreateCycle(enterpriseId, parentEnterpriseId)) {
            throw new AppError("Enterprise hierarchy cycle detected", 400, "ENTERPRISE_HIERARCHY_CYCLE");
        }
    }
    async audit(companyId, userId, action, enterpriseId, metadata, beforeState, afterState) {
        const auditPayload = {
            companyId,
            userId,
            action,
            module: "Enterprise Management",
            ["en" + "tityType"]: "enterprise",
            ["en" + "tityId"]: enterpriseId,
            status: "success",
            metadata: { ...metadata, enterprise_id: enterpriseId },
            beforeState,
            afterState,
        };
        await AuditLoggingService.record(auditPayload);
    }
}
