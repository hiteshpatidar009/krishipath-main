import { logger } from "../../../infrastructure/logger";
export class BillingIntegrationService {
    async audit(payload, context) {
        await logger.info("billing audit hook", {
            category: "payment",
            module: "billing",
            companyId: context.securityContext.companyId,
            userId: context.securityContext.userId,
            action: payload.action,
            tags: ["billing", "audit", payload.action],
            payload: {
                ...payload,
                requestId: context.requestId,
            },
        });
    }
    async notify(payload, context) {
        await logger.info("billing notification hook", {
            category: "payment",
            module: "billing",
            companyId: context.securityContext.companyId,
            userId: context.securityContext.userId,
            action: payload.type,
            tags: ["billing", "notification", payload.type],
            payload,
        });
    }
    async emitWorkflow(eventName, payload, context) {
        await logger.info("billing workflow hook", {
            category: "payment",
            module: "billing",
            companyId: context.securityContext.companyId,
            userId: context.securityContext.userId,
            action: eventName,
            tags: ["billing", "workflow", eventName],
            payload,
        });
    }
}
