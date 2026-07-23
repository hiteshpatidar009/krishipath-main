import { AuditContext } from "./audit-context";
export function auditEvent(input) {
    return (request, _response, next) => {
        AuditContext.set(request, input);
        next();
    };
}
