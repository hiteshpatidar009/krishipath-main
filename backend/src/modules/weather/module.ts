import { Router } from "express";
import { WeatherService } from "./services/weather.service";
import { WeatherController } from "./controllers/weather.controller";
import { WeatherRoutes } from "./routes/weather.routes";

export class WeatherModule {
  private readonly weatherService: WeatherService;
  private readonly weatherController: WeatherController;
  private readonly weatherRoutes: WeatherRoutes;

  constructor() {
    this.weatherService = new WeatherService();
    this.weatherController = new WeatherController(this.weatherService);
    this.weatherRoutes = new WeatherRoutes(this.weatherController);
  }

  public getRouter(): Router {
    return this.weatherRoutes.getRouter();
  }
}
