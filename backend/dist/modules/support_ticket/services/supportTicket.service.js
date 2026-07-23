import { SupportTicketMapper } from "../utils/supportTicket.mapper";
export class SupportTicketService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async createTicket(createTicketDto) {
        const ticketRecord = SupportTicketMapper.toTicketRecord(createTicketDto);
        const ticket = await this.repository.createTicket(ticketRecord);
        await this.repository.logAssistance(ticket.id, "Ticket created");
        await this.repository.notifyCustomer(ticket.id, "Your ticket has been created.");
        return ticket;
    }
    async getTicket(ticketId) {
        return this.repository.getTicketById(ticketId);
    }
    async updateTicket(ticketId, updateTicketDto) {
        const updateRecord = SupportTicketMapper.toTicketUpdateRecord(updateTicketDto);
        const ticket = await this.repository.updateTicket(ticketId, updateRecord);
        await this.repository.logAssistance(ticketId, "Ticket updated");
        return ticket;
    }
    async respondTicket(ticketId, respondTicketDto) {
        const responseRecord = SupportTicketMapper.toTicketResponseRecord(respondTicketDto);
        const result = await this.repository.addResponse(ticketId, responseRecord);
        await this.repository.notifyCustomer(ticketId, "A new response has been posted to your ticket.");
        await this.repository.logAssistance(ticketId, "Ticket response saved");
        return result;
    }
    async escalateTicket(ticketId, reason) {
        const escalation = await this.repository.escalateTicket(ticketId, reason);
        await this.repository.notifyCustomer(ticketId, "Your ticket has been escalated.");
        await this.repository.logAssistance(ticketId, "Ticket escalated");
        return escalation;
    }
}
