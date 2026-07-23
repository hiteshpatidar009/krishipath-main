import { Buffer } from "node:buffer";

export function tamperJwtPayload(token: string): string {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return `${token}.tampered`;
  }

  const payload = JSON.parse(
    Buffer.from(parts[1], "base64url").toString("utf8"),
  ) as Record<string, unknown>;
  payload.accessLevel = "full";
  payload.companyId = "11111111-1111-4111-8111-111111111111";
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  return [parts[0], encodedPayload, parts[2]].join(".");
}

export function forgeUnsignedJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "none", typ: "JWT" }),
  ).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.`;
}

export function malformedJwt(): string {
  return "malformed.jwt.structure";
}
