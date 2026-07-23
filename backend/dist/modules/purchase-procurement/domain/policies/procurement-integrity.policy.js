export class ProcurementIntegrityPolicy {
    transitions = new Map([
        ["draft", ["approval_required", "approved", "cancelled"]],
        ["approval_required", ["approved", "rejected", "cancelled"]],
        ["approved", ["partially_received", "received", "closed", "cancelled"]],
        ["partially_received", ["received", "closed"]],
        ["received", ["closed"]],
        ["rejected", ["draft"]],
        ["closed", []],
        ["cancelled", []],
    ]);
    ensureTransition(from, to) {
        if (!(this.transitions.get(from) ?? []).includes(to)) {
            throw new Error(`Invalid PO transition: ${from} -> ${to}`);
        }
    }
    isSuspiciousAmount(totalAmount) {
        return totalAmount > 1_000_000;
    }
}
