import { Request, Response } from "express";
import { TranslationService } from "../services/translation.service";
import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";

export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  public getEntityTranslations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { entityType, entityId } = req.params;
      const translations = await this.translationService.getEntityTranslations(
        entityType as string,
        entityId as string,
      );
      ApiResponse.ok(res, translations, "Translations fetched successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public upsertTranslation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { entityType, entityId, fieldName, languageCode, value } = req.body;
      if (!entityType || !entityId || !fieldName || !languageCode || value === undefined) {
        ApiResponse.badRequest(res, "entityType, entityId, fieldName, languageCode, and value are required");
        return;
      }

      const actorId = (req as any).auth?.userId;
      const result = await this.translationService.upsert({
        entityType,
        entityId,
        fieldName,
        languageCode,
        value,
        translatedBy: actorId,
      });
      ApiResponse.ok(res, result, "Translation saved successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public bulkUpsertTranslations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { records } = req.body;
      if (!Array.isArray(records) || records.length === 0) {
        ApiResponse.badRequest(res, "records array is required");
        return;
      }
      const actorId = (req as any).auth?.userId;
      await this.translationService.bulkUpsert(
        records.map((r: any) => ({ ...r, translatedBy: actorId })),
      );
      ApiResponse.ok(res, { count: records.length }, "Translations saved successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public approveTranslation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { entityType, entityId, fieldName, languageCode } = req.body;
      const reviewedBy = (req as any).auth?.userId;
      if (!reviewedBy) {
        ApiResponse.badRequest(res, "Authentication required");
        return;
      }
      await this.translationService.updateStatus(
        entityType, entityId, fieldName, languageCode, "APPROVED", reviewedBy,
      );
      ApiResponse.ok(res, null, "Translation approved");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public resolveField = async (req: Request, res: Response): Promise<void> => {
    try {
      const { entityType, entityId, fieldName } = req.params;
      const lang = req.lang ?? "en";
      const value = await this.translationService.resolveField(
        entityType as string, entityId as string, fieldName as string, lang,
      );
      ApiResponse.ok(res, { value, language: lang }, "Translation resolved");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  /**
   * GET /api/v1/localization/translations/missing?lang=mr&entityType=PRODUCT
   * Returns all entities that have English translations but are missing the requested language.
   */
  public getMissingTranslations = async (req: Request, res: Response): Promise<void> => {
    try {
      const lang = (req.query.lang as string) || "hi";
      const entityType = req.query.entityType as string | undefined;
      const missing = await this.translationService.getMissingTranslations(lang, entityType);
      ApiResponse.ok(res, { lang, count: missing.length, missing }, "Missing translations fetched");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };
}
