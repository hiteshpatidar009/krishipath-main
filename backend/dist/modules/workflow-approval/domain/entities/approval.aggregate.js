export class ApprovalAggregate {
    props;
    constructor(props) {
        this.props = props;
    }
    static decide(props) {
        if (!props.approvalRequestId || !props.workflowStepId || !props.approverUserId) {
            throw new Error("Approval context incomplete");
        }
        return new ApprovalAggregate(props);
    }
    get value() {
        return this.props;
    }
}
