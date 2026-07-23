import { Request, Response } from "express";
import { ContentService } from "../services/content.service";
import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";

export class ContentAdminController {
  constructor(private readonly contentService: ContentService) {}

  // ── Schemes ───────────────────────────────────────────────────────────
  public getSchemes = async (req: Request, res: Response) => {
    try {
      const data = await this.contentService.getAllSchemesAdmin();
      ApiResponse.ok(res, data, "Schemes fetched");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };
  public createScheme = async (req: Request, res: Response) => {
    try {
      const data = await this.contentService.createScheme(req.body);
      ApiResponse.created(res, data, "Scheme created");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };
  public updateScheme = async (req: Request, res: Response) => {
    try {
      const data = await this.contentService.updateScheme(req.params.id as string, req.body);
      ApiResponse.ok(res, data, "Scheme updated");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };
  public deleteScheme = async (req: Request, res: Response) => {
    try {
      await this.contentService.deleteScheme(req.params.id as string);
      ApiResponse.ok(res, null, "Scheme deleted");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };

  // ── Predictions ────────────────────────────────────────────────────────
  public getPredictions = async (req: Request, res: Response) => {
    try {
      const data = await this.contentService.getAllPredictionsAdmin();
      ApiResponse.ok(res, data, "Predictions fetched");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };
  public createPrediction = async (req: Request, res: Response) => {
    try {
      const data = await this.contentService.createPrediction(req.body);
      ApiResponse.created(res, data, "Prediction created");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };
  public updatePrediction = async (req: Request, res: Response) => {
    try {
      const data = await this.contentService.updatePrediction(req.params.id as string, req.body);
      ApiResponse.ok(res, data, "Prediction updated");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };
  public deletePrediction = async (req: Request, res: Response) => {
    try {
      await this.contentService.deletePrediction(req.params.id as string);
      ApiResponse.ok(res, null, "Prediction deleted");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };

  // ── Polls ─────────────────────────────────────────────────────────────
  public getPolls = async (req: Request, res: Response) => {
    try {
      const data = await this.contentService.getAllPollsAdmin();
      ApiResponse.ok(res, data, "Polls fetched");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };
  public createPoll = async (req: Request, res: Response) => {
    try {
      const { question, region, options } = req.body;
      const data = await this.contentService.createPoll({ question, region }, options || []);
      ApiResponse.created(res, data, "Poll created");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };
  public deletePoll = async (req: Request, res: Response) => {
    try {
      await this.contentService.deletePoll(req.params.id as string);
      ApiResponse.ok(res, null, "Poll deleted");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };

  // ── Creators ──────────────────────────────────────────────────────────
  public getCreators = async (req: Request, res: Response) => {
    try {
      const data = await this.contentService.getAllCreatorsAdmin();
      ApiResponse.ok(res, data, "Creators fetched");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };
  public createCreator = async (req: Request, res: Response) => {
    try {
      const data = await this.contentService.createCreator(req.body);
      ApiResponse.created(res, data, "Creator created");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };
  public updateCreator = async (req: Request, res: Response) => {
    try {
      const data = await this.contentService.updateCreator(req.params.id as string, req.body);
      ApiResponse.ok(res, data, "Creator updated");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };
  public deleteCreator = async (req: Request, res: Response) => {
    try {
      await this.contentService.deleteCreator(req.params.id as string);
      ApiResponse.ok(res, null, "Creator deleted");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };

  // ── Shorts ────────────────────────────────────────────────────────────
  public getShorts = async (req: Request, res: Response) => {
    try {
      const data = await this.contentService.getAllShortsAdmin();
      ApiResponse.ok(res, data, "Shorts fetched");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };
  public createShort = async (req: Request, res: Response) => {
    try {
      const data = await this.contentService.createShort(req.body);
      ApiResponse.created(res, data, "Short created");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };
  public updateShort = async (req: Request, res: Response) => {
    try {
      const data = await this.contentService.updateShort(req.params.id as string, req.body);
      ApiResponse.ok(res, data, "Short updated");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };
  public deleteShort = async (req: Request, res: Response) => {
    try {
      await this.contentService.deleteShort(req.params.id as string);
      ApiResponse.ok(res, null, "Short deleted");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };
}
