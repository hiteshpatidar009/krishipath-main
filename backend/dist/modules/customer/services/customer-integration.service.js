import { logger } from "../../../infrastructure/logger";
export class CustomerIntegrationService {
    async audit(payload, context) {
        await logger.info("Customer audit event", {
            module: "customer",
            tags: ["customer", "audit", payload.action],
            payload: {
                ...payload,
                companyId: context.securityContext.companyId,
                userId: context.securityContext.userId,
                requestId: context.requestId,
            },
        });
    }
    async activity(payload, context) {
        await logger.info("Customer activity event", {
            module: "customer",
            tags: ["customer", "activity", payload.action],
            payload: {
                ...payload,
                companyId: context.securityContext.companyId,
                userId: context.securityContext.userId,
            },
        });
    }
    async notify(payload, context) {
        await logger.info("Customer notification event", {
            module: "customer",
            tags: ["customer", "notification", payload.type],
            payload: {
                ...payload,
                companyId: context.securityContext.companyId,
            },
        });
    }
}
