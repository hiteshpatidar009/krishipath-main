import { z } from "zod";
export class FarmerLoginValidator {
    schema = z.object({
        phone: z.string().min(10),
    });
    parse(data) {
        return this.schema.parse(data);
    }
}
