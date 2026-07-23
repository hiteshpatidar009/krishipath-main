import { AuthRepository } from "../../../modules/auth/repositories/auth.repository";
export class CompanyGuard {
    static authRepository = new AuthRepository();
    static extractCompanyId(request) {
        const headerValue = request.header("x-company-id") ?? request.header("x-tenant-id");
        if (!headerValue) {
            return undefined;
        }
        const companyId = Array.isArray(headerValue)
            ? headerValue.find((value) => typeof value === "string" && value.trim())
            : headerValue;
        return companyId?.trim() || undefined;
    }
    static requireCompany(request, response, next) {
        void CompanyGuard.attachCompanyContext(request, response, next);
    }
    static async attachCompanyContext(request, response, next) {
        const securityContext = request.securityContext;
        const userId = securityContext?.userId;
        if (!securityContext || !userId) {
            response.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }
        const companyId = CompanyGuard.extractCompanyId(request) || securityContext.companyId;
        if (!companyId) {
            // Allow root users to operate globally without a company context
            if (securityContext.isRoot) {
                next();
                return;
            }
            response.status(403).json({
                success: false,
                message: "Company context required",
            });
            return;
        }
        const isRoot = securityContext.isRoot;
        const isCompanyOwner = isRoot || await CompanyGuard.authRepository.isCompanyOwner(userId, companyId);
        const hasTenantRole = isRoot || await CompanyGuard.authRepository.hasRoleInTenant(userId, companyId);
        if (!(isCompanyOwner || hasTenantRole)) {
            response.status(403).json({
                success: false,
                message: "Company access denied",
            });
            return;
        }
        const roles = await CompanyGuard.authRepository.listUserRoles(userId, companyId);
        const permissions = await CompanyGuard.authRepository.listUserPerms(userId, companyId);
        request.securityContext = {
            ...securityContext,
            companyId,
            activeCompanyId: companyId,
            companyIds: Array.from(new Set([...(securityContext.companyIds ?? []), companyId])),
            isCompanyOwner,
            roles: roles
                .map((role) => role.name)
                .filter((role) => Boolean(role)),
            permissions: permissions
                .map((permission) => permission.permissionKey)
                .filter((permission) => Boolean(permission)),
            requestFingerprint: securityContext.requestFingerprint,
        };
        next();
    }
}
