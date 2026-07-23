import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
export class WeatherController {
    weatherService;
    constructor(weatherService) {
        this.weatherService = weatherService;
    }
    getWeather = async (req, res) => {
        try {
            const { lat, lon, mandiId } = req.query;
            const data = await this.weatherService.getWeather({
                lat: lat ? Number(lat) : undefined,
                lon: lon ? Number(lon) : undefined,
                mandiId: mandiId,
            });
            ApiResponse.ok(res, data, "Weather fetched successfully");
        }
        catch (e) {
            res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
        }
    };
}
