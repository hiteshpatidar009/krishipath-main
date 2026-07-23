import { Request, Response } from "express";
import { LocationService } from "../services/location.service";
import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";

export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  public getStates = async (req: Request, res: Response): Promise<void> => {
    try {
      const states = await this.locationService.getStates();
      ApiResponse.ok(res, states, "States fetched successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public getDistricts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { stateId } = req.query;
      const districts = await this.locationService.getDistricts(stateId as string);
      ApiResponse.ok(res, districts, "Districts fetched successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public createState = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, status } = req.body;
      const state = await this.locationService.createState(name, status);
      ApiResponse.created(res, state, "State created successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public updateState = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, status } = req.body;
      await this.locationService.updateState(id as string, name, status);
      ApiResponse.ok(res, { id }, "State updated successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public deleteState = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.locationService.deleteState(id as string);
      ApiResponse.ok(res, { id }, "State deleted successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public createDistrict = async (req: Request, res: Response): Promise<void> => {
    try {
      const { stateId, name, status } = req.body;
      const district = await this.locationService.createDistrict(stateId, name, status);
      ApiResponse.created(res, district, "District created successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public updateDistrict = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, stateId, status } = req.body;
      await this.locationService.updateDistrict(id as string, name, stateId, status);
      ApiResponse.ok(res, { id }, "District updated successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public deleteDistrict = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.locationService.deleteDistrict(id as string);
      ApiResponse.ok(res, { id }, "District deleted successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };
}
