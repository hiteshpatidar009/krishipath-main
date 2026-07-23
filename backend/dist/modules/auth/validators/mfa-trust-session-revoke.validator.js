import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class MfaTrustSessionRevokeValidator extends BaseValidator {
    static schema = z.object({
        trustSessionId: z.string().uuid(),
    });
    validate(input) {
        MfaTrustSessionRevokeValidator.schema.parse(input);
    }
    parse(input) {
        return MfaTrustSessionRevokeValidator.schema.parse(input);
    }
}
