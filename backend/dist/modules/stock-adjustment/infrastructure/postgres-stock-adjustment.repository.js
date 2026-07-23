import { randomUUID } from "crypto";
import { and, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { Db1Connection, Db2Connection } from "../../../infrastructure/database";
import { usersTable, workflowDefinitionsTable, workflowStepsTable, approvalRequestsTable, approvalDecisionsTable, userRolesTable, rolesTable, } from "../../../infrastructure/database/postgres/schemas/db1";
import { stockAdjustmentItemsTable, stockAdjustmentsTable, stockItemsTable, stockMovementsTable, productVariantsTable, productsTable, warehousesTable, warehouseZonesTable, binLocationsTable, stockAdjustmentAttachmentsTable, stockAdjustmentCommentsTable, stockAdjustmentApprovalsTable, stockAdjustmentAuditLogsTable, unitsOfMeasureTable, } from "../../../infrastructure/database/postgres/schemas/db2";
import { AppError } from "../../../shared/errors/app.error";
export class PostgresStockAdjustmentRepository {
    async create(input, requiresApproval, approvalThreshold) {
        const [duplicate] = await Db2Connection.getInstance()
            .select({ id: stockAdjustmentsTable.id, status: stockAdjustmentsTable.status })
            .from(stockAdjustmentsTable)
            .where(and(eq(stockAdjustmentsTable.companyId, input.companyId), eq(stockAdjustmentsTable.idempotencyKey, input.idempotencyKey)))
            .limit(1);
        if (duplicate) {
            return { adjustmentId: duplicate.id, status: String(duplicate.status) };
        }
        const adjustmentId = randomUUID();
        const isDraft = input.status === "draft";
        const status = input.status || (requiresApproval ? "pending_approval" : "approved");
        await Db2Connection.getInstance().transaction(async (tx) => {
            const sequenceNumber = await this.generateAdjustmentNumber(tx, input.companyId);
            // Resolve next approver if workflow definition is provided
            let nextApproverUserId = input.nextApproverUserId || null;
            if (!isDraft && requiresApproval && input.workflowDefinitionId) {
                const db1 = Db1Connection.getInstance();
                const [firstStep] = await db1
                    .select({ approverUserId: workflowStepsTable.approverUserId })
                    .from(workflowStepsTable)
                    .where(eq(workflowStepsTable.workflowDefinitionId, input.workflowDefinitionId))
                    .orderBy(workflowStepsTable.stepOrder)
                    .limit(1);
                if (firstStep?.approverUserId) {
                    nextApproverUserId = firstStep.approverUserId;
                }
            }
            await tx.insert(stockAdjustmentsTable).values({
                id: adjustmentId,
                companyId: input.companyId,
                warehouseId: input.warehouseId,
                adjustmentNumber: sequenceNumber,
                idempotencyKey: input.idempotencyKey,
                adjustmentType: input.adjustmentType,
                reason: input.reason,
                notes: input.notes,
                status,
                approvalThreshold: String(approvalThreshold),
                evidence: input.evidence ?? {},
                approvedBy: status === "approved" ? input.createdBy : undefined,
                approvedAt: status === "approved" ? new Date() : undefined,
                createdBy: input.createdBy,
                createdAt: new Date(),
                updatedAt: new Date(),
                version: 1,
                referenceNumber: input.referenceNumber,
                department: input.department,
                reasonCode: input.reasonCode,
                reasonDescription: input.reasonDescription,
                adjustmentAccount: input.adjustmentAccount,
                tags: input.tags ?? {},
                adjustmentDate: input.adjustmentDate ? new Date(input.adjustmentDate) : new Date(),
                locationId: input.locationId || null,
                approvalRequired: requiresApproval,
                workflowDefinitionId: input.workflowDefinitionId || null,
                nextApproverUserId,
                ipAddress: input.ipAddress || null,
            });
            const lines = input.lines || [];
            if (lines.length === 0 && input.stockItemId) {
                const [stockItem] = await tx.select().from(stockItemsTable).where(eq(stockItemsTable.id, input.stockItemId)).limit(1);
                if (stockItem) {
                    const delta = this.delta(input.adjustmentType, input.quantity || 0);
                    await tx.insert(stockAdjustmentItemsTable).values({
                        id: randomUUID(),
                        stockAdjustmentId: adjustmentId,
                        stockItemId: input.stockItemId,
                        productId: stockItem.productId,
                        productVariantId: stockItem.productVariantId,
                        lotNumber: null,
                        batchNumber: null,
                        serialNumber: null,
                        binLocationId: stockItem.binLocationId,
                        uomId: null,
                        quantityBefore: String(stockItem.quantityOnHand ?? 0),
                        quantityAfter: String(Number(stockItem.quantityOnHand ?? 0) + delta),
                        adjustedQuantity: String(delta),
                        unitCost: stockItem.averageCost || "0",
                        reason: input.reason,
                        evidence: input.evidence ?? {},
                        totalValue: String(delta * Number(stockItem.averageCost || 0)),
                        onHandQuantity: String(stockItem.quantityOnHand ?? 0),
                        expiryDate: null,
                    });
                }
            }
            else {
                for (const line of lines) {
                    let productId = line.productId;
                    let unitCost = line.unitCost;
                    const binLocationId = line.binLocationId;
                    const [variant] = await tx.select().from(productVariantsTable).where(eq(productVariantsTable.id, line.productVariantId)).limit(1);
                    if (variant) {
                        if (!productId)
                            productId = variant.productId || undefined;
                        if (unitCost === undefined || unitCost === null) {
                            unitCost = Number(variant.costPrice || 0);
                        }
                    }
                    let stockItemId = line.stockItemId || null;
                    let before = 0;
                    if (stockItemId) {
                        const [stockItem] = await tx.select().from(stockItemsTable).where(eq(stockItemsTable.id, stockItemId)).limit(1);
                        if (stockItem) {
                            before = Number(stockItem.quantityOnHand ?? 0);
                        }
                    }
                    else {
                        const conditions = [
                            eq(stockItemsTable.companyId, input.companyId),
                            eq(stockItemsTable.productVariantId, line.productVariantId),
                            eq(stockItemsTable.warehouseId, input.warehouseId),
                        ];
                        if (binLocationId) {
                            conditions.push(eq(stockItemsTable.binLocationId, binLocationId));
                        }
                        else {
                            conditions.push(isNull(stockItemsTable.binLocationId));
                        }
                        const [stockItem] = await tx.select().from(stockItemsTable).where(and(...conditions)).limit(1);
                        if (stockItem) {
                            stockItemId = stockItem.id;
                            before = Number(stockItem.quantityOnHand ?? 0);
                        }
                    }
                    const after = before + line.adjustedQuantity;
                    const totalVal = line.adjustedQuantity * (unitCost || 0);
                    await tx.insert(stockAdjustmentItemsTable).values({
                        id: randomUUID(),
                        stockAdjustmentId: adjustmentId,
                        stockItemId: stockItemId || undefined,
                        productId: productId || null,
                        productVariantId: line.productVariantId,
                        lotNumber: line.lotNumber || null,
                        batchNumber: line.batchNumber || null,
                        serialNumber: line.serialNumber || null,
                        binLocationId: binLocationId || null,
                        uomId: line.uomId || null,
                        quantityBefore: String(before),
                        quantityAfter: String(after),
                        adjustedQuantity: String(line.adjustedQuantity),
                        unitCost: unitCost !== undefined ? String(unitCost) : "0",
                        reason: line.reason || input.reason,
                        evidence: line.evidence ?? {},
                        totalValue: String(totalVal),
                        onHandQuantity: String(before),
                        expiryDate: line.expiryDate ? new Date(line.expiryDate) : null,
                    });
                }
            }
            const auditAction = isDraft ? "Draft saved" : "Adjustment created";
            await this.logAudit(tx, input.companyId, adjustmentId, input.createdBy, auditAction, `Status: ${status}`);
            if (!isDraft && requiresApproval && nextApproverUserId) {
                await this.logAudit(tx, input.companyId, adjustmentId, input.createdBy, "Approval assigned", `Assigned to: ${nextApproverUserId}`);
            }
            if (status === "approved") {
                await this.applyAdjustmentLines(tx, input.companyId, adjustmentId, input.createdBy, input.idempotencyKey);
            }
        });
        return { adjustmentId, status };
    }
    async update(adjustmentId, input, requiresApproval, approvalThreshold) {
        const db = Db2Connection.getInstance();
        const [curr] = await db.select().from(stockAdjustmentsTable).where(and(eq(stockAdjustmentsTable.id, adjustmentId), eq(stockAdjustmentsTable.companyId, input.companyId))).limit(1);
        if (!curr) {
            throw new AppError("Adjustment not found", 404, "ADJUSTMENT_NOT_FOUND");
        }
        if (curr.status !== "draft" && curr.status !== "changes_requested") {
            throw new AppError("Only drafts or adjustments requesting changes can be updated", 400, "INVALID_STATE");
        }
        const isDraft = input.status === "draft";
        const status = input.status || (requiresApproval ? "pending_approval" : "approved");
        await db.transaction(async (tx) => {
            let nextApproverUserId = input.nextApproverUserId !== undefined ? input.nextApproverUserId : curr.nextApproverUserId;
            if (!isDraft && requiresApproval && input.workflowDefinitionId) {
                const db1 = Db1Connection.getInstance();
                const [firstStep] = await db1
                    .select({ approverUserId: workflowStepsTable.approverUserId })
                    .from(workflowStepsTable)
                    .where(eq(workflowStepsTable.workflowDefinitionId, input.workflowDefinitionId))
                    .orderBy(workflowStepsTable.stepOrder)
                    .limit(1);
                if (firstStep?.approverUserId) {
                    nextApproverUserId = firstStep.approverUserId;
                }
            }
            await tx.update(stockAdjustmentsTable).set({
                warehouseId: input.warehouseId || curr.warehouseId,
                adjustmentType: input.adjustmentType || curr.adjustmentType,
                reason: input.reason || curr.reason,
                notes: input.notes !== undefined ? input.notes : curr.notes,
                status,
                approvalThreshold: String(approvalThreshold),
                evidence: input.evidence ?? curr.evidence ?? {},
                approvedBy: status === "approved" ? input.updatedBy : undefined,
                approvedAt: status === "approved" ? new Date() : undefined,
                updatedAt: new Date(),
                version: sql `coalesce(${stockAdjustmentsTable.version}, 0) + 1`,
                referenceNumber: input.referenceNumber !== undefined ? input.referenceNumber : curr.referenceNumber,
                department: input.department !== undefined ? input.department : curr.department,
                reasonCode: input.reasonCode !== undefined ? input.reasonCode : curr.reasonCode,
                reasonDescription: input.reasonDescription !== undefined ? input.reasonDescription : curr.reasonDescription,
                adjustmentAccount: input.adjustmentAccount !== undefined ? input.adjustmentAccount : curr.adjustmentAccount,
                tags: input.tags ?? curr.tags ?? {},
                adjustmentDate: input.adjustmentDate ? new Date(input.adjustmentDate) : (curr.adjustmentDate ? new Date(curr.adjustmentDate) : undefined),
                locationId: input.locationId !== undefined ? input.locationId : curr.locationId,
                approvalRequired: requiresApproval,
                workflowDefinitionId: input.workflowDefinitionId !== undefined ? input.workflowDefinitionId : curr.workflowDefinitionId,
                nextApproverUserId,
                ipAddress: input.ipAddress !== undefined ? input.ipAddress : curr.ipAddress,
            }).where(eq(stockAdjustmentsTable.id, adjustmentId));
            if (input.lines) {
                await tx.delete(stockAdjustmentItemsTable).where(eq(stockAdjustmentItemsTable.stockAdjustmentId, adjustmentId));
                const warehouseId = input.warehouseId || curr.warehouseId;
                for (const line of input.lines) {
                    let productId = line.productId;
                    let unitCost = line.unitCost;
                    const binLocationId = line.binLocationId;
                    const [variant] = await tx.select().from(productVariantsTable).where(eq(productVariantsTable.id, line.productVariantId)).limit(1);
                    if (variant) {
                        if (!productId)
                            productId = variant.productId || undefined;
                        if (unitCost === undefined || unitCost === null) {
                            unitCost = Number(variant.costPrice || 0);
                        }
                    }
                    let stockItemId = line.stockItemId || null;
                    let before = 0;
                    if (stockItemId) {
                        const [stockItem] = await tx.select().from(stockItemsTable).where(eq(stockItemsTable.id, stockItemId)).limit(1);
                        if (stockItem) {
                            before = Number(stockItem.quantityOnHand ?? 0);
                        }
                    }
                    else if (warehouseId) {
                        const conditions = [
                            eq(stockItemsTable.companyId, input.companyId),
                            eq(stockItemsTable.productVariantId, line.productVariantId),
                            eq(stockItemsTable.warehouseId, warehouseId),
                        ];
                        if (binLocationId) {
                            conditions.push(eq(stockItemsTable.binLocationId, binLocationId));
                        }
                        else {
                            conditions.push(isNull(stockItemsTable.binLocationId));
                        }
                        const [stockItem] = await tx.select().from(stockItemsTable).where(and(...conditions)).limit(1);
                        if (stockItem) {
                            stockItemId = stockItem.id;
                            before = Number(stockItem.quantityOnHand ?? 0);
                        }
                    }
                    const after = before + line.adjustedQuantity;
                    const totalVal = line.adjustedQuantity * (unitCost || 0);
                    await tx.insert(stockAdjustmentItemsTable).values({
                        id: randomUUID(),
                        stockAdjustmentId: adjustmentId,
                        stockItemId: stockItemId || undefined,
                        productId: productId || null,
                        productVariantId: line.productVariantId,
                        lotNumber: line.lotNumber || null,
                        batchNumber: line.batchNumber || null,
                        serialNumber: line.serialNumber || null,
                        binLocationId: binLocationId || null,
                        uomId: line.uomId || null,
                        quantityBefore: String(before),
                        quantityAfter: String(after),
                        adjustedQuantity: String(line.adjustedQuantity),
                        unitCost: unitCost !== undefined ? String(unitCost) : "0",
                        reason: line.reason || input.reason || curr.reason || "",
                        evidence: line.evidence ?? {},
                        totalValue: String(totalVal),
                        onHandQuantity: String(before),
                        expiryDate: line.expiryDate ? new Date(line.expiryDate) : null,
                    });
                }
            }
            const auditAction = isDraft ? "Draft saved" : "Adjustment updated";
            await this.logAudit(tx, input.companyId, adjustmentId, input.updatedBy, auditAction, `Status: ${status}`);
            if (!isDraft && requiresApproval && nextApproverUserId) {
                await this.logAudit(tx, input.companyId, adjustmentId, input.updatedBy, "Approval assigned", `Assigned to: ${nextApproverUserId}`);
            }
            if (status === "approved") {
                await this.applyAdjustmentLines(tx, input.companyId, adjustmentId, input.updatedBy, `update:${adjustmentId}`);
            }
        });
        return { adjustmentId, status };
    }
    async setApprovalRequestId(companyId, adjustmentId, approvalRequestId) {
        const db = Db2Connection.getInstance();
        const db1 = Db1Connection.getInstance();
        const [req] = await db1
            .select({ workflowDefinitionId: approvalRequestsTable.workflowDefinitionId })
            .from(approvalRequestsTable)
            .where(eq(approvalRequestsTable.id, approvalRequestId))
            .limit(1);
        let nextApproverUserId = null;
        if (req?.workflowDefinitionId) {
            const [firstStep] = await db1
                .select({ approverUserId: workflowStepsTable.approverUserId })
                .from(workflowStepsTable)
                .where(eq(workflowStepsTable.workflowDefinitionId, req.workflowDefinitionId))
                .orderBy(workflowStepsTable.stepOrder)
                .limit(1);
            if (firstStep?.approverUserId) {
                nextApproverUserId = firstStep.approverUserId;
            }
        }
        const [updated] = await db
            .update(stockAdjustmentsTable)
            .set({
            approvalRequestId,
            nextApproverUserId: nextApproverUserId || undefined,
            updatedAt: new Date(),
        })
            .where(and(eq(stockAdjustmentsTable.id, adjustmentId), eq(stockAdjustmentsTable.companyId, companyId)))
            .returning({ id: stockAdjustmentsTable.id });
        if (!updated) {
            throw new AppError("Adjustment not found", 404, "ADJUSTMENT_NOT_FOUND");
        }
    }
    async approve(input) {
        await Db2Connection.getInstance().transaction(async (tx) => {
            const [adj] = await tx.select().from(stockAdjustmentsTable).where(and(eq(stockAdjustmentsTable.id, input.adjustmentId), eq(stockAdjustmentsTable.companyId, input.companyId))).limit(1);
            if (!adj)
                throw new AppError("Adjustment not found", 404, "ADJUSTMENT_NOT_FOUND");
            if (adj.status !== "pending_approval") {
                throw new AppError("Adjustment is not pending approval", 400, "INVALID_STATE");
            }
            await this.applyAdjustmentLines(tx, input.companyId, input.adjustmentId, input.actorId, `approve:${input.adjustmentId}`);
            await tx.update(stockAdjustmentsTable).set({
                status: "approved",
                approvedBy: input.actorId,
                approvedAt: new Date(),
                completedAt: new Date(),
                updatedAt: new Date(),
                nextApproverUserId: null,
                version: sql `coalesce(${stockAdjustmentsTable.version}, 0) + 1`,
            }).where(eq(stockAdjustmentsTable.id, input.adjustmentId));
            await tx.insert(stockAdjustmentApprovalsTable).values({
                id: randomUUID(),
                companyId: input.companyId,
                stockAdjustmentId: input.adjustmentId,
                approverUserId: input.actorId,
                status: "approved",
                comments: "Approved via workflow decision",
                decidedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await this.logAudit(tx, input.companyId, input.adjustmentId, input.actorId, "Approved");
            await this.logAudit(tx, input.companyId, input.adjustmentId, input.actorId, "Inventory posted");
        });
    }
    async reject(input) {
        await Db2Connection.getInstance().transaction(async (tx) => {
            const [updated] = await tx.update(stockAdjustmentsTable).set({
                status: "rejected",
                rejectedBy: input.actorId,
                rejectedAt: new Date(),
                updatedAt: new Date(),
                nextApproverUserId: null,
                version: sql `coalesce(${stockAdjustmentsTable.version}, 0) + 1`,
            }).where(and(eq(stockAdjustmentsTable.id, input.adjustmentId), eq(stockAdjustmentsTable.companyId, input.companyId), eq(stockAdjustmentsTable.status, "pending_approval"))).returning({ id: stockAdjustmentsTable.id });
            if (!updated)
                throw new AppError("Pending adjustment not found", 404, "ADJUSTMENT_NOT_FOUND");
            await tx.insert(stockAdjustmentApprovalsTable).values({
                id: randomUUID(),
                companyId: input.companyId,
                stockAdjustmentId: input.adjustmentId,
                approverUserId: input.actorId,
                status: "rejected",
                comments: "Rejected via workflow decision",
                decidedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await this.logAudit(tx, input.companyId, input.adjustmentId, input.actorId, "Rejected");
        });
    }
    async submit(companyId, adjustmentId, actorId, requiresApproval, approvalThreshold) {
        const db = Db2Connection.getInstance();
        const [curr] = await db.select().from(stockAdjustmentsTable).where(and(eq(stockAdjustmentsTable.id, adjustmentId), eq(stockAdjustmentsTable.companyId, companyId))).limit(1);
        if (!curr) {
            throw new AppError("Adjustment not found", 404, "ADJUSTMENT_NOT_FOUND");
        }
        if (curr.status !== "draft" && curr.status !== "changes_requested") {
            throw new AppError("Only drafts or adjustments requesting changes can be submitted", 400, "INVALID_STATE");
        }
        const status = requiresApproval ? "pending_approval" : "approved";
        await db.transaction(async (tx) => {
            let nextApproverUserId = null;
            if (requiresApproval && curr.workflowDefinitionId) {
                const db1 = Db1Connection.getInstance();
                const [firstStep] = await db1
                    .select({ approverUserId: workflowStepsTable.approverUserId })
                    .from(workflowStepsTable)
                    .where(eq(workflowStepsTable.workflowDefinitionId, curr.workflowDefinitionId))
                    .orderBy(workflowStepsTable.stepOrder)
                    .limit(1);
                if (firstStep?.approverUserId) {
                    nextApproverUserId = firstStep.approverUserId;
                }
            }
            await tx.update(stockAdjustmentsTable).set({
                status,
                approvalThreshold: String(approvalThreshold),
                submittedAt: new Date(),
                updatedAt: new Date(),
                nextApproverUserId: nextApproverUserId || undefined,
                version: sql `coalesce(${stockAdjustmentsTable.version}, 0) + 1`,
            }).where(eq(stockAdjustmentsTable.id, adjustmentId));
            await this.logAudit(tx, companyId, adjustmentId, actorId, "Submitted for approval", `Requires approval: ${requiresApproval}`);
            if (requiresApproval && nextApproverUserId) {
                await this.logAudit(tx, companyId, adjustmentId, actorId, "Approval assigned", `Assigned to: ${nextApproverUserId}`);
            }
            if (status === "approved") {
                await this.applyAdjustmentLines(tx, companyId, adjustmentId, actorId, `submit:${adjustmentId}`);
                await this.logAudit(tx, companyId, adjustmentId, actorId, "Inventory posted");
            }
        });
        return { status };
    }
    async cancel(companyId, adjustmentId, actorId) {
        const db = Db2Connection.getInstance();
        const [curr] = await db.select().from(stockAdjustmentsTable).where(and(eq(stockAdjustmentsTable.id, adjustmentId), eq(stockAdjustmentsTable.companyId, companyId))).limit(1);
        if (!curr) {
            throw new AppError("Adjustment not found", 404, "ADJUSTMENT_NOT_FOUND");
        }
        if (curr.status !== "draft" && curr.status !== "pending_approval") {
            throw new AppError("Only drafts or pending approval adjustments can be cancelled", 400, "INVALID_STATE");
        }
        await db.transaction(async (tx) => {
            await tx.update(stockAdjustmentsTable).set({
                status: "cancelled",
                cancelledAt: new Date(),
                updatedAt: new Date(),
                nextApproverUserId: null,
                version: sql `coalesce(${stockAdjustmentsTable.version}, 0) + 1`,
            }).where(eq(stockAdjustmentsTable.id, adjustmentId));
            await this.logAudit(tx, companyId, adjustmentId, actorId, "Cancelled");
        });
    }
    async requestChanges(companyId, adjustmentId, actorId, comments) {
        const db = Db2Connection.getInstance();
        const [curr] = await db.select().from(stockAdjustmentsTable).where(and(eq(stockAdjustmentsTable.id, adjustmentId), eq(stockAdjustmentsTable.companyId, companyId))).limit(1);
        if (!curr) {
            throw new AppError("Adjustment not found", 404, "ADJUSTMENT_NOT_FOUND");
        }
        if (curr.status !== "pending_approval") {
            throw new AppError("Only pending approval adjustments can request changes", 400, "INVALID_STATE");
        }
        await db.transaction(async (tx) => {
            await tx.update(stockAdjustmentsTable).set({
                status: "changes_requested",
                updatedAt: new Date(),
                nextApproverUserId: null,
                version: sql `coalesce(${stockAdjustmentsTable.version}, 0) + 1`,
            }).where(eq(stockAdjustmentsTable.id, adjustmentId));
            await tx.insert(stockAdjustmentApprovalsTable).values({
                id: randomUUID(),
                companyId,
                stockAdjustmentId: adjustmentId,
                approverUserId: actorId,
                status: "changes_requested",
                comments: comments || null,
                decidedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            if (comments) {
                await tx.insert(stockAdjustmentCommentsTable).values({
                    id: randomUUID(),
                    companyId,
                    stockAdjustmentId: adjustmentId,
                    commentText: comments,
                    commentType: "internal",
                    createdBy: actorId,
                    createdAt: new Date(),
                });
            }
            await this.logAudit(tx, companyId, adjustmentId, actorId, "Changes requested", comments);
        });
    }
    async reassign(companyId, adjustmentId, actorId, reassignedToUserId, comments) {
        const db = Db2Connection.getInstance();
        const [curr] = await db.select().from(stockAdjustmentsTable).where(and(eq(stockAdjustmentsTable.id, adjustmentId), eq(stockAdjustmentsTable.companyId, companyId))).limit(1);
        if (!curr) {
            throw new AppError("Adjustment not found", 404, "ADJUSTMENT_NOT_FOUND");
        }
        if (curr.status !== "pending_approval") {
            throw new AppError("Only pending approval adjustments can be reassigned", 400, "INVALID_STATE");
        }
        await db.transaction(async (tx) => {
            await tx.update(stockAdjustmentsTable).set({
                nextApproverUserId: reassignedToUserId,
                updatedAt: new Date(),
                version: sql `coalesce(${stockAdjustmentsTable.version}, 0) + 1`,
            }).where(eq(stockAdjustmentsTable.id, adjustmentId));
            await tx.insert(stockAdjustmentApprovalsTable).values({
                id: randomUUID(),
                companyId,
                stockAdjustmentId: adjustmentId,
                approverUserId: actorId,
                status: "reassigned",
                comments: comments || null,
                reassignedToUserId,
                decidedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            if (comments) {
                await tx.insert(stockAdjustmentCommentsTable).values({
                    id: randomUUID(),
                    companyId,
                    stockAdjustmentId: adjustmentId,
                    commentText: comments,
                    commentType: "internal",
                    createdBy: actorId,
                    createdAt: new Date(),
                });
            }
            await this.logAudit(tx, companyId, adjustmentId, actorId, "Approval reassigned", comments);
        });
    }
    async addComment(companyId, adjustmentId, commentText, commentType, createdBy) {
        const db = Db2Connection.getInstance();
        await db.transaction(async (tx) => {
            await tx.insert(stockAdjustmentCommentsTable).values({
                id: randomUUID(),
                companyId,
                stockAdjustmentId: adjustmentId,
                commentText,
                commentType,
                createdBy,
                createdAt: new Date(),
            });
            await this.logAudit(tx, companyId, adjustmentId, createdBy, "Comment added");
        });
    }
    async addAttachment(companyId, adjustmentId, fileName, fileSize, contentType, fileUrl, uploadedBy) {
        const db = Db2Connection.getInstance();
        await db.transaction(async (tx) => {
            await tx.insert(stockAdjustmentAttachmentsTable).values({
                id: randomUUID(),
                companyId,
                stockAdjustmentId: adjustmentId,
                fileName,
                fileSize,
                contentType,
                fileUrl,
                uploadedBy,
                uploadedAt: new Date(),
            });
            await this.logAudit(tx, companyId, adjustmentId, uploadedBy, `Attachment uploaded: ${fileName}`);
        });
    }
    async list(input) {
        const filters = [eq(stockAdjustmentsTable.companyId, input.companyId)];
        if (input.status)
            filters.push(eq(stockAdjustmentsTable.status, input.status));
        if (input.warehouseId)
            filters.push(eq(stockAdjustmentsTable.warehouseId, input.warehouseId));
        if (input.startDate)
            filters.push(sql `${stockAdjustmentsTable.createdAt} >= ${input.startDate}`);
        if (input.endDate)
            filters.push(sql `${stockAdjustmentsTable.createdAt} <= ${input.endDate}`);
        const where = and(...filters);
        const db = Db2Connection.getInstance();
        const [total] = await db.select({ value: count() }).from(stockAdjustmentsTable).where(where);
        const items = await db.select({
            id: stockAdjustmentsTable.id,
            companyId: stockAdjustmentsTable.companyId,
            warehouseId: stockAdjustmentsTable.warehouseId,
            warehouseName: warehousesTable.warehouseName,
            adjustmentNumber: stockAdjustmentsTable.adjustmentNumber,
            adjustmentType: stockAdjustmentsTable.adjustmentType,
            reason: stockAdjustmentsTable.reason,
            notes: stockAdjustmentsTable.notes,
            status: stockAdjustmentsTable.status,
            approvalRequestId: stockAdjustmentsTable.approvalRequestId,
            approvalThreshold: stockAdjustmentsTable.approvalThreshold,
            createdBy: stockAdjustmentsTable.createdBy,
            createdAt: stockAdjustmentsTable.createdAt,
            updatedAt: stockAdjustmentsTable.updatedAt,
            referenceNumber: stockAdjustmentsTable.referenceNumber,
            department: stockAdjustmentsTable.department,
            financialImpactEstimate: stockAdjustmentsTable.financialImpactEstimate,
        })
            .from(stockAdjustmentsTable)
            .leftJoin(warehousesTable, eq(stockAdjustmentsTable.warehouseId, warehousesTable.id))
            .where(where)
            .orderBy(desc(stockAdjustmentsTable.createdAt))
            .limit(input.limit)
            .offset((input.page - 1) * input.limit);
        return { items, total: Number(total?.value ?? 0) };
    }
    async findById(companyId, id) {
        const db = Db2Connection.getInstance();
        const [adjustment] = await db
            .select({
            id: stockAdjustmentsTable.id,
            companyId: stockAdjustmentsTable.companyId,
            warehouseId: stockAdjustmentsTable.warehouseId,
            warehouseName: warehousesTable.warehouseName,
            adjustmentNumber: stockAdjustmentsTable.adjustmentNumber,
            adjustmentType: stockAdjustmentsTable.adjustmentType,
            reason: stockAdjustmentsTable.reason,
            notes: stockAdjustmentsTable.notes,
            status: stockAdjustmentsTable.status,
            approvalRequestId: stockAdjustmentsTable.approvalRequestId,
            approvalThreshold: stockAdjustmentsTable.approvalThreshold,
            evidence: stockAdjustmentsTable.evidence,
            approvedBy: stockAdjustmentsTable.approvedBy,
            approvedAt: stockAdjustmentsTable.approvedAt,
            rejectedBy: stockAdjustmentsTable.rejectedBy,
            rejectedAt: stockAdjustmentsTable.rejectedAt,
            createdBy: stockAdjustmentsTable.createdBy,
            createdAt: stockAdjustmentsTable.createdAt,
            updatedAt: stockAdjustmentsTable.updatedAt,
            referenceNumber: stockAdjustmentsTable.referenceNumber,
            department: stockAdjustmentsTable.department,
            reasonCode: stockAdjustmentsTable.reasonCode,
            reasonDescription: stockAdjustmentsTable.reasonDescription,
            adjustmentAccount: stockAdjustmentsTable.adjustmentAccount,
            financialImpactEstimate: stockAdjustmentsTable.financialImpactEstimate,
            tags: stockAdjustmentsTable.tags,
            submittedAt: stockAdjustmentsTable.submittedAt,
            cancelledAt: stockAdjustmentsTable.cancelledAt,
            completedAt: stockAdjustmentsTable.completedAt,
            adjustmentDate: stockAdjustmentsTable.adjustmentDate,
            locationId: stockAdjustmentsTable.locationId,
            approvalRequired: stockAdjustmentsTable.approvalRequired,
            workflowDefinitionId: stockAdjustmentsTable.workflowDefinitionId,
            nextApproverUserId: stockAdjustmentsTable.nextApproverUserId,
            ipAddress: stockAdjustmentsTable.ipAddress,
        })
            .from(stockAdjustmentsTable)
            .leftJoin(warehousesTable, eq(stockAdjustmentsTable.warehouseId, warehousesTable.id))
            .where(and(eq(stockAdjustmentsTable.id, id), eq(stockAdjustmentsTable.companyId, companyId)))
            .limit(1);
        if (!adjustment)
            return null;
        const items = await db
            .select({
            id: stockAdjustmentItemsTable.id,
            stockItemId: stockAdjustmentItemsTable.stockItemId,
            productId: stockAdjustmentItemsTable.productId,
            productVariantId: stockAdjustmentItemsTable.productVariantId,
            lotNumber: stockAdjustmentItemsTable.lotNumber,
            batchNumber: stockAdjustmentItemsTable.batchNumber,
            serialNumber: stockAdjustmentItemsTable.serialNumber,
            binLocationId: stockAdjustmentItemsTable.binLocationId,
            uomId: stockAdjustmentItemsTable.uomId,
            quantityBefore: stockAdjustmentItemsTable.quantityBefore,
            quantityAfter: stockAdjustmentItemsTable.quantityAfter,
            adjustedQuantity: stockAdjustmentItemsTable.adjustedQuantity,
            unitCost: stockAdjustmentItemsTable.unitCost,
            reason: stockAdjustmentItemsTable.reason,
            evidence: stockAdjustmentItemsTable.evidence,
            expiryDate: stockAdjustmentItemsTable.expiryDate,
            sku: productVariantsTable.sku,
            productName: productsTable.productName,
            color: productVariantsTable.color,
            size: productVariantsTable.size,
            style: productVariantsTable.style,
            binCode: binLocationsTable.binCode,
            zoneName: warehouseZonesTable.zoneName,
            uomName: unitsOfMeasureTable.uomName,
            uomCode: unitsOfMeasureTable.uomCode,
        })
            .from(stockAdjustmentItemsTable)
            .leftJoin(stockItemsTable, eq(stockAdjustmentItemsTable.stockItemId, stockItemsTable.id))
            .leftJoin(productVariantsTable, eq(stockAdjustmentItemsTable.productVariantId, productVariantsTable.id))
            .leftJoin(productsTable, eq(stockAdjustmentItemsTable.productId, productsTable.id))
            .leftJoin(binLocationsTable, eq(stockAdjustmentItemsTable.binLocationId, binLocationsTable.id))
            .leftJoin(warehouseZonesTable, eq(binLocationsTable.warehouseZoneId, warehouseZonesTable.id))
            .leftJoin(unitsOfMeasureTable, eq(stockAdjustmentItemsTable.uomId, unitsOfMeasureTable.id))
            .where(eq(stockAdjustmentItemsTable.stockAdjustmentId, id));
        const db2Comments = await db
            .select()
            .from(stockAdjustmentCommentsTable)
            .where(eq(stockAdjustmentCommentsTable.stockAdjustmentId, id))
            .orderBy(desc(stockAdjustmentCommentsTable.createdAt));
        const db2Attachments = await db
            .select()
            .from(stockAdjustmentAttachmentsTable)
            .where(eq(stockAdjustmentAttachmentsTable.stockAdjustmentId, id))
            .orderBy(desc(stockAdjustmentAttachmentsTable.uploadedAt));
        const db2Approvals = await db
            .select()
            .from(stockAdjustmentApprovalsTable)
            .where(eq(stockAdjustmentApprovalsTable.stockAdjustmentId, id))
            .orderBy(desc(stockAdjustmentApprovalsTable.createdAt));
        const db2AuditLogs = await db
            .select()
            .from(stockAdjustmentAuditLogsTable)
            .where(eq(stockAdjustmentAuditLogsTable.stockAdjustmentId, id))
            .orderBy(desc(stockAdjustmentAuditLogsTable.timestamp));
        const userIds = new Set();
        if (adjustment.createdBy)
            userIds.add(adjustment.createdBy);
        if (adjustment.approvedBy)
            userIds.add(adjustment.approvedBy);
        if (adjustment.rejectedBy)
            userIds.add(adjustment.rejectedBy);
        if (adjustment.nextApproverUserId)
            userIds.add(adjustment.nextApproverUserId);
        db2Comments.forEach(c => { if (c.createdBy)
            userIds.add(c.createdBy); });
        db2Attachments.forEach(a => { if (a.uploadedBy)
            userIds.add(a.uploadedBy); });
        db2Approvals.forEach(ap => {
            if (ap.approverUserId)
                userIds.add(ap.approverUserId);
            if (ap.reassignedToUserId)
                userIds.add(ap.reassignedToUserId);
        });
        db2AuditLogs.forEach(au => { if (au.userId)
            userIds.add(au.userId); });
        const userMap = {};
        const userRoleNames = {};
        if (userIds.size > 0) {
            const db1 = Db1Connection.getInstance();
            const users = await db1
                .select({
                id: usersTable.id,
                firstName: usersTable.firstName,
                lastName: usersTable.lastName,
                email: usersTable.email,
            })
                .from(usersTable)
                .where(inArray(usersTable.id, Array.from(userIds)));
            for (const u of users) {
                userMap[u.id] = {
                    name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "Unknown User",
                    email: u.email || "",
                };
            }
            const rolesData = await db1
                .select({
                userId: userRolesTable.userId,
                roleName: rolesTable.name,
            })
                .from(userRolesTable)
                .leftJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
                .where(inArray(userRolesTable.userId, Array.from(userIds)));
            for (const r of rolesData) {
                if (r.userId && r.roleName) {
                    userRoleNames[r.userId] = r.roleName;
                }
            }
        }
        const creatorUser = adjustment.createdBy ? (userMap[adjustment.createdBy] || null) : null;
        const approverUser = adjustment.approvedBy ? (userMap[adjustment.approvedBy] || null) : null;
        const rejecterUser = adjustment.rejectedBy ? (userMap[adjustment.rejectedBy] || null) : null;
        const nextApproverUser = adjustment.nextApproverUserId ? (userMap[adjustment.nextApproverUserId] || null) : null;
        const comments = db2Comments.map(c => ({
            ...c,
            createdByUserName: c.createdBy ? (userMap[c.createdBy]?.name || "Unknown") : "System",
            createdByEmail: c.createdBy ? (userMap[c.createdBy]?.email || "") : "",
        }));
        const attachments = db2Attachments.map(a => ({
            ...a,
            uploadedByUserName: a.uploadedBy ? (userMap[a.uploadedBy]?.name || "Unknown") : "System",
            uploadedByEmail: a.uploadedBy ? (userMap[a.uploadedBy]?.email || "") : "",
        }));
        const approvals = db2Approvals.map(ap => ({
            ...ap,
            approverUserName: ap.approverUserId ? (userMap[ap.approverUserId]?.name || "Unknown") : "",
            reassignedToUserName: ap.reassignedToUserId ? (userMap[ap.reassignedToUserId]?.name || "") : "",
        }));
        const auditHistory = db2AuditLogs.map(au => ({
            action: au.action,
            comments: au.comments,
            performedBy: au.userId,
            performedByUserName: au.userId ? (userMap[au.userId]?.name || "Unknown") : "System",
            performedAt: au.timestamp,
            previousState: au.previousState,
            newState: au.newState,
        }));
        if (auditHistory.length === 0) {
            auditHistory.push({
                action: "Adjustment created",
                comments: null,
                performedBy: adjustment.createdBy,
                performedByUserName: creatorUser?.name || "Unknown",
                performedAt: adjustment.createdAt,
                previousState: null,
                newState: null,
            });
            if (adjustment.status === "approved") {
                auditHistory.push({
                    action: "Approved",
                    comments: null,
                    performedBy: adjustment.approvedBy,
                    performedByUserName: approverUser?.name || "Unknown",
                    performedAt: adjustment.approvedAt,
                    previousState: null,
                    newState: null,
                });
            }
        }
        let totalBefore = 0;
        let totalAdjust = 0;
        let totalAfter = 0;
        let valueBefore = 0;
        let valueAfter = 0;
        const locationImpacts = {};
        // Initialize location impacts with all warehouse zones
        if (adjustment.warehouseId) {
            const warehouseZones = await db
                .select({ zoneName: warehouseZonesTable.zoneName })
                .from(warehouseZonesTable)
                .where(eq(warehouseZonesTable.warehouseId, adjustment.warehouseId));
            for (const zone of warehouseZones) {
                if (zone.zoneName) {
                    locationImpacts[zone.zoneName] = { quantity: 0, value: 0 };
                }
            }
        }
        const resolvedLines = items.map(item => {
            const before = Number(item.quantityBefore || 0);
            const adjust = Number(item.adjustedQuantity || 0);
            const after = Number(item.quantityAfter || 0);
            const cost = Number(item.unitCost || 0);
            const val = adjust * cost;
            totalBefore += before;
            totalAdjust += adjust;
            totalAfter += after;
            valueBefore += before * cost;
            valueAfter += after * cost;
            const locName = item.zoneName || "Storage";
            if (!locationImpacts[locName]) {
                locationImpacts[locName] = { quantity: 0, value: 0 };
            }
            locationImpacts[locName].quantity += adjust;
            locationImpacts[locName].value += val;
            return {
                ...item,
                lineValue: val,
                totalValue: val,
                productImage: item.productVariantId ? `/api/v1/products/${item.productVariantId}/image` : null,
            };
        });
        const totalValue = resolvedLines.reduce((sum, item) => sum + (Number(item.adjustedQuantity || 0) * Number(item.unitCost || 0)), 0);
        // Calculate approval duration
        let approvalDuration = null;
        if (adjustment.submittedAt) {
            const end = adjustment.completedAt || adjustment.rejectedAt || adjustment.approvedAt;
            if (end) {
                approvalDuration = Math.round((new Date(end).getTime() - new Date(adjustment.submittedAt).getTime()) / 1000);
            }
        }
        // Load active workflow info
        let workflowState = null;
        if (adjustment.approvalRequestId) {
            const db1 = Db1Connection.getInstance();
            const [req] = await db1
                .select({
                id: approvalRequestsTable.id,
                workflowDefinitionId: approvalRequestsTable.workflowDefinitionId,
                status: approvalRequestsTable.status,
                currentStepOrder: approvalRequestsTable.currentStepOrder,
                workflowName: workflowDefinitionsTable.workflowName,
            })
                .from(approvalRequestsTable)
                .leftJoin(workflowDefinitionsTable, eq(approvalRequestsTable.workflowDefinitionId, workflowDefinitionsTable.id))
                .where(eq(approvalRequestsTable.id, adjustment.approvalRequestId))
                .limit(1);
            if (req && req.workflowDefinitionId) {
                const steps = await db1
                    .select({
                    id: workflowStepsTable.id,
                    stepOrder: workflowStepsTable.stepOrder,
                    stepName: workflowStepsTable.stepName,
                    approverUserId: workflowStepsTable.approverUserId,
                    minimumApprovals: workflowStepsTable.minimumApprovals,
                })
                    .from(workflowStepsTable)
                    .where(eq(workflowStepsTable.workflowDefinitionId, req.workflowDefinitionId))
                    .orderBy(workflowStepsTable.stepOrder);
                const decisions = await db1
                    .select({
                    id: approvalDecisionsTable.id,
                    workflowStepId: approvalDecisionsTable.workflowStepId,
                    status: approvalDecisionsTable.decision,
                    comments: approvalDecisionsTable.comments,
                    approverUserId: approvalDecisionsTable.approverUserId,
                    decidedAt: approvalDecisionsTable.decidedAt,
                })
                    .from(approvalDecisionsTable)
                    .where(eq(approvalDecisionsTable.approvalRequestId, req.id));
                workflowState = {
                    requestId: req.id,
                    workflowName: req.workflowName,
                    status: req.status,
                    currentStepOrder: req.currentStepOrder,
                    steps,
                    decisions: decisions.map(d => ({
                        ...d,
                        approverUserName: d.approverUserId ? (userMap[d.approverUserId]?.name || "Unknown") : "Unknown",
                    })),
                };
            }
        }
        return {
            ...adjustment,
            createdByUserName: creatorUser?.name || "Unknown",
            createdByEmail: creatorUser?.email || "",
            createdByRole: adjustment.createdBy ? (userRoleNames[adjustment.createdBy] || "") : "",
            approvedByUserName: approverUser?.name || "",
            approvedByRole: adjustment.approvedBy ? (userRoleNames[adjustment.approvedBy] || "") : "",
            rejectedByUserName: rejecterUser?.name || "",
            rejectedByRole: adjustment.rejectedBy ? (userRoleNames[adjustment.rejectedBy] || "") : "",
            nextApprover: nextApproverUser ? {
                id: adjustment.nextApproverUserId,
                name: nextApproverUser.name,
                email: nextApproverUser.email,
                role: adjustment.nextApproverUserId ? (userRoleNames[adjustment.nextApproverUserId] || "") : "",
            } : null,
            lines: resolvedLines,
            totals: {
                before: totalBefore,
                adjust: totalAdjust,
                after: totalAfter,
                value: totalValue,
                totalSKUs: resolvedLines.length,
                totalQuantity: totalAdjust,
                totalFinancialValue: totalValue,
            },
            stockImpact: {
                before: totalBefore,
                adjust: totalAdjust,
                after: totalAfter,
            },
            locationImpact: Object.entries(locationImpacts).map(([zone, data]) => ({
                zone,
                quantity: data.quantity,
                value: data.value,
            })),
            valueImpact: {
                valueBefore,
                adjustmentValue: totalValue,
                valueAfter,
            },
            approvalDuration,
            workflowState,
            comments,
            attachments,
            approvals,
            auditHistory,
        };
    }
    delta(type, quantity) {
        const negativeTypes = [
            "decrease",
            "damage",
            "shrinkage",
            "subtract stock",
            "inventory write-off",
            "damaged goods adjustment",
            "expired goods adjustment",
            "lost inventory adjustment",
            "cycle count variance adjustment"
        ];
        return negativeTypes.includes(type.toLowerCase()) ? -Math.abs(quantity) : Math.abs(quantity);
    }
    async generateAdjustmentNumber(tx, companyId) {
        const [totalRow] = await tx
            .select({ value: count() })
            .from(stockAdjustmentsTable)
            .where(eq(stockAdjustmentsTable.companyId, companyId));
        const year = new Date().getFullYear();
        const sequence = String((totalRow?.value ?? 0) + 1).padStart(5, "0");
        return `ADJ-${year}-${sequence}`;
    }
    async logAudit(tx, companyId, adjustmentId, userId, action, comments, previousState, newState) {
        await tx.insert(stockAdjustmentAuditLogsTable).values({
            id: randomUUID(),
            companyId,
            stockAdjustmentId: adjustmentId,
            userId,
            action,
            previousState: previousState ?? null,
            newState: newState ?? null,
            comments: comments ?? null,
            timestamp: new Date(),
        });
    }
    async applyAdjustmentLines(tx, companyId, adjustmentId, actorId, idempotencyKey) {
        const lines = await tx.select().from(stockAdjustmentItemsTable).where(eq(stockAdjustmentItemsTable.stockAdjustmentId, adjustmentId));
        const [adj] = await tx.select().from(stockAdjustmentsTable).where(eq(stockAdjustmentsTable.id, adjustmentId)).limit(1);
        if (!adj)
            throw new AppError("Adjustment not found", 404, "ADJUSTMENT_NOT_FOUND");
        for (const line of lines) {
            let stockItemId = line.stockItemId;
            let balance;
            if (stockItemId) {
                [balance] = await tx.select().from(stockItemsTable).where(and(eq(stockItemsTable.id, stockItemId), eq(stockItemsTable.companyId, companyId))).limit(1);
            }
            else {
                const conditions = [
                    eq(stockItemsTable.companyId, companyId),
                    eq(stockItemsTable.productVariantId, line.productVariantId),
                    eq(stockItemsTable.warehouseId, adj.warehouseId),
                ];
                if (line.binLocationId) {
                    conditions.push(eq(stockItemsTable.binLocationId, line.binLocationId));
                }
                else {
                    conditions.push(isNull(stockItemsTable.binLocationId));
                }
                [balance] = await tx.select().from(stockItemsTable).where(and(...conditions)).limit(1);
            }
            const delta = Number(line.adjustedQuantity || 0);
            if (!balance) {
                if (delta < 0) {
                    throw new AppError(`Inventory balance not found for variant ${line.productVariantId}`, 404, "INVENTORY_NOT_FOUND");
                }
                const variantId = line.productVariantId;
                const [variant] = await tx.select().from(productVariantsTable).where(eq(productVariantsTable.id, variantId)).limit(1);
                if (!variant) {
                    throw new AppError(`Product variant ${variantId} not found`, 404, "VARIANT_NOT_FOUND");
                }
                let warehouseZoneId = null;
                if (line.binLocationId) {
                    const [binLoc] = await tx.select().from(binLocationsTable).where(eq(binLocationsTable.id, line.binLocationId)).limit(1);
                    if (binLoc) {
                        warehouseZoneId = binLoc.warehouseZoneId;
                    }
                }
                stockItemId = randomUUID();
                const defaultCost = line.unitCost ? String(line.unitCost) : String(variant.costPrice || 0);
                await tx.insert(stockItemsTable).values({
                    id: stockItemId,
                    companyId,
                    productId: variant.productId,
                    productVariantId: variantId,
                    warehouseId: adj.warehouseId,
                    warehouseZoneId,
                    binLocationId: line.binLocationId || null,
                    quantityOnHand: "0",
                    quantityAvailable: "0",
                    quantityReserved: "0",
                    averageCost: defaultCost,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    version: 1,
                });
                balance = {
                    id: stockItemId,
                    quantityOnHand: 0,
                    quantityAvailable: 0,
                    averageCost: defaultCost,
                };
            }
            const before = Number(balance.quantityOnHand ?? 0);
            const after = before + delta;
            if (after < 0) {
                throw new AppError("Adjustment creates negative stock", 409, "NEGATIVE_STOCK_FORBIDDEN");
            }
            await tx.update(stockAdjustmentItemsTable).set({
                stockItemId,
                quantityBefore: String(before),
                quantityAfter: String(after),
            }).where(eq(stockAdjustmentItemsTable.id, line.id));
            const isDamage = adj.adjustmentType === "damage" || adj.adjustmentType === "inventory write-off";
            const quantityColumn = isDamage ? stockItemsTable.quantityDamaged : stockItemsTable.quantityAvailable;
            const updates = {
                quantityOnHand: sql `${stockItemsTable.quantityOnHand} + ${delta}`,
                quantityAvailable: sql `${stockItemsTable.quantityAvailable} + ${delta}`,
                ...(isDamage ? {
                    quantityDamaged: sql `coalesce(${quantityColumn}, 0) + ${Math.abs(delta)}`,
                } : {}),
                lastMovementAt: new Date(),
                updatedAt: new Date(),
                version: sql `coalesce(${stockItemsTable.version}, 0) + 1`,
            };
            const [updated] = await tx.update(stockItemsTable).set(updates).where(and(eq(stockItemsTable.id, stockItemId), eq(stockItemsTable.companyId, companyId), sql `${stockItemsTable.quantityOnHand} + ${delta} >= 0`)).returning({ id: stockItemsTable.id });
            if (!updated) {
                throw new AppError("Inventory changed concurrently", 409, "INVENTORY_VERSION_CONFLICT");
            }
            const movementId = randomUUID();
            await tx.insert(stockMovementsTable).values({
                id: movementId,
                companyId,
                stockItemId,
                transactionNumber: `INV-${Date.now()}-${movementId.slice(0, 8)}`,
                movementType: "adjustment",
                referenceType: "stock_adjustment",
                referenceId: adjustmentId,
                quantity: String(delta),
                quantityBefore: String(before),
                quantityAfter: String(after),
                movementReason: line.reason || adj.reason || "",
                movementDate: new Date(),
                performedBy: actorId,
                idempotencyKey: `${idempotencyKey}:${line.id}`,
                createdAt: new Date(),
            });
        }
    }
}
