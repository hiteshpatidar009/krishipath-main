import jwt from "jsonwebtoken";
import { env } from "../../../infrastructure/config/env";
import { logger } from "../../../infrastructure/logger";
export class TokenService {
    signAccess(claims) {
        try {
            return jwt.sign(claims, env.jwtAccessSecretKey, {
                expiresIn: env.jwtAccessExpiryTime,
            });
        }
        catch (error) {
            const normalizedError = error instanceof Error ? error : new Error("JWT access sign failed");
            void logger.error(normalizedError, {
                module: "auth.token",
                userId: claims.sub,
                companyId: claims.companyId,
                tags: ["auth", "token", "access", "sign", "failed"],
            });
            throw error;
        }
    }
    signRefresh(claims) {
        try {
            return jwt.sign(claims, env.jwtRefreshSecretKey, {
                expiresIn: env.jwtRefreshExpiryTime,
            });
        }
        catch (error) {
            const normalizedError = error instanceof Error ? error : new Error("JWT refresh sign failed");
            void logger.error(normalizedError, {
                module: "auth.token",
                userId: claims.sub,
                companyId: claims.companyId,
                tags: ["auth", "token", "refresh", "sign", "failed"],
            });
            throw error;
        }
    }
    verifyAccess(token) {
        try {
            const payload = jwt.verify(token, env.jwtAccessSecretKey);
            return payload;
        }
        catch {
            void logger.warn("JWT access verify failed", {
                module: "auth.token",
                tags: ["auth", "token", "access", "verify", "failed"],
            });
            return null;
        }
    }
    verifyRefresh(token) {
        try {
            const payload = jwt.verify(token, env.jwtRefreshSecretKey);
            return payload;
        }
        catch {
            void logger.warn("JWT refresh verify failed", {
                module: "auth.token",
                tags: ["auth", "token", "refresh", "verify", "failed"],
            });
            return null;
        }
    }
}
