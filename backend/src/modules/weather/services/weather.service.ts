import axios from "axios";
import { eq } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { mandisTable } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
import { AppError } from "../../../shared/errors/app.error";

export class WeatherService {
  private get db() {
    return Db1Connection.getInstance();
  }

  public async getWeather(params: { lat?: number; lon?: number; mandiId?: string }) {
    let lat = params.lat;
    let lon = params.lon;

    if (params.mandiId) {
      const [mandi] = await this.db
        .select({ latitude: mandisTable.latitude, longitude: mandisTable.longitude })
        .from(mandisTable)
        .where(eq(mandisTable.id, params.mandiId))
        .limit(1);
      if (mandi?.latitude != null && mandi?.longitude != null) {
        lat = Number(mandi.latitude);
        lon = Number(mandi.longitude);
      }
    }

    if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new AppError("A valid location or mandiId is required for weather", 400, "WEATHER_LOCATION_REQUIRED");
    }

    const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: lat,
        longitude: lon,
        current: "temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m",
        daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset",
        forecast_days: 7,
        timezone: "auto",
      },
      timeout: 10_000,
    });
    const data = response.data;
    const current = data.current;
    const daily = data.daily;
    const condition = this.mapWeatherCode(current.weather_code);
    const advice = this.getFarmingAdvice(current);
    const forecast = (daily.time || []).map((date: string, index: number) => {
      const mapped = this.mapWeatherCode(daily.weather_code[index]);
      return {
        date,
        condition: mapped.text,
        weatherCode: daily.weather_code[index],
        minTemp: Math.round(daily.temperature_2m_min[index]),
        maxTemp: Math.round(daily.temperature_2m_max[index]),
        precipitationProbability: daily.precipitation_probability_max[index] ?? null,
        precipitationMm: daily.precipitation_sum[index] ?? null,
        sunrise: daily.sunrise[index] ?? null,
        sunset: daily.sunset[index] ?? null,
      };
    });

    return {
      source: "OPEN_METEO",
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      observedAt: current.time,
      temp: Math.round(current.temperature_2m),
      condition: condition.text,
      icon: condition.icon,
      weatherCode: current.weather_code,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      precipitationMm: current.precipitation,
      minTemp: Math.round(daily.temperature_2m_min[0]),
      maxTemp: Math.round(daily.temperature_2m_max[0]),
      adviceCode: advice.code,
      advice: advice.text,
      forecast,
    };
  }

  private mapWeatherCode(code: number) {
    if (code === 0) return { text: "Sunny", icon: "☀️" };
    if (code >= 1 && code <= 3) return { text: "Partly Cloudy", icon: "⛅" };
    if (code === 45 || code === 48) return { text: "Fog", icon: "🌫️" };
    if (code >= 51 && code <= 67) return { text: "Rain", icon: "🌧️" };
    if (code >= 71 && code <= 77) return { text: "Snow", icon: "❄️" };
    if (code >= 80 && code <= 82) return { text: "Heavy Showers", icon: "🌧️" };
    if (code >= 95 && code <= 99) return { text: "Thunderstorm", icon: "⛈️" };
    return { text: "Clear", icon: "🌤️" };
  }

  private getFarmingAdvice(current: { weather_code: number; temperature_2m: number; wind_speed_10m: number }) {
    const code = current.weather_code;
    if (code >= 51 && code <= 82) {
      return { code: "AVOID_SPRAY_RAIN", text: "Rain or showers are present; avoid spraying pesticides." };
    }
    if (code >= 95 && code <= 99) {
      return { code: "PROTECT_FROM_STORM", text: "Thunderstorms are present; protect workers, livestock, and loose equipment." };
    }
    if (current.temperature_2m >= 40) {
      return { code: "HEAT_PRECAUTION", text: "Extreme heat is present; avoid midday field work and check irrigation needs." };
    }
    if (current.wind_speed_10m >= 25) {
      return { code: "HIGH_WIND", text: "Wind is strong; postpone spraying and secure loose materials." };
    }
    return {
      code: "FIELD_CONDITIONS_NORMAL",
      text: "Current weather does not indicate a rain, storm, heat, or high-wind warning.",
    };
  }
}
