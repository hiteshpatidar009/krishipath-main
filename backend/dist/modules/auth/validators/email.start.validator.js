import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class EmailStartValidator extends BaseValidator {
    static schema = z.object({
        email: z.string().trim().email(),
    });
    validate(input) {
        EmailStartValidator.schema.parse(input);
    }
    parse(input) {
        return EmailStartValidator.schema.parse(input);
    }
}
