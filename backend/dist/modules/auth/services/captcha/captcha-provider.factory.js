import { CaptchaConfig } from "./captcha.config";
import { DevelopmentCaptchaProvider } from "../providers/development-captcha.provider";
import { TurnstileCaptchaProvider } from "../providers/turnstile-captcha.provider";
export class CaptchaProviderFactory {
    static create() {
        return CaptchaConfig.usesTurnstile()
            ? new TurnstileCaptchaProvider()
            : new DevelopmentCaptchaProvider();
    }
}
