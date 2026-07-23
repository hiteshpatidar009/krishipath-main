import { Router } from "express";
import { IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard } from "../../../shared/security";
import { SupportTicketValidator } from "../validators/supportTicket.validator";
export class SupportTicketRoutes {
    controller;
    router;
    constructor(controller) {
        this.controller = controller;
        this.router = Router();
        this.register();
    }
    getRouter() {
        return this.router;
    }
    register() {
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        this.router.post("/", IdempotencyMiddleware.requireForMutations(), SupportTicketValidator.validateCreateTicket, this.controller.createTicket);
        this.router.get("/:ticketId", this.controller.getTicket);
        this.router.put("/:ticketId", IdempotencyMiddleware.requireForMutations(), SupportTicketValidator.validateUpdateTicket, this.controller.updateTicket);
        this.router.post("/:ticketId/respond", IdempotencyMiddleware.requireForMutations(), SupportTicketValidator.validateRespondTicket, this.controller.respondTicket);
        this.router.post("/:ticketId/escalate", IdempotencyMiddleware.requireForMutations(), this.controller.escalateTicket);
    }
}
