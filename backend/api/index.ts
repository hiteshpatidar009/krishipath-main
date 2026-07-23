import type { Request, Response } from "express";
import type { Application } from "express";

let appPromise: Promise<Application> | undefined;

async function getApp(): Promise<Application> {
  if (!appPromise) {
    appPromise = (async () => {
      const [{ App }, { RuntimeLoggerService }] = await Promise.all([
        import("../src/app"),
        import("../src/infrastructure/logger/services/runtime-logger.service"),
      ]);

      RuntimeLoggerService.install();
      const app = new App();
      await app.initialize();
      return app.getExpressApp();
    })();
  }

  return appPromise;
}

export default async function handler(request: unknown, response: unknown): Promise<void> {
  const req = request as Request;
  const res = response as Response;
  applyCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  try {
    const app = await getApp();
    app(req, res);
  } catch {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

function applyCorsHeaders(request: Request, response: Response): void {
  const origin = request.headers.origin;
  const normalizedOrigin = Array.isArray(origin) ? origin[0] : origin;

  if (normalizedOrigin && isAllowedVercelOrigin(normalizedOrigin)) {
    response.setHeader("Access-Control-Allow-Origin", normalizedOrigin);
    response.setHeader("Vary", "Origin");
  }

  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  response.setHeader(
    "Access-Control-Allow-Headers",
    [
      "Authorization",
      "Content-Type",
      "X-Requested-With",
      "X-Company-Id",
      "X-Warehouse-Id",
      "X-Request-Id",
      "Idempotency-Key",
    ].join(", "),
  );
}

function isAllowedVercelOrigin(origin: string): boolean {
  return (
    origin === "https://rsbc.vercel.app" ||
    /^https:\/\/rsbc(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin)
  );
}
