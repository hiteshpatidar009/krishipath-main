import jwt from "jsonwebtoken";
import { env } from "../../../infrastructure/config/env";
export class SharedTokenService {
    signAccess(claims) {
        return jwt.sign(claims, env.jwtAccessSecretKey, {
            expiresIn: env.jwtAccessExpiryTime,
        });
    }
    verifyAccess(token) {
        try {
            return jwt.verify(token, env.jwtAccessSecretKey);
        }
        catch {
            return null;
        }
    }
}
