import { Router } from "express";
export class WeatherRoutes {
    weatherController;
    router = Router();
    constructor(weatherController) {
        this.weatherController = weatherController;
        this.setupRoutes();
    }
    setupRoutes() {
        this.router.get("/", this.weatherController.getWeather);
    }
    getRouter() {
        return this.router;
    }
}
