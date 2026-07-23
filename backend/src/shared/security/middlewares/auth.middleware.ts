import { NextFunction, Request, Response } from "express";
import { AuthRepository } from "../../../modules/auth/repositories/auth.repository";
import { AuthUtils } from "../../../modules/auth/utils/auth.utils";
import { SharedTokenService } from "../services/token.service";
import { FingerprintUtil } from "../utils/fingerprint.util";
import { SecurityRequest } from "../types/security-request.type";

export class SharedAuthMiddleware {
  private static readonly tokenService = new SharedTokenService();
  private static readonly authRepository = new AuthRepository();

  public static async use(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    const token = AuthUtils.extractBearerToken(request.headers.authorization);

    if (!token) {
      response.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const claims = SharedAuthMiddleware.tokenService.verifyAccess(token);

    if (!claims) {
      response.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }

    const active = await SharedAuthMiddleware.authRepository.isSessionActive(
      claims.sub,
      claims.sessionId,
    );

    if (!active) {
      response.status(401).json({
        success: false,
        message: "Session expired or revoked",
      });
      return;
    }

    const isRoot = claims.isRoot ?? claims.authType === "root";
    const securedRequest = request as SecurityRequest;
    securedRequest.securityContext = {
      userId: claims.sub,
      sessionId: claims.sessionId,
      companyId: claims.companyId,
      accessLevel: claims.accessLevel,
      isRoot,
      isCompanyOwner: false,
      authType: claims.authType ?? (claims.isRoot ? "root" : "iam"),
      roles: [],
      permissions: [],
      requestFingerprint: FingerprintUtil.fromRequest(request),
    };

    next();
  }

  public static useUserContext = SharedAuthMiddleware.use;
}
