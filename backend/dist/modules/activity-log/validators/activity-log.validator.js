import { z } from "zod";
import { ActivityLogDto } from "../dto/activity-log.dto";
export class ActivityLogValidator {
    schema = z.object({
        companyId: z.string().uuid().optional(),
        userId: z.string().uuid().optional(),
        activityType: z.string().min(2).max(100),
        description: z.string().min(2).max(1000),
        metadata: z.unknown().optional(),
        ipAddress: z.string().max(100).optional(),
        userAgent: z.string().max(1000).optional(),
        requestId: z.string().max(128).optional(),
    });
    parse(input) {
        return new ActivityLogDto(this.schema.parse(input));
    }
}
