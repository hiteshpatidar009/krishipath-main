import { Request, Response } from "express";
import { ContentService } from "../services/content.service";
import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
import { TranslationService } from "../../localization/services/translation.service";

export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly translationService: TranslationService
  ) {}

  private userId(req: Request): string {
    const userId = (req as any).auth?.userId;
    if (!userId) throw new Error("Unauthorized");
    return userId;
  }

  public getSchemes = async (req: Request, res: Response) => {
    try {
      let data = await this.contentService.getSchemes();
      const lang = req.headers["accept-language"] as string | undefined;
      if (lang && !lang.includes("en")) {
        data = await this.translationService.resolveEntityList("content_schemes", data as any, ["title", "description"], lang);
      }
      ApiResponse.ok(res, data, "Schemes fetched");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };

  public getPredictions = async (req: Request, res: Response) => {
    try {
      // Express returns repeated query parameters as an array while older
      // mobile builds send a single comma-separated value. Support both
      // representations so selecting multiple crops never turns into a 400.
      const cropIdsQuery = req.query.cropIds;
      const parsedCropIds = (Array.isArray(cropIdsQuery) ? cropIdsQuery : [cropIdsQuery])
        .flatMap((value) => typeof value === "string" ? value.split(",") : [])
        .map((value) => value.trim())
        .filter(Boolean);
      let data = await this.contentService.getPredictions(parsedCropIds);
      const lang = req.headers["accept-language"] as string | undefined;
      if (lang && !lang.includes("en")) {
        data = await this.translationService.resolveEntityList("content_predictions", data as any, ["notes"], lang);
      }
      ApiResponse.ok(res, data, "Predictions fetched");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };

  public getActivePoll = async (req: Request, res: Response) => {
    try {
      const district = req.query.district as string | undefined;
      let data = await this.contentService.getActivePoll(district, (req as any).auth?.userId);
      if (!data) {
        ApiResponse.ok(res, null, "No active poll");
        return;
      }
      
      const lang = req.headers["accept-language"] as string | undefined;
      if (lang && !lang.includes("en")) {
        const translatedPoll = await this.translationService.resolveEntity("content_polls", data as any, ["question"], lang);
        if (translatedPoll.options) {
          translatedPoll.options = await this.translationService.resolveEntityList("content_poll_options", translatedPoll.options as any, ["text"], lang);
        }
        data = translatedPoll;
      }
      
      ApiResponse.ok(res, data, "Active poll fetched");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };

  public votePoll = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { option } = req.body;
      const data = await this.contentService.votePoll(id, option, this.userId(req));
      ApiResponse.ok(res, data, "Vote submitted");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };

  public getCreators = async (req: Request, res: Response) => {
    try {
      let data = await this.contentService.getCreators();
      const lang = req.headers["accept-language"] as string | undefined;
      if (lang && !lang.includes("en")) {
        data = await this.translationService.resolveEntityList("content_creators", data as any, ["bio", "specialty"], lang);
      }
      ApiResponse.ok(res, data, "Creators fetched");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };

  public enrollCreator = async (req: Request, res: Response) => {
    try {
      ApiResponse.created(res, await this.contentService.enrollCreator(this.userId(req)), "Creator application submitted");
    } catch (e) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public getCreatorDashboard = async (req: Request, res: Response) => {
    try {
      ApiResponse.ok(res, await this.contentService.getCreatorDashboard(this.userId(req)), "Creator dashboard fetched");
    } catch (e) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public getShorts = async (req: Request, res: Response) => {
    try {
      const language = typeof req.query.lang === "string" ? req.query.lang : undefined;
      const search = typeof req.query.q === "string" ? req.query.q : undefined;
      const data = await this.contentService.getShorts(language, (req as any).auth?.userId, search);
      ApiResponse.ok(res, data, "Shorts fetched");
    } catch (e) {
      res.status(400).json(ErrorResponsePresenter.from(e, 400).body);
    }
  };

  public toggleShortLike = async (req: Request, res: Response) => {
    try {
      ApiResponse.ok(res, await this.contentService.toggleShortLike(req.params.id as string, this.userId(req)), "Short reaction updated");
    } catch (e) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public toggleShortSave = async (req: Request, res: Response) => {
    try {
      ApiResponse.ok(res, await this.contentService.toggleShortSave(req.params.id as string, this.userId(req)), "Saved short updated");
    } catch (e) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public toggleCreatorFollow = async (req: Request, res: Response) => {
    try {
      ApiResponse.ok(res, await this.contentService.toggleCreatorFollow(req.params.id as string, this.userId(req)), "Creator follow updated");
    } catch (e) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public recordShortView = async (req: Request, res: Response) => {
    try {
      ApiResponse.ok(res, await this.contentService.recordShortView(req.params.id as string), "Short view recorded");
    } catch (e) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public recordShortShare = async (req: Request, res: Response) => {
    try {
      ApiResponse.ok(res, await this.contentService.recordShortShare(req.params.id as string), "Short share recorded");
    } catch (e) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public getShortComments = async (req: Request, res: Response) => {
    try {
      ApiResponse.ok(res, await this.contentService.getShortComments(req.params.id as string), "Short comments fetched");
    } catch (e) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public createShortComment = async (req: Request, res: Response) => {
    try {
      const data = await this.contentService.createShortComment(req.params.id as string, this.userId(req), req.body?.body);
      ApiResponse.created(res, data, "Comment published");
    } catch (e) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };
}
