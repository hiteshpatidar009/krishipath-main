import { EnterpriseLogRepository, LogRouterService, } from "../../../shared/logger";
export class PlatformLogService {
    repository = new EnterpriseLogRepository();
    router = new LogRouterService(this.repository);
    list(category, query) {
        return this.router.listCategory(category, query.companyId, query.limit, query.offset);
    }
    async metrics() {
        const [userActivityLogs, paymentLogs, auditLogs, platformLogs,] = await Promise.all([
            this.repository.countByCollection("user_activity_logs"),
            this.repository.countByCollection("payment_logs"),
            this.repository.countByCollection("audit_logs"),
            this.repository.countByCollection("platform_logs"),
        ]);
        return {
            userActivityLogs,
            paymentLogs,
            auditLogs,
            platformLogs,
            totalLogs: userActivityLogs + paymentLogs + auditLogs + platformLogs,
        };
    }
}
