import { z } from "zod";
export class ApiKeyValidator {
    static create = z.object({
        keyName: z.string().min(2),
        scopes: z.array(z.string().min(2)).min(1),
        expiresAt: z.string().datetime().optional(),
    });
}
