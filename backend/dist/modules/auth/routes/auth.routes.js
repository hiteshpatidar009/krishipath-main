import { Router } from "express";
import { IdempotencyMiddleware } from "../../../shared/security";
import { AuthMiddleware } from "../middlewares/auth.middleware";
export class AuthRoutes {
    authController;
    router;
    constructor(authController) {
        this.authController = authController;
        this.router = Router();
        this.register();
    }
    getRouter() {
        return this.router;
    }
    register() {
        this.router.get("/status", this.authController.getStatus);
        this.router.get("/captcha/start", this.authController.startCaptcha);
        this.router.post("/signup", IdempotencyMiddleware.optionalForMutations(), this.authController.signUp);
        this.router.post("/login", IdempotencyMiddleware.optionalForMutations(), this.authController.login);
        this.router.post("/farmer/login", IdempotencyMiddleware.optionalForMutations(), this.authController.farmerLogin);
        this.router.post("/farmer/verify-otp", IdempotencyMiddleware.optionalForMutations(), this.authController.verifyFarmerLogin);
        this.router.post("/mfa/start", AuthMiddleware.attachOptional, IdempotencyMiddleware.optionalForMutations(), this.authController.startMfa);
        this.router.post("/mfa/verify", AuthMiddleware.attachOptional, IdempotencyMiddleware.optionalForMutations(), this.authController.verifyMfa);
        this.router.post("/refresh", IdempotencyMiddleware.optionalForMutations(), this.authController.refresh);
        this.router.post("/switch-company", IdempotencyMiddleware.optionalForMutations(), this.authController.switchCompany);
        this.router.post("/password/forgot", IdempotencyMiddleware.optionalForMutations(), this.authController.startPasswordReset);
        this.router.post("/password/reset", IdempotencyMiddleware.optionalForMutations(), this.authController.confirmPasswordReset);
        this.router.post("/password-reset/request", IdempotencyMiddleware.optionalForMutations(), this.authController.requestPasswordReset);
        this.router.post("/password-reset/validate", this.authController.validatePasswordResetToken);
        this.router.post("/password-reset/complete", IdempotencyMiddleware.optionalForMutations(), this.authController.completePasswordReset);
        this.router.post("/plan", AuthMiddleware.ensureAuthenticated, IdempotencyMiddleware.requireForMutations(), this.authController.selectPlan);
        this.router.post("/subscription/activate", AuthMiddleware.ensureAuthenticated, IdempotencyMiddleware.requireForMutations(), this.authController.activateSubscription);
        this.router.get("/mfa/methods", AuthMiddleware.ensureAuthenticated, this.authController.listMfaMethods);
        this.router.get("/sessions", AuthMiddleware.ensureAuthenticated, this.authController.listSessions);
        this.router.get("/mfa/trust-sessions", AuthMiddleware.ensureAuthenticated, this.authController.listMfaTrustSessions);
        this.router.delete("/mfa/trust-sessions", AuthMiddleware.ensureAuthenticated, IdempotencyMiddleware.requireForMutations(), this.authController.revokeMfaTrustSession);
        this.router.delete("/mfa/trust-sessions/all", AuthMiddleware.ensureAuthenticated, IdempotencyMiddleware.requireForMutations(), this.authController.revokeAllMfaTrustSessions);
        this.router.delete("/sessions", AuthMiddleware.ensureAuthenticated, IdempotencyMiddleware.requireForMutations(), this.authController.revokeSession);
        this.router.post("/sessions/revoke-others", AuthMiddleware.ensureAuthenticated, IdempotencyMiddleware.requireForMutations(), this.authController.revokeOtherSessions);
        this.router.post("/roles", AuthMiddleware.ensureAuthenticated, AuthMiddleware.ensureFullAccess, IdempotencyMiddleware.requireForMutations(), this.authController.createRole);
        this.router.get("/roles", AuthMiddleware.ensureAuthenticated, AuthMiddleware.ensureFullAccess, this.authController.listRoles);
        this.router.get("/permissions", AuthMiddleware.ensureAuthenticated, AuthMiddleware.ensureFullAccess, this.authController.listPermissions);
        this.router.post("/users", AuthMiddleware.ensureAuthenticated, AuthMiddleware.ensureFullAccess, IdempotencyMiddleware.requireForMutations(), this.authController.createUser);
        this.router.get("/me", AuthMiddleware.ensureAuthenticated, this.authController.getProfile);
    }
}
