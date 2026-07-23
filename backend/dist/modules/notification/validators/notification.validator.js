import { z } from "zod";
import { NotificationDto } from "../dto/notification.dto";
export class NotificationValidator {
    schema = z.object({
        companyId: z.string().uuid(),
        userId: z.string().uuid().optional(),
        channel: z.enum(["email", "sms", "push", "in_app"]),
        templateKey: z.string().min(2).max(120).optional(),
        recipient: z.string().min(1).max(255),
        subject: z.string().min(1).max(255).optional(),
        body: z.string().min(1).max(4000),
        dedupKey: z.string().min(8).max(255).optional(),
    }).refine((value) => value.channel !== "email" || Boolean(value.subject), {
        message: "subject is required for email notifications",
    });
    parse(input) {
        return new NotificationDto(this.schema.parse(input));
    }
}
