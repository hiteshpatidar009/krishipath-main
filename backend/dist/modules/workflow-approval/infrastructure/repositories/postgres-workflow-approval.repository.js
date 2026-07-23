import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { Db1Connection } from "../../../../infrastructure/database";
import { approvalDecisionsTable, approvalRequestsTable, workflowDefinitionsTable, workflowStepsTable, } from "../../../../infrastructure/database/postgres/schemas/db1";
export class PostgresWorkflowApprovalRepository {
    async createDefinition(input) {
        const db = Db1Connection.getInstance();
        const workflowDefinitionId = randomUUID();
        const now = new Date();
        await db.transaction(async (tx) => {
            await tx.insert(workflowDefinitionsTable).values({
                id: workflowDefinitionId,
                companyId: input.companyId,
                moduleName: input.moduleName,
                workflowName: input.workflowName,
                triggerEvent: input.triggerEvent,
                entityType: input.entityType,
                description: input.description,
                isActive: true,
                createdBy: input.createdBy,
                createdAt: now,
            });
            await tx.insert(workflowStepsTable).values(input.steps.map((step, index) => ({
                id: randomUUID(),
                workflowDefinitionId,
                stepOrder: index + 1,
                stepName: step.stepName,
                approverRoleId: step.approverRoleId,
                approverUserId: step.approverUserId,
                minimumApprovals: step.minimumApprovals,
                conditions: step.conditions,
                actionType: step.actionType,
            })));
        });
        return { workflowDefinitionId };
    }
    async listDefinitions(companyId) {
        return Db1Connection.getInstance()
            .select()
            .from(workflowDefinitionsTable)
            .where(eq(workflowDefinitionsTable.companyId, companyId));
    }
    async findDefinition(companyId, workflowDefinitionId) {
        const rows = await Db1Connection.getInstance()
            .select()
            .from(workflowDefinitionsTable)
            .where(and(eq(workflowDefinitionsTable.companyId, companyId), eq(workflowDefinitionsTable.id, workflowDefinitionId)))
            .limit(1);
        return rows[0] ?? null;
    }
    async startWorkflow(input) {
        const id = randomUUID();
        await Db1Connection.getInstance().insert(approvalRequestsTable).values({
            id,
            workflowDefinitionId: input.workflowDefinitionId,
            entityType: input.entityType,
            entityId: input.entityId,
            requestedBy: input.requestedBy,
            currentStepOrder: 1,
            status: "running",
            requestedAt: new Date(),
        });
        return { approvalRequestId: id };
    }
    async listApprovalRequests(input) {
        const conditions = [eq(workflowDefinitionsTable.companyId, input.companyId)];
        if (input.status) {
            conditions.push(eq(approvalRequestsTable.status, input.status));
        }
        if (input.requestedBy) {
            conditions.push(eq(approvalRequestsTable.requestedBy, input.requestedBy));
        }
        return Db1Connection.getInstance()
            .select({
            id: approvalRequestsTable.id,
            workflowDefinitionId: approvalRequestsTable.workflowDefinitionId,
            currentStepOrder: approvalRequestsTable.currentStepOrder,
            status: approvalRequestsTable.status,
            entityType: approvalRequestsTable.entityType,
            entityId: approvalRequestsTable.entityId,
            requestedBy: approvalRequestsTable.requestedBy,
            requestedAt: approvalRequestsTable.requestedAt,
            completedAt: approvalRequestsTable.completedAt,
        })
            .from(approvalRequestsTable)
            .innerJoin(workflowDefinitionsTable, eq(approvalRequestsTable.workflowDefinitionId, workflowDefinitionsTable.id))
            .where(and(...conditions));
    }
    async findApprovalRequestForTenant(companyId, approvalRequestId) {
        const rows = await Db1Connection.getInstance()
            .select({
            id: approvalRequestsTable.id,
            workflowDefinitionId: approvalRequestsTable.workflowDefinitionId,
            currentStepOrder: approvalRequestsTable.currentStepOrder,
            status: approvalRequestsTable.status,
            entityType: approvalRequestsTable.entityType,
            entityId: approvalRequestsTable.entityId,
            requestedBy: approvalRequestsTable.requestedBy,
            requestedAt: approvalRequestsTable.requestedAt,
            completedAt: approvalRequestsTable.completedAt,
        })
            .from(approvalRequestsTable)
            .innerJoin(workflowDefinitionsTable, eq(approvalRequestsTable.workflowDefinitionId, workflowDefinitionsTable.id))
            .where(and(eq(workflowDefinitionsTable.companyId, companyId), eq(approvalRequestsTable.id, approvalRequestId)))
            .limit(1);
        return rows[0] ?? null;
    }
    async findApprovalRequest(approvalRequestId) {
        const rows = await Db1Connection.getInstance()
            .select({
            id: approvalRequestsTable.id,
            workflowDefinitionId: approvalRequestsTable.workflowDefinitionId,
            currentStepOrder: approvalRequestsTable.currentStepOrder,
            status: approvalRequestsTable.status,
        })
            .from(approvalRequestsTable)
            .where(eq(approvalRequestsTable.id, approvalRequestId))
            .limit(1);
        return rows[0] ?? null;
    }
    async findStep(definitionId, stepOrder) {
        const rows = await Db1Connection.getInstance()
            .select({
            id: workflowStepsTable.id,
            stepOrder: workflowStepsTable.stepOrder,
            minimumApprovals: workflowStepsTable.minimumApprovals,
        })
            .from(workflowStepsTable)
            .where(and(eq(workflowStepsTable.workflowDefinitionId, definitionId), eq(workflowStepsTable.stepOrder, stepOrder)))
            .limit(1);
        return rows[0] ?? null;
    }
    async countApprovals(approvalRequestId, workflowStepId) {
        const rows = await Db1Connection.getInstance()
            .select({ id: approvalDecisionsTable.id })
            .from(approvalDecisionsTable)
            .where(and(eq(approvalDecisionsTable.approvalRequestId, approvalRequestId), eq(approvalDecisionsTable.workflowStepId, workflowStepId), eq(approvalDecisionsTable.decision, "approved")));
        return rows.length;
    }
    async createDecision(input) {
        await Db1Connection.getInstance().insert(approvalDecisionsTable).values({
            id: randomUUID(),
            approvalRequestId: input.approvalRequestId,
            workflowStepId: input.workflowStepId,
            approverUserId: input.approverUserId,
            decision: input.decision,
            comments: input.comments,
            decidedAt: new Date(),
        });
    }
    async updateApprovalRequest(approvalRequestId, input) {
        await Db1Connection.getInstance()
            .update(approvalRequestsTable)
            .set({
            status: input.status,
            currentStepOrder: input.currentStepOrder,
            completedAt: input.completedAt,
        })
            .where(eq(approvalRequestsTable.id, approvalRequestId));
    }
}
