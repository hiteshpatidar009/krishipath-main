import { Router } from "express";
import { WeatherController } from "../controllers/weather.controller";

export class WeatherRoutes {
  private readonly router = Router();

  constructor(private readonly weatherController: WeatherController) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get("/", this.weatherController.getWeather);
  }

  public getRouter(): Router {
    return this.router;
  }
}
