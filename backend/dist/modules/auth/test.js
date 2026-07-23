import express from "express";
import { createHash } from "crypto";
import { join } from "path";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthModule } from "./module";
import { AuthController } from "./controllers/auth.controller";
import { Email } from "./domain/value-objects/email.vo";
import { UserEntity } from "./domain/entities/user.entity";
import { AuthError } from "./errors/auth.error";
import { AuthMiddleware } from "./middlewares/auth.middleware";
import { AuthRoutes } from "./routes/auth.routes";
import { AuthService } from "./services/auth.service";
import { PassService } from "./services/pass.service";
import { AuthUtils } from "./utils/auth.utils";
import { SignValidator } from "./validators/sign.validator";
import { LoginStartValidator } from "./validators/login.start.validator";
import { MfaVerifyValidator } from "./validators/mfa.verify.validator";
import { registerEnterpriseModuleTests, } from "../../shared/testing/enterprise-test-kit";
vi.mock("../../infrastructure/logger", () => ({
    logger: {
        debug: vi.fn().mockResolvedValue(undefined),
        error: vi.fn().mockResolvedValue(undefined),
        fatal: vi.fn().mockResolvedValue(undefined),
        info: vi.fn().mockResolvedValue(undefined),
        warn: vi.fn().mockResolvedValue(undefined),
    },
}));
const validSignup = Object.freeze({
    firstName: "Tushar",
    lastName: "Singh",
    email: "Owner@KrishiPath.COM",
    password: "StrongPass#123",
    phone: "+919999999999",
    acceptedTerms: true,
    captchaCode: "ABCD12",
});
const validLogin = Object.freeze({
    email: "owner@krishipath.com",
    password: "StrongPass#123",
    captchaCode: "ABCD12",
    deviceId: "device-1",
    deviceName: "Chrome Desktop",
    deviceType: "desktop",
    operatingSystem: "Windows",
    browser: "Chrome",
});
const validRoleId = "11111111-1111-4111-8111-111111111111";
const validChallengeId = "22222222-2222-4222-8222-222222222222";
function sha256(value) {
    return createHash("sha256").update(value).digest("hex");
}
function createResponse() {
    const response = {};
    response.status = vi.fn((code) => {
        response.statusCodeValue = code;
        return response;
    });
    response.json = vi.fn((value) => {
        response.jsonValue = value;
        return response;
    });
    return response;
}
function createAuthService() {
    const authRepository = {
        activateSubscription: vi.fn(),
        assignRole: vi.fn(),
        countUsers: vi.fn(),
        createOrGetDevice: vi.fn(),
        createOrUpdateMfaDevice: vi.fn(),
        createMfaTrustSession: vi.fn().mockResolvedValue({ id: "trust-1" }),
        createSession: vi.fn(),
        createTenant: vi.fn(),
        createTenantSettings: vi.fn(),
        createUser: vi.fn(),
        findMfaDevice: vi.fn(),
        findActiveMfaTrustSession: vi.fn(),
        findPlanByCode: vi.fn(),
        findRoleById: vi.fn(),
        findSessionById: vi.fn(),
        findSubscriptionByTenant: vi.fn(),
        findTenantById: vi.fn().mockResolvedValue({ id: "company-1", status: "active", onboardingStatus: "completed" }),
        findUserByEmail: vi.fn(),
        findUserById: vi.fn(),
        isCompanyOwner: vi.fn().mockResolvedValue(true),
        getDefaultCompanyIdForUser: vi.fn().mockResolvedValue("company-1"),
        findUserByPhone: vi.fn().mockResolvedValue(null),
        hasRoleInTenant: vi.fn().mockResolvedValue(true),
        getStatus: vi.fn().mockReturnValue("auth-module-ready"),
        listRootTenants: vi.fn().mockResolvedValue([]),
        listIamTenants: vi.fn().mockResolvedValue([]),
        getTenantMfaTrustWindowMinutes: vi.fn().mockResolvedValue(null),
        isSessionActive: vi.fn(),
        listActiveSessions: vi.fn(),
        listAllPerms: vi.fn(),
        listMfaDevices: vi.fn(),
        listRolePermissionIds: vi.fn(),
        listRolesByTenant: vi.fn(),
        listUserPerms: vi.fn(),
        listUserRoles: vi.fn(),
        logLoginAttempt: vi.fn(),
        markEmailVerified: vi.fn(),
        markUserActive: vi.fn(),
        markUserMfaEnabled: vi.fn(),
        replaceBackupCodes: vi.fn(),
        revokeAllOtherSessions: vi.fn(),
        revokeAllUserMfaTrustSessions: vi.fn().mockResolvedValue(1),
        revokeMfaTrustSession: vi.fn().mockResolvedValue(true),
        revokeSession: vi.fn(),
        rotateSession: vi.fn(),
        setTenantPlan: vi.fn(),
        updateUserTenant: vi.fn(),
        upsertSubscriptionDraft: vi.fn(),
        touchMfaTrustSession: vi.fn(),
        useBackupCode: vi.fn(),
    };
    const roleRepository = {
        assignPermissionsToRole: vi.fn(),
        createPermission: vi.fn(),
        createRole: vi.fn(),
        ensurePermissionGroup: vi.fn(),
        findRoleByName: vi.fn(),
        listAllPermissions: vi.fn(),
        listPermissionsByIds: vi.fn(),
        listPermissionsByKeys: vi.fn(),
    };
    const passService = {
        hash: vi.fn().mockResolvedValue({ hash: "hash", salt: "salt" }),
        verify: vi.fn().mockResolvedValue(true),
    };
    const tokenService = {
        signAccess: vi.fn().mockReturnValue("access-token"),
        signRefresh: vi.fn().mockReturnValue("refresh-token"),
        verifyAccess: vi.fn(),
        verifyRefresh: vi.fn(),
    };
    const emailService = {
        send: vi.fn().mockResolvedValue({ messageId: "email-msg-1", status: "sent" }),
    };
    const smsService = {
        send: vi.fn().mockResolvedValue({ messageId: "sms-msg-1", status: "sent" }),
    };
    const service = new AuthService(authRepository, roleRepository, passService, tokenService, emailService, smsService);
    const mutable = service;
    mutable.captchaService = {
        start: vi.fn().mockResolvedValue({ captchaCode: "ABCD12" }),
        verify: vi.fn().mockResolvedValue(true),
        extractCaptchaValue: vi.fn((input) => input.captchaCode ?? input.captchaToken),
    };
    mutable.mfaService = {
        clearChallenge: vi.fn().mockResolvedValue(undefined),
        getChallenge: vi.fn(),
        issueChallenge: vi.fn().mockResolvedValue({
            code: "123456",
            challenge: {
                id: "challenge-1",
                expiresAt: new Date("2030-01-01T00:00:00.000Z"),
            },
        }),
        issueReplacementChallenge: vi.fn().mockResolvedValue({
            code: "123456",
            challenge: {
                id: "challenge-1",
                expiresAt: new Date("2030-01-01T00:00:00.000Z"),
            },
        }),
        saveChallenge: vi.fn().mockResolvedValue(undefined),
        verifyCode: vi.fn().mockReturnValue(true),
    };
    mutable.totpService = {
        buildOtpAuthUri: vi.fn().mockReturnValue("otpauth://totp/KrishiPath"),
        createSecret: vi.fn().mockReturnValue("totp-secret"),
        verify: vi.fn().mockReturnValue(true),
    };
    mutable.secService = {
        decrypt: vi.fn().mockReturnValue("totp-secret"),
        encrypt: vi.fn().mockReturnValue("encrypted-secret"),
    };
    mutable.otpService = {
        hash: vi.fn().mockReturnValue("otp-hash"),
    };
    mutable.deviceTrustService = {
        validateTrustedSession: vi.fn().mockResolvedValue({
            trusted: true,
            riskScore: 0,
            reason: "trusted_session_valid",
            trustSessionId: "trust-session-1",
        }),
        createTrustedSession: vi.fn().mockResolvedValue({
            trustSessionId: "trust-session-1",
            trustToken: "trust-token",
            expiresAt: new Date("2030-01-01T00:00:00.000Z"),
        }),
    };
    return {
        authRepository,
        mutable,
        passService,
        roleRepository,
        service,
        tokenService,
    };
}
function createUser(overrides = {}) {
    return {
        id: "user-1",
        companyId: undefined,
        firstName: "Tushar",
        lastName: "Singh",
        email: "owner@krishipath.com",
        phone: "+919999999999",
        passwordHash: "hash",
        passwordSalt: "salt",
        isEmailVerified: true,
        isMfaEnabled: true,
        status: "active",
        ...overrides,
    };
}
function createAuthenticatedRequest(authorization) {
    return {
        headers: {
            authorization,
        },
        ip: "127.0.0.1",
        method: "GET",
        originalUrl: "/api/v1/auth/me",
    };
}
describe("auth module enterprise test suite", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe("domain rules", () => {
        it("normalizes email value object deterministically", () => {
            expect(Email.create("  OWNER@KrishiPath.COM ").toString()).toBe("owner@krishipath.com");
        });
        it("rejects malformed email value object", () => {
            expect(() => Email.create("not-email")).toThrow("Invalid email address");
        });
        it("allows core access only after company, active status, email, and MFA", () => {
            const user = UserEntity.rehydrate({
                id: "user-1",
                companyId: "company-1",
                email: Email.create("owner@krishipath.com"),
                firstName: "Tushar",
                lastName: "Singh",
                status: "active",
                isEmailVerified: true,
                isMfaEnabled: true,
            });
            expect(user.canAccessCoreFeatures()).toBe(true);
        });
        it("denies core access for tenantless restricted account", () => {
            const user = UserEntity.rehydrate({
                id: "user-1",
                email: Email.create("owner@krishipath.com"),
                firstName: "Tushar",
                lastName: "Singh",
                status: "restricted",
                isEmailVerified: true,
                isMfaEnabled: true,
            });
            expect(user.canAccessCoreFeatures()).toBe(false);
        });
    });
    describe("validation", () => {
        it("accepts complete signup DTO", () => {
            const parsed = new SignValidator().parse(validSignup);
            expect(parsed.email).toBe("Owner@KrishiPath.COM");
        });
        it("rejects weak signup payloads", () => {
            expect(() => new SignValidator().parse({
                ...validSignup,
                password: "short",
            })).toThrow();
        });
        it("rejects invalid login MFA method", () => {
            expect(() => new LoginStartValidator().parse({
                ...validLogin,
                method: "sms_link",
            })).toThrow();
        });
        it("rejects malformed MFA verification payload", () => {
            expect(() => new MfaVerifyValidator().parse({
                challengeId: "",
                method: "email_otp",
                code: "1",
            })).toThrow();
        });
    });
    describe("token utilities and password security", () => {
        it("extracts bearer tokens strictly", () => {
            expect(AuthUtils.extractBearerToken("Bearer abc.def")).toBe("abc.def");
            expect(AuthUtils.extractBearerToken("Basic abc.def")).toBeNull();
            expect(AuthUtils.extractBearerToken(undefined)).toBeNull();
        });
        it("hashes and verifies password without storing plaintext", async () => {
            const passService = new PassService();
            const result = await passService.hash("StrongPass#123");
            expect(result.hash).not.toBe("StrongPass#123");
            await expect(passService.verify("StrongPass#123", result.hash, result.salt)).resolves.toBe(true);
            await expect(passService.verify("WrongPass#123", result.hash, result.salt)).resolves.toBe(false);
        });
    });
    describe("auth service business flows", () => {
        it("signs up account as restricted and triggers email verification challenge", async () => {
            const { authRepository, service } = createAuthService();
            authRepository.findUserByEmail
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(createUser({ isEmailVerified: false }));
            authRepository.createUser.mockResolvedValue(createUser({
                email: "owner@krishipath.com",
                status: "restricted",
            }));
            const result = await service.signUp(validSignup);
            expect(authRepository.createUser).toHaveBeenCalledWith(expect.objectContaining({
                email: "owner@krishipath.com",
                status: "restricted",
            }));
            expect(result).toMatchObject({
                accessLevel: "restricted",
                email: "owner@krishipath.com",
                hasTenant: false,
                nextStep: "verify_email",
            });
            expect(result.emailVerification).toMatchObject({
                challengeId: "challenge-1",
            });
        });
        it("blocks signup when captcha fails", async () => {
            const { authRepository, mutable, service } = createAuthService();
            mutable.captchaService.verify.mockResolvedValue(false);
            await expect(service.signUp(validSignup)).rejects.toMatchObject({
                code: 400,
                message: "Invalid CAPTCHA",
            });
            expect(authRepository.createUser).not.toHaveBeenCalled();
        });
        it("blocks duplicate signup before password hashing", async () => {
            const { authRepository, passService, service } = createAuthService();
            authRepository.findUserByEmail.mockResolvedValue(createUser());
            await expect(service.signUp(validSignup)).rejects.toMatchObject({
                code: 409,
                message: "Email already registered",
            });
            expect(passService.hash).not.toHaveBeenCalled();
        });
        it("blocks login and logs invalid credential attempt", async () => {
            const { authRepository, service } = createAuthService();
            authRepository.findUserByEmail.mockResolvedValue(null);
            await expect(service.login(validLogin, {
                ipAddress: "10.0.0.1",
                userAgent: "Vitest",
            })).rejects.toMatchObject({
                code: 401,
                message: "Invalid credentials",
            });
            expect(authRepository.logLoginAttempt).toHaveBeenCalledWith(undefined, undefined, "owner@krishipath.com", "10.0.0.1", "Vitest", false, "invalid_credentials");
        });
        it("requires verified email before MFA/login continuation", async () => {
            const { authRepository, service } = createAuthService();
            authRepository.findUserByEmail.mockResolvedValue(createUser({ isEmailVerified: false }));
            await expect(service.login(validLogin, {})).rejects.toMatchObject({
                code: 403,
                message: "Email verification required",
            });
        });
        it("rotates refresh tokens and persists new refresh hash", async () => {
            const { authRepository, service, tokenService } = createAuthService();
            tokenService.verifyRefresh.mockReturnValue({
                sub: "user-1",
                companyId: "company-1",
                sessionId: "session-1",
                accessLevel: "full",
            });
            tokenService.signAccess.mockReturnValue("new-access");
            tokenService.signRefresh.mockReturnValue("new-refresh");
            authRepository.findSessionById.mockResolvedValue({
                id: "session-1",
                userId: "user-1",
                refreshTokenHash: sha256("old-refresh"),
                expiresAt: new Date("2030-01-01T00:00:00.000Z"),
                revokedAt: null,
            });
            authRepository.findUserById.mockResolvedValue(createUser({ companyId: "company-1" }));
            authRepository.findSubscriptionByTenant.mockResolvedValue({
                status: "active",
            });
            const result = await service.refresh("old-refresh", {
                ipAddress: "10.0.0.2",
            });
            expect(result).toMatchObject({
                accessToken: "new-access",
                refreshToken: "new-refresh",
                accessLevel: "full",
                subscriptionStatus: "active",
            });
            expect(authRepository.rotateSession).toHaveBeenCalledWith("session-1", expect.any(String), expect.any(String), "10.0.0.2");
        });
        it("rejects replayed refresh token when persisted hash mismatches", async () => {
            const { authRepository, service, tokenService } = createAuthService();
            tokenService.verifyRefresh.mockReturnValue({
                sub: "user-1",
                companyId: "company-1",
                sessionId: "session-1",
                accessLevel: "full",
            });
            authRepository.findSessionById.mockResolvedValue({
                id: "session-1",
                userId: "user-1",
                refreshTokenHash: "different-hash",
                expiresAt: new Date("2030-01-01T00:00:00.000Z"),
                revokedAt: null,
            });
            await expect(service.refresh("old-refresh", {})).rejects.toMatchObject({
                code: 401,
                message: "Refresh token mismatch",
            });
            expect(authRepository.rotateSession).not.toHaveBeenCalled();
        });
        it("enforces trial user limit for company-created users", async () => {
            const { authRepository, service } = createAuthService();
            authRepository.findUserById.mockResolvedValue(createUser({ companyId: "company-1" }));
            authRepository.findSubscriptionByTenant.mockResolvedValue({
                status: "trial_active",
            });
            authRepository.listUserPerms.mockResolvedValue([
                { permissionKey: "users.create" },
            ]);
            authRepository.countUsers.mockResolvedValue(7);
            await expect(service.createUser("owner-1", {
                firstName: "Operator",
                email: "operator@krishipath.com",
                password: "StrongPass#123",
                roleIds: [validRoleId],
            })).rejects.toMatchObject({
                code: 403,
                message: "Trial limit reached: max 7 users",
            });
        });
    });
    describe("middleware security", () => {
        it("rejects missing bearer token", async () => {
            const response = createResponse();
            const next = vi.fn();
            await AuthMiddleware.ensureAuthenticated(createAuthenticatedRequest(), response, next);
            expect(response.statusCodeValue).toBe(401);
            expect(response.jsonValue).toEqual({
                success: false,
                message: "Unauthorized",
            });
            expect(next).not.toHaveBeenCalled();
        });
        it("rejects inactive session after valid token", async () => {
            const mutable = AuthMiddleware;
            mutable.tokenService.verifyAccess = vi.fn().mockReturnValue({
                sub: "user-1",
                companyId: "company-1",
                sessionId: "session-1",
                accessLevel: "full",
            });
            mutable.authRepository.isSessionActive = vi.fn().mockResolvedValue(false);
            const response = createResponse();
            const next = vi.fn();
            await AuthMiddleware.ensureAuthenticated(createAuthenticatedRequest("Bearer token"), response, next);
            expect(response.statusCodeValue).toBe(401);
            expect(response.jsonValue).toEqual({
                success: false,
                message: "Session expired or revoked",
            });
            expect(next).not.toHaveBeenCalled();
        });
        it("attaches auth context for valid active session", async () => {
            const mutable = AuthMiddleware;
            mutable.tokenService.verifyAccess = vi.fn().mockReturnValue({
                sub: "user-1",
                companyId: "company-1",
                sessionId: "session-1",
                accessLevel: "full",
            });
            mutable.authRepository.isSessionActive = vi.fn().mockResolvedValue(true);
            const requestObject = createAuthenticatedRequest("Bearer token");
            const response = createResponse();
            const next = vi.fn();
            await AuthMiddleware.ensureAuthenticated(requestObject, response, next);
            expect(requestObject.auth).toEqual({
                userId: "user-1",
                companyId: "company-1",
                sessionId: "session-1",
                accessLevel: "full",
            });
            expect(next).toHaveBeenCalledOnce();
        });
        it("denies restricted subscription at full-access gate", () => {
            const requestObject = {
                auth: {
                    userId: "user-1",
                    sessionId: "session-1",
                    accessLevel: "restricted",
                },
                method: "GET",
                originalUrl: "/api/v1/auth/roles",
            };
            const response = createResponse();
            const next = vi.fn();
            AuthMiddleware.ensureFullAccess(requestObject, response, next);
            expect(response.statusCodeValue).toBe(403);
            expect(response.jsonValue).toEqual({
                success: false,
                message: "Subscription inactive. Access denied",
            });
            expect(next).not.toHaveBeenCalled();
        });
    });
    describe("controller and API integration", () => {
        it("returns module status through route integration", async () => {
            const service = {
                getStatus: vi.fn().mockReturnValue("auth-module-ready"),
            };
            const app = express();
            app.use(express.json());
            app.use("/auth", new AuthRoutes(new AuthController(service)).getRouter());
            const response = await request(app).get("/auth/status");
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                success: true,
                module: "auth",
                status: "auth-module-ready",
            });
        });
        it("normalizes AuthError response from API", async () => {
            const service = {
                signUp: vi
                    .fn()
                    .mockRejectedValue(new AuthError(409, "Email already registered")),
            };
            const app = express();
            app.use(express.json());
            app.use("/auth", new AuthRoutes(new AuthController(service)).getRouter());
            const response = await request(app)
                .post("/auth/signup")
                .send(validSignup);
            expect(response.status).toBe(409);
            expect(response.body).toMatchObject({
                success: false,
                message: "Email already registered",
            });
        });
        it("passes request IP and user-agent into login context", async () => {
            const service = {
                login: vi.fn().mockResolvedValue({
                    mfaRequired: true,
                    challengeId: "challenge-1",
                }),
            };
            const app = express();
            app.use(express.json());
            app.use("/auth", new AuthRoutes(new AuthController(service)).getRouter());
            const response = await request(app)
                .post("/auth/login")
                .set("User-Agent", "Vitest-Agent")
                .send(validLogin);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                data: {
                    mfaRequired: true,
                    challengeId: "challenge-1",
                },
            });
            expect(service.login).toHaveBeenCalledWith(validLogin, expect.objectContaining({
                userAgent: "Vitest-Agent",
            }));
        });
    });
    describe("concurrency, idempotency, and event readiness", () => {
        it("creates one session per concurrent successful login finalization", async () => {
            const { authRepository, service } = createAuthService();
            authRepository.findUserByEmail.mockResolvedValue(createUser({ companyId: "company-1" }));
            authRepository.listMfaDevices.mockResolvedValue([]);
            authRepository.findUserById.mockResolvedValue(createUser({ companyId: "company-1" }));
            authRepository.findSubscriptionByTenant.mockResolvedValue({
                status: "active",
            });
            authRepository.listIamTenants.mockResolvedValue([
                { id: "company-1", name: "Company 1", code: "C1", status: "active" },
            ]);
            authRepository.createOrGetDevice.mockResolvedValue({
                id: "device-row-1",
            });
            await Promise.all([
                service.login(validLogin, { ipAddress: "10.0.0.1", userAgent: "A" }),
                service.login({ ...validLogin, deviceId: "device-2" }, { ipAddress: "10.0.0.2", userAgent: "B" }),
            ]);
            expect(authRepository.createSession).toHaveBeenCalledTimes(2);
            expect(authRepository.logLoginAttempt).toHaveBeenCalledWith("user-1", "company-1", "owner@krishipath.com", "10.0.0.1", "A", true, "mfa_skipped_trusted_session");
        });
        it("prevents backup code replay by delegating atomic consume to repository", async () => {
            const { authRepository, mutable, service } = createAuthService();
            mutable.mfaService.getChallenge.mockResolvedValue({
                userId: "user-1",
                companyId: "company-1",
                method: "auth_app_otp",
                purpose: "login",
            });
            mutable.totpService.verify.mockReturnValue(false);
            authRepository.findUserById.mockResolvedValue(createUser({ companyId: "company-1" }));
            authRepository.findMfaDevice.mockResolvedValue({
                secretHash: "encrypted-secret",
                verifiedAt: new Date(),
            });
            authRepository.useBackupCode
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false);
            authRepository.findSubscriptionByTenant.mockResolvedValue({
                status: "active",
            });
            authRepository.createOrGetDevice.mockResolvedValue({
                id: "device-row-1",
            });
            const first = await service.verifyLoginMfa({
                challengeId: validChallengeId,
                method: "auth_app_otp",
                code: "BACKUP01",
            }, {});
            expect(first).toMatchObject({ mfaRequired: false });
            await expect(service.verifyLoginMfa({
                challengeId: validChallengeId,
                method: "auth_app_otp",
                code: "BACKUP01",
            }, {})).rejects.toMatchObject({
                code: 401,
                message: expect.stringContaining("Invalid MFA code"),
            });
        });
        it("keeps side effects rollback-safe when company user validation fails", async () => {
            const { authRepository, service } = createAuthService();
            authRepository.findUserById.mockResolvedValue(createUser({ companyId: "company-1" }));
            authRepository.findSubscriptionByTenant.mockResolvedValue({
                status: "active",
            });
            authRepository.listUserPerms.mockResolvedValue([
                { permissionKey: "users.create" },
            ]);
            authRepository.findUserByEmail.mockResolvedValue(createUser());
            await expect(service.createUser("owner-1", {
                firstName: "Operator",
                email: "operator@krishipath.com",
                password: "StrongPass#123",
                roleIds: [validRoleId],
            })).rejects.toMatchObject({
                code: 409,
                message: "Email already used",
            });
            expect(authRepository.createUser).not.toHaveBeenCalled();
            expect(authRepository.assignRole).not.toHaveBeenCalled();
        });
    });
});
registerEnterpriseModuleTests({
    moduleName: "auth",
    moduleDir: join(process.cwd(), "src", "modules", "auth"),
    ModuleClass: AuthModule,
    expectedRouteCount: 20,
    requiresAuth: true,
});
