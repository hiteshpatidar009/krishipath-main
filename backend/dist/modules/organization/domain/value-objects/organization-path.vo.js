export class OrganizationPath {
    segments;
    constructor(segments) {
        this.segments = segments;
    }
    static root(organizationId) {
        return new OrganizationPath([organizationId]);
    }
    child(organizationId) {
        return new OrganizationPath([...this.segments, organizationId]);
    }
    contains(organizationId) {
        return this.segments.includes(organizationId);
    }
    toString() {
        return this.segments.join("/");
    }
}
