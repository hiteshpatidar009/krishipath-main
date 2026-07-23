import { z } from "zod";

import { BaseValidator } from "../../../core/base/base.validator";
import { PlanDto } from "../dto/plan.dto";

export class PlanValidator extends BaseValidator<unknown> {
  private static readonly schema = z.object({
    planCode: z.string().trim().min(2),
    billingCycle: z.enum(["monthly", "annual", "trial"]),
  });

  public validate(input: unknown): void {
    PlanValidator.schema.parse(input);
  }

  public parse(input: unknown): PlanDto {
    return PlanValidator.schema.parse(input);
  }
}
