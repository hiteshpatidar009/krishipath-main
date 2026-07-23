import { CoreEventBus, EventEnvelopeFactory } from "../../../../core";
import { logger } from "../../../../infrastructure/logger";
import { AppError } from "../../../../shared/errors/app.error";
import { OrganizationEvents } from "../../events/organization.events";
export class CreateOrganizationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const duplicate = await this.repository.findByNameOrCode(input.companyId, input.name, input.organizationCode);
        if (duplicate) {
            throw new AppError("Organization already exists for this company", 409, "ORGANIZATION_ALREADY_EXISTS");
        }
        const result = await this.repository.create(input);
        await this.publish(OrganizationEvents.created, result.organizationId, input.companyId, { ...input });
        await logger.info("Organization created", {
            module: "organization",
            companyId: input.companyId,
            tags: ["organization", "created"],
            payload: result,
        });
        return result;
    }
    async publish(name, id, companyId, payload) {
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id,
            name,
            source: "organization",
            payload,
            metadata: { companyId },
        }));
    }
}
export class UpdateOrganizationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await this.requireOrganization(input.companyId, input.organizationId);
        await this.repository.update(input);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: input.organizationId,
            name: OrganizationEvents.updated,
            source: "organization",
            payload: input,
            metadata: { companyId: input.companyId },
        }));
        return { updated: true };
    }
    async requireOrganization(companyId, organizationId) {
        const organization = await this.repository.findById(companyId, organizationId);
        if (!organization) {
            throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
        }
    }
}
export class InviteOrganizationMemberUseCase {
    async execute(input) {
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: `${input.organizationId}:${input.email}`,
            name: OrganizationEvents.memberInvited,
            source: "organization",
            payload: input,
            metadata: { companyId: input.companyId },
        }));
        return { invited: true };
    }
}
export class AssignOrganizationRoleUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await this.repository.assignRole(input);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: `${input.organizationId}:${input.userId}:${input.roleId}`,
            name: OrganizationEvents.roleAssigned,
            source: "organization",
            payload: input,
            metadata: { companyId: input.companyId, userId: input.assignedBy },
        }));
        return { assigned: true };
    }
}
export class ActivateOrganizationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, organizationId) {
        await this.repository.setStatus(companyId, organizationId, "active");
        return { activated: true };
    }
}
export class SuspendOrganizationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, organizationId) {
        await this.repository.setStatus(companyId, organizationId, "suspended");
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: organizationId,
            name: OrganizationEvents.suspended,
            source: "organization",
            payload: { organizationId },
            metadata: { companyId },
        }));
        return { suspended: true };
    }
}
export class LinkWarehouseToOrganizationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await this.repository.linkWarehouse(input);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: `${input.organizationId}:${input.warehouseId}`,
            name: OrganizationEvents.warehouseLinked,
            source: "organization",
            payload: input,
            metadata: { companyId: input.companyId, userId: input.linkedBy },
        }));
        return { linked: true };
    }
}
export class ValidateOrganizationAccessUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, organizationId) {
        const organization = await this.repository.findById(companyId, organizationId);
        if (!organization) {
            throw new AppError("Organization access denied", 403, "ORG_ACCESS_DENIED");
        }
        return { valid: true };
    }
}
export class GetOrganizationHierarchyUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId) {
        return { organizations: await this.repository.listHierarchy(companyId) };
    }
}
