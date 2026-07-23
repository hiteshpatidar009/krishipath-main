import { Router } from "express";
import { KrishiGuruController } from "./controllers/krishiguru.controller";
import { KrishiGuruRepository } from "./repositories/krishiguru.repository";
import { KrishiGuruRoutes } from "./routes/krishiguru.routes";
import { KrishiGuruService } from "./services/krishiguru.service";
import { CoreEventDispatcher } from "../../core/events";

export class KrishiGuruModule {
  private readonly krishiGuruRepository: KrishiGuruRepository;
  private readonly krishiGuruService: KrishiGuruService;
  private readonly krishiGuruController: KrishiGuruController;
  private readonly krishiGuruRoutes: KrishiGuruRoutes;

  constructor() {
    this.krishiGuruRepository = new KrishiGuruRepository();
    this.krishiGuruService = new KrishiGuruService(
      this.krishiGuruRepository,
      CoreEventDispatcher
    );
    this.krishiGuruController = new KrishiGuruController(this.krishiGuruService);
    this.krishiGuruRoutes = new KrishiGuruRoutes(this.krishiGuruController);
  }

  public getRouter(): Router {
    return this.krishiGuruRoutes.getRouter();
  }
}
