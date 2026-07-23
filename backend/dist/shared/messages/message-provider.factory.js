import { env } from "../../infrastructure/config/env";
import { AppError } from "../errors/app.error";
import { DevMessageProvider } from "./dev-message.provider";
import { HttpMessageProvider } from "./http-message.provider";
export class MessageProviderFactory {
    create(channel) {
        const config = this.resolveConfig(channel);
        if (config.url && config.apiKey) {
            return new HttpMessageProvider(config.url, config.apiKey);
        }
        if (env.isEnvironmentProduction) {
            throw new AppError(`${channel} provider is not configured`, 503, "MESSAGE_PROVIDER_NOT_CONFIGURED");
        }
        return new DevMessageProvider();
    }
    resolveConfig(channel) {
        if (channel === "email") {
            return { url: env.emailProviderUrl, apiKey: env.emailProviderApiKey };
        }
        if (channel === "sms") {
            return { url: env.smsProviderUrl, apiKey: env.smsProviderApiKey };
        }
        return { url: env.pushProviderUrl, apiKey: env.pushProviderApiKey };
    }
}
