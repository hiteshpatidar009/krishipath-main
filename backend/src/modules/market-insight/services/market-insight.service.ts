import { randomUUID } from "crypto";
import { BaseService } from "../../../core/base/base.service";
import { AppError } from "../../../shared/errors/app.error";
import { MarketInsightRepository } from "../repositories/market-insight.repository";

export class MarketInsightService extends BaseService {
  constructor(private readonly insightRepo: MarketInsightRepository) {
    super("MarketInsightService");
  }

  public async getActiveInsight(productId: string, mandiId?: string) {
    // stable V1→V2 API contract representation
    const insight = await this.insightRepo.getActiveInsight(productId, mandiId);
    
    if (!insight) {
      return {
        available: false,
        message: "No market insight available for this product",
        source: null,
      };
    }

    return {
      available: true,
      source: insight.source, // ADMIN or AI
      scope: insight.scope,
      productId: insight.productId,
      mandiId: insight.mandiId,
      recommendation: insight.recommendation,
      currentPrice: insight.currentPrice,
      targetPrice: insight.targetPrice,
      expectedRange: {
        min: insight.expectedRangeMin,
        max: insight.expectedRangeMax,
      },
      delta: insight.delta,
      confidence: insight.confidencePercent,
      summary: insight.summary,
      positiveFactors: insight.positiveFactors || [],
      riskFactors: insight.riskFactors || [],
      bestSellingWindow: {
        from: insight.bestWindowFrom,
        to: insight.bestWindowTo,
      },
      weatherImpact: insight.weatherImpact || null,
      storageAdvice: insight.storageAdvice || null,
      storageExpectedGain: {
        min: insight.storageExpectedGainMin,
        max: insight.storageExpectedGainMax,
      },
      publishedAt: insight.publishAt,
      expiresAt: insight.expiresAt,
      status: insight.status,
    };
  }

  public listAdmin(filters: { productId?: string; mandiId?: string; status?: string }) {
    return this.insightRepo.listAdmin({
      productId: filters.productId,
      mandiId: filters.mandiId,
      status: filters.status ? String(filters.status).toUpperCase() : undefined,
    });
  }

  public async createInsight(input: any, createdBy: string) {
    if (!createdBy) throw new AppError("An authenticated admin is required", 401);
    const patch = this.normalize(input, false);
    if (!patch.productId) throw new AppError("productId is required", 422, "PRODUCT_REQUIRED");
    if (!patch.scope) throw new AppError("scope is required", 422, "SCOPE_REQUIRED");
    if (!patch.recommendation) throw new AppError("recommendation is required", 422, "RECOMMENDATION_REQUIRED");
    this.assertPublishable(patch);
    return this.insightRepo.create({
      id: randomUUID(),
      ...patch,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
  }

  public async updateInsight(id: string, input: any) {
    const current = await this.insightRepo.findById(id);
    if (!current) throw new AppError("Market insight not found", 404, "INSIGHT_NOT_FOUND");
    const patch = this.normalize(input, true);
    if (!Object.keys(patch).length) throw new AppError("No editable insight fields provided", 400, "EMPTY_UPDATE");
    this.assertPublishable({ ...current, ...patch });
    return this.insightRepo.update(id, patch as any);
  }

  private normalize(input: any, partial: boolean): Record<string, any> {
    const output: Record<string, any> = {};
    const textFields = [
      "productId", "mandiId", "scope", "recommendation", "summary",
      "expectedDuration", "storageAdvice", "chartDataUrl", "featuredImageUrl",
    ];
    for (const field of textFields) {
      if (input?.[field] !== undefined) {
        const value = String(input[field] ?? "").trim();
        output[field] = value || null;
      }
    }
    if (!partial) {
      output.status = String(input?.status || "DRAFT").toUpperCase();
      output.source = String(input?.source || "ADMIN").toUpperCase();
    } else {
      if (input?.status !== undefined) output.status = String(input.status).toUpperCase();
      if (input?.source !== undefined) output.source = String(input.source).toUpperCase();
    }
    if (output.scope) output.scope = String(output.scope).toUpperCase();
    if (output.recommendation) output.recommendation = String(output.recommendation).toUpperCase();

    const numericFields = [
      "currentPrice", "targetPrice", "expectedRangeMin", "expectedRangeMax", "delta",
      "storageExpectedGainMin", "storageExpectedGainMax",
    ];
    for (const field of numericFields) {
      if (input?.[field] !== undefined) {
        if (input[field] === null || input[field] === "") output[field] = null;
        else {
          const value = Number(input[field]);
          if (!Number.isFinite(value)) throw new AppError(`${field} must be numeric`, 422, "INVALID_NUMBER");
          output[field] = String(value);
        }
      }
    }
    if (input?.confidencePercent !== undefined) {
      const confidence = Number(input.confidencePercent);
      if (!Number.isInteger(confidence) || confidence < 0 || confidence > 100) {
        throw new AppError("confidencePercent must be an integer between 0 and 100", 422, "INVALID_CONFIDENCE");
      }
      output.confidencePercent = confidence;
    }
    for (const field of ["positiveFactors", "riskFactors"]) {
      if (input?.[field] !== undefined) {
        if (!Array.isArray(input[field])) throw new AppError(`${field} must be an array`, 422, "INVALID_FACTORS");
        output[field] = input[field];
      }
    }
    if (input?.weatherImpact !== undefined) {
      if (input.weatherImpact !== null && (typeof input.weatherImpact !== "object" || Array.isArray(input.weatherImpact))) {
        throw new AppError("weatherImpact must be an object", 422, "INVALID_WEATHER_IMPACT");
      }
      output.weatherImpact = input.weatherImpact;
    }
    for (const field of ["bestWindowFrom", "bestWindowTo"]) {
      if (input?.[field] !== undefined) {
        const value = input[field] ? String(input[field]) : null;
        if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new AppError(`${field} must use YYYY-MM-DD`, 422, "INVALID_DATE");
        output[field] = value;
      }
    }
    for (const field of ["publishAt", "expiresAt"]) {
      if (input?.[field] !== undefined) {
        const value = input[field] ? new Date(input[field]) : null;
        if (value && Number.isNaN(value.getTime())) throw new AppError(`${field} must be a valid date`, 422, "INVALID_DATE");
        output[field] = value;
      }
    }
    if (output.status === "PUBLISHED" && input?.publishAt === undefined) output.publishAt = new Date();
    return output;
  }

  private assertPublishable(data: Record<string, any>) {
    const scopes = ["NATIONAL", "STATE", "DISTRICT", "MANDI"];
    const recommendations = ["SELL", "HOLD", "WAIT", "REVIEW"];
    const statuses = ["DRAFT", "PUBLISHED", "ARCHIVED"];
    const sources = ["ADMIN", "AI"];
    if (data.scope && !scopes.includes(data.scope)) throw new AppError("scope is invalid", 422, "INVALID_SCOPE");
    if (data.recommendation && !recommendations.includes(data.recommendation)) throw new AppError("recommendation is invalid", 422, "INVALID_RECOMMENDATION");
    if (data.status && !statuses.includes(data.status)) throw new AppError("status is invalid", 422, "INVALID_STATUS");
    if (data.source && !sources.includes(data.source)) throw new AppError("source is invalid", 422, "INVALID_SOURCE");
    if (data.scope === "MANDI" && !data.mandiId) throw new AppError("mandiId is required for MANDI scope", 422, "MANDI_REQUIRED");
    if (data.status === "PUBLISHED") {
      if (!data.expiresAt || new Date(data.expiresAt).getTime() <= Date.now()) {
        throw new AppError("A future expiresAt is required before publishing", 422, "EXPIRY_REQUIRED");
      }
      if (data.confidencePercent === null || data.confidencePercent === undefined) {
        throw new AppError("confidencePercent is required before publishing", 422, "CONFIDENCE_REQUIRED");
      }
    }
  }
}
