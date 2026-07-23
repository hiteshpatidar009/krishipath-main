import { WeatherService } from "./services/weather.service";
import { WeatherController } from "./controllers/weather.controller";
import { WeatherRoutes } from "./routes/weather.routes";
export class WeatherModule {
    weatherService;
    weatherController;
    weatherRoutes;
    constructor() {
        this.weatherService = new WeatherService();
        this.weatherController = new WeatherController(this.weatherService);
        this.weatherRoutes = new WeatherRoutes(this.weatherController);
    }
    getRouter() {
        return this.weatherRoutes.getRouter();
    }
}
