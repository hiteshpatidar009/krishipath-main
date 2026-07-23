import { randomUUID } from "crypto";
import { CoreEventBus, EventEnvelopeFactory } from "../../../core";
import { logger } from "../../../infrastructure/logger";
import { AppError } from "../../../shared/errors/app.error";
import { UserEvents } from "../events/user.events";
import { PassService } from "../../auth/services/pass.service";
import { AuditLoggingService } from "../../../shared/audit/audit-logging.service";
import { Db1Connection } from "../../../infrastructure/database";
import { and, eq, inArray, isNull, or, sql, desc } from "drizzle-orm";
import { userRolesTable, rolesTable, usersTable, sessionsTable, mfaDevicesTable, auditLogsTable, companiesTable } from "../../../infrastructure/database/postgres/schemas/db1";
import { EmailService } from "../../email/services/email.service";
import { EmailDto } from "../../email/dto/email.dto";
import { env } from "../../../infrastructure/config/env";
export class UserService {
    repo;
    passService = new PassService();
    emailService = new EmailService();
    constructor(repo) {
        this.repo = repo;
    }
    async invite(input) {
        const token = randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const invitation = await this.repo.createInvitation({
            companyId: input.companyId,
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            roleId: input.roleId,
            warehouseAccess: input.warehouseAccess,
            message: input.message,
            token,
            invitedBy: input.actorId,
            expiresAt,
        });
        // Check if user already exists in DB
        const existingUser = await this.repo.findUserByEmail(input.email);
        const link = `${env.frontendBaseUrl}/login?invitationToken=${token}`;
        const subject = existingUser
            ? "Invitation to join team on KrishiPath"
            : "Welcome to KrishiPath - Create your account";
        const body = existingUser
            ? `Hello,\n\nYou have been invited to join the organization on KrishiPath.\n\nPlease click the link below to log in and accept the invitation:\n${link}\n\nIf you did not expect this invitation, you can ignore this email.\n\nBest regards,\nThe KrishiPath Team`
            : `Hello,\n\nYou have been invited to join the organization on KrishiPath.\n\nPlease click the link below to create your account and accept the invitation:\n${link}\n\nIf you did not expect this invitation, you can ignore this email.\n\nBest regards,\nThe KrishiPath Team`;
        const htmlBody = existingUser
            ? `<p>Hello,</p><p>You have been invited to join the organization on <strong>KrishiPath</strong>.</p><p>Please click the button below to log in and accept the invitation:</p><p><a href="${link}" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-family: sans-serif; font-weight: bold;">Log In & Accept Invitation</a></p><p>Or copy and paste this link in your browser:</p><p>${link}</p><p>If you did not expect this invitation, you can ignore this email.</p><p>Best regards,<br>The KrishiPath Team</p>`
            : `<p>Hello,</p><p>You have been invited to join the organization on <strong>KrishiPath</strong>.</p><p>Please click the button below to create your account and accept the invitation:</p><p><a href="${link}" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-family: sans-serif; font-weight: bold;">Create Account</a></p><p>Or copy and paste this link in your browser:</p><p>${link}</p><p>If you did not expect this invitation, you can ignore this email.</p><p>Best regards,<br>The KrishiPath Team</p>`;
        try {
            await this.emailService.send(new EmailDto({
                to: input.email,
                subject,
                body,
                htmlBody,
                companyId: input.companyId,
                userId: input.actorId,
            }));
        }
        catch (err) {
            await logger.error(err instanceof Error ? err : new Error(String(err)), { message: "Failed to send invitation email" });
        }
        await this.event("user.invited", input.companyId, input.actorId, { email: input.email, token });
        await AuditLoggingService.record({
            companyId: input.companyId,
            userId: input.actorId,
            action: "user.invite",
            module: "user",
            entityType: "invitation",
            entityId: invitation.id,
            status: "success",
            afterState: invitation,
        });
        // await SubscriptionLimitService.checkUserLimit(input.companyId, input.actorId);
        return invitation;
    }
    async listInvitations(companyId) {
        return this.repo.getInvitations(companyId);
    }
    async resendInvitation(companyId, invitationId, actorId) {
        const invite = await this.repo.findInvitationById(companyId, invitationId);
        if (!invite)
            throw new AppError("Invitation not found", 404, "INVITATION_NOT_FOUND");
        if (invite.status !== "pending")
            throw new AppError("Only pending invitations can be resent", 400, "INVALID_INVITATION_STATUS");
        const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.repo.updateInvitation(invitationId, { expiresAt: newExpiresAt });
        const existingUser = await this.repo.findUserByEmail(invite.email);
        const link = `${env.frontendBaseUrl}/login?invitationToken=${invite.token}`;
        const subject = existingUser
            ? "Invitation to join team on KrishiPath (Resent)"
            : "Welcome to KrishiPath - Create your account (Resent)";
        const body = existingUser
            ? `Hello,\n\nYou have been invited to join the organization on KrishiPath.\n\nPlease click the link below to log in and accept the invitation:\n${link}\n\nIf you did not expect this invitation, you can ignore this email.\n\nBest regards,\nThe KrishiPath Team`
            : `Hello,\n\nYou have been invited to join the organization on KrishiPath.\n\nPlease click the link below to create your account and accept the invitation:\n${link}\n\nIf you did not expect this invitation, you can ignore this email.\n\nBest regards,\nThe KrishiPath Team`;
        const htmlBody = existingUser
            ? `<p>Hello,</p><p>You have been invited to join the organization on <strong>KrishiPath</strong>.</p><p>Please click the button below to log in and accept the invitation:</p><p><a href="${link}" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-family: sans-serif; font-weight: bold;">Log In & Accept Invitation</a></p><p>Or copy and paste this link in your browser:</p><p>${link}</p><p>If you did not expect this invitation, you can ignore this email.</p><p>Best regards,<br>The KrishiPath Team</p>`
            : `<p>Hello,</p><p>You have been invited to join the organization on <strong>KrishiPath</strong>.</p><p>Please click the button below to create your account and accept the invitation:</p><p><a href="${link}" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-family: sans-serif; font-weight: bold;">Create Account</a></p><p>Or copy and paste this link in your browser:</p><p>${link}</p><p>If you did not expect this invitation, you can ignore this email.</p><p>Best regards,<br>The KrishiPath Team</p>`;
        try {
            await this.emailService.send(new EmailDto({
                to: invite.email,
                subject,
                body,
                htmlBody,
                companyId,
                userId: actorId,
            }));
        }
        catch (err) {
            await logger.error(err instanceof Error ? err : new Error(String(err)), { message: "Failed to send invitation email" });
        }
        await this.event("user.invitation.resent", companyId, actorId, { invitationId });
        await AuditLoggingService.record({
            companyId,
            userId: actorId,
            action: "user.invitation.resend",
            module: "user",
            entityType: "invitation",
            entityId: invitationId,
            status: "success",
        });
        return { resent: true };
    }
    async revokeInvitation(companyId, invitationId, actorId) {
        const invite = await this.repo.findInvitationById(companyId, invitationId);
        if (!invite)
            throw new AppError("Invitation not found", 404, "INVITATION_NOT_FOUND");
        if (invite.status !== "pending")
            throw new AppError("Only pending invitations can be revoked", 400, "INVALID_INVITATION_STATUS");
        await this.repo.updateInvitation(invitationId, { status: "revoked" });
        await this.event("user.invitation.revoked", companyId, actorId, { invitationId });
        await AuditLoggingService.record({
            companyId,
            userId: actorId,
            action: "user.invitation.revoke",
            module: "user",
            entityType: "invitation",
            entityId: invitationId,
            status: "success",
        });
        return { revoked: true };
    }
    async acceptInvitation(token, password, authUserId) {
        const invite = await this.repo.findInvitationByToken(token);
        if (!invite)
            throw new AppError("Invalid or expired invitation token", 400, "INVALID_TOKEN");
        if (invite.status !== "pending")
            throw new AppError("Invitation has already been accepted or revoked", 400, "INVALID_INVITATION_STATUS");
        if (invite.expiresAt < new Date())
            throw new AppError("Invitation token has expired", 400, "EXPIRED_TOKEN");
        const existingUser = await this.repo.findUserByEmail(invite.email);
        let userId;
        if (existingUser) {
            if (authUserId) {
                if (existingUser.id !== authUserId) {
                    throw new AppError("You can only accept invitations sent to your email address", 403, "FORBIDDEN");
                }
                userId = existingUser.id;
            }
            else {
                if (!existingUser.passwordHash || !existingUser.passwordSalt) {
                    if (!password) {
                        throw new AppError("Password is required to set up your account", 400, "PASSWORD_REQUIRED");
                    }
                    const { hash, salt } = await this.passService.hash(password);
                    userId = existingUser.id;
                    if (invite.roleId) {
                        await this.repo.assignRoles(invite.companyId, userId, [invite.roleId], userId);
                    }
                    await this.repo.update(invite.companyId, userId, {
                        passwordHash: hash,
                        passwordSalt: salt,
                        isEmailVerified: true,
                    });
                }
                else {
                    if (!password) {
                        throw new AppError("Password is required to verify identity", 400, "PASSWORD_REQUIRED");
                    }
                    const isPasswordValid = await this.passService.verify(password, existingUser.passwordHash, existingUser.passwordSalt);
                    if (!isPasswordValid) {
                        throw new AppError("Invalid password. Please check your credentials.", 401, "INVALID_CREDENTIALS");
                    }
                    userId = existingUser.id;
                }
            }
        }
        else {
            if (!password) {
                throw new AppError("Password is required to create your account", 400, "PASSWORD_REQUIRED");
            }
            const { hash, salt } = await this.passService.hash(password);
            const userResult = await this.repo.create({
                companyId: invite.companyId,
                email: invite.email,
                firstName: invite.firstName || "",
                lastName: invite.lastName || "",
                status: "active",
            });
            userId = userResult.userId;
            if (invite.roleId) {
                await this.repo.assignRoles(invite.companyId, userId, [invite.roleId], userId);
            }
            await this.repo.update(invite.companyId, userId, {
                passwordHash: hash,
                passwordSalt: salt,
                isEmailVerified: true,
            });
        }
        if (invite.warehouseAccess) {
            await this.repo.updateWarehouseAccess(invite.companyId, userId, invite.warehouseAccess);
        }
        await this.repo.updateInvitation(invite.id, { status: "accepted" });
        await this.event("user.invitation.accepted", invite.companyId, userId, { userId });
        await AuditLoggingService.record({
            companyId: invite.companyId,
            userId,
            action: "user.invitation.accept",
            module: "user",
            entityType: "user",
            entityId: userId,
            status: "success",
        });
        return { userId, success: true };
    }
    async list(companyId, params) {
        if (params) {
            return this.repo.listPaginated(companyId, params);
        }
        return this.repo.list(companyId);
    }
    async exportDirectory(companyId, params) {
        const result = await this.repo.listPaginated(companyId, { ...params, page: 1, limit: 10000 });
        const users = result.users;
        const headers = ["ID", "Full Name", "Email", "Roles", "Primary Warehouse", "Status", "Last Active", "User Type"];
        const csvRows = [headers.join(",")];
        for (const u of users) {
            const row = [
                u.id,
                `"${(u.fullName || "").replace(/"/g, '""')}"`,
                u.email,
                `"${(u.roleNames || []).join(", ")}"`,
                `"${(u.primaryWarehouse || "").replace(/"/g, '""')}"`,
                u.status,
                u.lastActive,
                u.userType,
            ];
            csvRows.push(row.join(","));
        }
        return csvRows.join("\n");
    }
    async getSummary(companyId) {
        return this.repo.getSummary(companyId);
    }
    async get(companyId, userId) {
        const user = await this.repo.find(companyId, userId);
        if (!user)
            throw new AppError("User not found", 404, "USER_NOT_FOUND");
        const db = Db1Connection.getInstance();
        const roles = await db
            .select({ id: rolesTable.id, name: rolesTable.name })
            .from(userRolesTable)
            .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
            .where(and(eq(userRolesTable.userId, userId), eq(userRolesTable.companyId, companyId), isNull(rolesTable.deletedAt)));
        const warehouseAccess = await this.repo.getWarehouseAccess(companyId, userId);
        return {
            ...user,
            roles,
            warehouseAccess: warehouseAccess ? {
                all: warehouseAccess.allWarehouses,
                warehouseIds: warehouseAccess.warehouseIds || [],
            } : { all: false, warehouseIds: [] },
        };
    }
    async update(companyId, userId, actorId, input) {
        // await SubscriptionLimitService.assertCanUpdate(companyId);
        if (userId === actorId) {
            if (input.status !== undefined && input.status !== "active") {
                throw new AppError("Self-mutation guard: you cannot deactivate or lock yourself", 400, "SELF_MUTATION_DENIED");
            }
        }
        const current = await this.get(companyId, userId);
        await this.repo.update(companyId, userId, input);
        await AuditLoggingService.record({
            companyId,
            userId: actorId,
            action: "user.update",
            module: "user",
            entityType: "user",
            entityId: userId,
            status: "success",
            beforeState: current,
            afterState: input,
        });
        await this.event(UserEvents.updated, companyId, actorId, { userId });
        return { updated: true };
    }
    async assignRoles(companyId, userId, actorId, input) {
        // await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.get(companyId, userId);
        const validRoleCount = await this.repo.countTenantRoles(companyId, input.roleIds);
        if (validRoleCount !== new Set(input.roleIds).size) {
            throw new AppError("Invalid role assignment: some roles do not exist or belong to another company", 400, "INVALID_ROLE_ASSIGNMENT");
        }
        const actorRoles = await Db1Connection.getInstance()
            .select({ roleId: userRolesTable.roleId })
            .from(userRolesTable)
            .where(and(eq(userRolesTable.userId, actorId), eq(userRolesTable.companyId, companyId)));
        const actorRoleIds = actorRoles.map(ar => ar.roleId);
        const isActorSuperAdmin = await this.checkUserIsSuperAdmin(companyId, actorId);
        if (!isActorSuperAdmin) {
            for (const targetRoleId of input.roleIds) {
                if (!actorRoleIds.includes(targetRoleId)) {
                    throw new AppError("Privilege escalation prevented: Actor cannot assign a role they do not possess", 403, "PRIVILEGE_ESCALATION_PREVENTED");
                }
            }
        }
        if (userId !== actorId) {
            const isTargetAdmin = await this.checkUserIsAdmin(companyId, userId);
            if (isTargetAdmin) {
                const targetRolesAreAdmin = await this.checkRolesIncludeAdmin(companyId, input.roleIds);
                if (!targetRolesAreAdmin) {
                    const activeAdminsCount = await this.countActiveAdmins(companyId);
                    if (activeAdminsCount <= 1) {
                        throw new AppError("Last administrator guard: cannot remove administrator role from the last active admin", 400, "LAST_ADMIN_GUARD");
                    }
                }
            }
        }
        else {
            const isTargetAdmin = await this.checkUserIsAdmin(companyId, userId);
            if (isTargetAdmin) {
                const targetRolesAreAdmin = await this.checkRolesIncludeAdmin(companyId, input.roleIds);
                if (!targetRolesAreAdmin) {
                    throw new AppError("Self-mutation guard: you cannot remove your own administrator role", 400, "SELF_MUTATION_DENIED");
                }
            }
        }
        await this.repo.assignRoles(companyId, userId, input.roleIds, actorId);
        await AuditLoggingService.record({
            companyId,
            userId: actorId,
            action: "user.assign-roles",
            module: "user",
            entityType: "user",
            entityId: userId,
            status: "success",
            afterState: { roleIds: input.roleIds },
        });
        await this.event("user.roles.assigned", companyId, actorId, { userId, roleIds: input.roleIds });
        return { assigned: true, roleCount: input.roleIds.length };
    }
    async status(companyId, userId, actorId, status) {
        // await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.get(companyId, userId);
        if (userId === actorId && status !== "active") {
            throw new AppError("Self-mutation guard: you cannot suspend or lock yourself", 400, "SELF_MUTATION_DENIED");
        }
        if (status !== "active" && await this.checkUserIsAdmin(companyId, userId)) {
            const activeAdmins = await this.countActiveAdmins(companyId);
            if (activeAdmins <= 1) {
                throw new AppError("Last administrator guard: you cannot suspend or lock the last active admin", 400, "LAST_ADMIN_GUARD");
            }
        }
        await this.repo.update(companyId, userId, { status });
        await AuditLoggingService.record({
            companyId,
            userId: actorId,
            action: `user.${status}`,
            module: "user",
            entityType: "user",
            entityId: userId,
            status: "success",
        });
        await this.event(`user.${status}`, companyId, actorId, { userId, status });
        return { status };
    }
    async preferences(companyId, userId, actorId, input) {
        // await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.get(companyId, userId);
        await this.repo.updatePreferences(userId, input);
        await AuditLoggingService.record({
            companyId,
            userId: actorId,
            action: "user.preferences.update",
            module: "user",
            entityType: "user",
            entityId: userId,
            status: "success",
            afterState: input,
        });
        await this.event(UserEvents.preferencesUpdated, companyId, actorId, { userId });
        return { updated: true };
    }
    async bulkAction(companyId, actorId, payload) {
        if (payload.ids.includes(actorId)) {
            throw new AppError("Self-mutation guard: bulk actions cannot include yourself", 400, "SELF_MUTATION_DENIED");
        }
        for (const userId of payload.ids) {
            await this.get(companyId, userId);
        }
        const targetsAreAdmins = [];
        for (const targetId of payload.ids) {
            if (await this.checkUserIsAdmin(companyId, targetId)) {
                targetsAreAdmins.push(targetId);
            }
        }
        const disablingActions = ["deactivate", "lock", "delete", "assign-roles"];
        if (disablingActions.includes(payload.action) && targetsAreAdmins.length > 0) {
            if (payload.action === "assign-roles") {
                const targetRolesAreAdmin = await this.checkRolesIncludeAdmin(companyId, payload.roleIds || []);
                if (!targetRolesAreAdmin) {
                    const activeAdminsCount = await this.countActiveAdmins(companyId);
                    if (activeAdminsCount - targetsAreAdmins.length <= 0) {
                        throw new AppError("Last administrator guard: bulk action would remove the last active admin(s)", 400, "LAST_ADMIN_GUARD");
                    }
                }
            }
            else {
                const activeAdminsCount = await this.countActiveAdmins(companyId);
                if (activeAdminsCount - targetsAreAdmins.length <= 0) {
                    throw new AppError("Last administrator guard: bulk action would disable the last active admin(s)", 400, "LAST_ADMIN_GUARD");
                }
            }
        }
        const db = Db1Connection.getInstance();
        if (payload.action === "activate") {
            await db.update(usersTable).set({ status: "active", lockedUntil: null }).where(and(inArray(usersTable.id, payload.ids), isNull(usersTable.deletedAt)));
        }
        else if (payload.action === "deactivate") {
            await db.update(usersTable).set({ status: "inactive" }).where(and(inArray(usersTable.id, payload.ids), isNull(usersTable.deletedAt)));
        }
        else if (payload.action === "lock") {
            await db.update(usersTable).set({ status: "locked", lockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) }).where(and(inArray(usersTable.id, payload.ids), isNull(usersTable.deletedAt)));
        }
        else if (payload.action === "unlock") {
            await db.update(usersTable).set({ status: "active", lockedUntil: null, failedLoginAttempts: 0 }).where(and(inArray(usersTable.id, payload.ids), isNull(usersTable.deletedAt)));
        }
        else if (payload.action === "delete") {
            await db.update(usersTable).set({ deletedAt: new Date(), status: "deleted" }).where(and(inArray(usersTable.id, payload.ids), isNull(usersTable.deletedAt)));
        }
        else if (payload.action === "assign-roles" && payload.roleIds) {
            const validRoleCount = await this.repo.countTenantRoles(companyId, payload.roleIds);
            if (validRoleCount !== new Set(payload.roleIds).size) {
                throw new AppError("Invalid role assignment: some roles do not exist or belong to another company", 400, "INVALID_ROLE_ASSIGNMENT");
            }
            const actorRoles = await Db1Connection.getInstance()
                .select({ roleId: userRolesTable.roleId })
                .from(userRolesTable)
                .where(and(eq(userRolesTable.userId, actorId), eq(userRolesTable.companyId, companyId)));
            const actorRoleIds = actorRoles.map(ar => ar.roleId);
            const isActorSuperAdmin = await this.checkUserIsSuperAdmin(companyId, actorId);
            if (!isActorSuperAdmin) {
                for (const targetRoleId of payload.roleIds) {
                    if (!actorRoleIds.includes(targetRoleId)) {
                        throw new AppError("Privilege escalation prevented: Actor cannot assign a role they do not possess", 403, "PRIVILEGE_ESCALATION_PREVENTED");
                    }
                }
            }
            for (const targetId of payload.ids) {
                await this.repo.assignRoles(companyId, targetId, payload.roleIds, actorId);
            }
        }
        await AuditLoggingService.record({
            companyId,
            userId: actorId,
            action: `user.bulk.${payload.action}`,
            module: "user",
            entityType: "user",
            status: "success",
            metadata: { targetIds: payload.ids, action: payload.action },
        });
        return { success: true, count: payload.ids.length };
    }
    async getUserSessions(companyId, userId) {
        const db = Db1Connection.getInstance();
        return db
            .select()
            .from(sessionsTable)
            .where(and(eq(sessionsTable.userId, userId), isNull(sessionsTable.revokedAt)));
    }
    async getUserActivity(companyId, userId) {
        const db = Db1Connection.getInstance();
        return db
            .select()
            .from(auditLogsTable)
            .where(and(eq(auditLogsTable.companyId, companyId), eq(auditLogsTable.userId, userId)))
            .orderBy(desc(auditLogsTable.createdAt))
            .limit(50);
    }
    async getWarehouseAccess(companyId, userId) {
        const access = await this.repo.getWarehouseAccess(companyId, userId);
        return access ? {
            all: access.allWarehouses,
            warehouseIds: access.warehouseIds || [],
        } : { all: false, warehouseIds: [] };
    }
    async updateWarehouseAccess(companyId, userId, actorId, access) {
        // await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.get(companyId, userId);
        await this.repo.updateWarehouseAccess(companyId, userId, access);
        await AuditLoggingService.record({
            companyId,
            userId: actorId,
            action: "user.warehouse-access.update",
            module: "user",
            entityType: "user",
            entityId: userId,
            status: "success",
            afterState: access,
        });
        return { updated: true };
    }
    async resetPassword(companyId, userId, actorId) {
        await this.get(companyId, userId);
        await this.repo.update(companyId, userId, {
            passwordHash: null,
            passwordSalt: null,
        });
        await AuditLoggingService.record({
            companyId,
            userId: actorId,
            action: "user.password.reset",
            module: "user",
            entityType: "user",
            entityId: userId,
            status: "success",
        });
        return { success: true };
    }
    async resetMfa(companyId, userId, actorId) {
        await this.get(companyId, userId);
        const db = Db1Connection.getInstance();
        await db.delete(mfaDevicesTable).where(eq(mfaDevicesTable.userId, userId));
        await this.repo.update(companyId, userId, { isMfaEnabled: false });
        await AuditLoggingService.record({
            companyId,
            userId: actorId,
            action: "user.mfa.reset",
            module: "user",
            entityType: "user",
            entityId: userId,
            status: "success",
        });
        return { success: true };
    }
    async terminateSessions(companyId, userId, actorId) {
        await this.get(companyId, userId);
        await this.repo.terminateSessions(userId);
        await AuditLoggingService.record({
            companyId,
            userId: actorId,
            action: "user.sessions.terminate",
            module: "user",
            entityType: "user",
            entityId: userId,
            status: "success",
        });
        return { success: true };
    }
    async checkUserIsAdmin(companyId, userId) {
        const db = Db1Connection.getInstance();
        const adminRoles = await db
            .select({ id: userRolesTable.id })
            .from(userRolesTable)
            .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
            .where(and(eq(userRolesTable.userId, userId), eq(userRolesTable.companyId, companyId), or(eq(rolesTable.name, "System Administrator"), eq(rolesTable.name, "Organization Administrator"), eq(rolesTable.name, "Administrator")), isNull(rolesTable.deletedAt)))
            .limit(1);
        return adminRoles.length > 0;
    }
    async checkUserIsSuperAdmin(companyId, userId) {
        const db = Db1Connection.getInstance();
        const adminRoles = await db
            .select({ id: userRolesTable.id })
            .from(userRolesTable)
            .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
            .where(and(eq(userRolesTable.userId, userId), eq(userRolesTable.companyId, companyId), eq(rolesTable.name, "System Administrator"), isNull(rolesTable.deletedAt)))
            .limit(1);
        return adminRoles.length > 0;
    }
    async checkRolesIncludeAdmin(companyId, roleIds) {
        if (!roleIds.length)
            return false;
        const db = Db1Connection.getInstance();
        const admins = await db
            .select({ id: rolesTable.id })
            .from(rolesTable)
            .where(and(inArray(rolesTable.id, roleIds), eq(rolesTable.companyId, companyId), or(eq(rolesTable.name, "System Administrator"), eq(rolesTable.name, "Organization Administrator"), eq(rolesTable.name, "Administrator")), isNull(rolesTable.deletedAt)));
        return admins.length > 0;
    }
    async countActiveAdmins(companyId) {
        const db = Db1Connection.getInstance();
        const activeAdmins = await db
            .select({ count: sql `count(distinct ${usersTable.id})` })
            .from(usersTable)
            .innerJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
            .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
            .where(and(eq(userRolesTable.companyId, companyId), eq(usersTable.status, "active"), or(eq(rolesTable.name, "System Administrator"), eq(rolesTable.name, "Organization Administrator"), eq(rolesTable.name, "Administrator")), isNull(usersTable.deletedAt), isNull(rolesTable.deletedAt)));
        return Number(activeAdmins[0]?.count ?? 0);
    }
    async getInvitationByToken(token) {
        const invite = await this.repo.findInvitationByToken(token);
        if (!invite) {
            throw new AppError("Invalid or expired invitation token", 404, "INVITATION_NOT_FOUND");
        }
        if (invite.status !== "pending") {
            throw new AppError("Invitation has already been accepted or revoked", 400, "INVALID_INVITATION_STATUS");
        }
        if (invite.expiresAt < new Date()) {
            throw new AppError("Invitation token has expired", 400, "EXPIRED_TOKEN");
        }
        const company = await Db1Connection.getInstance()
            .select({ name: companiesTable.name })
            .from(companiesTable)
            .where(eq(companiesTable.id, invite.companyId))
            .limit(1);
        const existingUser = await this.repo.findUserByEmail(invite.email);
        return {
            email: invite.email,
            firstName: invite.firstName,
            lastName: invite.lastName,
            companyName: company[0]?.name || "KrishiPath Workspace",
            userExists: !!existingUser,
        };
    }
    async event(name, companyId, userId, payload) {
        await logger.info(name, { module: "user", companyId, userId, payload, tags: ["user", "event"] });
        await CoreEventBus.publish(EventEnvelopeFactory.create({ id: randomUUID(), name, source: "user", payload, metadata: { companyId, userId } }));
    }
}
