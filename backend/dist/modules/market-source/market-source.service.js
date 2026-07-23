import { Db1Connection } from "../../infrastructure/database/postgres/connections/db1.connection";
import { getRawMarketMessageModel } from "../../infrastructure/database/mongodb/schemas/raw-market-message.schema";
import { eq, desc } from "drizzle-orm";
import { marketSourcesTable, marketSourceProductsTable, marketSourceMandisTable, marketSourceParserProfilesTable, marketSourceTimelineTable, marketSourceAnalyticsTable, } from "../../infrastructure/database/postgres/schemas/db1/market-source.schema";
import { productsTable, mandisTable } from "../../infrastructure/database/postgres/schemas/db1";
export class MarketSourceService {
    async getMarketSources(filters) {
        const db = Db1Connection.getInstance();
        const sources = await db.select().from(marketSourcesTable)
            .orderBy(desc(marketSourcesTable.createdAt));
        return sources;
    }
    async getMarketSourceById(id) {
        const db = Db1Connection.getInstance();
        const [source] = await db.select().from(marketSourcesTable)
            .where(eq(marketSourcesTable.id, id))
            .limit(1);
        if (!source) {
            throw new Error("Market source not found");
        }
        // Fetch related mandis
        const mandis = await db.select({
            mandiId: marketSourceMandisTable.mandiId,
            name: mandisTable.name,
        })
            .from(marketSourceMandisTable)
            .leftJoin(mandisTable, eq(marketSourceMandisTable.mandiId, mandisTable.id))
            .where(eq(marketSourceMandisTable.marketSourceId, id));
        // Fetch related products
        const products = await db.select({
            productId: marketSourceProductsTable.productId,
            name: productsTable.name,
        })
            .from(marketSourceProductsTable)
            .leftJoin(productsTable, eq(marketSourceProductsTable.productId, productsTable.id))
            .where(eq(marketSourceProductsTable.marketSourceId, id));
        const { marketSourceParserProfilesTable } = await import("../../infrastructure/database/postgres/schemas/db1/market-source.schema");
        const profiles = await db.select()
            .from(marketSourceParserProfilesTable)
            .where(eq(marketSourceParserProfilesTable.marketSourceId, id));
        return {
            ...source,
            mandis: mandis.map(m => ({ id: m.mandiId, name: m.name })),
            products: products.map(p => ({ id: p.productId, name: p.name })),
            isAutomationEnabled: profiles[0]?.isAutomationEnabled || false,
        };
    }
    async createMarketSource(data, userId) {
        const db = Db1Connection.getInstance();
        // Extract mandiIds and productIds if they exist
        const { mandiIds, productIds, ...sourceData } = data;
        // Sanitize UUID fields: convert empty strings to undefined to avoid Postgres UUID errors
        if (sourceData.stateId === "")
            sourceData.stateId = undefined;
        if (sourceData.districtId === "")
            sourceData.districtId = undefined;
        if (sourceData.mandiId === "")
            sourceData.mandiId = undefined;
        // Use transaction to ensure data integrity
        const newSource = await db.transaction(async (tx) => {
            const [insertedSource] = await tx.insert(marketSourcesTable).values({
                ...sourceData,
                createdBy: userId,
            }).returning();
            // Handle mandi mappings
            if (mandiIds && Array.isArray(mandiIds) && mandiIds.length > 0) {
                const mandiMappings = mandiIds.map((mandiId) => ({
                    marketSourceId: insertedSource.id,
                    mandiId,
                }));
                await tx.insert(marketSourceMandisTable).values(mandiMappings);
            }
            else if (sourceData.mandiId) {
                // Fallback for older single mandiId structure
                await tx.insert(marketSourceMandisTable).values({
                    marketSourceId: insertedSource.id,
                    mandiId: sourceData.mandiId,
                });
            }
            // Handle product mappings
            if (productIds && Array.isArray(productIds) && productIds.length > 0) {
                const productMappings = productIds.map((productId) => ({
                    marketSourceId: insertedSource.id,
                    productId,
                }));
                await tx.insert(marketSourceProductsTable).values(productMappings);
            }
            // Create a timeline event
            await tx.insert(marketSourceTimelineTable).values({
                marketSourceId: insertedSource.id,
                activityType: "CREATED",
                description: "Market Source was created",
                createdBy: userId,
            });
            // Create default analytics record
            await tx.insert(marketSourceAnalyticsTable).values({
                marketSourceId: insertedSource.id,
            });
            // Create default parser profile record
            await tx.insert(marketSourceParserProfilesTable).values({
                marketSourceId: insertedSource.id,
            });
            return insertedSource;
        });
        // Notify WhatsApp Intelligence Service if whatsappNumber is provided
        if (newSource.whatsappNumber) {
            this.notifyWhatsAppIntelligence(newSource);
        }
        return newSource;
    }
    async notifyWhatsAppIntelligence(source) {
        try {
            console.log(`[Integration] Notifying WhatsApp service about new source: ${source.whatsappNumber}`);
            // In a real scenario, this would be a RabbitMQ event or Webhook call to Service 2
            // e.g., await axios.post("http://whatsapp-service:3000/api/traders", { phone: source.whatsappNumber });
        }
        catch (error) {
            console.error("[Integration Error] Failed to notify WhatsApp service", error);
        }
    }
    async updateMarketSource(id, data, userId) {
        const db = Db1Connection.getInstance();
        // Extract mandiIds and productIds if they exist
        const { mandiIds, productIds, ...sourceData } = data;
        // Sanitize UUID fields: convert empty strings to undefined to avoid Postgres UUID errors
        if (sourceData.stateId === "")
            sourceData.stateId = undefined;
        if (sourceData.districtId === "")
            sourceData.districtId = undefined;
        if (sourceData.mandiId === "")
            sourceData.mandiId = undefined;
        // Use transaction to ensure data integrity
        const updatedSource = await db.transaction(async (tx) => {
            // Clean up undefined values from sourceData
            Object.keys(sourceData).forEach(key => sourceData[key] === undefined && delete sourceData[key]);
            const [source] = await tx.update(marketSourcesTable)
                .set({ ...sourceData, updatedAt: new Date() })
                .where(eq(marketSourcesTable.id, id))
                .returning();
            if (!source)
                throw new Error("Market source not found");
            // Handle mandi mappings
            if (mandiIds && Array.isArray(mandiIds)) {
                await tx.delete(marketSourceMandisTable).where(eq(marketSourceMandisTable.marketSourceId, id));
                if (mandiIds.length > 0) {
                    const mandiMappings = mandiIds.map((mandiId) => ({
                        marketSourceId: id,
                        mandiId,
                    }));
                    await tx.insert(marketSourceMandisTable).values(mandiMappings);
                }
            }
            // Handle product mappings
            if (productIds && Array.isArray(productIds)) {
                await tx.delete(marketSourceProductsTable).where(eq(marketSourceProductsTable.marketSourceId, id));
                if (productIds.length > 0) {
                    const productMappings = productIds.map((productId) => ({
                        marketSourceId: id,
                        productId,
                    }));
                    await tx.insert(marketSourceProductsTable).values(productMappings);
                }
            }
            return source;
        });
        return updatedSource;
    }
    async getWhatsAppMessages(id, limit = 20) {
        const source = await this.getMarketSourceById(id);
        // We fetch messages using whatsappGroupId if available.
        // If not, we might fallback to sender number.
        const query = {};
        if (source.whatsappGroupId) {
            query.$or = [
                { whatsappGroupId: source.whatsappGroupId },
                { groupId: source.whatsappGroupId }
            ];
        }
        else if (source.whatsappNumber) {
            query.sender = source.whatsappNumber;
        }
        else {
            return [];
        }
        const messages = await getRawMarketMessageModel().find(query)
            .sort({ createdAt: -1, timestamp: -1 }) // Handle both createdAt and timestamp
            .limit(limit)
            .lean()
            .exec();
        // Return messages
        return messages;
    }
    async submitPrices(marketSourceId, prices, userId) {
        const db = Db1Connection.getInstance();
        const { eq, and } = await import("drizzle-orm");
        const { productVariantsTable } = await import("../../infrastructure/database/postgres/schemas/db1/all.schema");
        const { priceSubmissionsTable } = await import("../../infrastructure/database/postgres/schemas/db1/price.schema");
        // Verify market source exists and get fallback mandi
        const source = await this.getMarketSourceById(marketSourceId);
        const fallbackMandiId = source.mandis?.[0]?.id || null;
        if (!prices || !Array.isArray(prices) || prices.length === 0) {
            throw new Error("No prices provided");
        }
        const priceSubmissions = [];
        for (const price of prices) {
            const vName = price.variantName || 'Base';
            let actualVariantId = price.variantId;
            // If variantId is missing but we have variantName, look it up or create it
            if (!actualVariantId) {
                const existingVariants = await db.select()
                    .from(productVariantsTable)
                    .where(and(eq(productVariantsTable.productId, price.productId), eq(productVariantsTable.gradeName, vName))).limit(1);
                if (existingVariants.length > 0) {
                    actualVariantId = existingVariants[0].id;
                }
                else {
                    // Create a new variant
                    const { v4: uuidv4 } = await import("uuid");
                    const newVarId = uuidv4();
                    await db.insert(productVariantsTable).values({
                        id: newVarId,
                        productId: price.productId,
                        gradeName: vName,
                        unit: price.unit || 'Qtl'
                    });
                    actualVariantId = newVarId;
                }
            }
            priceSubmissions.push({
                marketSourceId,
                mandiId: price.mandiId || fallbackMandiId,
                productId: price.productId,
                variantId: actualVariantId,
                unit: price.unit || 'Qtl',
                minPrice: price.minPrice?.toString(),
                maxPrice: price.maxPrice?.toString(),
                modalPrice: price.modalPrice?.toString(),
                source: price.source || 'MANUAL',
                status: 'VERIFIED',
            });
        }
        const result = await db.insert(priceSubmissionsTable).values(priceSubmissions).returning();
        return result;
    }
    async getPriceHistory(marketSourceId) {
        const db = Db1Connection.getInstance();
        const { priceSubmissionsTable } = await import("../../infrastructure/database/postgres/schemas/db1/price.schema");
        const history = await db.select({
            id: priceSubmissionsTable.id,
            productId: priceSubmissionsTable.productId,
            productName: productsTable.name,
            variantName: priceSubmissionsTable.variantId,
            minPrice: priceSubmissionsTable.minPrice,
            maxPrice: priceSubmissionsTable.maxPrice,
            createdAt: priceSubmissionsTable.createdAt,
        })
            .from(priceSubmissionsTable)
            .leftJoin(productsTable, eq(priceSubmissionsTable.productId, productsTable.id))
            .where(eq(priceSubmissionsTable.marketSourceId, marketSourceId))
            .orderBy(desc(priceSubmissionsTable.createdAt));
        // Group by day
        const grouped = history.reduce((acc, curr) => {
            const date = curr.createdAt.toISOString().split('T')[0];
            if (!acc[date])
                acc[date] = [];
            acc[date].push(curr);
            return acc;
        }, {});
        return Object.keys(grouped).map(date => ({
            date,
            prices: grouped[date]
        }));
    }
    async toggleAutomation(marketSourceId, isAutomationEnabled) {
        const db = Db1Connection.getInstance();
        const { marketSourceParserProfilesTable } = await import("../../infrastructure/database/postgres/schemas/db1/market-source.schema");
        await db.update(marketSourceParserProfilesTable)
            .set({ isAutomationEnabled, updatedAt: new Date() })
            .where(eq(marketSourceParserProfilesTable.marketSourceId, marketSourceId));
        return { success: true, isAutomationEnabled };
    }
    async getParserProfile(marketSourceId) {
        const db = Db1Connection.getInstance();
        const { marketSourceParserProfilesTable } = await import("../../infrastructure/database/postgres/schemas/db1/market-source.schema");
        const profiles = await db.select()
            .from(marketSourceParserProfilesTable)
            .where(eq(marketSourceParserProfilesTable.marketSourceId, marketSourceId));
        return profiles.length > 0 ? profiles[0] : null;
    }
    async processIncomingWebhook(payload) {
        const db = Db1Connection.getInstance();
        const { sender, message, groupId, groupName, messageId } = payload;
        const RawMarketMessageModel = getRawMarketMessageModel();
        // Find market source by sender or groupId
        let sourceQuery = undefined;
        if (groupId) {
            sourceQuery = eq(marketSourcesTable.whatsappGroupId, groupId);
        }
        else if (sender) {
            sourceQuery = eq(marketSourcesTable.whatsappNumber, sender);
        }
        if (!sourceQuery)
            return { success: false, reason: "No identifier provided" };
        const sources = await db.select().from(marketSourcesTable).where(sourceQuery).limit(1);
        if (sources.length === 0)
            return { success: false, reason: "No matching market source" };
        const source = sources[0];
        const fullSource = await this.getMarketSourceById(source.id);
        const mandiId = fullSource.mandis?.[0]?.id || source.mandiId;
        // Create raw message
        const msg = new RawMarketMessageModel({
            messageId: messageId || `wh-${Date.now()}`,
            marketSourceId: source.id,
            whatsappGroupId: groupId,
            groupName: groupName,
            sender: sender || "system",
            timestamp: new Date(),
            rawMessage: payload,
            text: message, // Use 'text' schema field if possible
        });
        // Fallback manual assignment if text field doesn't exist on msg
        msg.text = message;
        // Fetch profile to check automation
        const profile = await this.getParserProfile(source.id);
        if (profile?.isAutomationEnabled && message) {
            const { FuzzyMessageParserService } = await import("./services/fuzzy-parser.service");
            const fuzzyParser = new FuzzyMessageParserService();
            const extractedData = await fuzzyParser.parseRawMessage(message, profile);
            msg.extractedData = extractedData;
            msg.isParsed = true;
            msg.aiStatus = "completed";
            msg.parserVersion = "fuzzy-v1";
            if (extractedData?.prices?.length > 0) {
                try {
                    const pricesToSubmit = extractedData.prices.map((p) => ({
                        mandiId: mandiId,
                        productId: p.productId,
                        variantId: p.variantName,
                        unit: p.unit,
                        minPrice: p.minPrice,
                        maxPrice: p.maxPrice,
                        source: "AUTO",
                    }));
                    await this.submitPrices(source.id, pricesToSubmit, "SYSTEM");
                    msg.approvalStatus = "SAVED";
                }
                catch (e) {
                    console.error("Auto-submit failed", e);
                }
            }
        }
        await msg.save();
        return { success: true, processed: !!profile?.isAutomationEnabled, messageId: msg._id };
    }
}
