export class HierarchyValidationService {
    ensureNoCycle(organizationId, parentOrganizationId) {
        if (parentOrganizationId && organizationId === parentOrganizationId) {
            throw new Error("Organization hierarchy cycle detected");
        }
    }
}
