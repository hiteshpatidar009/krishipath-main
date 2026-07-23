import jwt from "jsonwebtoken";
import { env } from "../../../infrastructure/config/env";
import { AccessClaims } from "../../../modules/auth/types/claims.type";

export class SharedTokenService {
  public signAccess(claims: AccessClaims): string {
    return jwt.sign(claims, env.jwtAccessSecretKey, {
      expiresIn: env.jwtAccessExpiryTime,
    });
  }

  public verifyAccess(token: string): AccessClaims | null {
    try {
      return jwt.verify(token, env.jwtAccessSecretKey) as AccessClaims;
    } catch {
      return null;
    }
  }
}
