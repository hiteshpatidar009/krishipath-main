import { CoreEventBus, EventEnvelopeFactory } from "../../../core";
import { AuditLoggingService } from "../../../shared/audit";
import { logger } from "../../../infrastructure/logger";
import { NotificationRepository } from "../../notification/repositories/notification.repository";
import { FinanceAccountingEvents } from "../events/finance-accounting.events";
export class FinanceAccountingService {
    repository;
    notificationRepository = new NotificationRepository();
    constructor(repository) {
        this.repository = repository;
    }
    async createInvoice(input) {
        const result = await this.repository.createInvoice(input);
        await this.afterAction(FinanceAccountingEvents.invoiceCreated, "finance.invoice.create", result.invoiceId, input.companyId, input.createdBy, input);
        return result;
    }
    async updateInvoice(input) {
        const result = await this.repository.updateInvoice(input);
        await this.afterAction("finance.invoice.updated", "finance.invoice.update", result.invoiceId, input.companyId, input.actorId, input);
        return result;
    }
    listInvoices(query) {
        return this.repository.listInvoices(query);
    }
    getInvoice(companyId, invoiceId) {
        return this.repository.getInvoice(companyId, invoiceId);
    }
    async approveInvoice(input) {
        const result = await this.repository.approveInvoice(input);
        await this.afterAction(FinanceAccountingEvents.invoiceApproved, "finance.invoice.approve", input.invoiceId, input.companyId, input.actorId, input);
        return result;
    }
    async sendInvoice(input) {
        const result = await this.repository.sendInvoice(input);
        await this.afterAction(FinanceAccountingEvents.invoiceSent, "finance.invoice.send", input.invoiceId, input.companyId, input.actorId, input);
        await this.notify(input.companyId, input.actorId, "Invoice sent", "Invoice was sent to counterparty.", input.invoiceId);
        return result;
    }
    async cancelInvoice(input) {
        const result = await this.repository.cancelInvoice(input);
        await this.afterAction(FinanceAccountingEvents.invoiceCancelled, "finance.invoice.cancel", input.invoiceId, input.companyId, input.actorId, input);
        return result;
    }
    async recordPayment(input) {
        const result = await this.repository.recordPayment(input);
        await this.afterAction(FinanceAccountingEvents.paymentRecorded, "finance.payment.record", input.invoiceId, input.companyId, input.actorId, input);
        await this.notify(input.companyId, input.actorId, "Payment received", "Operational invoice payment was recorded.", input.invoiceId);
        return result;
    }
    chartOfAccounts(companyId) {
        return this.repository.chartOfAccounts(companyId);
    }
    accountingEvents(companyId) {
        return this.repository.accountingEvents(companyId);
    }
    arSummary(companyId) {
        return this.repository.arSummary(companyId);
    }
    apSummary(companyId) {
        return this.repository.apSummary(companyId);
    }
    async afterAction(eventName, action, entityId, companyId, userId, payload) {
        await Promise.all([
            CoreEventBus.publish(EventEnvelopeFactory.create({
                id: entityId,
                name: eventName,
                source: "finance-accounting",
                payload: { value: payload },
                metadata: { companyId, userId },
            })),
            AuditLoggingService.record({
                companyId,
                userId,
                module: "finance-accounting",
                action,
                entityType: "invoice",
                entityId,
                status: "success",
                metadata: { payload },
            }),
            logger.info("Finance activity recorded", {
                category: "user_activity",
                module: "finance-accounting",
                action,
                companyId,
                userId,
                actorId: userId,
                payload,
            }),
        ]);
    }
    async notify(companyId, userId, subject, body, invoiceId) {
        try {
            await this.notificationRepository.create({
                companyId,
                userId,
                channel: "in_app",
                templateKey: "finance.accounting.event",
                recipient: userId,
                subject,
                body,
                dedupKey: `${invoiceId}:${subject}`,
            });
        }
        catch (error) {
            await logger.warn("Finance notification failed", {
                module: "finance-accounting",
                action: "finance.notification.failed",
                companyId,
                userId,
                payload: { invoiceId, message: error instanceof Error ? error.message : "Notification failed" },
            });
        }
    }
}
