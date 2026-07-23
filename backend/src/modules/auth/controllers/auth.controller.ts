import { Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../../../infrastructure/logger";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";

import { AuthError } from "../errors/auth.error";
import { AuthService } from "../services/auth.service";
import { AuthContext } from "../types/ctx.type";
import { LoginCtx } from "../types/login.ctx.type";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public getStatus = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await logger.info(
      "auth.status requested",
      this.meta(request, "auth.status"),
    );

    response.status(200).json({
      success: true,
      module: "auth",
      status: this.authService.getStatus(),
      timestamp: new Date().toISOString(),
    });
  };

  public signUp = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(request, response, "auth.signup", 201, async () =>
      this.authService.signUp(request.body),
    );
  };

  public startCaptcha = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(request, response, "auth.captcha.start", 200, async () =>
      this.authService.startCaptcha(request.ip),
    );
  };

  public login = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(request, response, "auth.login", 200, async () =>
      this.authService.login(request.body, this.loginCtx(request)),
    );
  };

  public farmerLogin = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(request, response, "auth.farmer.login", 200, async () =>
      this.authService.farmerLogin(request.body, this.loginCtx(request)),
    );
  };

  public verifyFarmerLogin = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(request, response, "auth.farmer.verify_otp", 200, async () =>
      this.authService.verifyFarmerLogin(request.body, this.loginCtx(request)),
    );
  };

  public refresh = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(request, response, "auth.refresh", 200, async () =>
      this.authService.refresh(
        request.body?.refreshToken ??
          request.cookies?.refreshToken ??
          request.header("x-refresh-token"),
        this.loginCtx(request),
      ),
    );
  };

  public switchCompany = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(request, response, "auth.switch_company", 200, async () =>
      this.authService.switchCompany(
        request.body?.refreshToken ??
          request.cookies?.refreshToken ??
          request.header("x-refresh-token"),
        request.body?.companyId,
        this.loginCtx(request),
      ),
    );
  };

  public startPasswordReset = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.password.reset.start",
      200,
      async () => this.authService.startPasswordReset(request.body),
    );
  };

  public confirmPasswordReset = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.password.reset.confirm",
      200,
      async () => this.authService.confirmPasswordReset(request.body),
    );
  };

  public requestPasswordReset = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.password.reset.request",
      200,
      async () =>
        this.authService.requestPasswordReset(
          request.body,
          request.ip,
          request.headers["user-agent"] as string,
        ),
    );
  };

  public validatePasswordResetToken = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.password.reset.validate",
      200,
      async () =>
        this.authService.validatePasswordResetToken(request.body, request.ip),
    );
  };

  public completePasswordReset = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.password.reset.complete",
      200,
      async () =>
        this.authService.completePasswordReset(
          request.body,
          request.ip,
          request.headers["user-agent"] as string,
        ),
    );
  };

  public startEmailVerification = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.email.verify.start",
      200,
      async () =>
        this.authService.startEmailVerification(
          request.body,
          this.loginCtx(request),
        ),
    );
  };

  public verifyEmail = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.email.verify.confirm",
      200,
      async () => this.authService.verifyEmail(request.body),
    );
  };

  public startSignupPhoneVerification = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.signup.phone.start",
      200,
      async () =>
        this.authService.startSignupPhoneVerification(
          request.body,
          this.loginCtx(request),
        ),
    );
  };

  public verifySignupPhone = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.signup.phone.verify",
      200,
      async () => this.authService.verifySignupPhone(request.body),
    );
  };

  public startSignupAuthApp = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.signup.auth_app.start",
      200,
      async () => this.authService.startSignupAuthApp(request.body),
    );
  };

  public verifySignupAuthApp = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.signup.auth_app.verify",
      200,
      async () => this.authService.verifySignupAuthApp(request.body),
    );
  };

  public setSignupPassword = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.signup.password.set",
      200,
      async () =>
        this.authService.setSignupPassword(
          request.body,
          this.loginCtx(request),
        ),
    );
  };

  public verifyLoginMfa = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.login.mfa.verify",
      200,
      async () =>
        this.authService.verifyLoginMfa(request.body, this.loginCtx(request)),
    );
  };

  public startMfa = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(request, response, "auth.mfa.start", 200, async () =>
      this.authService.startMfa(
        request.body,
        this.getOptionalAuthContext(request),
        this.loginCtx(request),
      ),
    );
  };

  public verifyMfa = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(request, response, "auth.mfa.verify", 200, async () =>
      this.authService.verifyMfa(
        request.body,
        this.getOptionalAuthContext(request),
        this.loginCtx(request),
      ),
    );
  };

  public startEmailMfa = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.mfa.email.start",
      200,
      async () => {
        const auth = this.getAuthContext(request);
        return this.authService.startEmailMfa(auth.userId, this.loginCtx(request));
      },
    );
  };

  public startPhoneMfa = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.mfa.phone.start",
      200,
      async () => {
        const auth = this.getAuthContext(request);
        return this.authService.startPhoneMfa(
          auth.userId,
          request.body,
          this.loginCtx(request),
        );
      },
    );
  };

  public verifyOtpMfaSetup = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.mfa.otp.verify",
      200,
      async () => {
        const auth = this.getAuthContext(request);
        return this.authService.verifyOtpMfaSetup(auth.userId, request.body);
      },
    );
  };

  public startAuthAppMfa = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.mfa.app.start",
      200,
      async () => {
        const auth = this.getAuthContext(request);
        return this.authService.startAuthAppMfa(auth.userId);
      },
    );
  };

  public verifyAuthAppMfa = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.mfa.app.verify",
      200,
      async () => {
        const auth = this.getAuthContext(request);
        return this.authService.verifyAuthAppMfa(auth.userId, request.body);
      },
    );
  };

  public listMfaMethods = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.mfa.methods.list",
      200,
      async () => {
        const auth = this.getAuthContext(request);
        return this.authService.listMfaMethods(auth.userId);
      },
    );
  };

  public listSessions = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.sessions.list",
      200,
      async () => {
        const auth = this.getAuthContext(request);
        return this.authService.listSessions(auth.userId, auth.sessionId);
      },
    );
  };

  public listMfaTrustSessions = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.mfa_trust.list",
      200,
      async () => {
        const auth = this.getAuthContext(request);
        return this.authService.listMfaTrustSessions(auth.userId);
      },
    );
  };

  public revokeMfaTrustSession = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.mfa_trust.revoke",
      200,
      async () => {
        const auth = this.getAuthContext(request);
        return this.authService.revokeMfaTrustSession(
          auth.userId,
          request.body,
        );
      },
    );
  };

  public revokeAllMfaTrustSessions = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.mfa_trust.revoke_all",
      200,
      async () => {
        const auth = this.getAuthContext(request);
        return this.authService.revokeAllMfaTrustSessions(
          auth.userId,
          request.body,
        );
      },
    );
  };

  public revokeSession = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.session.revoke",
      200,
      async () => {
        const auth = this.getAuthContext(request);
        return this.authService.revokeSession(auth.userId, {
          sessionId: request.body?.sessionId,
          reason: request.body?.reason,
        });
      },
    );
  };

  public revokeOtherSessions = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.session.revoke_others",
      200,
      async () => {
        const auth = this.getAuthContext(request);
        return this.authService.revokeOtherSessions(
          auth.userId,
          auth.sessionId,
        );
      },
    );
  };

  public selectPlan = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(request, response, "auth.plan.select", 200, async () => {
      const auth = this.getAuthContext(request);
      return this.authService.selectPlan(auth.userId, request.body);
    });
  };

  public activateSubscription = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.subscription.activate",
      200,
      async () => {
        const auth = this.getAuthContext(request);
        return this.authService.activateSubscription(auth.userId);
      },
    );
  };

  public createRole = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(request, response, "auth.role.create", 201, async () => {
      const auth = this.getAuthContext(request);
      return this.authService.createRole(auth.userId, request.body, { isRoot: auth.isRoot, companyId: auth.companyId });
    });
  };

  public createUser = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(request, response, "auth.user.create", 201, async () => {
      const auth = this.getAuthContext(request);
      return this.authService.createUser(auth.userId, request.body, { isRoot: auth.isRoot, companyId: auth.companyId });
    });
  };

  public getProfile = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.profile.read",
      200,
      async () => {
        const auth = this.getAuthContext(request);
        return this.authService.getProfile(auth.userId);
      },
    );
  };

  public listPermissions = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(
      request,
      response,
      "auth.permissions.list",
      200,
      async () => {
        const auth = this.getAuthContext(request);
        return this.authService.listPermissions(auth.userId, { isRoot: auth.isRoot, companyId: auth.companyId });
      },
    );
  };

  public listRoles = async (
    request: Request,
    response: Response,
  ): Promise<void> => {
    await this.execute(request, response, "auth.roles.list", 200, async () => {
      const auth = this.getAuthContext(request);
      return this.authService.listRoles(auth.userId, { isRoot: auth.isRoot, companyId: auth.companyId });
    });
  };

  private async execute(
    request: Request,
    response: Response,
    action: string,
    successCode: number,
    runner: () => Promise<unknown>,
  ): Promise<void> {
    await logger.info(`${action} started`, this.meta(request, action));

    try {
      const data = await runner();
      await logger.info(`${action} succeeded`, this.meta(request, action));

      response.status(successCode).json({
        success: true,
        data,
      });
    } catch (error: unknown) {
      this.sendError(request, response, error, action);
    }
  }

  private getAuthContext(request: Request): AuthContext {
    const contextualizedRequest = request as Request & { auth?: AuthContext };

    if (!contextualizedRequest.auth) {
      throw new AuthError(401, "Unauthorized");
    }

    return contextualizedRequest.auth;
  }

  private getOptionalAuthContext(request: Request): AuthContext | undefined {
    const contextualizedRequest = request as Request & { auth?: AuthContext };
    return contextualizedRequest.auth;
  }

  private sendError(
    request: Request,
    response: Response,
    error: unknown,
    action: string,
  ): void {
    if (error instanceof AuthError) {
      void logger.warn(`${action} failed`, {
        ...this.meta(request, action),
        payload: {
          code: error.code,
          message: error.message,
        },
      });

      const formatted = ErrorResponsePresenter.from(error);
      response.status(formatted.statusCode).json(formatted.body);
      return;
    }

    if (error instanceof ZodError) {
      console.log("ZOD ERROR:", JSON.stringify(error.issues, null, 2));
      void logger.warn(`${action} validation failed`, {
        ...this.meta(request, action),
        payload: {
          issues: error.issues,
        },
      });

      const formatted = ErrorResponsePresenter.from(error);
      response.status(formatted.statusCode).json(formatted.body);
      return;
    }

    if (error instanceof Error) {
      void logger.error(error, this.meta(request, action));

      const formatted = ErrorResponsePresenter.from(error, 400);
      response.status(formatted.statusCode).json(formatted.body);
      return;
    }

    void logger.error(new Error("Unknown auth controller error"), {
      ...this.meta(request, action),
      payload: {
        error,
      },
    });

    const formatted = ErrorResponsePresenter.from(
      new Error("Unknown error"),
      400,
    );
    response.status(formatted.statusCode).json(formatted.body);
  }

  private meta(request: Request, action: string): Record<string, unknown> {
    const contextualizedRequest = request as Request & {
      requestId?: string;
      auth?: AuthContext;
    };
    const userAgentHeader = request.headers["user-agent"];
    const userAgent =
      Array.isArray(userAgentHeader) ?
        userAgentHeader.join(",")
      : userAgentHeader;

    return {
      module: "auth.controller",
      method: request.method,
      route: request.originalUrl,
      requestId: contextualizedRequest.requestId,
      userId: contextualizedRequest.auth?.userId,
      companyId: contextualizedRequest.auth?.companyId,
      ipAddress: request.ip,
      userAgent,
      tags: ["auth", "controller", action],
    };
  }

  private loginCtx(request: Request): LoginCtx {
    const userAgentHeader = request.headers["user-agent"];
    const userAgent =
      Array.isArray(userAgentHeader) ?
        userAgentHeader.join(",")
      : userAgentHeader;

    return {
      ipAddress: request.ip,
      userAgent,
      idempotencyKey: request.header("idempotency-key"),
    };
  }
}
