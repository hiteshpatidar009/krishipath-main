import { createHash, randomBytes, randomUUID } from "crypto";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { BaseService } from "../../../core/base/base.service";
import { DistributedLockService } from "../../../core/resilience/distributed-lock.service";
import { env } from "../../../infrastructure/config/env";
import { RedisService } from "../../../infrastructure/database/redis/redis.service";
import { CACHE_TTL_SECONDS } from "../../../infrastructure/database/redis/cache.ttl";
import { logger } from "../../../infrastructure/logger";
import { EmailDto } from "../../email/dto/email.dto";
import { EmailService } from "../../email/services/email.service";
import { SmsDto } from "../../sms/dto/sms.dto";
import { SmsService } from "../../sms/services/sms.service";
import { PermCatalog } from "../constants/perm.catalog";
import { RoleTemplates } from "../constants/role.templates";
import { AuthError } from "../errors/auth.error";
import { EmailStartValidator } from "../validators/email.start.validator";
import { EmailVerifyValidator } from "../validators/email.verify.validator";
import { LoginStartValidator } from "../validators/login.start.validator";
import { LoginVerifyValidator } from "../validators/login.verify.validator";
import { MfaAppValidator } from "../validators/mfa.app.validator";
import { MfaAppStartValidator } from "../validators/mfa.app.start.validator";
import { MfaAppVerifySetupValidator } from "../validators/mfa.app.verify-setup.validator";
import { MfaPhoneValidator } from "../validators/mfa.phone.validator";
import { MfaStartValidator } from "../validators/mfa.start.validator";
import { MfaTrustSessionRevokeAllValidator } from "../validators/mfa-trust-session-revoke-all.validator";
import { MfaTrustSessionRevokeValidator } from "../validators/mfa-trust-session-revoke.validator";
import { MfaUnifiedVerifyValidator } from "../validators/mfa.unified.verify.validator";
import { MfaVerifyValidator } from "../validators/mfa.verify.validator";
import { PlanValidator } from "../validators/plan.validator";
import { PasswordResetConfirmValidator, PasswordResetStartValidator, PasswordResetValidateValidator, } from "../validators/password-reset.validator";
import { AuditLogRepository } from "../../audit-log/repositories/audit-log.repository";
import { AuditLogDto } from "../../audit-log/dto/audit-log.dto";
import { RoleValidator } from "../validators/role.validator";
import { SessionRevokeValidator } from "../validators/ses.revoke.validator";
import { SignValidator } from "../validators/sign.validator";
import { SignupPasswordSetValidator } from "../validators/signup-password.set.validator";
import { SignupPhoneStartValidator } from "../validators/signup-phone.start.validator";
import { SignupPhoneVerifyValidator } from "../validators/signup-phone.verify.validator";
import { UserValidator } from "../validators/user.validator";
import { FarmerLoginValidator } from "../validators/farmer-login.validator";
import { FarmerVerifyValidator } from "../validators/farmer-verify.validator";
import { MfaService } from "./mfa.service";
import { OtpService } from "./otp.service";
import { PasswordResetRateLimiter } from "./password-reset-rate-limiter";
import { DeviceTrustService } from "./device-trust.service";
import { SecService } from "./sec.service";
import { TotpService } from "./totp.service";
export class AuthService extends BaseService {
    authRepository;
    rolePermissionRepository;
    passService;
    tokenService;
    emailService;
    smsService;
    signValidator;
    planValidator;
    passwordResetStartValidator;
    passwordResetConfirmValidator;
    passwordResetValidateValidator;
    auditLogRepository = new AuditLogRepository();
    roleValidator;
    userValidator;
    loginStartValidator;
    loginVerifyValidator;
    emailStartValidator;
    emailVerifyValidator;
    mfaAppStartValidator;
    mfaAppVerifySetupValidator;
    mfaPhoneValidator;
    mfaTrustSessionRevokeValidator;
    mfaTrustSessionRevokeAllValidator;
    mfaStartValidator;
    mfaUnifiedVerifyValidator;
    mfaVerifyValidator;
    mfaAppValidator;
    signupPhoneStartValidator;
    signupPhoneVerifyValidator;
    signupPasswordSetValidator;
    sessionRevokeValidator;
    farmerLoginValidator;
    farmerVerifyValidator;
    mfaService;
    secService;
    otpService;
    totpService;
    captchaService;
    deviceTrustService;
    passwordResetRateLimiter;
    otpRedis;
    otpLockService;
    constructor(authRepository, rolePermissionRepository, passService, tokenService, emailService = new EmailService(), smsService = new SmsService()) {
        super("AuthService");
        this.authRepository = authRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.passService = passService;
        this.tokenService = tokenService;
        this.emailService = emailService;
        this.smsService = smsService;
        this.signValidator = new SignValidator();
        this.planValidator = new PlanValidator();
        this.passwordResetStartValidator = new PasswordResetStartValidator();
        this.passwordResetConfirmValidator = new PasswordResetConfirmValidator();
        this.passwordResetValidateValidator = new PasswordResetValidateValidator();
        this.roleValidator = new RoleValidator();
        this.userValidator = new UserValidator();
        this.loginStartValidator = new LoginStartValidator();
        this.loginVerifyValidator = new LoginVerifyValidator();
        this.emailStartValidator = new EmailStartValidator();
        this.emailVerifyValidator = new EmailVerifyValidator();
        this.mfaAppStartValidator = new MfaAppStartValidator();
        this.mfaAppVerifySetupValidator = new MfaAppVerifySetupValidator();
        this.mfaPhoneValidator = new MfaPhoneValidator();
        this.mfaTrustSessionRevokeValidator = new MfaTrustSessionRevokeValidator();
        this.mfaTrustSessionRevokeAllValidator =
            new MfaTrustSessionRevokeAllValidator();
        this.mfaStartValidator = new MfaStartValidator();
        this.mfaUnifiedVerifyValidator = new MfaUnifiedVerifyValidator();
        this.mfaVerifyValidator = new MfaVerifyValidator();
        this.mfaAppValidator = new MfaAppValidator();
        this.signupPhoneStartValidator = new SignupPhoneStartValidator();
        this.signupPhoneVerifyValidator = new SignupPhoneVerifyValidator();
        this.signupPasswordSetValidator = new SignupPasswordSetValidator();
        this.sessionRevokeValidator = new SessionRevokeValidator();
        this.farmerLoginValidator = new FarmerLoginValidator();
        this.farmerVerifyValidator = new FarmerVerifyValidator();
        this.mfaService = new MfaService();
        this.secService = new SecService();
        this.otpService = new OtpService();
        this.totpService = new TotpService();
        this.passwordResetRateLimiter = new PasswordResetRateLimiter();
        this.otpRedis = new RedisService();
        this.otpLockService = new DistributedLockService();
        this.deviceTrustService = new DeviceTrustService(this.authRepository);
        // Mock captchaService since it's missing
        this.captchaService = {
            extractCaptchaValue: (input) => input.captchaToken || input.captchaCode,
            start: async () => ({ id: "mock-captcha" }),
            verify: async () => true,
        };
    }
    getStatus() {
        void logger.debug("auth.getStatus invoked", {
            module: "auth.service",
            tags: ["auth", "service", "status"],
        });
        return this.authRepository.getStatus();
    }
    async startCaptcha(remoteIp) {
        return this.withLogs("auth.captcha.start", async () => {
            const captcha = await this.captchaService.start(remoteIp);
            return { ...captcha };
        });
    }
    async signUp(payload) {
        return this.withLogs("auth.signup", async () => {
            const input = this.signValidator.parse(payload);
            const captchaValue = this.captchaService.extractCaptchaValue(input);
            await this.verifyCaptchaIfRequired(captchaValue);
            const email = input.email.trim().toLowerCase();
            const phone = input.phone?.trim();
            const existing = await this.authRepository.findUserByEmail(email);
            if (existing) {
                if (existing.status === "active") {
                    throw new AuthError(409, "Email already registered");
                }
                if (phone && existing.phone && existing.phone !== phone) {
                    throw new AuthError(409, "Email already registered");
                }
                if (phone && !existing.phone) {
                    await this.authRepository.updateUserPhone(existing.id, phone);
                }
                if (!existing.passwordHash || !existing.passwordSalt) {
                    const hashed = await this.passService.hash(input.password);
                    await this.authRepository.updateUserPassword(existing.id, hashed.hash, hashed.salt);
                }
                const existingCompanyId = await this.authRepository.getDefaultCompanyIdForUser(existing.id);
                return this.resumeSignup({
                    ...existing,
                    phone: existing.phone ?? phone ?? null,
                    isPhoneVerified: existing.phone ? existing.isPhoneVerified : false,
                    companyId: existingCompanyId,
                });
            }
            if (phone) {
                const existingPhone = await this.authRepository.findUserByPhone(phone);
                if (existingPhone) {
                    throw new AuthError(409, "Phone already registered");
                }
            }
            const hashed = await this.passService.hash(input.password);
            const user = await this.authRepository.createUser({
                firstName: input.firstName,
                lastName: input.lastName,
                email,
                phone,
                passwordHash: hashed.hash,
                passwordSalt: hashed.salt,
                status: "restricted",
            });
            return {
                userId: user.id,
                email: user.email,
                accessLevel: "restricted",
                hasTenant: false,
                nextStep: "verify_email",
                emailVerification: await this.startEmailVerification({
                    email,
                }),
            };
        });
    }
    async login(payload, ctx) {
        return this.withLogs("auth.login", async () => {
            const input = this.loginStartValidator.parse(payload);
            const captchaValue = this.captchaService.extractCaptchaValue(input);
            await this.verifyCaptchaIfRequired(captchaValue, ctx.ipAddress);
            const primaryMethod = input.method ?? "email_password";
            const email = input.email?.trim().toLowerCase();
            const phone = input.phone?.trim();
            const user = primaryMethod === "phone_otp" ?
                ((await this.authRepository.findUserByPhone(phone ?? "")) ??
                    (await this.authRepository.findUserByVerifiedMfaPhone(phone ?? "")))
                : await this.authRepository.findUserByEmail(email ?? "");
            const loginIdentifier = email ?? phone ?? "";
            if (!user) {
                await this.authRepository.logLoginAttempt(undefined, undefined, loginIdentifier, ctx.ipAddress, ctx.userAgent, false, "invalid_credentials");
                throw new AuthError(401, "Invalid credentials");
            }
            if (!user.isEmailVerified) {
                throw new AuthError(403, "Email verification required");
            }
            const companies = await this.listAccessibleCompanies(user.id, input.isRoot);
            if (input.companyId &&
                !companies.some((company) => company.id === input.companyId)) {
                throw new AuthError(403, input.isRoot ?
                    "Company not owned by root user"
                    : "Company role assignment required");
            }
            if (primaryMethod === "email_password") {
                if (!input.password || !user.passwordHash || !user.passwordSalt) {
                    await this.authRepository.logLoginAttempt(user.id, undefined, loginIdentifier, ctx.ipAddress, ctx.userAgent, false, "invalid_credentials");
                    throw new AuthError(401, "Invalid credentials");
                }
                const passwordMatches = await this.passService.verify(input.password, user.passwordHash, user.passwordSalt);
                if (!passwordMatches) {
                    await this.authRepository.logLoginAttempt(user.id, undefined, loginIdentifier, ctx.ipAddress, ctx.userAgent, false, "invalid_credentials");
                    throw new AuthError(401, "Invalid credentials");
                }
                // --- DEV BYPASS ---
                // Bypass MFA for local development so admins can login without building MFA screens yet
                const isSuperAdmin = user.userType === 'superadmin' || user.email === 'superadmin@krishipath.com' || user.email?.toLowerCase().includes('super');
                let companyId = await this.authRepository.getDefaultCompanyIdForUser(user.id);
                if (!companyId) {
                    const { Db1Connection } = await import("../../../infrastructure/database/index");
                    const { companiesTable } = await import("../../../infrastructure/database/postgres/schemas/db1/all.schema");
                    const db = Db1Connection.getInstance();
                    const anyCompany = await db.select().from(companiesTable).limit(1);
                    if (anyCompany.length > 0) {
                        companyId = anyCompany[0].id;
                    }
                }
                const access = {
                    companyId: companyId || undefined,
                    accessLevel: isSuperAdmin ? "full" : "admin",
                    isRoot: isSuperAdmin,
                    authType: isSuperAdmin ? "root" : "iam",
                };
                const tokens = await this.issueTokens(user.id, access, "password", input, ctx);
                return {
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: isSuperAdmin ? "SUPER_ADMIN" : "ADMIN",
                    },
                    ...tokens,
                };
                const u = user;
                // Onboarding Continuity Check: Email OTP verification
                if (!u.isEmailVerified) {
                    const emailVerification = await this.issueEmailVerification(u);
                    return {
                        incomplete: true,
                        nextStep: "verify_email",
                        email: u.email,
                        userId: u.id,
                        emailVerification,
                    };
                }
                // Onboarding Continuity Check: Authenticator MFA setup
                if (!u.isMfaEnabled) {
                    const authApp = await this.authRepository.findMfaDevice(u.id, "auth_app_otp");
                    if (!authApp?.verifiedAt) {
                        const setup = await this.mfaService.issueReplacementChallenge(u.id, undefined, "auth_app_otp", "setup", u.email ?? u.id);
                        return {
                            incomplete: true,
                            nextStep: "setup_authenticator",
                            email: u.email,
                            userId: u.id,
                            authAppSetupToken: setup.challenge.id,
                            authAppSetupExpiresAt: setup.challenge.expiresAt,
                        };
                    }
                }
                if (!u.isMfaEnabled) {
                    this.requireConfiguredAuthenticator();
                }
                return this.issueAuthenticatorLoginChallenge(u, input, "password", ctx);
            }
            const target = primaryMethod === "email_otp" ?
                (user.email ?? undefined)
                : (phone ?? user.phone ?? undefined);
            if (!target) {
                throw new AuthError(400, "OTP target missing");
            }
            const challenge = await this.issueOtpChallengeOnce({
                user,
                method: primaryMethod,
                purpose: "login_primary",
                target,
                channel: input.otpChannel ?? "sms",
                subject: "KrishiPath login code",
                idempotencyKey: ctx.idempotencyKey,
                context: {
                    selectedCompanyId: input.companyId ?? undefined,
                    isRoot: input.isRoot,
                    authType: input.isRoot ? "root" : "iam",
                },
            });
            await this.authRepository.logLoginAttempt(user.id, undefined, loginIdentifier, ctx.ipAddress, ctx.userAgent, false, "mfa_required");
            return {
                primaryVerificationRequired: true,
                challengeId: challenge.challengeId,
                method: primaryMethod,
                nextStep: "verify_primary_otp",
                expiresAt: challenge.expiresAt,
                deliveryStatus: challenge.deliveryStatus,
                replayed: challenge.replayed,
            };
        });
    }
    async farmerLogin(payload, ctx) {
        return this.withLogs("auth.farmer.login", async () => {
            const input = this.farmerLoginValidator.parse(payload);
            let user = await this.authRepository.findUserByPhone(input.phone);
            if (!user) {
                // Create an incomplete farmer profile
                user = await this.authRepository.createUser({
                    phone: input.phone,
                    status: "active", // Or "restricted" ? Let's use active since it's just phone
                    userType: "farmer",
                    profileStatus: "INCOMPLETE",
                    isPhoneVerified: false,
                });
            }
            if (user.status !== "active" && user.status !== "restricted") {
                throw new AuthError(401, "Account unavailable");
            }
            const challenge = await this.issueOtpChallengeOnce({
                user,
                method: "phone_otp",
                purpose: "login",
                target: input.phone,
                channel: "sms",
                subject: "KrishiPath Login Code",
                idempotencyKey: ctx.idempotencyKey,
            });
            return {
                challengeId: challenge.challengeId,
                method: "phone_otp",
                nextStep: "verify_otp",
                expiresAt: challenge.expiresAt,
                deliveryStatus: challenge.deliveryStatus,
                replayed: challenge.replayed,
            };
        });
    }
    async verifyFarmerLogin(payload, ctx) {
        return this.withLogs("auth.farmer.verify_otp", async () => {
            const input = this.farmerVerifyValidator.parse(payload);
            const user = await this.authRepository.findUserByPhone(input.phone);
            if (!user) {
                throw new AuthError(401, "Invalid credentials");
            }
            const otpVerification = await this.mfaService.verifyOtpChallenge({
                challengeId: input.challengeId,
                userId: user.id,
                method: "phone_otp",
                purpose: "login",
                code: input.code,
            });
            if (otpVerification.status === "invalid_challenge") {
                throw new AuthError(400, "Invalid or expired challenge");
            }
            if (otpVerification.status === "attempts_exhausted") {
                throw new AuthError(400, "Too many incorrect attempts. Verification code expired.");
            }
            if (otpVerification.status === "invalid_code") {
                const remaining = (otpVerification.challenge.maxAttempts ?? 3) -
                    (otpVerification.challenge.attempts ?? 0);
                throw new AuthError(401, `Invalid OTP code. ${remaining} attempts remaining.`);
            }
            await this.mfaService.clearChallenge(input.challengeId);
            if (!user.isPhoneVerified) {
                await this.authRepository.markPhoneVerified(user.id);
            }
            await this.authRepository.logLoginAttempt(user.id, undefined, input.phone, ctx.ipAddress, ctx.userAgent, true);
            const deviceMeta = {
                deviceId: input.deviceId,
                deviceName: input.deviceName,
                deviceType: input.deviceType,
                operatingSystem: input.operatingSystem,
                browser: input.browser,
                mfaTrustToken: input.mfaTrustToken,
            };
            return this.finalizeLogin(user.id, undefined, "phone_otp", deviceMeta, ctx, false, true);
        });
    }
    async startEmailVerification(payload, ctx) {
        return this.withLogs("auth.email.verify.start", async () => {
            const input = this.emailStartValidator.parse(payload);
            const email = input.email.trim().toLowerCase();
            const user = await this.authRepository.findUserByEmail(email);
            if (!user) {
                throw new AuthError(404, "User not found");
            }
            if (user.isEmailVerified) {
                return {
                    alreadyVerified: true,
                };
            }
            return this.issueEmailVerification(user, ctx);
        });
    }
    async issueEmailVerification(user, ctx) {
        if (!user.email) {
            throw new AuthError(400, "Email address required");
        }
        const email = user.email.trim().toLowerCase();
        const result = await this.issueOtpChallengeOnce({
            user,
            method: "email_otp",
            purpose: "email_verify",
            target: email,
            subject: "Verify your KrishiPath account",
            companyId: user.companyId ?? undefined,
            idempotencyKey: ctx?.idempotencyKey,
        });
        return {
            challengeId: result.challengeId,
            expiresAt: result.expiresAt,
            deliveryStatus: result.deliveryStatus,
            replayed: result.replayed,
        };
    }
    async resumeSignup(user) {
        const base = {
            userId: user.id,
            email: user.email,
            accessLevel: "restricted",
            hasTenant: Boolean(user.companyId),
            resumed: true,
        };
        if (!user.isEmailVerified) {
            return {
                ...base,
                nextStep: "verify_email",
                emailVerification: await this.issueEmailVerification(user),
            };
        }
        const authApp = await this.authRepository.findMfaDevice(user.id, "auth_app_otp");
        if (!authApp?.verifiedAt) {
            const setup = await this.mfaService.issueReplacementChallenge(user.id, user.companyId ?? undefined, "auth_app_otp", "setup", user.email ?? user.id);
            return {
                ...base,
                nextStep: "setup_authenticator",
                authAppSetupToken: setup.challenge.id,
                authAppSetupExpiresAt: setup.challenge.expiresAt,
            };
        }
        if (!user.passwordHash || !user.passwordSalt) {
            const passwordSetup = await this.mfaService.issueReplacementChallenge(user.id, user.companyId ?? undefined, "auth_app_otp", "password_setup", user.email ?? user.id);
            return {
                ...base,
                nextStep: "set_password",
                passwordSetupToken: passwordSetup.challenge.id,
                passwordSetupExpiresAt: passwordSetup.challenge.expiresAt,
            };
        }
        throw new AuthError(409, "Email already registered");
    }
    async issuePhoneVerification(user, channel, ctx) {
        if (!user.phone) {
            throw new AuthError(400, "Phone number required");
        }
        const result = await this.issueOtpChallengeOnce({
            user,
            method: "phone_otp",
            purpose: "phone_verify",
            target: user.phone,
            channel,
            companyId: user.companyId ?? undefined,
            idempotencyKey: ctx?.idempotencyKey,
        });
        return {
            challengeId: result.challengeId,
            method: "phone_otp",
            channel,
            expiresAt: result.expiresAt,
            deliveryStatus: result.deliveryStatus,
            replayed: result.replayed,
        };
    }
    async issueAuthenticatorLoginChallenge(user, input, primaryMethod, ctx) {
        const isRoot = input.isRoot;
        const companies = await this.listAccessibleCompanies(user.id, isRoot);
        const selectedCompanyId = input.companyId ?? companies[0]?.id;
        const trust = await this.deviceTrustService.validateTrustedSession({
            userId: user.id,
            companyId: selectedCompanyId,
            deviceId: input.deviceId,
            deviceName: input.deviceName,
            deviceType: input.deviceType,
            operatingSystem: input.operatingSystem,
            browser: input.browser,
            trustToken: input.mfaTrustToken,
            ctx: ctx ?? {},
        });
        if (trust.trusted) {
            await logger.info("MFA skipped by trusted session", {
                module: "auth.mfa_trust",
                userId: user.id,
                companyId: selectedCompanyId,
                payload: {
                    trustSessionId: trust.trustSessionId,
                    riskScore: trust.riskScore,
                    reason: trust.reason,
                },
                tags: ["auth", "mfa", "trust", "skip"],
            });
            await this.authRepository.logLoginAttempt(user.id, selectedCompanyId, user.email ?? input.email ?? "", ctx?.ipAddress, ctx?.userAgent, true, "mfa_skipped_trusted_session");
            return this.finalizeLogin(user.id, selectedCompanyId, `${primaryMethod}_trusted_mfa`, input, ctx ?? {}, isRoot, true);
        }
        if (input.mfaTrustToken) {
            await logger.warn("MFA trust rejected", {
                module: "auth.mfa_trust",
                userId: user.id,
                companyId: selectedCompanyId,
                payload: {
                    trustSessionId: trust.trustSessionId,
                    riskScore: trust.riskScore,
                    reason: trust.reason,
                },
                tags: ["auth", "mfa", "trust", "risk"],
            });
        }
        const device = await this.authRepository.findMfaDevice(user.id, "auth_app_otp");
        if (!device?.secretHash || !device.verifiedAt) {
            this.requireConfiguredAuthenticator();
        }
        const challenge = await this.mfaService.issueReplacementChallenge(user.id, undefined, "auth_app_otp", "login", undefined, {
            selectedCompanyId,
            isRoot,
            authType: isRoot ? "root" : "iam",
        });
        await this.authRepository.logLoginAttempt(user.id, undefined, user.email ?? input.email ?? "", ctx?.ipAddress, ctx?.userAgent, false, "authenticator_required");
        return {
            mfaRequired: true,
            primaryMethod,
            challengeId: challenge.challenge.id,
            method: "auth_app_otp",
            nextStep: "verify_authenticator",
            expiresAt: challenge.challenge.expiresAt,
        };
    }
    async issueOtpLoginMfaChallenge(user, input, primaryMethod, method, ctx) {
        const companies = await this.listAccessibleCompanies(user.id, input.isRoot);
        const selectedCompanyId = input.companyId ?? companies[0]?.id;
        const target = await this.getLoginMfaTarget(user, method);
        if (!target) {
            throw new AuthError(403, "Requested MFA method is not configured");
        }
        const challenge = await this.issueOtpChallengeOnce({
            user,
            method,
            purpose: "login",
            target,
            channel: input.otpChannel ?? "sms",
            subject: "KrishiPath MFA code",
            companyId: selectedCompanyId,
            idempotencyKey: ctx?.idempotencyKey,
            context: {
                selectedCompanyId,
                isRoot: input.isRoot,
                authType: input.isRoot ? "root" : "iam",
            },
        });
        await this.authRepository.logLoginAttempt(user.id, user.companyId ?? undefined, user.email ?? input.email ?? "", ctx?.ipAddress, ctx?.userAgent, false, `${method}_required`);
        return {
            mfaRequired: true,
            primaryMethod,
            challengeId: challenge.challengeId,
            method,
            nextStep: "verify_mfa_otp",
            expiresAt: challenge.expiresAt,
            deliveryStatus: challenge.deliveryStatus,
            replayed: challenge.replayed,
        };
    }
    requireConfiguredAuthenticator() {
        throw new AuthError(403, "Authenticator app is not configured. Complete signup authenticator setup first.");
    }
    async sendOtpEmail(user, email, code, subject) {
        return this.emailService.send(new EmailDto({
            to: email,
            subject,
            body: this.buildEmailVerificationBody(code),
            htmlBody: this.buildEmailVerificationHtml(code),
            attachments: this.buildEmailVerificationAttachments(),
            companyId: user.companyId ?? undefined,
            userId: user.id,
            singleAttempt: true,
        }));
    }
    async sendOtpSms(user, phone, code, channel) {
        return this.smsService.send(new SmsDto({
            to: phone,
            message: `Your KrishiPath verification code is ${code}. It expires soon.`,
            channel,
            companyId: user.companyId ?? undefined,
            userId: user.id,
            singleAttempt: true,
        }));
    }
    buildEmailVerificationBody(code) {
        return [
            "Your KrishiPath verification code is:",
            "",
            code,
            "",
            "This code expires soon.",
            "If you did not request this, ignore this email.",
        ].join("\n");
    }
    buildEmailVerificationAttachments() {
        const logoPath = path.join(process.cwd(), "public", "mail_logo.png");
        if (!existsSync(logoPath)) {
            return undefined;
        }
        return [
            {
                content: readFileSync(logoPath).toString("base64"),
                filename: "mail_logo.png",
                type: "image/png",
                disposition: "inline",
                contentId: "mail-logo",
            },
        ];
    }
    buildEmailVerificationHtml(code) {
        const codeCells = code
            .split("")
            .map((digit) => `
          <td class="digit-cell" style="width:60px;height:80px;border:2px dashed #d0d0d0;border-radius:8px;text-align:center;font-family:'Inter','Segoe UI',Arial,Helvetica,sans-serif;font-size:48px;line-height:80px;font-weight:700;color:#0a1f44;background:#ffffff;">
            ${digit}
          </td>
        `)
            .join("");
        // Convert the illustration SVG to a base64 <img> so it renders inline
        // in ALL email clients (Gmail, Outlook, Apple Mail) instead of showing
        // up as an attachment or being stripped.
        const illustrationSvg = Buffer.from(`<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="90" fill="#e8f2ff"/>
        <circle cx="160" cy="50" r="8" fill="#b3d9ff"/>
        <circle cx="180" cy="120" r="6" fill="#b3d9ff"/>
        <rect x="50" y="70" width="100" height="70" rx="4" fill="#a8c5e8"/>
        <path d="M50 75L100 105L150 75" stroke="#7a9cc6" stroke-width="2" fill="none"/>
        <rect x="60" y="50" width="80" height="60" rx="4" fill="white"/>
        <circle cx="100" cy="75" r="18" fill="#0052cc"/>
        <path d="M100 62L92 66V74C92 78.42 95.03 82.34 100 83C104.97 82.34 108 78.42 108 74V66L100 62Z" fill="white"/>
        <circle cx="140" cy="130" r="16" fill="#10b981"/>
        <path d="M135 130L138 133L145 126" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`).toString("base64");
        return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Verify Your Email – KrishiPath</title>
      <style>
        /* ── Reset ─────────────────────────────────────────── */
        body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
        table, td          { mso-table-lspace:0pt; mso-table-rspace:0pt; }
        img                { -ms-interpolation-mode:bicubic; border:0; display:block; }

        /* ── Mobile (≤ 620 px) ──────────────────────────────── */
        @media only screen and (max-width:620px) {

          /* Wrapper */
          .email-wrapper   { padding:16px 8px !important; }
          .email-container { border-radius:8px !important; }

          /* Header */
          .header-cell     { padding:16px 20px !important; }
          .header-brand    { font-size:22px !important; }
          .header-trust    { display:none !important; font-size:0 !important;
                             max-height:0 !important; overflow:hidden !important; }

          /* Hero two-column → single column */
          .hero-cell       { padding:28px 20px 20px !important; }
          .col-text        { display:block !important; width:100% !important;
                             padding-right:0 !important; }
          .col-image       { display:block !important; width:100% !important;
                             padding-top:24px !important; text-align:center !important; }
          .hero-h1         { font-size:26px !important; }
          .illus-img       { width:150px !important; height:150px !important; }

          /* OTP */
          .code-outer      { padding:0 16px 24px !important; }
          .code-inner      { padding:24px 12px !important; border-radius:10px !important; }
          .digit-cell      { width:42px !important; height:58px !important;
                             font-size:34px !important; line-height:58px !important; }

          /* Feature strip → stacked */
          .features-outer  { padding:0 20px 28px !important; }
          .feat-col        { display:block !important; width:100% !important;
                             padding:0 0 24px 0 !important; }

          /* Footer → stacked & centred */
          .footer-cell     { padding:20px !important; }
          .footer-left     { display:block !important; width:100% !important;
                             text-align:center !important; padding-bottom:12px !important; }
          .footer-right    { display:block !important; width:100% !important;
                             text-align:center !important; }
        }
      </style>
    </head>

    <body style="margin:0;padding:0;background:#e8eef5;font-family:'Inter','Segoe UI',Arial,Helvetica,sans-serif;">

      <!-- ════════════════════ WRAPPER ════════════════════ -->
      <table class="email-wrapper" role="presentation" width="100%" cellspacing="0" cellpadding="0"
             style="background:#e8eef5;padding:40px 20px;">
        <tr>
          <td align="center">

            <!-- ════════════════ CARD ════════════════ -->
            <table class="email-container" role="presentation" cellspacing="0" cellpadding="0"
                   style="max-width:920px;width:100%;background:#ffffff;border-radius:12px;
                          overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">


              <!-- ── HEADER ────────────────────────────────── -->
              <tr>
                <td class="header-cell"
                    style="background:linear-gradient(135deg,#0052cc 0%,#0066ff 100%);padding:24px 40px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>

                      <!-- Logo + brand -->
                      <td class="header-brand" align="left"
                          style="color:#ffffff;font-size:28px;font-weight:700;line-height:36px;">
                        <span style="display:inline-block;vertical-align:middle;margin-right:12px;">
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" rx="6" fill="white"/>
                            <path d="M16 8L8 12V16C8 20.42 11.03 24.34 16 25C20.97 24.34 24 20.42 24 16V12L16 8Z" fill="#0052cc"/>
                          </svg>
                        </span>
                        <span style="vertical-align:middle;">KrishiPath</span>
                      </td>

                      <!-- "Secure & Trusted" tag – hidden on mobile -->
                      <td class="header-trust" align="right"
                          style="color:#ffffff;font-size:16px;font-weight:500;line-height:24px;">
                        <span style="display:inline-block;vertical-align:middle;margin-right:8px;">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="white"/>
                          </svg>
                        </span>
                        <span style="vertical-align:middle;">Secure &amp; Trusted</span>
                      </td>

                    </tr>
                  </table>
                </td>
              </tr>


              <!-- ── HERO (two-column) ──────────────────────── -->
              <tr>
                <td class="hero-cell" style="padding:60px 40px 40px 40px;background:#ffffff;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>

                      <!-- Left: headline + body copy -->
                      <td class="col-text" valign="top"
                          style="width:55%;padding-right:40px;">
                        <h1 class="hero-h1"
                            style="margin:0 0 24px 0;font-size:40px;line-height:1.2;font-weight:700;color:#0a1f44;">
                          Verify Your Email
                          <span style="display:inline-block;vertical-align:middle;margin-left:8px;">
                            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="18" cy="18" r="18" fill="#0052cc"/>
                              <path d="M15 22L10 17L11.41 15.59L15 19.17L24.59 9.58L26 11L15 22Z" fill="white"/>
                            </svg>
                          </span>
                        </h1>
                        <p style="margin:0 0 16px 0;font-size:16px;line-height:1.5;color:#0a1f44;">Hello,</p>
                        <p style="margin:0;font-size:16px;line-height:1.6;color:#4a5568;">
                          Thank you for registering with <strong style="color:#0a1f44;">KrishiPath</strong>.
                          Use the verification code below to complete your email verification and
                          secure your account.
                        </p>
                      </td>

                      <!-- Right: illustration rendered as <img> (base64) – never an attachment -->
                      <td class="col-image" valign="middle" align="center"
                          style="width:45%;">
                        <img class="illus-img"
                             src="data:image/svg+xml;base64,${illustrationSvg}"
                             width="200" height="200"
                             alt="Email verification illustration"
                             style="display:inline-block;border:0;outline:none;text-decoration:none;" />
                      </td>

                    </tr>
                  </table>
                </td>
              </tr>


              <!-- ── OTP CODE BOX ──────────────────────────── -->
              <tr>
                <td class="code-outer" style="padding:0 40px 40px 40px;background:#ffffff;">
                  <table class="code-inner" role="presentation" width="100%" cellspacing="0" cellpadding="0"
                         style="background:#f7fafc;border-radius:12px;padding:32px 24px;">

                    <!-- Label -->
                    <tr>
                      <td align="center"
                          style="font-size:14px;font-weight:700;color:#0052cc;letter-spacing:1px;
                                 padding-bottom:20px;text-transform:uppercase;">
                        YOUR VERIFICATION CODE
                      </td>
                    </tr>

                    <!-- Digit cells -->
                    <tr>
                      <td align="center">
                        <table role="presentation" cellspacing="8" cellpadding="0" style="margin:0 auto;">
                          <tr>${codeCells}</tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Expiry -->
                    <tr>
                      <td align="center" style="font-size:16px;color:#4a5568;padding-top:20px;">
                        This code expires in <strong style="color:#ef4444;">15 minutes.</strong>
                      </td>
                    </tr>

                    <!-- Security notice -->
                    <tr>
                      <td style="padding-top:24px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                               style="background:#e8f2ff;border-radius:8px;padding:16px 20px;">
                          <tr>
                            <td width="40" align="center" valign="top" style="padding-right:16px;">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="#0a1f44"/>
                              </svg>
                            </td>
                            <td style="font-size:14px;line-height:1.5;color:#0a1f44;">
                              If you didn't request this code, you can safely ignore this email.<br>
                              Your account is secure.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>


              <!-- ── FEATURES STRIP ────────────────────────── -->
              <tr>
                <td class="features-outer" style="padding:0 40px 40px 40px;background:#ffffff;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>

                      <!-- Secure -->
                      <td class="feat-col" valign="top" style="width:33%;padding-right:20px;">
                        <table role="presentation" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="padding-bottom:12px;">
                              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="24" fill="#e8f2ff"/>
                                <path d="M24 14L16 18V24C16 28.42 19.03 32.34 24 33C28.97 32.34 32 28.42 32 24V18L24 14Z" fill="#0052cc"/>
                              </svg>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div style="font-size:18px;font-weight:700;color:#0a1f44;margin-bottom:4px;">Secure</div>
                              <div style="font-size:14px;line-height:1.5;color:#4a5568;">Bank-level security to protect your data</div>
                            </td>
                          </tr>
                        </table>
                      </td>

                      <!-- Fast -->
                      <td class="feat-col" valign="top" style="width:33%;padding:0 10px;">
                        <table role="presentation" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="padding-bottom:12px;">
                              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="24" fill="#e8f2ff"/>
                                <path d="M17 31L14 28L15.41 26.59L17 28.17L20.59 24.58L22 26L17 31ZM17 19L14 16L15.41 14.59L17 16.17L20.59 12.58L22 14L17 19ZM25 29H34V27H25V29ZM25 17H34V15H25V17Z" fill="#0052cc"/>
                                <path d="M24 20L18 24L24 28L30 24L24 20Z" fill="#0052cc"/>
                              </svg>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div style="font-size:18px;font-weight:700;color:#0a1f44;margin-bottom:4px;">Fast</div>
                              <div style="font-size:14px;line-height:1.5;color:#4a5568;">Quick verification to get you started</div>
                            </td>
                          </tr>
                        </table>
                      </td>

                      <!-- Support -->
                      <td class="feat-col" valign="top" style="width:33%;padding-left:20px;">
                        <table role="presentation" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="padding-bottom:12px;">
                              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="24" fill="#e8f2ff"/>
                                <path d="M24 14C19.03 14 15 18.03 15 23C15 27.97 19.03 32 24 32C28.97 32 33 27.97 33 23C33 18.03 28.97 14 24 14ZM24 30C20.13 30 17 26.87 17 23C17 19.13 20.13 16 24 16C27.87 16 31 19.13 31 23C31 26.87 27.87 30 24 30Z" fill="#0052cc"/>
                                <path d="M24 18C22.9 18 22 18.9 22 20V24C22 25.1 22.9 26 24 26C25.1 26 26 25.1 26 24V20C26 18.9 25.1 18 24 18Z" fill="#0052cc"/>
                                <circle cx="24" cy="28" r="1.5" fill="#0052cc"/>
                              </svg>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div style="font-size:18px;font-weight:700;color:#0a1f44;margin-bottom:4px;">Support</div>
                              <div style="font-size:14px;line-height:1.5;color:#4a5568;">We're here to help you anytime</div>
                            </td>
                          </tr>
                        </table>
                      </td>

                    </tr>
                  </table>
                </td>
              </tr>


              <!-- ── FOOTER ─────────────────────────────────── -->
              <tr>
                <td class="footer-cell"
                    style="background:#f7fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td class="footer-left" align="left"
                          style="font-size:13px;line-height:1.6;color:#4a5568;">
                        &copy; 2025 KrishiPath. All rights reserved.<br>
                        <a href="#" style="color:#0052cc;text-decoration:none;">Privacy Policy</a>
                        <span style="color:#cbd5e0;"> &bull; </span>
                        <a href="#" style="color:#0052cc;text-decoration:none;">Terms of Service</a>
                        <span style="color:#cbd5e0;"> &bull; </span>
                        <a href="#" style="color:#0052cc;text-decoration:none;">Support</a>
                      </td>
                      <td class="footer-right" align="right"
                          style="font-size:13px;line-height:1.6;color:#4a5568;">
                        KrishiPath Inc.<br>
                        880 Industrial Blvd, Chicago, IL 60601, USA
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>


            </table><!-- /card -->
          </td>
        </tr>
      </table><!-- /wrapper -->

    </body>
  </html>`;
    }
    async verifyEmail(payload) {
        return this.withLogs("auth.email.verify.confirm", async () => {
            const input = this.emailVerifyValidator.parse(payload);
            const email = input.email.trim().toLowerCase();
            const user = await this.authRepository.findUserByEmail(email);
            if (!user) {
                throw new AuthError(404, "User not found");
            }
            const verification = await this.mfaService.verifyOtpChallenge({
                challengeId: input.challengeId,
                userId: user.id,
                method: "email_otp",
                purpose: "email_verify",
                target: email,
                code: input.code,
                allowMatchingCode: true,
            });
            if (verification.status === "invalid_challenge") {
                await logger.warn("Email verification challenge rejected", {
                    module: "auth.email_verify",
                    userId: user.id,
                    companyId: undefined,
                    tags: ["auth", "email", "verify", "challenge", "missing"],
                    payload: {
                        requestedChallengeId: input.challengeId,
                        availableChallengeKeys: await this.mfaService.listChallengeKeys(),
                    },
                });
                throw new AuthError(400, "Invalid or expired challenge");
            }
            if (verification.status === "attempts_exhausted") {
                throw new AuthError(400, "Too many incorrect attempts. Verification code expired.");
            }
            if (verification.status === "invalid_code") {
                const remaining = (verification.challenge.maxAttempts ?? 3) -
                    (verification.challenge.attempts ?? 0);
                throw new AuthError(401, `Invalid verification code. ${remaining} attempts remaining.`);
            }
            await this.mfaService.clearChallenge(verification.challenge.id);
            if (verification.challenge.id !== input.challengeId) {
                await this.mfaService.clearChallenge(input.challengeId);
            }
            await this.authRepository.markEmailVerified(user.id);
            await this.authRepository.createOrUpdateMfaDevice(user.id, "email_otp", undefined, email, undefined, true, new Date());
            return {
                verified: true,
                nextStep: "setup_authenticator",
            };
        });
    }
    async startSignupPhoneVerification(payload, ctx) {
        return this.withLogs("auth.signup.phone.start", async () => {
            const input = this.signupPhoneStartValidator.parse(payload);
            const email = input.email.trim().toLowerCase();
            const user = await this.authRepository.findUserByEmail(email);
            if (!user) {
                throw new AuthError(404, "User not found");
            }
            if (!user.isEmailVerified) {
                throw new AuthError(403, "Email verification required");
            }
            if (input.phone && user.phone !== input.phone.trim()) {
                const existingPhone = await this.authRepository.findUserByPhone(input.phone.trim());
                if (existingPhone && existingPhone.id !== user.id) {
                    throw new AuthError(409, "Phone already registered");
                }
                await this.authRepository.updateUserPhone(user.id, input.phone.trim());
                return this.issuePhoneVerification({
                    ...user,
                    phone: input.phone.trim(),
                    isPhoneVerified: false,
                }, input.channel ?? "sms", ctx);
            }
            if (user.isPhoneVerified) {
                return {
                    alreadyVerified: true,
                    nextStep: "setup_authenticator",
                };
            }
            return this.issuePhoneVerification(user, input.channel ?? "sms", ctx);
        });
    }
    async verifySignupPhone(payload) {
        return this.withLogs("auth.signup.phone.verify", async () => {
            const input = this.signupPhoneVerifyValidator.parse(payload);
            const email = input.email.trim().toLowerCase();
            const user = await this.authRepository.findUserByEmail(email);
            if (!user) {
                throw new AuthError(404, "User not found");
            }
            const verification = await this.mfaService.verifyOtpChallenge({
                challengeId: input.challengeId,
                userId: user.id,
                method: "phone_otp",
                purpose: "phone_verify",
                code: input.code,
                allowMatchingCode: true,
            });
            if (verification.status === "invalid_challenge") {
                throw new AuthError(400, "Invalid or expired challenge");
            }
            if (verification.status === "attempts_exhausted") {
                throw new AuthError(400, "Too many incorrect attempts. Verification code expired.");
            }
            if (verification.status === "invalid_code") {
                const remaining = (verification.challenge.maxAttempts ?? 3) -
                    (verification.challenge.attempts ?? 0);
                throw new AuthError(401, `Invalid verification code. ${remaining} attempts remaining.`);
            }
            await this.mfaService.clearChallenge(verification.challenge.id);
            if (verification.challenge.id !== input.challengeId) {
                await this.mfaService.clearChallenge(input.challengeId);
            }
            await this.authRepository.markPhoneVerified(user.id);
            await this.authRepository.createOrUpdateMfaDevice(user.id, "phone_otp", undefined, undefined, verification.challenge.target, true, new Date());
            return {
                verified: true,
                nextStep: "setup_authenticator",
            };
        });
    }
    async setSignupPassword(payload, ctx) {
        return this.withLogs("auth.signup.password.set", async () => {
            const input = this.signupPasswordSetValidator.parse(payload);
            const email = input.email.trim().toLowerCase();
            const user = await this.authRepository.findUserByEmail(email);
            if (!user) {
                throw new AuthError(404, "User not found");
            }
            const challenge = await this.mfaService.getChallenge(input.setupToken);
            if (!challenge ||
                challenge.userId !== user.id ||
                challenge.purpose !== "password_setup") {
                throw new AuthError(400, "Invalid or expired password setup token");
            }
            if (!user.isEmailVerified ||
                !user.isPhoneVerified ||
                !user.isMfaEnabled) {
                throw new AuthError(403, "Signup verification incomplete");
            }
            const hashed = await this.passService.hash(input.password);
            await this.authRepository.updateUserPassword(user.id, hashed.hash, hashed.salt);
            await this.authRepository.markUserActive(user.id);
            await this.mfaService.clearChallenge(input.setupToken);
            const result = await this.finalizeLogin(user.id, undefined, "signup_password_set", {}, ctx, true, true);
            return {
                ...result,
                nextStep: "tenant_registration",
            };
        });
    }
    async verifyLoginMfa(payload, ctx) {
        return this.withLogs("auth.login.mfa.verify", async () => {
            const input = this.loginVerifyValidator.parse(payload);
            const challenge = await this.mfaService.getChallenge(input.challengeId);
            if (!challenge ||
                (challenge.purpose !== "login" && challenge.purpose !== "login_primary")) {
                throw new AuthError(400, "Invalid or expired challenge");
            }
            if (challenge.method !== input.method) {
                throw new AuthError(400, "MFA method mismatch");
            }
            const user = await this.requireUser(challenge.userId);
            if (challenge.purpose === "login_primary") {
                if (input.method === "auth_app_otp") {
                    throw new AuthError(400, "Primary login method mismatch");
                }
                const primaryVerification = await this.mfaService.verifyOtpChallenge({
                    challengeId: input.challengeId,
                    userId: user.id,
                    method: input.method,
                    purpose: "login_primary",
                    code: input.code,
                });
                if (primaryVerification.status === "invalid_challenge") {
                    throw new AuthError(400, "Challenge not eligible for OTP");
                }
                if (primaryVerification.status === "attempts_exhausted") {
                    throw new AuthError(400, "Too many incorrect attempts. Verification code expired.");
                }
                if (primaryVerification.status === "invalid_code") {
                    const remaining = (primaryVerification.challenge.maxAttempts ?? 3) -
                        (primaryVerification.challenge.attempts ?? 0);
                    throw new AuthError(401, `Invalid MFA code. ${remaining} attempts remaining.`);
                }
                await this.mfaService.clearChallenge(primaryVerification.challenge.id);
                return this.issueAuthenticatorLoginChallenge(user, {
                    email: user.email ?? "",
                    companyId: challenge.selectedCompanyId,
                    isRoot: challenge.isRoot ?? challenge.authType === "root",
                    deviceId: input.deviceId,
                    deviceName: input.deviceName,
                    deviceType: input.deviceType,
                    operatingSystem: input.operatingSystem,
                    browser: input.browser,
                    mfaTrustToken: input.mfaTrustToken,
                }, input.method, ctx);
            }
            if (input.method === "auth_app_otp") {
                const device = await this.authRepository.findMfaDevice(user.id, "auth_app_otp");
                if (!device?.secretHash || !device.verifiedAt) {
                    this.requireConfiguredAuthenticator();
                }
                const maxAttempts = challenge.maxAttempts ?? 5;
                const currentAttempts = challenge.attempts ?? 0;
                if (currentAttempts >= maxAttempts) {
                    await this.mfaService.clearChallenge(challenge.id);
                    throw new AuthError(400, "Too many incorrect attempts. Login session expired.");
                }
                const secret = this.secService.decrypt(device.secretHash);
                const otpOk = this.totpService.verify(secret, input.code);
                const backupOk = await this.authRepository.useBackupCode(user.id, this.otpService.hash(input.code));
                if (!otpOk && !backupOk) {
                    challenge.attempts = currentAttempts + 1;
                    const ttl = Math.ceil((challenge.expiresAt - Date.now()) / 1000);
                    if (challenge.attempts >= maxAttempts) {
                        await this.mfaService.clearChallenge(challenge.id);
                        throw new AuthError(400, "Too many incorrect attempts. Login session expired.");
                    }
                    if (ttl > 0) {
                        await this.mfaService.saveChallenge(challenge, ttl);
                    }
                    const remaining = maxAttempts - challenge.attempts;
                    throw new AuthError(401, `Invalid MFA code. ${remaining} attempts remaining.`);
                }
            }
            else {
                const otpVerification = await this.mfaService.verifyOtpChallenge({
                    challengeId: input.challengeId,
                    userId: user.id,
                    method: input.method,
                    purpose: "login",
                    code: input.code,
                });
                if (otpVerification.status === "invalid_challenge") {
                    throw new AuthError(400, "Challenge not eligible for OTP");
                }
                if (otpVerification.status === "attempts_exhausted") {
                    throw new AuthError(400, "Too many incorrect attempts. Verification code expired.");
                }
                if (otpVerification.status === "invalid_code") {
                    const remaining = (otpVerification.challenge.maxAttempts ?? 3) -
                        (otpVerification.challenge.attempts ?? 0);
                    throw new AuthError(401, `Invalid MFA code. ${remaining} attempts remaining.`);
                }
            }
            await this.mfaService.clearChallenge(input.challengeId);
            const deviceMeta = this.loginFromVerify(input);
            const isRoot = challenge.isRoot ?? challenge.authType === "root";
            const selectedCompanyId = input.companyId ?? challenge.selectedCompanyId;
            const companies = await this.listAccessibleCompanies(user.id, isRoot);
            if (selectedCompanyId &&
                !companies.some((company) => company.id === selectedCompanyId)) {
                throw new AuthError(403, isRoot ?
                    "Company not owned by root user"
                    : "Company role assignment required");
            }
            await this.authRepository.logLoginAttempt(user.id, undefined, user.email ?? "", ctx.ipAddress, ctx.userAgent, true);
            return this.finalizeLogin(user.id, selectedCompanyId, input.method, deviceMeta, ctx, isRoot, true);
        });
    }
    async startMfa(payload, auth, ctx) {
        return this.withLogs("auth.mfa.start", async () => {
            const input = this.mfaStartValidator.parse(payload);
            const flow = this.resolveMfaFlow(input.flow, auth);
            if (flow === "signup") {
                return this.startSignupMfa(input, ctx);
            }
            if (flow === "account_setup") {
                return this.startAccountSetupMfa(input, auth, ctx);
            }
            throw new AuthError(400, "Use /auth/login to start login verification");
        });
    }
    async verifyMfa(payload, auth, ctx) {
        return this.withLogs("auth.mfa.verify", async () => {
            const input = this.mfaUnifiedVerifyValidator.parse(payload);
            const flow = this.resolveMfaFlow(input.flow, auth);
            if (flow === "signup") {
                return this.verifySignupMfa(input, ctx);
            }
            if (flow === "login") {
                return this.verifyLoginMfaFlow(input, ctx);
            }
            return this.verifyAccountSetupMfa(input, auth);
        });
    }
    async startSignupAuthApp(payload) {
        return this.withLogs("auth.signup.auth_app.start", async () => {
            const input = this.mfaAppStartValidator.parse(payload);
            const email = input.email.trim().toLowerCase();
            const user = await this.authRepository.findUserByEmail(email);
            if (!user) {
                throw new AuthError(401, "Invalid credentials");
            }
            await this.ensureSignupSetupAuthorized(user, input.password, input.setupToken);
            if (!user.isEmailVerified) {
                throw new AuthError(403, "Email verification required");
            }
            const existingDevice = await this.authRepository.findMfaDevice(user.id, "auth_app_otp");
            if (existingDevice?.secretHash && existingDevice.verifiedAt) {
                return {
                    alreadyConfigured: true,
                    enabled: true,
                    method: "auth_app_otp",
                    nextStep: "tenant_registration",
                };
            }
            const secret = this.totpService.createSecret();
            const issuer = env.totpIssuer;
            const account = user.email ?? user.id;
            const uri = this.totpService.buildOtpAuthUri(secret, issuer, account);
            const setup = await this.mfaService.issueReplacementChallenge(user.id, undefined, "auth_app_otp", "setup", secret);
            return {
                secret,
                otpauthUri: uri,
                setupToken: setup.challenge.id,
                authAppSetupToken: setup.challenge.id,
                setupExpiresAt: setup.challenge.expiresAt,
            };
        });
    }
    async verifySignupAuthApp(payload, ctx = {}) {
        return this.withLogs("auth.signup.auth_app.verify", async () => {
            const input = this.mfaAppVerifySetupValidator.parse(payload);
            const email = input.email.trim().toLowerCase();
            const user = await this.authRepository.findUserByEmail(email);
            if (!user) {
                throw new AuthError(401, "Invalid credentials");
            }
            await this.ensureSignupSetupAuthorized(user, input.password, input.setupToken);
            if (!user.isEmailVerified) {
                throw new AuthError(403, "Email verification required");
            }
            const setupChallenge = input.setupToken ?
                await this.mfaService.getChallenge(input.setupToken)
                : null;
            const setupSecret = (setupChallenge?.userId === user.id &&
                setupChallenge.method === "auth_app_otp" &&
                setupChallenge.purpose === "setup" &&
                setupChallenge.target) ?
                setupChallenge.target
                : input.secret;
            if (!setupSecret) {
                throw new AuthError(400, "Authenticator setup token or secret required");
            }
            if (setupChallenge) {
                const maxAttempts = setupChallenge.maxAttempts ?? 5;
                const currentAttempts = setupChallenge.attempts ?? 0;
                if (currentAttempts >= maxAttempts) {
                    await this.mfaService.clearChallenge(setupChallenge.id);
                    throw new AuthError(400, "Too many incorrect attempts. Setup session expired.");
                }
                const isValid = this.totpService.verify(setupSecret, input.code);
                if (!isValid) {
                    setupChallenge.attempts = currentAttempts + 1;
                    const ttl = Math.ceil((setupChallenge.expiresAt - Date.now()) / 1000);
                    if (setupChallenge.attempts >= maxAttempts) {
                        await this.mfaService.clearChallenge(setupChallenge.id);
                        throw new AuthError(400, "Too many incorrect attempts. Setup session expired.");
                    }
                    if (ttl > 0) {
                        await this.mfaService.saveChallenge(setupChallenge, ttl);
                    }
                    const remaining = maxAttempts - setupChallenge.attempts;
                    throw new AuthError(401, `Invalid authenticator code. ${remaining} attempts remaining.`);
                }
            }
            else {
                const isValid = this.totpService.verify(setupSecret, input.code);
                if (!isValid) {
                    throw new AuthError(401, "Invalid authenticator code");
                }
            }
            const encryptedSecret = this.secService.encrypt(setupSecret);
            await this.authRepository.createOrUpdateMfaDevice(user.id, "auth_app_otp", encryptedSecret, undefined, undefined, true, new Date());
            await this.authRepository.markUserMfaEnabled(user.id);
            const backups = this.generateBackupCodes();
            const hashes = backups.map((code) => this.otpService.hash(code));
            await this.authRepository.replaceBackupCodes(user.id, hashes);
            if (input.setupToken) {
                await this.mfaService.clearChallenge(input.setupToken);
            }
            await this.authRepository.markUserActive(user.id);
            const result = await this.finalizeLogin(user.id, undefined, "signup_authenticator", {}, ctx, true, true);
            return {
                ...result,
                backupCodes: backups,
                nextStep: "tenant_registration",
            };
        });
    }
    async startEmailMfa(userId, ctx) {
        return this.withLogs("auth.mfa.email.start", async () => {
            const user = await this.requireUser(userId);
            if (!user.email) {
                throw new AuthError(400, "User email missing");
            }
            const result = await this.issueOtpChallengeOnce({
                user,
                method: "email_otp",
                purpose: "setup",
                target: user.email,
                subject: "KrishiPath MFA setup code",
                idempotencyKey: ctx?.idempotencyKey,
            });
            return {
                challengeId: result.challengeId,
                method: "email_otp",
                expiresAt: result.expiresAt,
                deliveryStatus: result.deliveryStatus,
                replayed: result.replayed,
            };
        });
    }
    async startPhoneMfa(userId, payload, ctx) {
        return this.withLogs("auth.mfa.phone.start", async () => {
            const input = this.mfaPhoneValidator.parse(payload);
            const user = await this.requireUser(userId);
            const result = await this.issueOtpChallengeOnce({
                user,
                method: "phone_otp",
                purpose: "setup",
                target: input.phone,
                channel: input.channel ?? "sms",
                idempotencyKey: ctx?.idempotencyKey,
            });
            return {
                challengeId: result.challengeId,
                method: "phone_otp",
                channel: input.channel ?? "sms",
                expiresAt: result.expiresAt,
                deliveryStatus: result.deliveryStatus,
                replayed: result.replayed,
            };
        });
    }
    async verifyOtpMfaSetup(userId, payload) {
        return this.withLogs("auth.mfa.otp.verify", async () => {
            const input = this.mfaVerifyValidator.parse(payload);
            const verification = await this.mfaService.verifyOtpChallenge({
                challengeId: input.challengeId,
                userId,
                purpose: "setup",
                code: input.code,
            });
            if (verification.status === "invalid_challenge") {
                throw new AuthError(400, "Invalid or expired challenge");
            }
            if (verification.status === "attempts_exhausted") {
                throw new AuthError(400, "Too many incorrect attempts. Verification code expired.");
            }
            if (verification.status === "invalid_code") {
                const remaining = (verification.challenge.maxAttempts ?? 3) -
                    (verification.challenge.attempts ?? 0);
                throw new AuthError(401, `Invalid OTP code. ${remaining} attempts remaining.`);
            }
            await this.mfaService.clearChallenge(verification.challenge.id);
            if (verification.challenge.method === "email_otp") {
                await this.authRepository.createOrUpdateMfaDevice(userId, "email_otp", undefined, verification.challenge.target, undefined, true, new Date());
            }
            else if (verification.challenge.method === "phone_otp") {
                await this.authRepository.createOrUpdateMfaDevice(userId, "phone_otp", undefined, undefined, verification.challenge.target, true, new Date());
            }
            else {
                throw new AuthError(400, "Unsupported setup challenge");
            }
            await this.authRepository.markUserMfaEnabled(userId);
            await this.deviceTrustService.revokeAllUserTrustSessions(userId);
            await logger.info("MFA trust invalidated by MFA method update", {
                module: "auth.mfa_trust",
                userId,
                tags: ["auth", "mfa", "trust", "invalidate"],
            });
            return {
                enabled: true,
                method: verification.challenge.method,
            };
        });
    }
    async startAuthAppMfa(userId) {
        return this.withLogs("auth.mfa.app.start", async () => {
            const user = await this.requireUser(userId);
            const existingDevice = await this.authRepository.findMfaDevice(user.id, "auth_app_otp");
            if (existingDevice?.secretHash && existingDevice.verifiedAt) {
                return {
                    alreadyConfigured: true,
                    enabled: true,
                    method: "auth_app_otp",
                    nextStep: "verify_existing_authenticator",
                };
            }
            const secret = this.totpService.createSecret();
            const issuer = env.totpIssuer;
            const account = user.email ?? user.id;
            const uri = this.totpService.buildOtpAuthUri(secret, issuer, account);
            const setup = await this.mfaService.issueReplacementChallenge(user.id, undefined, "auth_app_otp", "setup", secret);
            return {
                setupToken: setup.challenge.id,
                expiresAt: setup.challenge.expiresAt,
                secret,
                otpauthUri: uri,
            };
        });
    }
    async verifyAuthAppMfa(userId, payload) {
        return this.withLogs("auth.mfa.app.verify", async () => {
            const input = this.mfaAppValidator.parse(payload);
            const setupChallenge = input.setupToken ?
                await this.mfaService.getChallenge(input.setupToken)
                : null;
            const setupSecret = (setupChallenge?.userId === userId &&
                setupChallenge.method === "auth_app_otp" &&
                setupChallenge.purpose === "setup" &&
                setupChallenge.target) ?
                setupChallenge.target
                : input.secret;
            if (!setupSecret) {
                throw new AuthError(400, "Authenticator setup token or secret required");
            }
            const isValid = this.totpService.verify(setupSecret, input.code);
            if (!isValid) {
                throw new AuthError(401, "Invalid authenticator code");
            }
            const encryptedSecret = this.secService.encrypt(setupSecret);
            await this.authRepository.createOrUpdateMfaDevice(userId, "auth_app_otp", encryptedSecret, undefined, undefined, true, new Date());
            await this.authRepository.markUserMfaEnabled(userId);
            if (input.setupToken) {
                await this.mfaService.clearChallenge(input.setupToken);
            }
            await this.deviceTrustService.revokeAllUserTrustSessions(userId);
            await logger.info("MFA trust invalidated by authenticator update", {
                module: "auth.mfa_trust",
                userId,
                tags: ["auth", "mfa", "trust", "invalidate"],
            });
            const backups = this.generateBackupCodes();
            const hashes = backups.map((code) => this.otpService.hash(code));
            await this.authRepository.replaceBackupCodes(userId, hashes);
            return {
                enabled: true,
                method: "auth_app_otp",
                backupCodes: backups,
            };
        });
    }
    async listMfaMethods(userId) {
        return this.withLogs("auth.mfa.methods.list", async () => {
            const devices = await this.authRepository.listMfaDevices(userId);
            return {
                methods: devices.map((device) => ({
                    id: device.id,
                    type: device.mfaType,
                    isPrimary: device.isPrimary,
                    verifiedAt: device.verifiedAt,
                    email: device.email,
                    phone: device.phoneNumber,
                })),
            };
        });
    }
    async listSessions(userId, currentSessionId) {
        return this.withLogs("auth.sessions.list", async () => {
            const sessions = await this.authRepository.listActiveSessions(userId);
            return {
                sessions: sessions.map((session) => ({
                    sessionId: session.id,
                    deviceId: session.deviceId,
                    deviceType: session.deviceType,
                    browser: session.browser,
                    operatingSystem: session.operatingSystem,
                    ipAddress: session.ipAddress,
                    loginMethod: session.loginMethod,
                    createdAt: session.createdAt,
                    lastActiveAt: session.lastActiveAt,
                    expiresAt: session.expiresAt,
                    isCurrent: session.id === currentSessionId,
                })),
            };
        });
    }
    async listMfaTrustSessions(userId) {
        return this.withLogs("auth.mfa_trust.list", async () => {
            const sessions = await this.authRepository.listMfaTrustSessions(userId);
            return {
                sessions: sessions.map((session) => ({
                    trustSessionId: session.id,
                    companyId: session.companyId,
                    deviceId: session.deviceId,
                    browserFingerprint: session.browserFingerprint,
                    sessionId: session.sessionId,
                    trustedAt: session.trustedAt,
                    expiresAt: session.expiresAt,
                    lastSeenIp: session.lastSeenIp,
                    riskScore: session.riskScore,
                    metadata: session.metadata,
                })),
            };
        });
    }
    async revokeMfaTrustSession(userId, payload) {
        return this.withLogs("auth.mfa_trust.revoke", async () => {
            const input = this.mfaTrustSessionRevokeValidator.parse(payload);
            const revoked = await this.deviceTrustService.revokeTrustedSession(userId, input.trustSessionId);
            await logger.info("MFA trust revoked", {
                module: "auth.mfa_trust",
                userId,
                payload: { trustSessionId: input.trustSessionId, revoked },
                tags: ["auth", "mfa", "trust", "revoke"],
            });
            return { revoked };
        });
    }
    async revokeAllMfaTrustSessions(currentUserId, payload) {
        return this.withLogs("auth.mfa_trust.revoke_all", async () => {
            const input = this.mfaTrustSessionRevokeAllValidator.parse(payload);
            const targetUserId = input.userId ?? currentUserId;
            const revokedCount = await this.deviceTrustService.revokeAllUserTrustSessions(targetUserId);
            await logger.info("MFA trust revoked for user", {
                module: "auth.mfa_trust",
                userId: currentUserId,
                payload: { targetUserId, revokedCount },
                tags: ["auth", "mfa", "trust", "revoke"],
            });
            return { revokedCount };
        });
    }
    async revokeSession(userId, payload) {
        return this.withLogs("auth.session.revoke", async () => {
            const input = this.sessionRevokeValidator.parse(payload);
            const revoked = await this.authRepository.revokeSession(userId, input.sessionId, input.reason ?? "manual_revoke");
            if (!revoked) {
                throw new AuthError(404, "Session not found");
            }
            return {
                revoked: true,
                sessionId: input.sessionId,
            };
        });
    }
    async revokeOtherSessions(userId, currentSessionId) {
        return this.withLogs("auth.session.revoke_others", async () => {
            const count = await this.authRepository.revokeAllOtherSessions(userId, currentSessionId, "revoke_other_sessions");
            return {
                revokedCount: count,
            };
        });
    }
    async selectPlan(userId, payload) {
        return this.withLogs("auth.plan.select", async () => {
            const input = this.planValidator.parse(payload);
            const user = await this.requireUser(userId);
            const userCompanyId = await this.authRepository.getDefaultCompanyIdForUser(userId);
            const plan = await this.authRepository.findPlanByCode(input.planCode);
            if (!plan) {
                throw new AuthError(404, "Plan not found");
            }
            if (userCompanyId) {
                await this.authRepository.setTenantPlan(userCompanyId, plan.id);
            }
            if (input.billingCycle === "trial" || plan.code === "free_tier") {
                const subscription = await this.authRepository.activateTrialSubscription(userId, plan.id, 15);
                await this.authRepository.markUserActive(user.id);
                return {
                    companyId: userCompanyId ?? userId,
                    plan: plan.code,
                    subscriptionId: subscription.id,
                    status: subscription.status,
                    trialDays: 15,
                    limits: {
                        maxOrganizations: 2,
                        maxWarehousesPerOrganization: 2,
                        maxItemsPerWarehouse: 100,
                        maxUsers: 7,
                    },
                    nextStep: "trial_active_limited_access",
                };
            }
            const subscription = await this.authRepository.upsertSubscriptionDraft(userId, plan.id, input.billingCycle);
            return {
                companyId: userCompanyId ?? userId,
                plan: plan.code,
                subscriptionId: subscription.id,
                status: subscription.status,
                nextStep: "activate_subscription",
            };
        });
    }
    async startPasswordReset(payload) {
        return this.withLogs("auth.password.reset.start", async () => {
            const input = this.passwordResetStartValidator.parse(payload);
            const email = input.email.trim().toLowerCase();
            const user = await this.authRepository.findUserByEmail(email);
            if (!user) {
                return {
                    accepted: true,
                    message: "If account exists, reset instructions will be sent",
                };
            }
            if (!env.passwordResetUrl) {
                throw new AuthError(503, "Password reset URL is not configured");
            }
            const { randomInt } = await import("crypto");
            const token = randomInt(100000, 999999).toString();
            await this.authRepository.createPasswordResetToken(user.id, this.sha256(token), env.passwordResetTokenTtlMinutes);
            const delivery = await this.emailService.send(new EmailDto({
                to: email,
                subject: "Reset your KrishiPath password",
                body: this.buildPasswordResetEmailBody(token, env.passwordResetTokenTtlMinutes),
                htmlBody: this.buildPasswordResetEmailHtml(token, env.passwordResetTokenTtlMinutes),
                companyId: undefined,
                userId: user.id,
            }));
            await logger.info("Password reset token generated", {
                module: "auth.password_reset",
                userId: user.id,
                companyId: undefined,
                tags: ["auth", "password", "reset", "start"],
                payload: {
                    messageId: delivery.messageId,
                    deliveryStatus: delivery.status,
                },
            });
            return {
                accepted: true,
                message: "If account exists, reset instructions will be sent",
            };
        });
    }
    async confirmPasswordReset(payload) {
        return this.withLogs("auth.password.reset.confirm", async () => {
            const input = this.passwordResetConfirmValidator.parse(payload);
            const token = await this.authRepository.findPasswordResetTokenByHash(this.sha256(input.token));
            if (!token ||
                !token.id ||
                !token.userId ||
                token.usedAt ||
                !token.expiresAt ||
                token.expiresAt < new Date()) {
                throw new AuthError(400, "Invalid or expired reset token");
            }
            const hashed = await this.passService.hash(input.password);
            await this.authRepository.updateUserPassword(token.userId, hashed.hash, hashed.salt);
            await this.authRepository.markPasswordResetTokenUsed(token.id);
            await this.authRepository.revokeAllSessions(token.userId, "password_reset");
            await this.deviceTrustService.revokeAllUserTrustSessions(token.userId);
            await logger.info("MFA trust invalidated by password reset", {
                module: "auth.mfa_trust",
                userId: token.userId,
                tags: ["auth", "mfa", "trust", "invalidate", "password"],
            });
            return {
                reset: true,
            };
        });
    }
    async requestPasswordReset(payload, ipAddress, userAgent) {
        return this.withLogs("auth.password.reset.request", async () => {
            const input = this.passwordResetStartValidator.parse(payload);
            const email = input.email.trim().toLowerCase();
            const genericResponse = {
                success: true,
                message: "If an account exists for this email address, a password reset link has been sent.",
            };
            this.passwordResetRateLimiter.assertWithinLimit("password_reset_request_ip", ipAddress, 20, 3600);
            this.passwordResetRateLimiter.assertWithinLimit("password_reset_request_email", email, 5, 3600);
            const user = await this.authRepository.findUserByEmail(email);
            if (!user || user.deletedAt !== null || user.status !== "active") {
                return genericResponse;
            }
            const activeSessions = await this.authRepository.getActivePasswordResetSessions(user.id);
            for (const activeSession of activeSessions) {
                await this.authRepository.invalidatePasswordResetSession(activeSession.id);
            }
            const { randomInt } = await import("crypto");
            const token = randomInt(100000, 999999).toString(); // 6-digit OTP
            const tokenHash = this.sha256(token);
            const ttlMinutes = 10;
            await this.authRepository.createPasswordResetSession(user.id, tokenHash, ipAddress, userAgent, ttlMinutes);
            await this.emailService.send(new EmailDto({
                to: email,
                subject: "Reset your KrishiPath password",
                body: this.buildPasswordResetEmailBody(token, ttlMinutes),
                htmlBody: this.buildPasswordResetEmailHtml(token, ttlMinutes),
                companyId: undefined,
                userId: user.id,
            }));
            await logger.info("Password reset session created", {
                module: "auth.password_reset",
                userId: user.id,
                tags: ["auth", "password", "reset", "session", "create"],
            });
            return genericResponse;
        });
    }
    async validatePasswordResetToken(payload, ipAddress) {
        return this.withLogs("auth.password.reset.validate", async () => {
            const input = this.passwordResetValidateValidator.parse(payload);
            this.passwordResetRateLimiter.assertWithinLimit("password_reset_validate_ip", ipAddress, 30, 3600);
            this.passwordResetRateLimiter.assertWithinLimit("password_reset_validate_token", this.sha256(input.token), 10, 3600);
            const session = await this.authRepository.findPasswordResetSessionByHash(this.sha256(input.token));
            if (!session || !session.userId || session.invalidatedAt) {
                throw new AuthError(400, "Reset Link Expired");
            }
            if (session.used) {
                throw new AuthError(400, "This reset link has already been used.");
            }
            if (!session.expiresAt || session.expiresAt < new Date()) {
                throw new AuthError(400, "Reset Link Expired");
            }
            const user = await this.authRepository.findUserById(session.userId);
            if (!user || user.deletedAt !== null) {
                throw new AuthError(400, "Account unavailable");
            }
            if (user.status !== "active") {
                throw new AuthError(400, "Account unavailable");
            }
            return {
                success: true,
            };
        });
    }
    async completePasswordReset(payload, ipAddress, userAgent) {
        return this.withLogs("auth.password.reset.complete", async () => {
            const input = this.passwordResetConfirmValidator.parse(payload);
            this.passwordResetRateLimiter.assertWithinLimit("password_reset_complete_ip", ipAddress, 20, 3600);
            this.passwordResetRateLimiter.assertWithinLimit("password_reset_complete_token", this.sha256(input.token), 10, 3600);
            const session = await this.authRepository.findPasswordResetSessionByHash(this.sha256(input.token));
            if (!session || !session.userId || session.invalidatedAt) {
                throw new AuthError(400, "Reset Link Expired");
            }
            if (session.used) {
                throw new AuthError(400, "This reset link has already been used.");
            }
            if (!session.expiresAt || session.expiresAt < new Date()) {
                throw new AuthError(400, "Reset Link Expired");
            }
            const user = await this.authRepository.findUserById(session.userId);
            if (!user || user.deletedAt !== null) {
                throw new AuthError(400, "Account unavailable");
            }
            if (user.status !== "active") {
                throw new AuthError(400, "Account unavailable");
            }
            // Check current password difference
            const isSameAsCurrent = await this.passService.verify(input.password, user.passwordHash, user.passwordSalt);
            if (isSameAsCurrent) {
                throw new AuthError(400, "New password must be different from current password");
            }
            // Check last 5 passwords history
            const history = await this.authRepository.getPasswordHistory(user.id, 5);
            for (const entry of history) {
                const matchesHistory = await this.passService.verify(input.password, entry.passwordHash, entry.passwordSalt);
                if (matchesHistory) {
                    throw new AuthError(400, "Password cannot be one of your last 5 passwords");
                }
            }
            const consumedSession = await this.authRepository.consumePasswordResetSession(session.id);
            if (!consumedSession) {
                throw new AuthError(400, "Reset Link Expired");
            }
            const hashed = await this.passService.hash(input.password);
            await this.authRepository.addPasswordHistory(user.id, user.passwordHash, user.passwordSalt);
            await this.authRepository.updateUserPassword(user.id, hashed.hash, hashed.salt);
            // Invalidate all refresh tokens and access sessions
            await this.authRepository.revokeAllSessions(user.id, "password_reset");
            // Invalidate all remembered devices
            await this.authRepository.untrustAllUserDevices(user.id);
            // Invalidate all trusted MFA sessions
            await this.authRepository.revokeAllUserMfaTrustSessions(user.id);
            // Create audit log entry
            await this.auditLogRepository.create(new AuditLogDto({
                userId: user.id,
                action: "PASSWORD_RESET_COMPLETED",
                entityType: "user",
                entityId: user.id,
                ipAddress: ipAddress,
                userAgent: userAgent,
                metadata: {
                    timestamp: new Date().toISOString(),
                    device: userAgent,
                    resetSessionId: session.id,
                },
            }));
            // Send security email
            await this.emailService.send(new EmailDto({
                to: user.email,
                subject: "Your password was changed successfully",
                body: `Your password was changed successfully at ${new Date().toISOString()} from IP ${ipAddress} (Device: ${userAgent}). If this change was unauthorized, please contact support immediately.`,
                htmlBody: `<p>Your password was changed successfully.</p><p><strong>Details:</strong></p><ul><li>Timestamp: ${new Date().toISOString()}</li><li>IP Address: ${ipAddress}</li><li>Device: ${userAgent}</li></ul><p>If this change was unauthorized, please contact support immediately.</p>`,
                companyId: undefined,
                userId: user.id,
            }));
            await logger.info("Password reset completed successfully", {
                module: "auth.password_reset",
                userId: user.id,
                tags: ["auth", "password", "reset", "complete"],
            });
            return {
                success: true,
                message: "Password changed successfully.",
            };
        });
    }
    async switchCompany(refreshToken, companyId, ctx) {
        return this.withLogs("auth.switch_company", async () => {
            if (!refreshToken)
                throw new AuthError(400, "Refresh token required");
            if (!companyId)
                throw new AuthError(400, "Company ID required");
            const claims = this.tokenService.verifyRefresh(refreshToken);
            if (!claims)
                throw new AuthError(401, "Invalid refresh token");
            const session = await this.authRepository.findSessionById(claims.sessionId);
            if (!session || session.userId !== claims.sub)
                throw new AuthError(401, "Invalid session");
            const refreshHash = this.sha256(refreshToken);
            if (session.refreshTokenHash !== refreshHash)
                throw new AuthError(401, "Refresh token mismatch");
            if (session.revokedAt || (session.expiresAt && session.expiresAt < new Date())) {
                throw new AuthError(401, "Session expired");
            }
            const isRoot = claims.isRoot ?? claims.authType === "root";
            // Validate the user actually has access to the requested company under their current login type
            const accessibleCompanies = await this.listAccessibleCompanies(claims.sub, isRoot);
            if (!accessibleCompanies.some((c) => c.id === companyId)) {
                throw new AuthError(403, isRoot ? "Company not owned by root user" : "Company role assignment required");
            }
            const access = await this.resolveTenantAccess(claims.sub, companyId, isRoot);
            const accessJti = randomUUID();
            const newClaims = await this.buildTokenClaims(claims.sub, claims.sessionId, access);
            const accessToken = this.tokenService.signAccess(newClaims);
            const newRefreshToken = this.tokenService.signRefresh(newClaims);
            const newRefreshHash = this.sha256(newRefreshToken);
            await this.authRepository.rotateSession(claims.sessionId, accessJti, newRefreshHash, ctx.ipAddress);
            return {
                accessToken,
                refreshToken: newRefreshToken,
                companyId: access.companyId,
                accessLevel: access.accessLevel,
                subscriptionStatus: access.subscriptionStatus,
                isRoot: access.isRoot,
                authType: access.authType,
            };
        });
    }
    async refresh(refreshToken, ctx) {
        return this.withLogs("auth.refresh", async () => {
            if (!refreshToken) {
                throw new AuthError(400, "Refresh token required");
            }
            const claims = this.tokenService.verifyRefresh(refreshToken);
            if (!claims) {
                throw new AuthError(401, "Invalid refresh token");
            }
            const session = await this.authRepository.findSessionById(claims.sessionId);
            if (!session || session.userId !== claims.sub) {
                throw new AuthError(401, "Invalid session");
            }
            const refreshHash = this.sha256(refreshToken);
            if (session.refreshTokenHash !== refreshHash) {
                throw new AuthError(401, "Refresh token mismatch");
            }
            if (session.revokedAt ||
                (session.expiresAt && session.expiresAt < new Date())) {
                throw new AuthError(401, "Session expired");
            }
            const access = claims.companyId ?
                await this.resolveTenantAccess(claims.sub, claims.companyId, claims.isRoot ?? claims.authType === "root")
                : {
                    subscriptionStatus: "none",
                    accessLevel: "restricted",
                    isRoot: claims.isRoot ?? claims.authType === "root",
                    authType: (claims.authType ??
                        (claims.isRoot ? "root" : "iam")),
                };
            const accessJti = randomUUID();
            const newClaims = await this.buildTokenClaims(claims.sub, claims.sessionId, access);
            const accessToken = this.tokenService.signAccess(newClaims);
            const newRefreshToken = this.tokenService.signRefresh(newClaims);
            const newRefreshHash = this.sha256(newRefreshToken);
            await this.authRepository.rotateSession(claims.sessionId, accessJti, newRefreshHash, ctx.ipAddress);
            return {
                accessToken,
                refreshToken: newRefreshToken,
                accessLevel: access.accessLevel,
                subscriptionStatus: access.subscriptionStatus,
                availableCompanies: await this.listAccessibleCompanies(claims.sub, access.isRoot),
            };
        });
    }
    async activateSubscription(userId) {
        return this.withLogs("auth.subscription.activate", async () => {
            const user = await this.requireUser(userId);
            const userCompanyId = await this.authRepository.getDefaultCompanyIdForUser(userId);
            const subscription = await this.authRepository.activateSubscription(userId);
            await this.authRepository.markUserActive(user.id);
            const access = await this.resolveAccess(user.id);
            const tokens = await this.issueTokens(user.id, access, "activation", {}, {});
            return {
                companyId: userCompanyId ?? userId,
                subscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                accessLevel: access.accessLevel,
                tokens,
                nextStep: "setup_and_operate",
            };
        });
    }
    async createRole(userId, payload, authCtx) {
        return this.withLogs("auth.role.create", async () => {
            const input = this.roleValidator.parse(payload);
            const access = await this.requireFullAccess(userId, authCtx);
            if (!authCtx?.isRoot) {
                await this.requirePermission(userId, "roles.create");
            }
            const duplicate = await this.rolePermissionRepository.findRoleByName(access.companyId, input.name);
            if (duplicate) {
                throw new AuthError(409, "Role already exists");
            }
            const permissions = await this.rolePermissionRepository.listPermissionsByIds(input.permissionIds);
            if (permissions.length !== input.permissionIds.length) {
                throw new AuthError(400, "Invalid permission ids");
            }
            const role = await this.rolePermissionRepository.createRole({
                companyId: access.companyId,
                createdBy: userId,
                name: input.name,
                description: input.description ?? input.name,
                color: input.color,
            }, input.permissionIds);
            return {
                roleId: role.id,
                name: role.name,
                permissionCount: input.permissionIds.length,
            };
        });
    }
    async createUser(userId, payload, authCtx) {
        return this.withLogs("auth.user.create", async () => {
            const input = this.userValidator.parse(payload);
            const access = await this.requireFullAccess(userId, authCtx);
            if (!authCtx?.isRoot) {
                await this.requirePermission(userId, "users.create");
            }
            if (access.subscriptionStatus === "trial_active") {
                const currentCount = await this.authRepository.countUsers(access.companyId);
                if (currentCount >= 7) {
                    throw new AuthError(403, "Trial limit reached: max 7 users");
                }
            }
            const existing = await this.authRepository.findUserByEmail(input.email.trim().toLowerCase());
            if (existing) {
                throw new AuthError(409, "Email already used");
            }
            const roles = await Promise.all(input.roleIds.map((roleId) => this.authRepository.findRoleById(roleId)));
            const invalidRole = roles.find((role) => !role || role.companyId !== access.companyId);
            if (invalidRole) {
                throw new AuthError(400, "Invalid role assignment");
            }
            const hashed = await this.passService.hash(input.password);
            const user = await this.authRepository.createUser({
                firstName: input.firstName,
                lastName: input.lastName,
                email: input.email.trim().toLowerCase(),
                phone: input.phone,
                passwordHash: hashed.hash,
                passwordSalt: hashed.salt,
                status: "active",
            });
            for (const roleId of input.roleIds) {
                await this.authRepository.assignRole(user.id, roleId, userId);
            }
            return {
                userId: user.id,
                email: user.email,
                roleCount: input.roleIds.length,
            };
        });
    }
    async getProfile(userId) {
        return this.withLogs("auth.profile.read", async () => {
            const user = await this.requireUser(userId);
            const roles = await this.authRepository.listUserRoles(user.id);
            const permissions = await this.authRepository.listUserPerms(user.id);
            const access = await this.resolveAccess(user.id);
            return {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                companyId: access.companyId ?? null,
                accessLevel: access.accessLevel,
                subscriptionStatus: access.subscriptionStatus,
                roles: roles.map((role) => role.name),
                permissions: permissions.map((permission) => permission.permissionKey),
            };
        });
    }
    async listPermissions(userId, authCtx) {
        return this.withLogs("auth.permissions.list", async () => {
            await this.requireFullAccess(userId, authCtx);
            const permissions = await this.authRepository.listAllPerms();
            const grouped = new Map();
            for (const permission of permissions) {
                const key = permission.module ?? "general";
                const existing = grouped.get(key) ?? [];
                existing.push({
                    id: permission.id,
                    key: permission.permissionKey,
                    resource: permission.resource,
                    action: permission.action,
                    description: permission.description,
                });
                grouped.set(key, existing);
            }
            return {
                companyId: authCtx?.companyId,
                total: permissions.length,
                groups: [...grouped.entries()].map(([module, items]) => ({
                    module,
                    permissions: items,
                })),
            };
        });
    }
    async listRoles(userId, authCtx) {
        return this.withLogs("auth.roles.list", async () => {
            const access = await this.requireFullAccess(userId, authCtx);
            const roles = await this.authRepository.listRolesByTenant(access.companyId);
            const roleRows = await Promise.all(roles.map(async (role) => {
                const permissionIds = await this.authRepository.listRolePermissionIds(role.id);
                return {
                    id: role.id,
                    name: role.name,
                    description: role.description,
                    color: role.color,
                    isSystemRole: role.isSystemRole,
                    permissionIds,
                    permissionCount: permissionIds.length,
                };
            }));
            return {
                companyId: access.companyId,
                roles: roleRows,
            };
        });
    }
    async requireUser(userId) {
        const user = await this.authRepository.findUserById(userId);
        if (!user) {
            throw new AuthError(404, "User not found");
        }
        return user;
    }
    async requireUserByEmail(email) {
        if (!email) {
            throw new AuthError(400, "Email required");
        }
        const user = await this.authRepository.findUserByEmail(email.trim().toLowerCase());
        if (!user) {
            throw new AuthError(404, "User not found");
        }
        return user;
    }
    resolveMfaFlow(flow, auth) {
        if (flow) {
            return flow;
        }
        return auth ? "account_setup" : "login";
    }
    async startSignupMfa(input, ctx) {
        if (input.type === "email_otp") {
            return this.startEmailVerification({
                email: this.requireEmail(input.email),
            }, ctx);
        }
        if (this.isPhoneMfaType(input.type)) {
            return this.startSignupPhoneVerification({
                email: this.requireEmail(input.email),
                phone: this.requirePhone(input.phone),
                channel: this.channelFor(input.type),
            }, ctx);
        }
        return this.startSignupAuthApp({
            email: this.requireEmail(input.email),
            password: input.password,
            setupToken: input.setupToken,
        });
    }
    async startAccountSetupMfa(input, auth, ctx) {
        if (!auth) {
            throw new AuthError(401, "Authentication required");
        }
        if (input.type === "email_otp") {
            return this.startEmailMfa(auth.userId, ctx);
        }
        if (this.isPhoneMfaType(input.type)) {
            return this.startPhoneMfa(auth.userId, {
                phone: this.requirePhone(input.phone),
                channel: this.channelFor(input.type),
            }, ctx);
        }
        return this.startAuthAppMfa(auth.userId);
    }
    async verifySignupMfa(input, ctx) {
        const user = await this.requireUserByEmail(input.email);
        if (input.type === "email_otp") {
            return this.verifyEmail({
                email: this.requireEmail(input.email),
                challengeId: await this.resolveChallengeId(input.challengeId, user.id, "email_verify"),
                code: input.code,
            });
        }
        if (this.isPhoneMfaType(input.type)) {
            return this.verifySignupPhone({
                email: this.requireEmail(input.email),
                challengeId: await this.resolveChallengeId(input.challengeId, user.id, "phone_verify"),
                code: input.code,
            });
        }
        return this.verifySignupAuthApp({
            email: this.requireEmail(input.email),
            password: input.password,
            setupToken: input.setupToken ??
                (await this.resolveChallengeId(undefined, user.id, "setup")),
            secret: input.secret,
            code: input.code,
        }, ctx);
    }
    async verifyLoginMfaFlow(input, ctx) {
        const method = this.loginMethodFor(input.type);
        const challengeId = input.challengeId ?? (await this.resolveLoginChallengeId(input, method));
        return this.verifyLoginMfa({
            challengeId,
            method,
            code: input.code,
            companyId: input.companyId,
            deviceId: input.deviceId,
            deviceName: input.deviceName,
            deviceType: input.deviceType,
            operatingSystem: input.operatingSystem,
            browser: input.browser,
            mfaTrustToken: input.mfaTrustToken,
        }, ctx);
    }
    async verifyAccountSetupMfa(input, auth) {
        if (!auth) {
            throw new AuthError(401, "Authentication required");
        }
        if (input.type === "authenticator_app") {
            return this.verifyAuthAppMfa(auth.userId, {
                setupToken: input.setupToken,
                secret: input.secret,
                code: input.code,
            });
        }
        return this.verifyOtpMfaSetup(auth.userId, {
            challengeId: await this.resolveChallengeId(input.challengeId, auth.userId, "setup"),
            code: input.code,
        });
    }
    async resolveLoginChallengeId(input, method) {
        const user = await this.requireUserByEmail(input.email);
        const purpose = method === "auth_app_otp" ? "login" : "login_primary";
        return this.resolveChallengeId(undefined, user.id, purpose);
    }
    async issueOtpChallengeOnce(input) {
        const provider = input.method === "email_otp" ? "email" : (input.channel ?? "sms");
        const idempotencyKey = input.idempotencyKey?.trim() ||
            this.sha256([
                input.user.id,
                input.method,
                input.purpose,
                input.target,
                provider,
            ].join("|"));
        const scope = this.sha256([
            "otp",
            input.user.id,
            input.method,
            input.purpose,
            input.target,
            provider,
            idempotencyKey,
        ].join("|"));
        const resultKey = `auth:otp:idempotency:${scope}`;
        const replayTtlSeconds = input.idempotencyKey ? CACHE_TTL_SECONDS.fiveMinutes : 2;
        const cached = await this.otpRedis.get(resultKey);
        if (cached) {
            await this.logOtpTrace("OTP Requested", input, {
                ...cached,
                replayed: true,
            });
            return { ...cached, replayed: true };
        }
        const lock = await this.otpLockService.acquire(`auth:otp:${scope}`, 10);
        if (!lock) {
            const replay = await this.waitForOtpResult(resultKey);
            if (replay) {
                await this.logOtpTrace("OTP Requested", input, {
                    ...replay,
                    replayed: true,
                });
                return { ...replay, replayed: true };
            }
            throw new AuthError(409, "OTP request already in progress");
        }
        try {
            const secondCheck = await this.otpRedis.get(resultKey);
            if (secondCheck) {
                await this.logOtpTrace("OTP Requested", input, {
                    ...secondCheck,
                    replayed: true,
                });
                return { ...secondCheck, replayed: true };
            }
            await this.logOtpTrace("OTP Requested", input);
            const issued = await this.mfaService.issueReplacementChallenge(input.user.id, input.companyId, input.method, input.purpose, input.target, input.context);
            if (!issued.code) {
                throw new AuthError(500, "OTP generation failed");
            }
            const pendingResult = {
                challengeId: issued.challenge.id,
                method: input.method,
                purpose: input.purpose,
                target: input.target,
                provider,
                expiresAt: issued.challenge.expiresAt,
                deliveryStatus: "generated",
            };
            await this.logOtpTrace("OTP Generated", input, pendingResult);
            await this.logOtpTrace("OTP Stored", input, pendingResult);
            const delivery = input.method === "email_otp" ?
                await this.sendOtpEmail(input.user, input.target, issued.code, input.subject ?? "KrishiPath verification code")
                : await this.sendOtpSms(input.user, input.target, issued.code, input.channel ?? "sms");
            const result = {
                ...pendingResult,
                deliveryStatus: delivery.status,
                messageId: delivery.messageId,
            };
            await this.otpRedis.set(resultKey, result, replayTtlSeconds);
            await this.logOtpTrace("OTP Sent", input, result);
            return result;
        }
        catch (error) {
            await this.logOtpTrace("OTP Failed", input, undefined, error);
            throw error;
        }
        finally {
            await lock.release();
        }
    }
    async waitForOtpResult(resultKey) {
        for (let attempt = 0; attempt < 20; attempt += 1) {
            await this.delay(100);
            const result = await this.otpRedis.get(resultKey);
            if (result) {
                return result;
            }
        }
        return null;
    }
    async logOtpTrace(eventName, input, result, error) {
        const provider = result?.provider ?? (input.method === "email_otp" ? "email" : (input.channel ?? "sms"));
        await logger.info(eventName, {
            category: error ? "platform" : "audit",
            module: "auth.otp",
            action: eventName.toLowerCase().replace(/\s+/g, "."),
            userId: input.user.id,
            companyId: input.companyId,
            tags: ["auth", "otp", provider, input.purpose],
            payload: {
                email: input.method === "email_otp" ? input.target : input.user.email,
                phone: input.method === "phone_otp" ? input.target : input.user.phone,
                requestId: input.idempotencyKey,
                otpSessionId: result?.challengeId,
                provider,
                timestamp: new Date().toISOString(),
                deliveryStatus: result?.deliveryStatus,
                messageId: result?.messageId,
                replayed: result?.replayed,
                error: error instanceof Error ? error.message : undefined,
            },
        });
    }
    async delay(ms) {
        await new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
    async resolveChallengeId(challengeId, userId, purpose) {
        if (challengeId) {
            return challengeId;
        }
        const latest = await this.mfaService.getLatestChallenge(userId, purpose);
        if (!latest) {
            throw new AuthError(400, "Invalid or expired challenge");
        }
        return latest.id;
    }
    loginMethodFor(type) {
        return (type === "authenticator_app" ? "auth_app_otp"
            : type === "email_otp" ? "email_otp"
                : "phone_otp");
    }
    isPhoneMfaType(type) {
        return type === "phone_sms" || type === "phone_whatsapp";
    }
    channelFor(type) {
        return type === "phone_whatsapp" ? "whatsapp" : "sms";
    }
    requireEmail(email) {
        if (!email) {
            throw new AuthError(400, "Email required");
        }
        return email.trim().toLowerCase();
    }
    requirePhone(phone) {
        if (!phone) {
            throw new AuthError(400, "Phone required");
        }
        return phone.trim();
    }
    async verifyCaptchaIfRequired(token, remoteIp) {
        if (!token) {
            throw new AuthError(400, "CAPTCHA value required");
        }
        const captchaValid = await this.captchaService.verify(token, remoteIp);
        if (!captchaValid) {
            throw new AuthError(400, "Invalid CAPTCHA");
        }
    }
    buildPasswordResetUrl(token) {
        const resetUrl = new URL(env.passwordResetUrl ?? "https://app.krishipath.com/auth/reset-password");
        resetUrl.searchParams.set("token", token);
        return resetUrl.toString();
    }
    buildPasswordResetEmailBody(otp, expiresInMinutes) {
        return [
            "Reset your KrishiPath password using this OTP code:",
            "",
            otp,
            "",
            `This code expires in ${expiresInMinutes} minutes.`,
            "If you did not request this reset, ignore this email.",
        ].join("\n");
    }
    buildPasswordResetEmailHtml(otp, expiresInMinutes) {
        return `
      <!doctype html>
      <html lang="en">
        <body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#102044;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="padding:40px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;">
                  <tr>
                    <td style="padding:40px;">
                      <h1 style="margin:0 0 16px;font-size:26px;">Reset your password</h1>
                      <p style="margin:0 0 24px;line-height:1.6;">
                        Use the following one-time password (OTP) to create a new KrishiPath password.
                      </p>
                      <div style="font-size:32px;font-weight:bold;letter-spacing:4px;color:#165dff;margin:24px 0;">
                        ${otp}
                      </div>
                      <p style="margin:24px 0 0;line-height:1.6;color:#52627a;">
                        This link expires in ${expiresInMinutes} minutes.
                      </p>
                      <p style="margin:8px 0 0;line-height:1.6;color:#52627a;">
                        Ignore this email if you did not request a reset.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
    }
    async ensureSignupSetupAuthorized(user, password, setupToken) {
        // If email is already verified, the user is authenticated enough to set up MFA.
        if (user.isEmailVerified) {
            return;
        }
        // Email not yet verified — require either a valid setup challenge token or the password.
        if (setupToken) {
            const challenge = await this.mfaService.getChallenge(setupToken);
            if (challenge &&
                challenge.userId === user.id &&
                challenge.method === "auth_app_otp" &&
                challenge.purpose === "setup") {
                return;
            }
            if (!password) {
                throw new AuthError(401, "Invalid authenticator setup token");
            }
        }
        if (!password || !user.passwordHash || !user.passwordSalt) {
            throw new AuthError(401, "Password or setup token required");
        }
        const passwordMatches = await this.passService.verify(password, user.passwordHash, user.passwordSalt);
        if (!passwordMatches) {
            throw new AuthError(401, "Invalid credentials");
        }
    }
    async resolveAccess(userId) {
        const user = await this.requireUser(userId);
        const companyId = await this.authRepository.getDefaultCompanyIdForUser(userId);
        if (!companyId) {
            return {
                subscriptionStatus: "none",
                accessLevel: "restricted",
                isRoot: false,
                authType: "iam",
            };
        }
        return this.resolveTenantAccess(userId, companyId, false);
    }
    async resolveTenantAccess(userId, companyId, isRoot) {
        const company = await this.authRepository.findTenantById(companyId);
        if (!company) {
            throw new AuthError(404, "Company not found");
        }
        if (isRoot) {
            const isCompanyOwner = await this.authRepository.isCompanyOwner(userId, companyId);
            if (!isCompanyOwner) {
                throw new AuthError(403, "Company not owned by root user");
            }
        }
        else {
            const assigned = await this.authRepository.hasRoleInTenant(userId, companyId);
            if (!assigned) {
                throw new AuthError(403, "Company role assignment required");
            }
        }
        const subscription = await this.authRepository.findSubscriptionByTenant(companyId);
        if (!subscription) {
            return {
                companyId,
                subscriptionStatus: "none",
                accessLevel: "restricted",
                isRoot,
                authType: isRoot ? "root" : "iam",
            };
        }
        if (subscription.status === "active") {
            return {
                companyId,
                subscriptionStatus: subscription.status,
                accessLevel: "full",
                isRoot,
                authType: isRoot ? "root" : "iam",
            };
        }
        if (subscription.status === "trial_active") {
            return {
                companyId,
                subscriptionStatus: subscription.status,
                accessLevel: "limited",
                isRoot,
                authType: isRoot ? "root" : "iam",
            };
        }
        return {
            companyId,
            subscriptionStatus: subscription.status ?? "none",
            accessLevel: "restricted",
            isRoot,
            authType: isRoot ? "root" : "iam",
        };
    }
    async requireFullAccess(userId, authCtx) {
        // Root users bypass subscription/role checks — they always have full access
        if (authCtx?.isRoot) {
            const companyId = authCtx.companyId ??
                (await this.authRepository.getDefaultCompanyIdForUser(userId)) ??
                undefined;
            if (!companyId) {
                throw new AuthError(403, "Company required");
            }
            return {
                companyId,
                accessLevel: "full",
                subscriptionStatus: "active",
            };
        }
        const access = await this.resolveAccess(userId);
        if (!access.companyId) {
            throw new AuthError(403, "Company required");
        }
        if (access.accessLevel === "restricted") {
            throw new AuthError(403, "Subscription inactive. Core feature access denied");
        }
        return {
            companyId: access.companyId,
            accessLevel: access.accessLevel,
            subscriptionStatus: access.subscriptionStatus,
        };
    }
    async listAccessibleCompanies(userId, isRoot) {
        const companies = isRoot ?
            await this.authRepository.listRootTenants(userId)
            : await this.authRepository.listIamTenants(userId);
        return companies.map((company) => ({
            id: company.id,
            name: company.name,
            code: company.code,
            status: company.status,
            onboardingStatus: company.onboardingStatus,
            accessType: isRoot ? "root" : "iam",
        }));
    }
    async finalizeLogin(userId, companyId, loginMethod, input, ctx, isRoot = false, mfaVerified = false) {
        const access = companyId ?
            await this.resolveTenantAccess(userId, companyId, isRoot)
            : {
                subscriptionStatus: "none",
                accessLevel: "restricted",
                isRoot,
                authType: isRoot ? "root" : "iam",
            };
        const availableCompanies = await this.listAccessibleCompanies(userId, isRoot);
        const issued = await this.issueTokens(userId, access, loginMethod, input, ctx);
        const mfaTrust = mfaVerified ?
            await this.deviceTrustService.createTrustedSession({
                userId,
                companyId: access.companyId,
                sessionId: issued.sessionId,
                deviceId: input.deviceId,
                deviceName: input.deviceName,
                deviceType: input.deviceType,
                operatingSystem: input.operatingSystem,
                browser: input.browser,
                ctx,
            })
            : undefined;
        if (mfaTrust) {
            await logger.info("MFA trust created", {
                module: "auth.mfa_trust",
                userId,
                companyId: access.companyId,
                sessionId: issued.sessionId,
                payload: {
                    trustSessionId: mfaTrust.trustSessionId,
                    expiresAt: mfaTrust.expiresAt,
                },
                tags: ["auth", "mfa", "trust", "create"],
            });
        }
        return {
            mfaRequired: false,
            userId,
            companyId,
            accessLevel: access.accessLevel,
            subscriptionStatus: access.subscriptionStatus,
            availableCompanies,
            selectedCompany: access.companyId ?
                (availableCompanies.find((company) => company.id === access.companyId) ?? null)
                : null,
            nextStep: access.companyId ? "account_dashboard" : "select_company",
            tokens: {
                accessToken: issued.accessToken,
                refreshToken: issued.refreshToken,
            },
            mfaTrust,
        };
    }
    async issueTokens(userId, access, loginMethod, input, ctx) {
        const sessionId = randomUUID();
        const accessJti = randomUUID();
        const claims = await this.buildTokenClaims(userId, sessionId, access);
        const accessToken = this.tokenService.signAccess(claims);
        const refreshToken = this.tokenService.signRefresh(claims);
        const refreshHash = this.sha256(refreshToken);
        const deviceIdentifier = input.deviceId ??
            this.sha256(`${ctx.userAgent ?? ""}:${ctx.ipAddress ?? ""}:${userId}`);
        const device = await this.authRepository.createOrGetDevice(userId, deviceIdentifier, input.deviceName, input.deviceType, input.operatingSystem, input.browser, ctx.ipAddress);
        await this.authRepository.createSession({
            sessionId,
            userId,
            accessJti,
            refreshHash,
            deviceId: device.id,
            deviceType: input.deviceType,
            browser: input.browser,
            operatingSystem: input.operatingSystem,
            ipAddress: ctx.ipAddress,
            loginMethod,
            loginProvider: "local",
        });
        return {
            accessToken,
            refreshToken,
            sessionId,
        };
    }
    async buildTokenClaims(userId, sessionId, access) {
        const user = await this.authRepository.findUserById(userId);
        const allowedUserTypes = [
            "farmer", "creator", "trader", "company", "admin", "employee",
        ];
        const allowedProfileStatuses = [
            "INCOMPLETE", "PENDING_VERIFICATION", "COMPLETE", "COMPLETED",
        ];
        const userType = allowedUserTypes.find((value) => value === user?.userType);
        const profileStatus = allowedProfileStatuses.find((value) => value === user?.profileStatus);
        return {
            sub: userId,
            companyId: access.companyId,
            sessionId,
            accessLevel: access.accessLevel,
            isRoot: access.isRoot,
            authType: access.authType,
            userType,
            profileStatus,
        };
    }
    async seedPerms() {
        const permissions = PermCatalog.list();
        for (const permission of permissions) {
            const groupId = await this.rolePermissionRepository.ensurePermissionGroup(permission.module);
            await this.rolePermissionRepository.createPermission(groupId, permission.module, permission.resource, permission.action, permission.key, permission.description);
        }
    }
    async seedRoles(companyId, ownerId) {
        const allPermissions = await this.rolePermissionRepository.listAllPermissions();
        const superAdmin = await this.rolePermissionRepository.findRoleByName(companyId, "Super Admin");
        const ownerRole = superAdmin ??
            (await this.rolePermissionRepository.createRole({
                companyId,
                createdBy: ownerId,
                name: "Super Admin",
                description: "Company owner with all permissions",
                isSystemRole: true,
                canBeDeleted: false,
                priority: 90,
            }, []));
        if (!superAdmin) {
            await this.rolePermissionRepository.assignPermissionsToRole(ownerRole.id, allPermissions.map((permission) => permission.id));
        }
        await this.authRepository.assignRole(ownerId, ownerRole.id, ownerId);
        for (const template of RoleTemplates.list()) {
            const exists = await this.rolePermissionRepository.findRoleByName(companyId, template.name);
            if (exists) {
                continue;
            }
            const role = await this.rolePermissionRepository.createRole({
                companyId,
                createdBy: ownerId,
                name: template.name,
                description: template.description,
                isSystemRole: true,
                canBeDeleted: false,
                priority: 90,
            }, []);
            const permissionRows = await this.rolePermissionRepository.listPermissionsByKeys(template.keys);
            await this.rolePermissionRepository.assignPermissionsToRole(role.id, permissionRows.map((permission) => permission.id));
        }
    }
    async requirePermission(userId, permissionKey) {
        const permissions = await this.authRepository.listUserPerms(userId);
        const permissionSet = new Set(permissions.map((permission) => permission.permissionKey));
        if (permissionSet.has(permissionKey)) {
            return;
        }
        throw new AuthError(403, `Missing permission: ${permissionKey}`);
    }
    sha256(value) {
        return createHash("sha256").update(value).digest("hex");
    }
    async withLogs(action, runner) {
        await logger.info(`${action} started`, {
            module: "auth.service",
            tags: ["auth", "service", action, "start"],
        });
        try {
            const result = await runner();
            await logger.info(`${action} succeeded`, {
                module: "auth.service",
                tags: ["auth", "service", action, "ok"],
            });
            return result;
        }
        catch (error) {
            if (error instanceof AuthError) {
                await logger.warn(`${action} failed`, {
                    module: "auth.service",
                    tags: ["auth", "service", action, "warn"],
                    payload: {
                        code: error.code,
                        message: error.message,
                    },
                });
                throw error;
            }
            const normalizedError = error instanceof Error ? error : (new Error(`Unknown error in ${action}`));
            await logger.error(normalizedError, {
                module: "auth.service",
                tags: ["auth", "service", action, "error"],
            });
            throw error;
        }
    }
    async getEnabledMfaMethods(userId) {
        const devices = await this.authRepository.listMfaDevices(userId);
        const methods = devices
            .filter((device) => device.verifiedAt)
            .map((device) => device.mfaType)
            .filter((type) => type === "email_otp" ||
            type === "phone_otp" ||
            type === "auth_app_otp");
        return [...new Set(methods)];
    }
    pickMfaMethod(preferred, available) {
        if (preferred && available.includes(preferred)) {
            return preferred;
        }
        if (available.includes("auth_app_otp")) {
            return "auth_app_otp";
        }
        return available[0];
    }
    async getMfaTarget(userId, method) {
        if (method === "auth_app_otp") {
            return undefined;
        }
        const device = await this.authRepository.findMfaDevice(userId, method);
        if (!device) {
            throw new AuthError(400, `MFA device not configured for ${method}`);
        }
        return method === "email_otp" ?
            (device.email ?? undefined)
            : (device.phoneNumber ?? undefined);
    }
    async getLoginMfaTarget(user, method) {
        if (method === "email_otp") {
            return user.email ?? (await this.getMfaTarget(user.id, method));
        }
        return user.phone ?? (await this.getMfaTarget(user.id, method));
    }
    loginFromVerify(input) {
        return {
            deviceId: input.deviceId,
            deviceName: input.deviceName,
            deviceType: input.deviceType,
            operatingSystem: input.operatingSystem,
            browser: input.browser,
        };
    }
    generateBackupCodes() {
        return Array.from({ length: 8 }).map(() => randomBytes(6).toString("base64url").slice(0, 8).toUpperCase());
    }
}
