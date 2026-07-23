export class RolePermissionContractAdapter {
    repository;
    moduleName = "role-permission";
    version = "1.0.0";
    constructor(repository) {
        this.repository = repository;
    }
    async hasPermission(userId, permissionKey) {
        return this.repository.hasPermission(userId, permissionKey);
    }
    async listPermissions() {
        const permissions = await this.repository.listAllPermissions();
        return permissions.map((permission) => ({
            id: permission.id,
            key: permission.permissionKey ?? "",
            resource: permission.resource ?? "",
            action: permission.action ?? "",
        }));
    }
}
