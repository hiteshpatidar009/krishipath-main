import { z } from "zod";

export class UserValidator {
  public static invite = z.object({
    email: z.string().email(),
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(1).max(50),
    roleId: z.string().uuid(),
    warehouseAccess: z.object({
      all: z.boolean(),
      warehouseIds: z.array(z.string().uuid()).optional(),
    }),
    message: z.string().max(250).optional(),
  });

  public static acceptInvitation = z.object({
    token: z.string().min(1),
    password: z.string().min(8).optional(),
  });

  public static update = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    displayName: z.string().optional(),
    phone: z.string().optional(),
    avatarUrl: z.string().url().optional(),
  });

  public static preferences = z.object({
    timezone: z.string().optional(),
    languageCode: z.string().optional(),
    dateFormat: z.string().optional(),
    timeFormat: z.string().optional(),
    notificationPreferences: z.unknown().optional(),
    themePreference: z.string().optional(),
  });

  public static assignRoles = z.object({
    roleIds: z.array(z.string().uuid()).min(1),
  });

  public static warehouseAccess = z.object({
    all: z.boolean(),
    warehouseIds: z.array(z.string().uuid()).optional(),
  });

  public static bulkAction = z.object({
    ids: z.array(z.string().uuid()).min(1),
    action: z.enum(["activate", "deactivate", "lock", "unlock", "delete", "assign-roles"]),
    roleIds: z.array(z.string().uuid()).optional(),
  });

  public static query = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    search: z.string().optional(),
    role: z.string().optional(),
    warehouse: z.string().optional(),
    organization: z.string().optional(),
    location: z.string().optional(),
    userGroup: z.string().optional(),
    status: z.string().optional(),
    joinDateStart: z.string().optional(),
    joinDateEnd: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  });
}
