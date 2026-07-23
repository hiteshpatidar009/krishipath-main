import { logger } from "../../../infrastructure/logger";
export class SupportTicketController {
    supportTicketService;
    constructor(supportTicketService) {
        this.supportTicketService = supportTicketService;
    }
    createTicket = async (request, response) => {
        await logger.info("support_ticket.create requested", {
            module: "support_ticket",
        });
        const ticket = await this.supportTicketService.createTicket(request.body);
        response.status(201).json({
            success: true,
            ticket,
        });
    };
    getTicket = async (request, response) => {
        const ticket = await this.supportTicketService.getTicket(this.param(request.params.ticketId));
        response.status(200).json({
            success: true,
            ticket,
        });
    };
    updateTicket = async (request, response) => {
        const ticket = await this.supportTicketService.updateTicket(this.param(request.params.ticketId), request.body);
        response.status(200).json({
            success: true,
            ticket,
        });
    };
    respondTicket = async (request, response) => {
        const result = await this.supportTicketService.respondTicket(this.param(request.params.ticketId), request.body);
        response.status(200).json({
            success: true,
            response: result,
        });
    };
    escalateTicket = async (request, response) => {
        const { reason } = request.body;
        const escalation = await this.supportTicketService.escalateTicket(this.param(request.params.ticketId), reason);
        response.status(200).json({
            success: true,
            escalation,
        });
    };
    param(value) {
        return Array.isArray(value) ? value[0] ?? "" : value ?? "";
    }
}
