import { Request, Response } from "express";
import { ProductAdminService } from "../services/product-admin.service";
import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";

export class ProductAdminController {
  constructor(private readonly productAdminService: ProductAdminService) {}

  // ── Core Product ────────────────────────────────────────────────────────────

  public getCrops = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await this.productAdminService.getCrops(req.lang);
      ApiResponse.ok(res, products, "Products fetched successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public getCrop = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productAdminService.getCrop(req.params.id as string, req.lang);
      ApiResponse.ok(res, product, "Product fetched successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public createCrop = async (req: Request, res: Response): Promise<void> => {
    try {
      const createdBy = (req as any).auth?.userId;
      const { name } = req.body;
      if (!name) {
        ApiResponse.badRequest(res, "name is required"); return;
      }
      const product = await this.productAdminService.createCrop(req.body, createdBy);
      ApiResponse.created(res, product, "Product created successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public updateCrop = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedBy = (req as any).auth?.userId;
      const updated = await this.productAdminService.updateCrop(req.params.id as string, req.body, updatedBy);
      ApiResponse.ok(res, updated, "Product updated successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  // ── Classifications ─────────────────────────────────────────────────────────

  public getClassifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.productAdminService.getClassifications(req.params.id as string);
      ApiResponse.ok(res, data, "Classifications fetched");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public addClassification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body;
      if (!name) { ApiResponse.badRequest(res, "name is required"); return; }
      const data = await this.productAdminService.addClassification(req.params.id as string, req.body);
      ApiResponse.created(res, data, "Classification added");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public updateClassification = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.productAdminService.updateClassification(req.params.cId as string, req.body);
      ApiResponse.ok(res, data, "Classification updated");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public deleteClassification = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.productAdminService.deleteClassification(req.params.cId as string);
      ApiResponse.ok(res, null, "Classification deleted");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  // ── Variants ────────────────────────────────────────────────────────────────

  public addVariant = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body;
      if (!name) { ApiResponse.badRequest(res, "name is required"); return; }
      const data = await this.productAdminService.addVariant(req.params.cId as string, req.body);
      ApiResponse.created(res, data, "Variant added");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public updateVariant = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.productAdminService.updateVariant(req.params.vId as string, req.body);
      ApiResponse.ok(res, data, "Variant updated");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public deleteVariant = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.productAdminService.deleteVariant(req.params.vId as string);
      ApiResponse.ok(res, null, "Variant deleted");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  // ── Aliases ─────────────────────────────────────────────────────────────────

  public setAliases = async (req: Request, res: Response): Promise<void> => {
    try {
      const { aliases } = req.body;
      if (!Array.isArray(aliases)) { ApiResponse.badRequest(res, "aliases must be an array"); return; }
      const data = await this.productAdminService.setAliases(req.params.id as string, aliases);
      ApiResponse.ok(res, data, "Aliases updated");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  // ── Mandis ──────────────────────────────────────────────────────────────────

  public getMandis = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.productAdminService.getMandis(req.params.id as string);
      ApiResponse.ok(res, data, "Mandi assignments fetched");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public setMandis = async (req: Request, res: Response): Promise<void> => {
    try {
      const { mandiIds } = req.body;
      if (!Array.isArray(mandiIds)) { ApiResponse.badRequest(res, "mandiIds must be an array"); return; }
      const data = await this.productAdminService.setMandis(req.params.id as string, mandiIds);
      ApiResponse.ok(res, data, "Mandi assignments updated");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  // ── Translations ─────────────────────────────────────────────────────────────

  public setTranslations = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedBy = (req as any).auth?.userId;
      const data = await this.productAdminService.upsertTranslations(req.params.id as string, req.body, updatedBy);
      ApiResponse.ok(res, data, "Translations updated");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };
}
