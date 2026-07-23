export class SupportTicketValidator {
    static validateCreateTicket(request, response, next) {
        const { subject, description, customerId } = request.body;
        if (!subject || !description || !customerId) {
            response.status(400).json({
                success: false,
                message: "subject, description, and customerId are required",
            });
            return;
        }
        next();
    }
    static validateUpdateTicket(request, response, next) {
        if (!request.body || Object.keys(request.body).length === 0) {
            response.status(400).json({
                success: false,
                message: "At least one field is required to update the ticket",
            });
            return;
        }
        next();
    }
    static validateRespondTicket(request, response, next) {
        const { responderId, message } = request.body;
        if (!responderId || !message) {
            response.status(400).json({
                success: false,
                message: "responderId and message are required to respond to the ticket",
            });
            return;
        }
        next();
    }
}
