import { Db1Connection } from "../../../infrastructure/database/postgres/connections/db1.connection";
import { userProfilesTable } from "../../../infrastructure/database/postgres/schemas/db1/all.schema";
import { eq } from "drizzle-orm";
export class LanguageResolverMiddleware {
    languageService;
    constructor(languageService) {
        this.languageService = languageService;
    }
    /**
     * Middleware that resolves the request language and attaches it to req.lang.
     * Priority:
     *  1. User's stored preferred language (from userProfilesTable, read from JWT userId)
     *  2. Accept-Language header
     *  3. Platform default ('en')
     */
    use = async (req, _res, next) => {
        try {
            // 1. Try to get the user's stored preferred language from DB
            const userId = req.auth?.userId;
            if (userId) {
                try {
                    const db = Db1Connection.getInstance();
                    const [profile] = await db
                        .select({ preferredLanguage: userProfilesTable.preferredLanguage })
                        .from(userProfilesTable)
                        .where(eq(userProfilesTable.userId, userId))
                        .limit(1);
                    if (profile?.preferredLanguage) {
                        req.lang = profile.preferredLanguage;
                        return next();
                    }
                }
                catch {
                    // DB read failed — fall through to header
                }
            }
            // 2. Try Accept-Language header
            const acceptLanguage = req.headers["accept-language"];
            if (acceptLanguage) {
                // Parse "mr,hi;q=0.9,en;q=0.8" → take first token
                const primary = acceptLanguage.split(",")[0]?.split(";")[0]?.trim().slice(0, 5);
                if (primary) {
                    const resolved = await this.languageService.resolveLanguageCode(primary, undefined);
                    req.lang = resolved;
                    return next();
                }
            }
            // 3. Default
            req.lang = "en";
        }
        catch {
            // Never let language resolution crash a request
            req.lang = "en";
        }
        next();
    };
}
