import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../../infrastructure/config/env";
import { logger } from "../../../infrastructure/logger";
import { AppError } from "../../../shared/errors/app.error";
export class GeminiGateway {
    genAI;
    constructor() {
        this.genAI = new GoogleGenerativeAI(env.geminiApiKey || "not-configured");
    }
    isConfigured() {
        return Boolean(env.geminiApiKey);
    }
    async chat(message, options) {
        try {
            if (!this.isConfigured()) {
                logger.warn("GEMINI_API_KEY is missing. KrishiGuru requests are disabled.", { module: "krishiguru" });
                throw new AppError("KrishiGuru AI provider is not configured", 503, "AI_PROVIDER_NOT_CONFIGURED");
            }
            const model = this.genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-3.5-flash" });
            const systemPrompt = `You are KrishiGuru, an expert agricultural AI assistant for Indian farmers.
You MUST respond in the farmer's preferred language: ${options.language}.
Keep responses clear, practical, and helpful.
Ask for the crop, growth stage, location, and visible symptoms when they are needed.
For pesticide, fertilizer, or disease advice, emphasize label directions, local regulations, protective equipment, and confirmation by a local agriculture officer when uncertain.
Never invent current market prices, weather, government schemes, or field observations.
${options.context ? `Additional Context:\n${options.context}` : ""}`;
            const chat = model.startChat({
                systemInstruction: { parts: [{ text: systemPrompt }], role: "system" },
                history: options.history.map(msg => ({
                    role: msg.role === "assistant" ? "model" : "user",
                    parts: [{ text: msg.content }],
                })),
            });
            const result = await chat.sendMessage(message);
            const response = await result.response;
            return response.text();
        }
        catch (error) {
            if (error instanceof AppError)
                throw error;
            logger.error(new Error("Failed to communicate with Gemini API"), { originalError: String(error) });
            throw new AppError("AI provider failed to generate a response", 502, "AI_PROVIDER_FAILED");
        }
    }
}
