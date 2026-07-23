import { logger } from "../../../infrastructure/logger";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
import { RolePermissionError } from "../errors/role-permission.error";
export class RolePermissionController {
    service;
    constructor(service) {
        this.service = service;
    }
    getStatus = async (request, response) => {
        await logger.info("role-permission.status requested", this.meta(request, "status"));
        response.status(200).json({
            success: true,
            module: "role-permission",
            status: this.service.getStatus(),
            timestamp: new Date().toISOString(),
        });
    };
    listPermissions = async (request, response) => {
        await this.execute(request, response, "permissions.list", 200, async () => this.service.listPermissions());
    };
    listRoles = async (request, response) => {
        await this.execute(request, response, "roles.list", 200, async () => {
            const security = this.getSecurityContext(request);
            return this.service.listRoles(security.companyId);
        });
    };
    getRoleDetail = async (request, response) => {
        await this.execute(request, response, "roles.detail", 200, async () => {
            const security = this.getSecurityContext(request);
            return this.service.getRoleDetail(security.companyId, this.getRoleId(request));
        });
    };
    createRole = async (request, response) => {
        await this.execute(request, response, "roles.create", 201, async () => {
            const security = this.getSecurityContext(request);
            return this.service.createRole(security.companyId, security.userId, request.body);
        });
    };
    updateRole = async (request, response) => {
        await this.execute(request, response, "roles.update", 200, async () => {
            const security = this.getSecurityContext(request);
            return this.service.updateRole(security.companyId, this.getRoleId(request), security.userId, request.body);
        });
    };
    replaceRolePermissions = async (request, response) => {
        await this.execute(request, response, "roles.permissions.replace", 200, async () => {
            const security = this.getSecurityContext(request);
            return this.service.replaceRolePermissions(security.companyId, this.getRoleId(request), security.userId, request.body);
        });
    };
    deleteRole = async (request, response) => {
        await this.execute(request, response, "roles.delete", 200, async () => {
            const security = this.getSecurityContext(request);
            return this.service.deleteRole(security.companyId, this.getRoleId(request), security.userId);
        });
    };
    cloneRole = async (request, response) => {
        await this.execute(request, response, "roles.clone", 201, async () => {
            const security = this.getSecurityContext(request);
            return this.service.cloneRole(security.companyId, this.getRoleId(request), security.userId, request.body);
        });
    };
    retireRole = async (request, response) => {
        await this.execute(request, response, "roles.retire", 200, async () => {
            const security = this.getSecurityContext(request);
            return this.service.retireRole(security.companyId, this.getRoleId(request), security.userId);
        });
    };
    restoreRole = async (request, response) => {
        await this.execute(request, response, "roles.restore", 200, async () => {
            const security = this.getSecurityContext(request);
            return this.service.restoreRole(security.companyId, this.getRoleId(request), security.userId);
        });
    };
    getPermissionMatrix = async (request, response) => {
        await this.execute(request, response, "permissions.matrix.get", 200, async () => {
            const security = this.getSecurityContext(request);
            return this.service.getPermissionMatrix(security.companyId);
        });
    };
    savePermissionMatrix = async (request, response) => {
        await this.execute(request, response, "permissions.matrix.save", 200, async () => {
            const security = this.getSecurityContext(request);
            return this.service.savePermissionMatrix(security.companyId, security.userId, request.body);
        });
    };
    publishPermissionMatrix = async (request, response) => {
        await this.execute(request, response, "permissions.matrix.publish", 200, async () => {
            const security = this.getSecurityContext(request);
            return this.service.publishPermissionMatrix(security.companyId, security.userId);
        });
    };
    compareRoles = async (request, response) => {
        await this.execute(request, response, "permissions.compare", 200, async () => {
            const security = this.getSecurityContext(request);
            const roleIds = request.body.roleIds;
            if (!Array.isArray(roleIds) || roleIds.length < 2) {
                throw new RolePermissionError(400, "Compare requires at least 2 roleIds");
            }
            return this.service.compareRoles(security.companyId, roleIds);
        });
    };
    listPermissionModules = async (request, response) => {
        await this.execute(request, response, "permissions.modules.list", 200, async () => {
            return this.service.listPermissionModules();
        });
    };
    async execute(request, response, action, successCode, runner) {
        await logger.info(`${action} started`, this.meta(request, action));
        try {
            const data = await runner();
            await logger.info(`${action} succeeded`, this.meta(request, action));
            response.status(successCode).json({
                success: true,
                data,
            });
        }
        catch (error) {
            this.sendError(request, response, action, error);
        }
    }
    sendError(request, response, action, error) {
        if (error instanceof RolePermissionError) {
            void logger.warn(`${action} failed`, {
                ...this.meta(request, action),
                payload: {
                    code: error.code,
                    message: error.message,
                },
            });
            const formatted = ErrorResponsePresenter.from(error);
            response.status(formatted.statusCode).json(formatted.body);
            return;
        }
        if (error instanceof Error) {
            void logger.error(error, this.meta(request, action));
            const formatted = ErrorResponsePresenter.from(error, 400);
            response.status(formatted.statusCode).json(formatted.body);
            return;
        }
        void logger.error(new Error("Unknown role-permission controller error"), {
            ...this.meta(request, action),
            payload: {
                error,
            },
        });
        const formatted = ErrorResponsePresenter.from(new Error("Unknown error"), 400);
        response.status(formatted.statusCode).json(formatted.body);
    }
    getSecurityContext(request) {
        const securedRequest = request;
        if (!securedRequest.securityContext?.userId || !securedRequest.securityContext?.companyId) {
            throw new RolePermissionError(401, "Unauthorized");
        }
        return {
            userId: securedRequest.securityContext.userId,
            companyId: securedRequest.securityContext.companyId,
        };
    }
    getRoleId(request) {
        const roleId = request.params.roleId;
        if (typeof roleId !== "string") {
            throw new RolePermissionError(400, "Invalid role id");
        }
        return roleId;
    }
    meta(request, action) {
        const securedRequest = request;
        const userAgentHeader = request.headers["user-agent"];
        const userAgent = Array.isArray(userAgentHeader)
            ? userAgentHeader.join(",")
            : userAgentHeader;
        return {
            module: "role-permission.controller",
            method: request.method,
            route: request.originalUrl,
            requestId: securedRequest.requestId,
            userId: securedRequest.securityContext?.userId,
            companyId: securedRequest.securityContext?.companyId,
            ipAddress: request.ip,
            userAgent,
            tags: ["role-permission", "controller", action],
        };
    }
}
