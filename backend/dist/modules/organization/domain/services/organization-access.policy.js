export class OrganizationAccessPolicy {
    requireOrganizationAccess(allowedOrganizationIds, organizationId) {
        if (!allowedOrganizationIds.includes(organizationId)) {
            throw new Error("Organization access denied");
        }
    }
}
