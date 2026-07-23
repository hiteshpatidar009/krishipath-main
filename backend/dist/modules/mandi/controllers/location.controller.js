import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
export class LocationController {
    locationService;
    constructor(locationService) {
        this.locationService = locationService;
    }
    getStates = async (req, res) => {
        try {
            const states = await this.locationService.getStates();
            ApiResponse.ok(res, states, "States fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    getDistricts = async (req, res) => {
        try {
            const { stateId } = req.query;
            const districts = await this.locationService.getDistricts(stateId);
            ApiResponse.ok(res, districts, "Districts fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    createState = async (req, res) => {
        try {
            const { name, status } = req.body;
            const state = await this.locationService.createState(name, status);
            ApiResponse.created(res, state, "State created successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    updateState = async (req, res) => {
        try {
            const { id } = req.params;
            const { name, status } = req.body;
            await this.locationService.updateState(id, name, status);
            ApiResponse.ok(res, { id }, "State updated successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    deleteState = async (req, res) => {
        try {
            const { id } = req.params;
            await this.locationService.deleteState(id);
            ApiResponse.ok(res, { id }, "State deleted successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    createDistrict = async (req, res) => {
        try {
            const { stateId, name, status } = req.body;
            const district = await this.locationService.createDistrict(stateId, name, status);
            ApiResponse.created(res, district, "District created successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    updateDistrict = async (req, res) => {
        try {
            const { id } = req.params;
            const { name, stateId, status } = req.body;
            await this.locationService.updateDistrict(id, name, stateId, status);
            ApiResponse.ok(res, { id }, "District updated successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    deleteDistrict = async (req, res) => {
        try {
            const { id } = req.params;
            await this.locationService.deleteDistrict(id);
            ApiResponse.ok(res, { id }, "District deleted successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
}
