import { RequestHandler } from "express";
import { AuditContext, AuditContextInput } from "./audit-context";

export function auditEvent(input: AuditContextInput): RequestHandler {
  return (request, _response, next): void => {
    AuditContext.set(request, input);
    next();
  };
}
