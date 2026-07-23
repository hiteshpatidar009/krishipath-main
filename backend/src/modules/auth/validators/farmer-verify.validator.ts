import { z } from "zod";

export class FarmerVerifyValidator {
  private readonly schema = z.object({
    phone: z.string().min(10),
    code: z.string().min(4),
    challengeId: z.string(),
    companyId: z.string().optional(),
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
    deviceType: z.string().optional(),
    operatingSystem: z.string().optional(),
    browser: z.string().optional(),
    mfaTrustToken: z.string().optional(),
  });

  public parse(data: unknown) {
    return this.schema.parse(data);
  }
}
