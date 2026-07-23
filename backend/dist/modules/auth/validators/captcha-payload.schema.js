import { z } from "zod";
import { env } from "../../../infrastructure/config/env";
import { requiredTurnstileTokenSchema } from "./turnstile-token.schema";
const ignoredCaptchaField = z.string().optional();
export function captchaPayloadFields() {
    if (env.isEnvironmentProduction) {
        return {
            captchaToken: requiredTurnstileTokenSchema,
            captchaCode: ignoredCaptchaField,
        };
    }
    return {
        captchaCode: z.string().trim().min(1, "captchaCode is required"),
        captchaToken: ignoredCaptchaField,
    };
}
