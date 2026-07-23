import { LogRouterService } from "../../../shared/logger";
export class TaxEventPublisher {
    logRouter = new LogRouterService();
    async publish(eventName, payload, context) {
        await this.logRouter.route({
            category: eventName.includes("failed") ? "platform" : "audit",
            severity: eventName.includes("failed") ? "warning" : "info",
            module: "tax",
            action: eventName,
            message: eventName,
            companyId: context.companyId,
            organizationId: context.organizationId ?? undefined,
            userId: context.userId ?? undefined,
            actorId: context.userId ?? undefined,
            requestId: context.requestId,
            correlationId: context.correlationId,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            metadata: payload,
        });
    }
}
