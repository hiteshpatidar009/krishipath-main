import { ActivityLogDto } from "../dto/activity-log.dto";
export class ActivityLogContractAdapter {
    service;
    moduleName = "activity-log";
    version = "1.0.0";
    constructor(service) {
        this.service = service;
    }
    async record(command) {
        await this.service.record(new ActivityLogDto({
            companyId: command.companyId,
            userId: command.userId,
            activityType: command.action,
            description: `${command.module}.${command.action}`,
            metadata: command.metadata,
        }));
    }
}
