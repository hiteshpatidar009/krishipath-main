import { z } from "zod";
const placeholderTurnstileTokens = new Set([
    "",
    "captcha-token",
    "captcha-token-local-12345",
    "<paste-turnstile-token-from-browser>",
]);
const normalizeTurnstileToken = (value) => {
    if (typeof value !== "string") {
        return value;
    }
    const token = value.trim();
    return placeholderTurnstileTokens.has(token) ? undefined : token;
};
export const turnstileTokenSchema = z.preprocess(normalizeTurnstileToken, z.string().min(10).optional());
export const requiredTurnstileTokenSchema = z.preprocess(normalizeTurnstileToken, z.string().min(10, "captchaToken is required"));
