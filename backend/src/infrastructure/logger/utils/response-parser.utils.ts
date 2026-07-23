import { Response } from "express";

export class ResponseParserUtils {
  public static toMetadata(response: Response, duration: number): unknown {
    return {
      statusCode: response.statusCode,
      duration,
    };
  }
}
