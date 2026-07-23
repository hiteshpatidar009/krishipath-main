export class OrganizationHierarchyAggregate {
    nodes;
    constructor(nodes) {
        this.nodes = nodes;
    }
    get tree() {
        return this.nodes;
    }
}
