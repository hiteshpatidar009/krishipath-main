import { NextFunction, Request, Response } from "express";
import { logger } from "../../../infrastructure/logger";

import { AuthRepository } from "../repositories/auth.repository";
import { AuthUtils } from "../utils/auth.utils";
import { TokenService } from "../services/token.service";
import { AuthContext } from "../types/ctx.type";

export class AuthMiddleware {
  private static readonly tokenService = new TokenService();
  private static readonly authRepository = new AuthRepository();

  public static async ensureAuthenticated(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    const token = AuthUtils.extractBearerToken(
      request.headers.authorization,
    );

    if (!token) {
      void logger.warn("Authorization token missing", {
        module: "auth.middleware",
        method: request.method,
        route: request.originalUrl,
        ipAddress: request.ip,
        tags: ["auth", "middleware", "missing-token"],
      });

      response.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const claims = AuthMiddleware.tokenService.verifyAccess(token);

    if (!claims) {
      void logger.warn("Invalid access token", {
        module: "auth.middleware",
        method: request.method,
        route: request.originalUrl,
        ipAddress: request.ip,
        tags: ["auth", "middleware", "invalid-token"],
      });

      response.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }

    const sessionActive = await AuthMiddleware.authRepository.isSessionActive(
      claims.sub,
      claims.sessionId,
    );

    if (!sessionActive) {
      void logger.warn("Session inactive", {
        module: "auth.middleware",
        method: request.method,
        route: request.originalUrl,
        ipAddress: request.ip,
        userId: claims.sub,
        companyId: claims.companyId,
        tags: ["auth", "middleware", "session-inactive"],
      });

      response.status(401).json({
        success: false,
        message: "Session expired or revoked",
      });
      return;
    }

    const contextualizedRequest = request as Request & {
      auth?: AuthContext;
      requestId?: string;
    };
    contextualizedRequest.auth = {
      userId: claims.sub,
      companyId: claims.companyId,
      sessionId: claims.sessionId,
      accessLevel: claims.accessLevel,
      isRoot: claims.isRoot,
      authType: claims.authType,
      userType: claims.userType,
      profileStatus: claims.profileStatus,
      farmerId: claims.farmerId,
    };

    void logger.debug("Auth context attached", {
      module: "auth.middleware",
      method: request.method,
      route: request.originalUrl,
      requestId: contextualizedRequest.requestId,
      userId: claims.sub,
      companyId: claims.companyId,
      tags: ["auth", "middleware", "context-attached"],
    });

    next();
  }

  public static async attachOptional(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    const token = AuthUtils.extractBearerToken(
      request.headers.authorization,
    );

    if (!token) {
      next();
      return;
    }

    const claims = AuthMiddleware.tokenService.verifyAccess(token);

    if (!claims) {
      void logger.warn("Optional authorization token invalid or expired", {
        module: "auth.middleware",
        method: request.method,
        route: request.originalUrl,
        ipAddress: request.ip,
        tags: ["auth", "middleware", "optional-invalid-token"],
      });
      next();
      return;
    }

    const sessionActive = await AuthMiddleware.authRepository.isSessionActive(
      claims.sub,
      claims.sessionId,
    );

    if (!sessionActive) {
      void logger.warn("Optional authorization session inactive", {
        module: "auth.middleware",
        method: request.method,
        route: request.originalUrl,
        ipAddress: request.ip,
        userId: claims.sub,
        companyId: claims.companyId,
        tags: ["auth", "middleware", "optional-session-inactive"],
      });
      next();
      return;
    }

    const contextualizedRequest = request as Request & {
      auth?: AuthContext;
    };
    contextualizedRequest.auth = {
      userId: claims.sub,
      companyId: claims.companyId,
      sessionId: claims.sessionId,
      accessLevel: claims.accessLevel,
      isRoot: claims.isRoot,
      authType: claims.authType,
      userType: claims.userType,
      profileStatus: claims.profileStatus,
      farmerId: claims.farmerId,
    };

    next();
  }

  public static ensureFullAccess(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    const contextualizedRequest = request as Request & {
      auth?: AuthContext;
      requestId?: string;
    };

    if (!contextualizedRequest.auth) {
      void logger.warn("Unauthorized full-access check", {
        module: "auth.middleware",
        method: request.method,
        route: request.originalUrl,
        tags: ["auth", "middleware", "full-access", "missing-context"],
      });

      response.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (contextualizedRequest.auth.accessLevel === "restricted") {
      void logger.warn("Access denied by subscription gate", {
        module: "auth.middleware",
        method: request.method,
        route: request.originalUrl,
        userId: contextualizedRequest.auth.userId,
        companyId: contextualizedRequest.auth.companyId,
        requestId: contextualizedRequest.requestId,
        tags: ["auth", "middleware", "full-access", "denied"],
      });

      response.status(403).json({
        success: false,
        message: "Subscription inactive. Access denied",
      });
      return;
    }

    next();
  }

  public static ensureProfileCompleted(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    const contextualizedRequest = request as Request & {
      auth?: AuthContext;
      requestId?: string;
    };

    if (!contextualizedRequest.auth) {
      void logger.warn("Unauthorized profile check", {
        module: "auth.middleware",
        method: request.method,
        route: request.originalUrl,
        tags: ["auth", "middleware", "profile-completed", "missing-context"],
      });

      response.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    // Admins and Root always pass profile check
    if (contextualizedRequest.auth.isRoot || contextualizedRequest.auth.userType === "admin") {
      next();
      return;
    }

    if (contextualizedRequest.auth.profileStatus !== "COMPLETED") {
      void logger.warn("Access denied: Profile incomplete", {
        module: "auth.middleware",
        method: request.method,
        route: request.originalUrl,
        userId: contextualizedRequest.auth.userId,
        tags: ["auth", "middleware", "profile-incomplete", "denied"],
      });

      response.status(403).json({
        success: false,
        message: "Profile is not completed",
        data: {
          profileStatus: contextualizedRequest.auth.profileStatus,
        }
      });
      return;
    }

    next();
  }
}
