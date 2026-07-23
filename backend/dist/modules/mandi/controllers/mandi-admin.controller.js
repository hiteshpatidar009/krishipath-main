import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
export class MandiAdminController {
    mandiAdminService;
    constructor(mandiAdminService) {
        this.mandiAdminService = mandiAdminService;
    }
    listMandis = async (req, res) => {
        try {
            const { page, limit, search, stateId, districtId, status } = req.query;
            const parseString = (val) => {
                if (!val || val === "null" || val === "undefined" || val === "" || val === "all")
                    return undefined;
                return String(val);
            };
            const parseUuid = (val) => {
                const str = parseString(val);
                if (!str)
                    return undefined;
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
        }
        catch (e) {
            console.error("listMandis error:", e);
            res.status(400).json({ success: false, message: e.message, code: e.code });
        }
    };
    getMandi = async (req, res) => {
        try {
            const mandi = await this.mandiAdminService.getMandi(req.params.id);
            ApiResponse.ok(res, mandi, "Mandi fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    createMandi = async (req, res) => {
        try {
            // Use authenticated user id if available, otherwise fall back to a system actor
            const createdBy = req.auth?.userId ?? null;
            const mandi = await this.mandiAdminService.createMandi(req.body, createdBy);
            ApiResponse.created(res, mandi, "Mandi created successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    updateMandi = async (req, res) => {
        try {
            const updated = await this.mandiAdminService.updateMandi(req.params.id, req.body);
            ApiResponse.ok(res, updated, "Mandi updated successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    setStatus = async (req, res) => {
        try {
            const { status } = req.body;
            if (!status) {
                ApiResponse.badRequest(res, "status is required");
                return;
            }
            const updated = await this.mandiAdminService.setStatus(req.params.id, status);
            ApiResponse.ok(res, updated, "Mandi status updated");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    duplicateMandi = async (req, res) => {
        try {
            const createdBy = req.auth?.userId;
            if (!createdBy) {
                ApiResponse.badRequest(res, "Authentication required");
                return;
            }
            const { targetName, copyOptions } = req.body;
            if (!targetName) {
                ApiResponse.badRequest(res, "targetName is required");
                return;
            }
            const result = await this.mandiAdminService.duplicateMandi(req.params.id, targetName, copyOptions ?? { products: true, settings: true }, createdBy);
            ApiResponse.created(res, result, "Mandi duplicated successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
}
