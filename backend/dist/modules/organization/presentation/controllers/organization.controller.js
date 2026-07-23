import { RequestContext } from "../../../../shared/context/request-context";
import { ApiResponse } from "../../../../shared/http/api-response";
import { OrganizationValidator } from "../validators/organization.validator";
export class OrganizationController {
    createOrganizationUseCase;
    updateOrganizationUseCase;
    inviteOrganizationMemberUseCase;
    assignOrganizationRoleUseCase;
    activateOrganizationUseCase;
    suspendOrganizationUseCase;
    linkWarehouseToOrganizationUseCase;
    validateOrganizationAccessUseCase;
    getOrganizationHierarchyUseCase;
    constructor(createOrganizationUseCase, updateOrganizationUseCase, inviteOrganizationMemberUseCase, assignOrganizationRoleUseCase, activateOrganizationUseCase, suspendOrganizationUseCase, linkWarehouseToOrganizationUseCase, validateOrganizationAccessUseCase, getOrganizationHierarchyUseCase) {
        this.createOrganizationUseCase = createOrganizationUseCase;
        this.updateOrganizationUseCase = updateOrganizationUseCase;
        this.inviteOrganizationMemberUseCase = inviteOrganizationMemberUseCase;
        this.assignOrganizationRoleUseCase = assignOrganizationRoleUseCase;
        this.activateOrganizationUseCase = activateOrganizationUseCase;
        this.suspendOrganizationUseCase = suspendOrganizationUseCase;
        this.linkWarehouseToOrganizationUseCase = linkWarehouseToOrganizationUseCase;
        this.validateOrganizationAccessUseCase = validateOrganizationAccessUseCase;
        this.getOrganizationHierarchyUseCase = getOrganizationHierarchyUseCase;
    }
    create = async (request, response) => {
        const input = OrganizationValidator.create.parse(request.body);
        ApiResponse.created(response, await this.createOrganizationUseCase.execute({
            companyId: RequestContext.companyId(request),
            ...input,
            organizationCode: input.organizationCode ?? this.buildOrganizationCode(input.name),
        }), "Organization created");
    };
    buildOrganizationCode(name) {
        const normalized = name
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 30);
        return normalized.length >= 2 ? normalized : `ORG-${Date.now()}`;
    }
    update = async (request, response) => {
        const input = OrganizationValidator.update.parse(request.body);
        ApiResponse.ok(response, await this.updateOrganizationUseCase.execute({
            companyId: RequestContext.companyId(request),
            organizationId: String(request.params.organizationId ?? ""),
            ...input,
        }), "Organization updated");
    };
    inviteMember = async (request, response) => {
        const input = OrganizationValidator.invite.parse(request.body);
        ApiResponse.ok(response, await this.inviteOrganizationMemberUseCase.execute({
            companyId: RequestContext.companyId(request),
            organizationId: String(request.params.organizationId ?? ""),
            email: input.email,
        }), "Organization member invited");
    };
    assignRole = async (request, response) => {
        const input = OrganizationValidator.assignRole.parse(request.body);
        ApiResponse.ok(response, await this.assignOrganizationRoleUseCase.execute({
            companyId: RequestContext.companyId(request),
            organizationId: String(request.params.organizationId ?? ""),
            assignedBy: RequestContext.userId(request),
            ...input,
        }), "Organization role assigned");
    };
    activate = async (request, response) => {
        ApiResponse.ok(response, await this.activateOrganizationUseCase.execute(RequestContext.companyId(request), String(request.params.organizationId ?? "")), "Organization activated");
    };
    suspend = async (request, response) => {
        ApiResponse.ok(response, await this.suspendOrganizationUseCase.execute(RequestContext.companyId(request), String(request.params.organizationId ?? "")), "Organization suspended");
    };
    linkWarehouse = async (request, response) => {
        const input = OrganizationValidator.linkWarehouse.parse(request.body);
        ApiResponse.ok(response, await this.linkWarehouseToOrganizationUseCase.execute({
            companyId: RequestContext.companyId(request),
            organizationId: String(request.params.organizationId ?? ""),
            warehouseId: input.warehouseId,
            linkedBy: RequestContext.userId(request),
        }), "Warehouse linked");
    };
    validateAccess = async (request, response) => {
        ApiResponse.ok(response, await this.validateOrganizationAccessUseCase.execute(RequestContext.companyId(request), String(request.params.organizationId ?? "")), "Organization access valid");
    };
    hierarchy = async (request, response) => {
        ApiResponse.ok(response, await this.getOrganizationHierarchyUseCase.execute(RequestContext.companyId(request)), "Organization hierarchy");
    };
}
