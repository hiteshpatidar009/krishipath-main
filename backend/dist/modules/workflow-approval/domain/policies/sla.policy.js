export class SlaPolicy {
    isOverdue(dueAt, now = new Date()) {
        return Boolean(dueAt && dueAt.getTime() < now.getTime());
    }
}
