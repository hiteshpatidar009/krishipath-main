import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(request: VercelRequest, response: VercelResponse): void {
  applyCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "GET") {
    response.status(405).json({
      success: false,
      message: "Method not allowed",
    });
    return;
  }

  response.status(200).json({
    success: true,
    data: {
      provider: "cloudflare_turnstile",
      tokenField: "captchaToken",
      verificationRequired: true,
    },
  });
}

function applyCorsHeaders(request: VercelRequest, response: VercelResponse): void {
  const origin = request.headers.origin;
  const normalizedOrigin = Array.isArray(origin) ? origin[0] : origin;

  if (normalizedOrigin && isAllowedOrigin(normalizedOrigin)) {
    response.setHeader("Access-Control-Allow-Origin", normalizedOrigin);
    response.setHeader("Vary", "Origin");
  }

  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, X-Requested-With, X-Company-Id, X-Warehouse-Id, X-Request-Id, Idempotency-Key",
  );
  response.setHeader("Access-Control-Max-Age", "86400");
}

function isAllowedOrigin(origin: string): boolean {
  return (
    origin === "https://rsbc.vercel.app" ||
    origin === "http://localhost:5173" ||
    origin === "http://localhost:3000" ||
    /^https:\/\/rsbc(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin)
  );
}
