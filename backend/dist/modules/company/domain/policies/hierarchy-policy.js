export class OrganizationHierarchyPolicy {
    ensureNoSelfParent(organizationId, parentOrganizationId) {
        if (parentOrganizationId && organizationId === parentOrganizationId) {
            throw new Error("Organization cannot parent itself");
        }
    }
}
