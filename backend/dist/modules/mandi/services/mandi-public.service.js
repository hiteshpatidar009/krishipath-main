import { AppError } from "../../../shared/errors/app.error";
const toNumber = (value) => {
    if (value === null || value === undefined || value === "")
        return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
};
const round = (value, digits = 2) => {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
};
const distanceKm = (origin, latitude, longitude) => {
    const lat1 = toNumber(origin?.latitude);
    const lon1 = toNumber(origin?.longitude);
    const lat2 = toNumber(latitude);
    const lon2 = toNumber(longitude);
    if (lat1 === null || lon1 === null || lat2 === null || lon2 === null)
        return null;
    const radians = (degrees) => (degrees * Math.PI) / 180;
    const dLat = radians(lat2 - lat1);
    const dLon = radians(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
    return round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)), 1);
};
const initials = (name) => name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "TR";
export class MandiPublicService {
    mandiRepo;
    mandiProductRepo;
    mandiPriceRepo;
    productExtrasRepo;
    traderPriceRepo;
    marketInsightRepo;
    constructor(mandiRepo, mandiProductRepo, mandiPriceRepo, productExtrasRepo, traderPriceRepo, marketInsightRepo) {
        this.mandiRepo = mandiRepo;
        this.mandiProductRepo = mandiProductRepo;
        this.mandiPriceRepo = mandiPriceRepo;
        this.productExtrasRepo = productExtrasRepo;
        this.traderPriceRepo = traderPriceRepo;
        this.marketInsightRepo = marketInsightRepo;
    }
    shapeMandi(mandi, origin) {
        const images = Array.isArray(mandi.imageUrls) ? mandi.imageUrls.filter(Boolean) : [];
        return {
            id: mandi.id,
            code: mandi.code,
            slug: mandi.slug,
            name: mandi.name,
            address: mandi.address,
            districtId: mandi.districtId,
            districtName: mandi.districtName,
            stateId: mandi.stateId,
            stateName: mandi.stateName,
            latitude: toNumber(mandi.latitude),
            longitude: toNumber(mandi.longitude),
            distanceKm: distanceKm(origin, mandi.latitude, mandi.longitude),
            openingTime: mandi.openingTime,
            closingTime: mandi.closingTime,
            workingDays: Array.isArray(mandi.workingDays) ? mandi.workingDays : [],
            imageUrl: images[0] || null,
            images,
            currency: mandi.currency,
            defaultUnit: mandi.defaultUnit,
            status: mandi.status,
        };
    }
    shapePriceHistory(rows) {
        return rows.map((row) => ({
            date: row.priceDate,
            price: toNumber(row.priceModal),
            minPrice: toNumber(row.priceMin),
            maxPrice: toNumber(row.priceMax),
            arrivalQuantity: toNumber(row.arrivalQuantity),
            arrivalUnit: row.arrivalUnit || null,
            grade: row.grade,
            unit: row.unit,
            source: row.source,
        }));
    }
    shapeProduct(crop, historyRows) {
        const history = this.shapePriceHistory(historyRows);
        const current = history[0] || null;
        const previous = history[1] || null;
        const currentPrice = current?.price ?? null;
        const previousPrice = previous?.price ?? null;
        const changeAmount = currentPrice !== null && previousPrice !== null
            ? round(currentPrice - previousPrice)
            : null;
        const changePercent = changeAmount !== null && previousPrice
            ? round((changeAmount / previousPrice) * 100)
            : null;
        return {
            id: crop.productId,
            productId: crop.productId,
            code: crop.cropCode,
            name: crop.cropName,
            category: crop.cropCategory,
            imageUrl: crop.cropImageUrl || null,
            available: currentPrice !== null && currentPrice > 0,
            currentPrice,
            minPrice: current?.minPrice ?? null,
            maxPrice: current?.maxPrice ?? null,
            previousPrice,
            changeAmount,
            changePercent,
            priceDate: current?.date ?? null,
            arrivalQuantity: current?.arrivalQuantity ?? null,
            arrivalUnit: current?.arrivalUnit ?? null,
            grade: current?.grade ?? null,
            unit: current?.unit ?? "QUINTAL",
            source: current?.source ?? null,
            history: history.slice(0, 30).reverse(),
        };
    }
    shapeInsight(insight) {
        if (!insight) {
            return { available: false, message: "No published market insight is available" };
        }
        return {
            available: true,
            id: insight.id,
            source: insight.source,
            scope: insight.scope,
            recommendation: insight.recommendation,
            currentPrice: toNumber(insight.currentPrice),
            targetPrice: toNumber(insight.targetPrice),
            expectedRange: {
                min: toNumber(insight.expectedRangeMin),
                max: toNumber(insight.expectedRangeMax),
            },
            delta: toNumber(insight.delta),
            confidence: insight.confidencePercent,
            summary: insight.summary,
            positiveFactors: Array.isArray(insight.positiveFactors) ? insight.positiveFactors : [],
            riskFactors: Array.isArray(insight.riskFactors) ? insight.riskFactors : [],
            bestSellingWindow: {
                from: insight.bestWindowFrom,
                to: insight.bestWindowTo,
            },
            expectedDuration: insight.expectedDuration,
            weatherImpact: insight.weatherImpact && typeof insight.weatherImpact === "object"
                ? insight.weatherImpact
                : null,
            storageAdvice: insight.storageAdvice || null,
            storageExpectedGain: {
                min: toNumber(insight.storageExpectedGainMin),
                max: toNumber(insight.storageExpectedGainMax),
            },
            publishedAt: insight.publishAt,
            expiresAt: insight.expiresAt,
        };
    }
    async getBuyers(mandiId, productId) {
        const rows = await this.traderPriceRepo.findByMandiAndProduct(mandiId, productId);
        const byTrader = new Map();
        for (const row of rows) {
            const price = toNumber(row.pricePerQuintal);
            // An assignment alone is not a published offer. Public clients should
            // receive only approved traders that have provided a usable price.
            if (price === null || price <= 0)
                continue;
            const current = byTrader.get(row.traderId);
            if (!current || (price !== null && (current.price === null || price > current.price))) {
                byTrader.set(row.traderId, {
                    id: row.traderId,
                    name: row.shopName,
                    initials: initials(row.shopName),
                    verified: row.verificationStatus === "APPROVED",
                    verificationStatus: row.verificationStatus,
                    licenseNumber: row.licenseNumber || null,
                    phone: row.phone || null,
                    price,
                    grade: row.grade || null,
                    priceDate: row.priceDate || null,
                    unit: "QUINTAL",
                    updatedAt: row.updatedAt || null,
                });
            }
        }
        return Array.from(byTrader.values()).sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    }
    async getNearbyMandis(origin, radiusKm = 50, limit = 10) {
        const latitude = toNumber(origin.latitude);
        const longitude = toNumber(origin.longitude);
        if (latitude === null || longitude === null) {
            throw new AppError("lat and lon are required", 400);
        }
        const safeRadius = Math.max(1, Math.min(Number(radiusKm) || 50, 500));
        const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 50));
        const mandis = await this.mandiRepo.findAllFull();
        return mandis
            .map((mandi) => this.shapeMandi(mandi, { latitude, longitude }))
            .filter((mandi) => mandi.distanceKm !== null && mandi.distanceKm <= safeRadius)
            .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
            .slice(0, safeLimit);
    }
    async getOverview(mandiId, productIds = [], primaryProductId, origin) {
        const mandi = await this.mandiRepo.findFullById(mandiId);
        if (!mandi || mandi.status !== "ACTIVE")
            throw new AppError("Mandi not found", 404);
        const [enabledCrops, historyRows] = await Promise.all([
            this.mandiProductRepo.findEnabledByMandi(mandiId),
            this.mandiPriceRepo.findHistoryByMandi(mandiId, 30),
        ]);
        const requested = new Set(productIds.filter(Boolean));
        const crops = requested.size
            ? enabledCrops.filter((crop) => requested.has(crop.productId))
            : enabledCrops;
        const historyByCrop = new Map();
        for (const row of historyRows) {
            const bucket = historyByCrop.get(row.cropId) || [];
            bucket.push(row);
            historyByCrop.set(row.cropId, bucket);
        }
        const products = crops.map((crop) => this.shapeProduct(crop, historyByCrop.get(crop.productId) || []));
        const selectedProductId = products.some((product) => product.id === primaryProductId)
            ? primaryProductId
            : products[0]?.id;
        const [buyers, insight] = selectedProductId
            ? await Promise.all([
                this.getBuyers(mandiId, selectedProductId),
                this.marketInsightRepo.getActiveInsight(selectedProductId, mandiId),
            ])
            : [[], null];
        return {
            mandi: this.shapeMandi(mandi, origin),
            selectedProductId: selectedProductId || null,
            products,
            buyers,
            insight: this.shapeInsight(insight),
            updatedAt: historyRows[0]?.updatedAt || null,
        };
    }
    async getProductDetail(mandiId, productId, origin) {
        const [overview, assignment, classifications] = await Promise.all([
            this.getOverview(mandiId, [productId], productId, origin),
            this.mandiProductRepo.findOne(mandiId, productId),
            this.productExtrasRepo.findClassificationsByProduct(productId),
        ]);
        if (!assignment || !assignment.isEnabled || overview.products.length === 0) {
            throw new AppError("Product is not available in this mandi", 404);
        }
        const classificationIds = classifications.map((item) => item.id);
        const variants = await this.productExtrasRepo.findVariantsByClassifications(classificationIds);
        const variantsByClassification = new Map();
        for (const variant of variants) {
            const bucket = variantsByClassification.get(variant.classificationId) || [];
            bucket.push(variant);
            variantsByClassification.set(variant.classificationId, bucket);
        }
        const classificationCatalog = classifications
            .filter((item) => item.status === "ACTIVE")
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .flatMap((classification) => {
            const children = (variantsByClassification.get(classification.id) || [])
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            if (children.length === 0) {
                return [{
                        id: classification.id,
                        classification: classification.name,
                        grade: classification.name,
                        minPrice: toNumber(classification.minPrice),
                        maxPrice: toNumber(classification.maxPrice),
                    }];
            }
            return children.map((variant) => ({
                id: variant.id,
                classification: classification.name,
                grade: variant.name,
                minPrice: toNumber(variant.minPrice ?? classification.minPrice),
                maxPrice: toNumber(variant.maxPrice ?? classification.maxPrice),
            }));
        });
        const product = overview.products[0];
        const qualities = product.available
            ? [{
                    id: `${productId}:official`,
                    classification: product.priceDate ? `Official · ${product.priceDate}` : "Official",
                    grade: product.grade || "Official modal price",
                    minPrice: product.minPrice ?? product.currentPrice,
                    maxPrice: product.maxPrice ?? product.currentPrice,
                }]
            : [];
        return {
            ...overview,
            product,
            products: undefined,
            qualities,
            classificationCatalog,
            arrival: product.arrivalQuantity,
            arrivalUnit: product.arrivalUnit,
        };
    }
    async compareProduct(productId, mandiIds = [], origin) {
        const enabledMandiIds = await this.mandiProductRepo.getMandiIdsForCrop(productId);
        const requested = new Set(mandiIds.filter(Boolean));
        const ids = requested.size
            ? enabledMandiIds.filter((id) => requested.has(id))
            : enabledMandiIds;
        const [mandis, priceRows] = await Promise.all([
            this.mandiRepo.findFullByIds(ids),
            this.mandiPriceRepo.findByProductAcrossMandis(productId, ids),
        ]);
        const latestByMandi = new Map();
        for (const row of priceRows) {
            if (!latestByMandi.has(row.mandiId))
                latestByMandi.set(row.mandiId, row);
        }
        return mandis.map((mandi) => {
            const price = latestByMandi.get(mandi.id);
            return {
                mandi: this.shapeMandi(mandi, origin),
                available: Boolean(price && toNumber(price.priceModal) !== null),
                price: toNumber(price?.priceModal),
                minPrice: toNumber(price?.priceMin),
                maxPrice: toNumber(price?.priceMax),
                unit: price?.unit || mandi.defaultUnit || "QUINTAL",
                grade: price?.grade || null,
                priceDate: price?.priceDate || null,
                source: price?.source || null,
            };
        });
    }
}
