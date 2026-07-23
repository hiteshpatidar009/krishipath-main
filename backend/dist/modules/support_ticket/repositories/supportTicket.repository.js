export class SupportTicketRepository {
    async createTicket(ticket) {
        return {
            id: `ticket_${Date.now()}`,
            ...ticket,
            status: "open",
            createdAt: new Date().toISOString(),
        };
    }
    async getTicketById(ticketId) {
        return {
            id: ticketId,
            subject: "Sample ticket",
            description: "Sample ticket details",
            status: "open",
            createdAt: new Date().toISOString(),
        };
    }
    async updateTicket(ticketId, updateTicketDto) {
        return {
            id: ticketId,
            ...updateTicketDto,
            updatedAt: new Date().toISOString(),
        };
    }
    async addResponse(ticketId, respondTicketDto) {
        return {
            ticketId,
            ...respondTicketDto,
            respondedAt: new Date().toISOString(),
        };
    }
    async escalateTicket(ticketId, reason) {
        return {
            ticketId,
            reason,
            escalatedAt: new Date().toISOString(),
        };
    }
    async notifyCustomer(_ticketId, _message) {
        return;
    }
    async logAssistance(_ticketId, _note) {
        return;
    }
}
