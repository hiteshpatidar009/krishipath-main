import { SupportTicketController } from "./controllers/supportTicket.controller";
import { SupportTicketRepository } from "./repositories/supportTicket.repository";
import { SupportTicketRoutes } from "./routes/supportTicket.routes";
import { SupportTicketService } from "./services/supportTicket.service";
export class SupportTicketModule {
    supportTicketRepository;
    supportTicketService;
    supportTicketController;
    supportTicketRoutes;
    constructor() {
        this.supportTicketRepository = new SupportTicketRepository();
        this.supportTicketService = new SupportTicketService(this.supportTicketRepository);
        this.supportTicketController = new SupportTicketController(this.supportTicketService);
        this.supportTicketRoutes = new SupportTicketRoutes(this.supportTicketController);
    }
    getRouter() {
        return this.supportTicketRoutes.getRouter();
    }
}
