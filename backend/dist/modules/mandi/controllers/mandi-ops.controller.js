import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
export class MandiCropController {
    mandiProductService;
    constructor(mandiProductService) {
        this.mandiProductService = mandiProductService;
    }
    getCrops = async (req, res) => {
        try {
            const products = await this.mandiProductService.getCrops(req.params.id, req.lang);
            ApiResponse.ok(res, products, "Mandi products fetched");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    toggleCrop = async (req, res) => {
        try {
            const { productId, isEnabled, priceInitStrategy, sourcePriceMandiId } = req.body;
            if (!productId || isEnabled === undefined) {
                ApiResponse.badRequest(res, "productId and isEnabled are required");
                return;
            }
            const result = await this.mandiProductService.toggleCrop(req.params.id, productId, isEnabled, priceInitStrategy, sourcePriceMandiId);
            ApiResponse.ok(res, result, "Product updated");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    bulkToggleCrops = async (req, res) => {
        try {
            const { products } = req.body;
            if (!Array.isArray(products)) {
                ApiResponse.badRequest(res, "products array required");
                return;
            }
            await this.mandiProductService.bulkToggleCrops(req.params.id, products);
            ApiResponse.ok(res, null, "Products updated");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    bulkAssignCrops = async (req, res) => {
        try {
            const { mandiIds, productIds } = req.body;
            if (!Array.isArray(mandiIds) || !Array.isArray(productIds)) {
                ApiResponse.badRequest(res, "mandiIds and productIds arrays required");
                return;
            }
            const result = await this.mandiProductService.bulkAssignCrops(mandiIds, productIds);
            ApiResponse.ok(res, result, "Products bulk assigned");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
}
export class MandiTraderController {
    mandiTraderService;
    constructor(mandiTraderService) {
        this.mandiTraderService = mandiTraderService;
    }
    listAllTraders = async (_req, res) => {
        try {
            ApiResponse.ok(res, await this.mandiTraderService.listAllTraders(), "Traders fetched");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    createTrader = async (req, res) => {
        try {
            ApiResponse.created(res, await this.mandiTraderService.createTrader(req.body), "Trader created");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    updateTrader = async (req, res) => {
        try {
            ApiResponse.ok(res, await this.mandiTraderService.updateTrader(req.params.traderId, req.body), "Trader updated");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    getTraders = async (req, res) => {
        try {
            const traders = await this.mandiTraderService.getTraders(req.params.id);
            ApiResponse.ok(res, traders, "Traders fetched");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    assignTrader = async (req, res) => {
        try {
            const assignedBy = req.auth?.userId;
            const { traderId, notes } = req.body;
            if (!traderId) {
                ApiResponse.badRequest(res, "traderId required");
                return;
            }
            const result = await this.mandiTraderService.assignTrader(req.params.id, traderId, assignedBy, notes);
            ApiResponse.created(res, result, "Trader assigned");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    removeTrader = async (req, res) => {
        try {
            await this.mandiTraderService.removeTrader(req.params.id, req.params.traderId);
            ApiResponse.ok(res, null, "Trader removed");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    transferTrader = async (req, res) => {
        try {
            const transferredBy = req.auth?.userId;
            const { fromMandiId, toMandiId } = req.body;
            await this.mandiTraderService.transferTrader(req.params.traderId, fromMandiId, toMandiId, transferredBy);
            ApiResponse.ok(res, null, "Trader transferred");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
}
export class MandiPriceController {
    mandiPriceService;
    constructor(mandiPriceService) {
        this.mandiPriceService = mandiPriceService;
    }
    getOfficialPrices = async (req, res) => {
        try {
            const prices = await this.mandiPriceService.getOfficialPrices(req.params.id);
            ApiResponse.ok(res, prices, "Official prices fetched");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    upsertOfficialPrice = async (req, res) => {
        try {
            const setBy = req.auth?.userId;
            const { productId, priceModal, priceDate, priceMin, priceMax, arrivalQuantity, arrivalUnit, source, grade, unit } = req.body;
            if (!productId || !priceModal || !priceDate) {
                ApiResponse.badRequest(res, "productId, priceModal, and priceDate are required");
                return;
            }
            const price = await this.mandiPriceService.setOfficialPrice({
                mandiId: req.params.id,
                variantId: productId, priceModal, priceDate, priceMin, priceMax, arrivalQuantity, arrivalUnit, source, grade, unit, setBy,
            });
            ApiResponse.ok(res, price, "Official price saved");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    upsertOfficialPrices = async (req, res) => {
        try {
            const setBy = req.auth?.userId;
            const records = req.body?.records;
            if (!Array.isArray(records) || records.length === 0) {
                ApiResponse.badRequest(res, "records must be a non-empty array");
                return;
            }
            const prices = await this.mandiPriceService.setOfficialPrices(req.params.id, records, setBy);
            ApiResponse.ok(res, prices, "Official prices imported");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    copyPrices = async (req, res) => {
        try {
            const setBy = req.auth?.userId;
            const { sourceMandiId, targetMandiId, productIds } = req.body;
            if (!sourceMandiId || !targetMandiId) {
                ApiResponse.badRequest(res, "sourceMandiId and targetMandiId are required");
                return;
            }
            const result = await this.mandiPriceService.copyPrices(sourceMandiId, targetMandiId, productIds ?? null, setBy);
            ApiResponse.ok(res, result, "Prices copied successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    getPricesForCrop = async (req, res) => {
        try {
            const id = req.params.id;
            const productId = req.params.productId;
            const priceDate = req.query.date || new Date().toISOString().split("T")[0];
            const result = await this.mandiPriceService.getTraderPrices(id, productId, priceDate);
            ApiResponse.ok(res, result, "Prices fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    updatePricesForCrop = async (req, res) => {
        try {
            const setBy = req.auth?.userId;
            const id = req.params.id;
            const productId = req.params.productId;
            const { traderId, pricePerQuintal, priceDate, grade, officialPrice, traderPrices } = req.body;
            const date = priceDate || new Date().toISOString().split("T")[0];
            if (officialPrice !== undefined || Array.isArray(traderPrices)) {
                const result = await this.mandiPriceService.updateCropPriceSheet({
                    mandiId: id,
                    productId,
                    priceDate: date,
                    updatedBy: setBy,
                    officialPrice,
                    traderPrices,
                });
                ApiResponse.ok(res, result, "Price sheet updated successfully");
                return;
            }
            if (!traderId || !pricePerQuintal) {
                ApiResponse.badRequest(res, "traderId and pricePerQuintal are required");
                return;
            }
            const result = await this.mandiPriceService.updateTraderPrice(traderId, id, productId, pricePerQuintal, setBy, date, grade);
            ApiResponse.ok(res, result, "Prices updated successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
}
