import { Request, Response } from "express";
import { MandiAdminService } from "../services/mandi-admin.service";
import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";

export class MandiAdminController {
  constructor(private readonly mandiAdminService: MandiAdminService) {}

  public listMandis = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page, limit, search, stateId, districtId, status } = req.query;
      const parseString = (val: any) => {
        if (!val || val === "null" || val === "undefined" || val === "" || val === "all") return undefined;
        return String(val);
      };
      const parseUuid = (val: any) => {
        const str = parseString(val);
        if (!str) return undefined;
        // Simple regex check for UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str) ? str : undefined;
      };

      const pageVal = Number(page);
      const limitVal = Number(limit);
      const result = await this.mandiAdminService.listMandis({
        page: !isNaN(pageVal) && pageVal > 0 ? pageVal : 1,
        limit: !isNaN(limitVal) && limitVal > 0 ? limitVal : 20,
        search: parseString(search),
        stateId: parseUuid(stateId),
        districtId: parseUuid(districtId),
        status: parseString(status),
      });
      ApiResponse.ok(res, result, "Mandis fetched successfully");
    } catch (e: any) {
      console.error("listMandis error:", e);
      res.status(400).json({ success: false, message: e.message, code: e.code });
    }
  };

  public getMandi = async (req: Request, res: Response): Promise<void> => {
    try {
      const mandi = await this.mandiAdminService.getMandi(req.params.id as string);
      ApiResponse.ok(res, mandi, "Mandi fetched successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public createMandi = async (req: Request, res: Response): Promise<void> => {
    try {
      // Use authenticated user id if available, otherwise fall back to a system actor
      const createdBy = (req as any).auth?.userId ?? null;
      const mandi = await this.mandiAdminService.createMandi(req.body, createdBy);
      ApiResponse.created(res, mandi, "Mandi created successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public updateMandi = async (req: Request, res: Response): Promise<void> => {
    try {
      const updated = await this.mandiAdminService.updateMandi(req.params.id as string, req.body);
      ApiResponse.ok(res, updated, "Mandi updated successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public setStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.body;
      if (!status) { ApiResponse.badRequest(res, "status is required"); return; }
      const updated = await this.mandiAdminService.setStatus(req.params.id as string, status);
      ApiResponse.ok(res, updated, "Mandi status updated");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public duplicateMandi = async (req: Request, res: Response): Promise<void> => {
    try {
      const createdBy = (req as any).auth?.userId;
      if (!createdBy) { ApiResponse.badRequest(res, "Authentication required"); return; }
      const { targetName, copyOptions } = req.body;
      if (!targetName) { ApiResponse.badRequest(res, "targetName is required"); return; }
      const result = await this.mandiAdminService.duplicateMandi(
        req.params.id as string,
        targetName,
        copyOptions ?? { products: true, settings: true },
        createdBy,
      );
      ApiResponse.created(res, result, "Mandi duplicated successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };
}
