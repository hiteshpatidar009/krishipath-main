export class WorkflowTransitionPolicy {
    transitions = new Map([
        ["pending", ["running", "rejected"]],
        ["running", ["approved", "rejected", "escalated", "completed"]],
        ["escalated", ["approved", "rejected", "completed"]],
        ["approved", ["completed"]],
    ]);
    ensureAllowed(from, to) {
        const allowed = this.transitions.get(from) ?? [];
        if (!allowed.includes(to)) {
            throw new Error(`Invalid workflow transition: ${from} -> ${to}`);
        }
    }
}
