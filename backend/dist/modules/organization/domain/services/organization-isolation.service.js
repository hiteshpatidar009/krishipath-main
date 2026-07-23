export class OrganizationIsolationService {
    enforceTenantOwnership(expectedCompanyId, actualCompanyId) {
        if (!actualCompanyId || expectedCompanyId !== actualCompanyId) {
            throw new Error("Cross-organization company violation");
        }
    }
}
