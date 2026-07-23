import { ApiResponse } from "../../shared/http/api-response";
export class MarketSourceController {
    marketSourceService;
    constructor(marketSourceService) {
        this.marketSourceService = marketSourceService;
    }
    getMarketSources = async (req, res, next) => {
        try {
            const filters = req.query;
            const sources = await this.marketSourceService.getMarketSources(filters);
            ApiResponse.ok(res, sources, "Market sources retrieved successfully");
        }
        catch (error) {
            next(error);
        }
    };
    getMarketSourceById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const source = await this.marketSourceService.getMarketSourceById(id);
            ApiResponse.ok(res, source, "Market source retrieved successfully");
        }
        catch (error) {
            next(error);
        }
    };
    createMarketSource = async (req, res, next) => {
        try {
            const userId = req.user?.id; // Assuming auth middleware sets this
            const newSource = await this.marketSourceService.createMarketSource(req.body, userId);
            // Assuming there is a created method or using generic ok for now.
            ApiResponse.ok(res, newSource, "Market source created successfully");
        }
        catch (error) {
            next(error);
        }
    };
    updateMarketSource = async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id; // Assuming auth middleware sets this
            const updatedSource = await this.marketSourceService.updateMarketSource(String(id), req.body, userId);
            ApiResponse.ok(res, updatedSource, "Market source updated successfully");
        }
        catch (error) {
            next(error);
        }
    };
    getMarketSourceMessages = async (req, res, next) => {
        try {
            const { id } = req.params;
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const messages = await this.marketSourceService.getWhatsAppMessages(String(id), limit);
            ApiResponse.ok(res, messages, "Messages retrieved successfully");
        }
        catch (error) {
            next(error);
        }
    };
    submitMarketSourcePrices = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { prices } = req.body;
            const userId = req.user?.id;
            // We will delegate to the new PriceService / AggregationEngine to handle submission
            // For now, we assume a method submitPrices on marketSourceService or similar
            const result = await this.marketSourceService.submitPrices(String(id), prices, userId);
            ApiResponse.ok(res, result, "Prices submitted successfully");
        }
        catch (error) {
            next(error);
        }
    };
    getMarketSourcePriceHistory = async (req, res, next) => {
        try {
            const { id } = req.params;
            const prices = await this.marketSourceService.getPriceHistory(String(id));
            ApiResponse.ok(res, prices, "Market source price history retrieved successfully");
        }
        catch (error) {
            next(error);
        }
    };
    parseMessage = async (req, res, next) => {
        try {
            const { id, msgId } = req.params;
            const { getRawMarketMessageModel } = await import("../../infrastructure/database/mongodb/schemas/raw-market-message.schema");
            const msg = await getRawMarketMessageModel().findById(String(msgId));
            if (!msg) {
                res.status(404).json({ error: "Message not found" });
                return;
            }
            // Fetch parser profile from Postgres
            const { Db1Connection } = await import("../../infrastructure/database/postgres/connections/db1.connection");
            const { marketSourceParserProfilesTable } = await import("../../infrastructure/database/postgres/schemas/db1/market-source.schema");
            const { eq } = await import("drizzle-orm");
            const db = Db1Connection.getInstance();
            const profiles = await db.select()
                .from(marketSourceParserProfilesTable)
                .where(eq(marketSourceParserProfilesTable.marketSourceId, String(id)));
            const profile = profiles.length > 0 ? profiles[0] : null;
            // We should use Fuzzy parser!
            const { FuzzyMessageParserService } = await import("./services/fuzzy-parser.service");
            const fuzzyParser = new FuzzyMessageParserService();
            // Get the message text (check both new and legacy formats)
            const text = msg.text || msg.rawMessage?.conversation || msg.rawMessage?.text || JSON.stringify(msg.rawMessage);
            if (!text) {
                res.status(400).json({ error: "Message has no text" });
                return;
            }
            // Execute parsing with profile
            const extractedData = await fuzzyParser.parseRawMessage(text, profile);
            // Update the DB
            msg.extractedData = extractedData;
            msg.isParsed = true;
            msg.aiStatus = "completed"; // Re-using aiStatus to signal it's processed
            msg.parserVersion = "fuzzy-v1";
            if (!msg.timestamp) {
                msg.timestamp = new Date();
            }
            await msg.save();
            res.status(200).json({ success: true, extractedData });
        }
        catch (error) {
            next(error);
        }
    };
    handleIncomingWebhook = async (req, res, next) => {
        try {
            const payload = req.body;
            const result = await this.marketSourceService.processIncomingWebhook(payload);
            ApiResponse.ok(res, result, "Webhook processed");
        }
        catch (error) {
            next(error);
        }
    };
    getHistory = async (req, res, next) => {
        try {
            const { id } = req.params;
            const history = await this.marketSourceService.getPriceHistory(String(id));
            ApiResponse.ok(res, history, "History retrieved");
        }
        catch (error) {
            next(error);
        }
    };
    updateParserProfile = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { isAutomationEnabled } = req.body;
            const result = await this.marketSourceService.toggleAutomation(String(id), isAutomationEnabled);
            ApiResponse.ok(res, result, "Parser profile updated");
        }
        catch (error) {
            next(error);
        }
    };
}
