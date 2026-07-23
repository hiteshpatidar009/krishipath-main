export class WorkflowAggregate {
    props;
    constructor(props) {
        this.props = props;
    }
    static start(props) {
        if (!props.companyId || !props.definitionId || !props.entityType || !props.entityId) {
            throw new Error("Workflow context incomplete");
        }
        return new WorkflowAggregate(props);
    }
    get id() {
        return this.props.id;
    }
}
