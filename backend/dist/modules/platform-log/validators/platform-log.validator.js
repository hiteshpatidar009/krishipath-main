import { z } from "zod";
export const platformLogCategorySchema = z.object({
    category: z.enum(["user_activity", "payment", "audit", "platform"]),
});
export const platformLogListSchema = z.object({
    companyId: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(500).default(100),
    offset: z.coerce.number().int().min(0).default(0),
});
