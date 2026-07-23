import { env } from "../../../../infrastructure/config/env";
export class CaptchaConfig {
    static usesTurnstile() {
        return env.isEnvironmentProduction;
    }
    static usesDevelopmentCaptcha() {
        return env.isEnvironmentDevelopment;
    }
    static getRequiredPayloadField() {
        return CaptchaConfig.usesTurnstile() ? "captchaToken" : "captchaCode";
    }
    static extractCaptchaValue(input) {
        if (CaptchaConfig.usesTurnstile()) {
            return input.captchaToken?.trim() || undefined;
        }
        return input.captchaCode?.trim() || undefined;
    }
}
