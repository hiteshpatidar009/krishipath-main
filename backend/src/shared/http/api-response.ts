import { Response } from "express";

export class ApiResponse {
  public static ok(response: Response, data: unknown, message = "OK"): void {
    response.status(200).json({ success: true, message, data });
  }

  public static created(response: Response, data: unknown, message = "Created"): void {
    response.status(201).json({ success: true, message, data });
  }

  public static badRequest(response: Response, message = "Bad Request"): void {
    response.status(400).json({ success: false, message });
  }

  public static notFound(response: Response, message = "Not Found"): void {
    response.status(404).json({ success: false, message });
  }
}
