import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class MfaTrustSessionRevokeAllValidator extends BaseValidator {
    static schema = z.object({
        userId: z.string().uuid().optional(),
    });
    validate(input) {
        MfaTrustSessionRevokeAllValidator.schema.parse(input);
    }
    parse(input) {
        return MfaTrustSessionRevokeAllValidator.schema.parse(input);
    }
}
