import { z } from "zod";
import { BaseValidator } from "../../../core/base/base.validator";
export class PlanValidator extends BaseValidator {
    static schema = z.object({
        planCode: z.string().trim().min(2),
        billingCycle: z.enum(["monthly", "annual", "trial"]),
    });
    validate(input) {
        PlanValidator.schema.parse(input);
    }
    parse(input) {
        return PlanValidator.schema.parse(input);
    }
}
