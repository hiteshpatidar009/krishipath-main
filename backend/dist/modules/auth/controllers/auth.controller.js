import { ZodError } from "zod";
import { logger } from "../../../infrastructure/logger";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
import { AuthError } from "../errors/auth.error";
export class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    getStatus = async (request, response) => {
        await logger.info("auth.status requested", this.meta(request, "auth.status"));
        response.status(200).json({
            success: true,
            module: "auth",
            status: this.authService.getStatus(),
            timestamp: new Date().toISOString(),
        });
    };
    signUp = async (request, response) => {
        await this.execute(request, response, "auth.signup", 201, async () => this.authService.signUp(request.body));
    };
    startCaptcha = async (request, response) => {
        await this.execute(request, response, "auth.captcha.start", 200, async () => this.authService.startCaptcha(request.ip));
    };
    login = async (request, response) => {
        await this.execute(request, response, "auth.login", 200, async () => this.authService.login(request.body, this.loginCtx(request)));
    };
    farmerLogin = async (request, response) => {
        await this.execute(request, response, "auth.farmer.login", 200, async () => this.authService.farmerLogin(request.body, this.loginCtx(request)));
    };
    verifyFarmerLogin = async (request, response) => {
        await this.execute(request, response, "auth.farmer.verify_otp", 200, async () => this.authService.verifyFarmerLogin(request.body, this.loginCtx(request)));
    };
    refresh = async (request, response) => {
        await this.execute(request, response, "auth.refresh", 200, async () => this.authService.refresh(request.body?.refreshToken ??
            request.cookies?.refreshToken ??
            request.header("x-refresh-token"), this.loginCtx(request)));
    };
    switchCompany = async (request, response) => {
        await this.execute(request, response, "auth.switch_company", 200, async () => this.authService.switchCompany(request.body?.refreshToken ??
            request.cookies?.refreshToken ??
            request.header("x-refresh-token"), request.body?.companyId, this.loginCtx(request)));
    };
    startPasswordReset = async (request, response) => {
        await this.execute(request, response, "auth.password.reset.start", 200, async () => this.authService.startPasswordReset(request.body));
    };
    confirmPasswordReset = async (request, response) => {
        await this.execute(request, response, "auth.password.reset.confirm", 200, async () => this.authService.confirmPasswordReset(request.body));
    };
    requestPasswordReset = async (request, response) => {
        await this.execute(request, response, "auth.password.reset.request", 200, async () => this.authService.requestPasswordReset(request.body, request.ip, request.headers["user-agent"]));
    };
    validatePasswordResetToken = async (request, response) => {
        await this.execute(request, response, "auth.password.reset.validate", 200, async () => this.authService.validatePasswordResetToken(request.body, request.ip));
    };
    completePasswordReset = async (request, response) => {
        await this.execute(request, response, "auth.password.reset.complete", 200, async () => this.authService.completePasswordReset(request.body, request.ip, request.headers["user-agent"]));
    };
    startEmailVerification = async (request, response) => {
        await this.execute(request, response, "auth.email.verify.start", 200, async () => this.authService.startEmailVerification(request.body, this.loginCtx(request)));
    };
    verifyEmail = async (request, response) => {
        await this.execute(request, response, "auth.email.verify.confirm", 200, async () => this.authService.verifyEmail(request.body));
    };
    startSignupPhoneVerification = async (request, response) => {
        await this.execute(request, response, "auth.signup.phone.start", 200, async () => this.authService.startSignupPhoneVerification(request.body, this.loginCtx(request)));
    };
    verifySignupPhone = async (request, response) => {
        await this.execute(request, response, "auth.signup.phone.verify", 200, async () => this.authService.verifySignupPhone(request.body));
    };
    startSignupAuthApp = async (request, response) => {
        await this.execute(request, response, "auth.signup.auth_app.start", 200, async () => this.authService.startSignupAuthApp(request.body));
    };
    verifySignupAuthApp = async (request, response) => {
        await this.execute(request, response, "auth.signup.auth_app.verify", 200, async () => this.authService.verifySignupAuthApp(request.body));
    };
    setSignupPassword = async (request, response) => {
        await this.execute(request, response, "auth.signup.password.set", 200, async () => this.authService.setSignupPassword(request.body, this.loginCtx(request)));
    };
    verifyLoginMfa = async (request, response) => {
        await this.execute(request, response, "auth.login.mfa.verify", 200, async () => this.authService.verifyLoginMfa(request.body, this.loginCtx(request)));
    };
    startMfa = async (request, response) => {
        await this.execute(request, response, "auth.mfa.start", 200, async () => this.authService.startMfa(request.body, this.getOptionalAuthContext(request), this.loginCtx(request)));
    };
    verifyMfa = async (request, response) => {
        await this.execute(request, response, "auth.mfa.verify", 200, async () => this.authService.verifyMfa(request.body, this.getOptionalAuthContext(request), this.loginCtx(request)));
    };
    startEmailMfa = async (request, response) => {
        await this.execute(request, response, "auth.mfa.email.start", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.startEmailMfa(auth.userId, this.loginCtx(request));
        });
    };
    startPhoneMfa = async (request, response) => {
        await this.execute(request, response, "auth.mfa.phone.start", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.startPhoneMfa(auth.userId, request.body, this.loginCtx(request));
        });
    };
    verifyOtpMfaSetup = async (request, response) => {
        await this.execute(request, response, "auth.mfa.otp.verify", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.verifyOtpMfaSetup(auth.userId, request.body);
        });
    };
    startAuthAppMfa = async (request, response) => {
        await this.execute(request, response, "auth.mfa.app.start", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.startAuthAppMfa(auth.userId);
        });
    };
    verifyAuthAppMfa = async (request, response) => {
        await this.execute(request, response, "auth.mfa.app.verify", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.verifyAuthAppMfa(auth.userId, request.body);
        });
    };
    listMfaMethods = async (request, response) => {
        await this.execute(request, response, "auth.mfa.methods.list", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.listMfaMethods(auth.userId);
        });
    };
    listSessions = async (request, response) => {
        await this.execute(request, response, "auth.sessions.list", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.listSessions(auth.userId, auth.sessionId);
        });
    };
    listMfaTrustSessions = async (request, response) => {
        await this.execute(request, response, "auth.mfa_trust.list", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.listMfaTrustSessions(auth.userId);
        });
    };
    revokeMfaTrustSession = async (request, response) => {
        await this.execute(request, response, "auth.mfa_trust.revoke", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.revokeMfaTrustSession(auth.userId, request.body);
        });
    };
    revokeAllMfaTrustSessions = async (request, response) => {
        await this.execute(request, response, "auth.mfa_trust.revoke_all", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.revokeAllMfaTrustSessions(auth.userId, request.body);
        });
    };
    revokeSession = async (request, response) => {
        await this.execute(request, response, "auth.session.revoke", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.revokeSession(auth.userId, {
                sessionId: request.body?.sessionId,
                reason: request.body?.reason,
            });
        });
    };
    revokeOtherSessions = async (request, response) => {
        await this.execute(request, response, "auth.session.revoke_others", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.revokeOtherSessions(auth.userId, auth.sessionId);
        });
    };
    selectPlan = async (request, response) => {
        await this.execute(request, response, "auth.plan.select", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.selectPlan(auth.userId, request.body);
        });
    };
    activateSubscription = async (request, response) => {
        await this.execute(request, response, "auth.subscription.activate", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.activateSubscription(auth.userId);
        });
    };
    createRole = async (request, response) => {
        await this.execute(request, response, "auth.role.create", 201, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.createRole(auth.userId, request.body, { isRoot: auth.isRoot, companyId: auth.companyId });
        });
    };
    createUser = async (request, response) => {
        await this.execute(request, response, "auth.user.create", 201, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.createUser(auth.userId, request.body, { isRoot: auth.isRoot, companyId: auth.companyId });
        });
    };
    getProfile = async (request, response) => {
        await this.execute(request, response, "auth.profile.read", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.getProfile(auth.userId);
        });
    };
    listPermissions = async (request, response) => {
        await this.execute(request, response, "auth.permissions.list", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.listPermissions(auth.userId, { isRoot: auth.isRoot, companyId: auth.companyId });
        });
    };
    listRoles = async (request, response) => {
        await this.execute(request, response, "auth.roles.list", 200, async () => {
            const auth = this.getAuthContext(request);
            return this.authService.listRoles(auth.userId, { isRoot: auth.isRoot, companyId: auth.companyId });
        });
    };
    async execute(request, response, action, successCode, runner) {
        await logger.info(`${action} started`, this.meta(request, action));
        try {
            const data = await runner();
            await logger.info(`${action} succeeded`, this.meta(request, action));
            response.status(successCode).json({
                success: true,
                data,
            });
        }
        catch (error) {
            this.sendError(request, response, error, action);
        }
    }
    getAuthContext(request) {
        const contextualizedRequest = request;
        if (!contextualizedRequest.auth) {
            throw new AuthError(401, "Unauthorized");
        }
        return contextualizedRequest.auth;
    }
    getOptionalAuthContext(request) {
        const contextualizedRequest = request;
        return contextualizedRequest.auth;
    }
    sendError(request, response, error, action) {
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
        const formatted = ErrorResponsePresenter.from(new Error("Unknown error"), 400);
        response.status(formatted.statusCode).json(formatted.body);
    }
    meta(request, action) {
        const contextualizedRequest = request;
        const userAgentHeader = request.headers["user-agent"];
        const userAgent = Array.isArray(userAgentHeader) ?
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
    loginCtx(request) {
        const userAgentHeader = request.headers["user-agent"];
        const userAgent = Array.isArray(userAgentHeader) ?
            userAgentHeader.join(",")
            : userAgentHeader;
        return {
            ipAddress: request.ip,
            userAgent,
            idempotencyKey: request.header("idempotency-key"),
        };
    }
}
