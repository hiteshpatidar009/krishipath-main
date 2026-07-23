import { z } from "zod";

export class FarmerLoginValidator {
  private readonly schema = z.object({
    phone: z.string().min(10),
  });

  public parse(data: unknown) {
    return this.schema.parse(data);
  }
}
