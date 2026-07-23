import { z } from "zod";
export class SetupWizardValidator {
    static progress = z.object({
        step: z.enum(["organization", "warehouse", "roles", "invitations"]),
    });
}
