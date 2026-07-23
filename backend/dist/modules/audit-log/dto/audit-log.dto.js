export class AuditLogDto {
    companyId;
    organizationId;
    warehouseId;
    userId;
    action;
    module;
    entityType;
    entityId;
    status;
    requestId;
    correlationId;
    ipAddress;
    userAgent;
    beforeState;
    afterState;
    changedFields;
    metadata;
    constructor(input) {
        this.companyId = input.companyId;
        this.organizationId = input.organizationId;
        this.warehouseId = input.warehouseId;
        this.userId = input.userId;
        this.action = input.action;
        this.module = input.module;
        this.entityType = input.entityType;
        this.entityId = input.entityId;
        this.status = input.status;
        this.requestId = input.requestId;
        this.correlationId = input.correlationId;
        this.ipAddress = input.ipAddress;
        this.userAgent = input.userAgent;
        this.beforeState = input.beforeState;
        this.afterState = input.afterState;
        this.changedFields = input.changedFields;
        this.metadata = input.metadata;
    }
}
