import { CoreEventBus, EventEnvelopeFactory } from "../../../core";
import { AuditLoggingService } from "../../../shared/audit";
import { logger } from "../../../infrastructure/logger";
import { NotificationRepository } from "../../notification/repositories/notification.repository";
import { QualityManagementEvents } from "../events/quality-management.events";
export class QualityManagementService {
    repository;
    notificationRepository = new NotificationRepository();
    constructor(repository) {
        this.repository = repository;
    }
    async createRule(input) {
        const result = await this.repository.createRule(input);
        await this.record("quality.rule.create", "quality_rule", result.ruleId, input.companyId, input.createdBy, input);
        return result;
    }
    listRules(companyId) {
        return this.repository.listRules(companyId);
    }
    async createChecklist(input) {
        const result = await this.repository.createChecklist(input);
        await this.record("quality.checklist.create", "quality_checklist", result.checklistId, input.companyId, input.createdBy, input);
        return result;
    }
    listChecklists(companyId) {
        return this.repository.listChecklists(companyId);
    }
    async createInspection(input) {
        const result = await this.repository.createInspection(input);
        await Promise.all([
            this.publish(QualityManagementEvents.inspectionCreated, result.inspectionId, input.companyId, input.createdBy, result),
            this.record("quality.inspection.create", "quality_inspection", result.inspectionId, input.companyId, input.createdBy, input),
            this.activity("quality.inspection.created", input.companyId, input.createdBy, result),
            this.notify(input.companyId, input.createdBy, "Quality inspection pending", "A quality inspection is pending review.", result.inspectionId),
        ]);
        return result;
    }
    listInspections(query) {
        return this.repository.listInspections(query);
    }
    getInspection(companyId, inspectionId) {
        return this.repository.getInspection(companyId, inspectionId);
    }
    async addDefect(input) {
        const result = await this.repository.addDefect(input);
        await Promise.all([
            this.publish(QualityManagementEvents.defectRecorded, result.defectId, input.companyId, input.createdBy, result),
            this.activity("quality.defect.recorded", input.companyId, input.createdBy, result),
        ]);
        return result;
    }
    async pass(input) {
        const result = await this.repository.pass(input);
        await this.workflow(QualityManagementEvents.inspectionPassed, "quality.inspection.pass", input, result);
        return result;
    }
    async fail(input) {
        const result = await this.repository.fail(input);
        await this.workflow(QualityManagementEvents.inspectionFailed, "quality.inspection.fail", input, result);
        return result;
    }
    async reject(input) {
        const result = await this.repository.reject(input);
        await this.workflow(QualityManagementEvents.inspectionRejected, "quality.inspection.reject", input, result);
        return result;
    }
    async quarantine(input) {
        const result = await this.repository.quarantine(input);
        await this.workflow(QualityManagementEvents.inventoryQuarantined, "quality.inventory.quarantine", input, result);
        return result;
    }
    async release(input) {
        const result = await this.repository.release(input);
        await this.workflow(QualityManagementEvents.inventoryReleased, "quality.inventory.release", input, result);
        return result;
    }
    summary(companyId) {
        return this.repository.summary(companyId);
    }
    failureTrends(companyId) {
        return this.repository.failureTrends(companyId);
    }
    supplierScore(companyId) {
        return this.repository.supplierScore(companyId);
    }
    warehouseScore(companyId) {
        return this.repository.warehouseScore(companyId);
    }
    productScore(companyId) {
        return this.repository.productScore(companyId);
    }
    async workflow(eventName, action, input, result) {
        await Promise.all([
            this.publish(eventName, input.inspectionId, input.companyId, input.actorId, result),
            this.record(action, "quality_inspection", input.inspectionId, input.companyId, input.actorId, {
                notes: input.notes,
                result,
            }),
            this.activity(action, input.companyId, input.actorId, result),
            this.notify(input.companyId, input.actorId, this.notificationTitle(action), `Quality action completed: ${action}`, input.inspectionId),
        ]);
    }
    async publish(name, id, companyId, userId, payload) {
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id,
            name,
            source: "quality-management",
            payload: { value: payload },
            metadata: { companyId, userId },
        }));
    }
    async record(action, entityType, entityId, companyId, userId, metadata) {
        await AuditLoggingService.record({
            companyId,
            userId,
            action,
            module: "quality-management",
            entityType,
            entityId,
            status: "success",
            metadata: { value: metadata },
        });
    }
    async activity(action, companyId, userId, payload) {
        await logger.info("Quality activity recorded", {
            category: "user_activity",
            module: "quality-management",
            action,
            companyId,
            userId,
            actorId: userId,
            payload,
        });
    }
    async notify(companyId, userId, subject, body, inspectionId) {
        try {
            await this.notificationRepository.create({
                companyId,
                userId,
                channel: "in_app",
                templateKey: "quality.management.event",
                recipient: userId,
                subject,
                body,
                dedupKey: `${inspectionId}:${subject}`,
            });
        }
        catch (error) {
            await logger.warn("Quality notification failed", {
                module: "quality-management",
                action: "quality.notification.failed",
                companyId,
                userId,
                payload: {
                    inspectionId,
                    message: error instanceof Error ? error.message : "Notification failed",
                },
            });
        }
    }
    notificationTitle(action) {
        if (action.includes("fail"))
            return "Quality inspection failed";
        if (action.includes("quarantine"))
            return "Inventory quarantined";
        if (action.includes("release"))
            return "Inventory released";
        if (action.includes("reject"))
            return "Inventory rejected";
        return "Quality action completed";
    }
}
