export class SupportTicketMapper {
    static toTicketRecord(createTicketDto) {
        return {
            ...createTicketDto,
            createdAt: new Date().toISOString(),
            status: "open",
        };
    }
    static toTicketUpdateRecord(updateTicketDto) {
        return {
            ...updateTicketDto,
            updatedAt: new Date().toISOString(),
        };
    }
    static toTicketResponseRecord(respondTicketDto) {
        return respondTicketDto;
    }
}
