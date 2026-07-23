import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
export class ProductAdminController {
    productAdminService;
    constructor(productAdminService) {
        this.productAdminService = productAdminService;
    }
    // ── Core Product ────────────────────────────────────────────────────────────
    getCrops = async (req, res) => {
        try {
            const products = await this.productAdminService.getCrops(req.lang);
            ApiResponse.ok(res, products, "Products fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    getCrop = async (req, res) => {
        try {
            const product = await this.productAdminService.getCrop(req.params.id, req.lang);
            ApiResponse.ok(res, product, "Product fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    createCrop = async (req, res) => {
        try {
            const createdBy = req.auth?.userId;
            const { name } = req.body;
            if (!name) {
                ApiResponse.badRequest(res, "name is required");
                return;
            }
            const product = await this.productAdminService.createCrop(req.body, createdBy);
            ApiResponse.created(res, product, "Product created successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    updateCrop = async (req, res) => {
        try {
            const updatedBy = req.auth?.userId;
            const updated = await this.productAdminService.updateCrop(req.params.id, req.body, updatedBy);
            ApiResponse.ok(res, updated, "Product updated successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    // ── Classifications ─────────────────────────────────────────────────────────
    getClassifications = async (req, res) => {
        try {
            const data = await this.productAdminService.getClassifications(req.params.id);
            ApiResponse.ok(res, data, "Classifications fetched");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    addClassification = async (req, res) => {
        try {
            const { name } = req.body;
            if (!name) {
                ApiResponse.badRequest(res, "name is required");
                return;
            }
            const data = await this.productAdminService.addClassification(req.params.id, req.body);
            ApiResponse.created(res, data, "Classification added");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    updateClassification = async (req, res) => {
        try {
            const data = await this.productAdminService.updateClassification(req.params.cId, req.body);
            ApiResponse.ok(res, data, "Classification updated");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    deleteClassification = async (req, res) => {
        try {
            await this.productAdminService.deleteClassification(req.params.cId);
            ApiResponse.ok(res, null, "Classification deleted");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    // ── Variants ────────────────────────────────────────────────────────────────
    addVariant = async (req, res) => {
        try {
            const { name } = req.body;
            if (!name) {
                ApiResponse.badRequest(res, "name is required");
                return;
            }
            const data = await this.productAdminService.addVariant(req.params.cId, req.body);
            ApiResponse.created(res, data, "Variant added");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    updateVariant = async (req, res) => {
        try {
            const data = await this.productAdminService.updateVariant(req.params.vId, req.body);
            ApiResponse.ok(res, data, "Variant updated");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    deleteVariant = async (req, res) => {
        try {
            await this.productAdminService.deleteVariant(req.params.vId);
            ApiResponse.ok(res, null, "Variant deleted");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    // ── Aliases ─────────────────────────────────────────────────────────────────
    setAliases = async (req, res) => {
        try {
            const { aliases } = req.body;
            if (!Array.isArray(aliases)) {
                ApiResponse.badRequest(res, "aliases must be an array");
                return;
            }
            const data = await this.productAdminService.setAliases(req.params.id, aliases);
            ApiResponse.ok(res, data, "Aliases updated");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    // ── Mandis ──────────────────────────────────────────────────────────────────
    getMandis = async (req, res) => {
        try {
            const data = await this.productAdminService.getMandis(req.params.id);
            ApiResponse.ok(res, data, "Mandi assignments fetched");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    setMandis = async (req, res) => {
        try {
            const { mandiIds } = req.body;
            if (!Array.isArray(mandiIds)) {
                ApiResponse.badRequest(res, "mandiIds must be an array");
                return;
            }
            const data = await this.productAdminService.setMandis(req.params.id, mandiIds);
            ApiResponse.ok(res, data, "Mandi assignments updated");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    // ── Translations ─────────────────────────────────────────────────────────────
    setTranslations = async (req, res) => {
        try {
            const updatedBy = req.auth?.userId;
            const data = await this.productAdminService.upsertTranslations(req.params.id, req.body, updatedBy);
            ApiResponse.ok(res, data, "Translations updated");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
}
