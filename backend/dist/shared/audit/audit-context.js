export class AuditContext {
    static key = Symbol.for("krishipath.audit.context");
    static set(request, input) {
        const target = request;
        target[AuditContext.key] = {
            ...target[AuditContext.key],
            ...input,
            metadata: {
                ...(target[AuditContext.key]?.metadata ?? {}),
                ...(input.metadata ?? {}),
            },
        };
    }
    static get(request) {
        return (request[AuditContext.key] ?? {});
    }
}
