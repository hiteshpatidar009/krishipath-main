import { RolePermissionRepository } from "../role-permission/repositories/role-permission.repository";
import { AuthController } from "./controllers/auth.controller";
import { AuthRepository } from "./repositories/auth.repository";
import { AuthRoutes } from "./routes/auth.routes";
import { AuthService } from "./services/auth.service";
import { PassService } from "./services/pass.service";
import { TokenService } from "./services/token.service";
export class AuthModule {
    authRepository;
    rolePermissionRepository;
    passService;
    tokenService;
    authService;
    authController;
    authRoutes;
    constructor() {
        this.authRepository = new AuthRepository();
        this.rolePermissionRepository = new RolePermissionRepository();
        this.passService = new PassService();
        this.tokenService = new TokenService();
        this.authService = new AuthService(this.authRepository, this.rolePermissionRepository, this.passService, this.tokenService);
        this.authController = new AuthController(this.authService);
        this.authRoutes = new AuthRoutes(this.authController);
    }
    getRouter() {
        return this.authRoutes.getRouter();
    }
}
