import { AppError } from "../../../shared/errors/app.error";
export class TransferTransitionPolicy {
    transitions = {
        draft: ["requested", "submitted", "cancelled"],
        requested: ["approved", "cancelled"],
        submitted: ["pending_approval", "approved", "rejected", "cancelled"],
        pending_approval: ["approved", "rejected", "cancelled"],
        approved: ["picked", "cancelled"],
        rejected: ["draft", "submitted"],
        picked: ["in_transit"],
        in_transit: ["received", "partially_received", "completed"],
        partially_received: ["received", "completed", "cancelled"],
        received: ["completed"],
        completed: [],
        cancelled: [],
    };
    ensure(current, target) {
        if (!this.transitions[current] || !this.transitions[current].includes(target)) {
            throw new AppError(`Invalid transfer transition: ${current} to ${target}`, 409, "INVALID_TRANSFER_STATE");
        }
    }
}
