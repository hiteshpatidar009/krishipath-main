import { z } from "zod";
import { PushDto } from "../dto/push.dto";
export class PushValidator {
    schema = z.object({
        userId: z.string().uuid(),
        title: z.string().min(1).max(255),
        message: z.string().min(1).max(2000),
        companyId: z.string().uuid().optional(),
        data: z.unknown().optional(),
    });
    parse(input) {
        return new PushDto(this.schema.parse(input));
    }
}
