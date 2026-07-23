import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class SessionRevokeValidator extends BaseValidator {
    static schema = z.object({
        sessionId: z.string().uuid(),
        reason: z.string().trim().min(2).optional(),
    });
    validate(input) {
        SessionRevokeValidator.schema.parse(input);
    }
    parse(input) {
        return SessionRevokeValidator.schema.parse(input);
    }
}
