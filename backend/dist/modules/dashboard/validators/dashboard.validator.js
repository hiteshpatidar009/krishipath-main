import { z } from "zod";
export const DashboardQueryValidator = z.object({
    warehouseId: z.string().uuid().optional(),
});
