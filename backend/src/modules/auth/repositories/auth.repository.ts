import { and, desc, eq, gt, inArray, isNull, ne } from "drizzle-orm";
import { randomUUID } from "crypto";

import { Db1Connection } from "../../../infrastructure/database";
import {
  backupCodesTable,
  loginAttemptsTable,
  mfaDevicesTable,
  mfaTrustSessionsTable,
  passwordResetTokensTable,
  passwordHistoriesTable,
  passwordResetSessionsTable,
  permissionGroupsTable,
  permissionsTable,
  rolePermissionsTable,
  rolesTable,
  sessionsTable,
  userDevicesTable,
  subscriptionPlansTable,
  subscriptionsTable,
  companySettingsTable,
  companiesTable,
  userRolesTable,
  usersTable,
} from "../../../infrastructure/database/postgres/schemas/db1";

type DbUser = typeof usersTable.$inferSelect;
type DbTenant = typeof companiesTable.$inferSelect;
type DbRole = typeof rolesTable.$inferSelect;
type DbPerm = typeof permissionsTable.$inferSelect;
type DbPlan = typeof subscriptionPlansTable.$inferSelect;
type DbSub = typeof subscriptionsTable.$inferSelect;
type DbSession = typeof sessionsTable.$inferSelect;
type DbMfa = typeof mfaDevicesTable.$inferSelect;
type DbMfaTrust = typeof mfaTrustSessionsTable.$inferSelect;
type DbDevice = typeof userDevicesTable.$inferSelect;

interface UserInsertInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  passwordSalt?: string;
  status: string;
  userType?: string;
  profileStatus?: string;
  isPhoneVerified?: boolean;
}

interface TenantInsertInput {
  name: string;
  legalName?: string;
  industry: string;
  companySize: string;
  website?: string;
  businessType: string;
  taxNumber?: string;
  country: string;
  stateProvince: string;
  city: string;
  postalCode: string;
  timezone: string;
  currencyCode: string;
}

interface SessionInsertInput {
  sessionId: string;
  userId: string;
  accessJti: string;
  refreshHash: string;
  deviceId?: string;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  ipAddress?: string;
  loginMethod?: string;
  loginProvider?: string;
}

interface MfaTrustSessionInsertInput {
  id: string;
  companyId?: string;
  userId: string;
  deviceId: string;
  browserFingerprint: string;
  deviceFingerprint: string;
  trustTokenHash: string;
  sessionId: string;
  trustedAt: Date;
  expiresAt: Date;
  createdIp?: string;
  lastSeenIp?: string;
  riskScore: number;
  metadata: Record<string, unknown>;
}

export class AuthRepository {
  public getStatus(): string {
    return "auth-module-ready";
  }

  public async findUserByEmail(email: string): Promise<DbUser | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.email, email), isNull(usersTable.deletedAt)))
      .limit(1);

    return rows[0] ?? null;
  }

  public async findUserByPhone(phone: string): Promise<DbUser | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.phone, phone), isNull(usersTable.deletedAt)))
      .limit(1);

    return rows[0] ?? null;
  }

  public async findUserByVerifiedMfaPhone(
    phone: string,
  ): Promise<DbUser | null> {
    const db = Db1Connection.getInstance();
    const devices = await db
      .select()
      .from(mfaDevicesTable)
      .where(
        and(
          eq(mfaDevicesTable.phoneNumber, phone),
          eq(mfaDevicesTable.mfaType, "phone_otp"),
        ),
      )
      .orderBy(
        desc(mfaDevicesTable.verifiedAt),
        desc(mfaDevicesTable.createdAt),
      )
      .limit(5);

    const verifiedDevice = devices.find((device) => device.verifiedAt);
    if (!verifiedDevice?.userId) {
      return null;
    }

    return this.findUserById(verifiedDevice.userId);
  }

  public async findUserById(userId: string): Promise<DbUser | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, userId), isNull(usersTable.deletedAt)))
      .limit(1);

    return rows[0] ?? null;
  }

  public async createUser(input: UserInsertInput): Promise<DbUser> {
    const db = Db1Connection.getInstance();
    const now = new Date();

    const rows = await db
      .insert(usersTable)
      .values({
        id: randomUUID(),
        globalIdentityKey: `usr_${randomUUID()}`,
        firstName: input.firstName,
        lastName: input.lastName,
        displayName: [input.firstName, input.lastName]
          .filter(Boolean)
          .join(" "),
        email: input.email,
        phone: input.phone,
        passwordHash: input.passwordHash,
        passwordSalt: input.passwordSalt,
        isEmailVerified: false,
        isPhoneVerified: input.isPhoneVerified ?? false,
        isMfaEnabled: false,
        isSsoUser: false,
        failedLoginAttempts: 0,
        status: input.status,
        userType: input.userType,
        profileStatus: input.profileStatus,
        createdAt: now,
        updatedAt: now,
        version: 1,
      })
      .returning();

    return rows[0] ?? null;
  }

  public async createPasswordResetToken(
    userId: string,
    tokenHash: string,
    ttlMinutes: number,
  ): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .update(passwordResetTokensTable)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(passwordResetTokensTable.userId, userId),
          isNull(passwordResetTokensTable.usedAt),
        ),
      );

    await db.insert(passwordResetTokensTable).values({
      id: randomUUID(),
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
      createdAt: new Date(),
    });
  }

  public async findPasswordResetTokenByHash(tokenHash: string) {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.tokenHash, tokenHash))
      .limit(1);

    return rows[0] ?? null;
  }

  public async markPasswordResetTokenUsed(tokenId: string): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .update(passwordResetTokensTable)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokensTable.id, tokenId));
  }

  public async createPasswordResetSession(
    userId: string,
    tokenHash: string,
    ipAddress: string | undefined,
    userAgent: string | undefined,
    ttlMinutes: number,
  ): Promise<typeof passwordResetSessionsTable.$inferSelect> {
    const db = Db1Connection.getInstance();
    const id = randomUUID();
    const rows = await db
      .insert(passwordResetSessionsTable)
      .values({
        id,
        userId,
        tokenHash,
        used: false,
        usedAt: null,
        invalidatedAt: null,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
        createdAt: new Date(),
      })
      .returning();
    return rows[0];
  }

  public async getActivePasswordResetSessions(
    userId: string,
  ): Promise<Array<typeof passwordResetSessionsTable.$inferSelect>> {
    const db = Db1Connection.getInstance();
    return db
      .select()
      .from(passwordResetSessionsTable)
      .where(
        and(
          eq(passwordResetSessionsTable.userId, userId),
          eq(passwordResetSessionsTable.used, false),
          isNull(passwordResetSessionsTable.invalidatedAt),
          gt(passwordResetSessionsTable.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(passwordResetSessionsTable.createdAt));
  }

  public async invalidatePasswordResetSession(sessionId: string): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .update(passwordResetSessionsTable)
      .set({
        invalidatedAt: new Date(),
        expiresAt: new Date(),
      })
      .where(eq(passwordResetSessionsTable.id, sessionId));
  }

  public async findPasswordResetSessionByHash(
    tokenHash: string,
  ): Promise<typeof passwordResetSessionsTable.$inferSelect | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(passwordResetSessionsTable)
      .where(eq(passwordResetSessionsTable.tokenHash, tokenHash))
      .limit(1);
    return rows[0] ?? null;
  }

  public async markPasswordResetSessionUsed(
    sessionId: string,
  ): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .update(passwordResetSessionsTable)
      .set({
        used: true,
        usedAt: new Date(),
      })
      .where(eq(passwordResetSessionsTable.id, sessionId));
  }

  public async consumePasswordResetSession(
    sessionId: string,
  ): Promise<typeof passwordResetSessionsTable.$inferSelect | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .update(passwordResetSessionsTable)
      .set({
        used: true,
        usedAt: new Date(),
      })
      .where(
        and(
          eq(passwordResetSessionsTable.id, sessionId),
          eq(passwordResetSessionsTable.used, false),
          isNull(passwordResetSessionsTable.invalidatedAt),
          gt(passwordResetSessionsTable.expiresAt, new Date()),
        ),
      )
      .returning();

    return rows[0] ?? null;
  }

  public async untrustAllUserDevices(userId: string): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .update(userDevicesTable)
      .set({
        isTrusted: false,
      })
      .where(eq(userDevicesTable.userId, userId));
  }

  public async getPasswordHistory(
    userId: string,
    limitCount: number,
  ): Promise<Array<typeof passwordHistoriesTable.$inferSelect>> {
    const db = Db1Connection.getInstance();
    return db
      .select()
      .from(passwordHistoriesTable)
      .where(eq(passwordHistoriesTable.userId, userId))
      .orderBy(desc(passwordHistoriesTable.createdAt))
      .limit(limitCount);
  }

  public async addPasswordHistory(
    userId: string,
    passwordHash: string,
    passwordSalt: string,
  ): Promise<void> {
    const db = Db1Connection.getInstance();
    await db.insert(passwordHistoriesTable).values({
      id: randomUUID(),
      userId,
      passwordHash,
      passwordSalt,
      createdAt: new Date(),
    });
  }

  public async updateUserPassword(
    userId: string,
    passwordHash: string,
    passwordSalt: string,
  ): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .update(usersTable)
      .set({
        passwordHash,
        passwordSalt,
        lastPasswordChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  }

  public async updateUserTenant(
    userId: string,
    companyId: string,
  ): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .update(usersTable)
      .set({
        status: "pending_subscription",
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  }

  public async markUserActive(userId: string): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .update(usersTable)
      .set({
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  }

  public async markEmailVerified(userId: string): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .update(usersTable)
      .set({
        isEmailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  }

  public async updateUserPhone(userId: string, phone: string): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .update(usersTable)
      .set({
        phone,
        isPhoneVerified: false,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  }

  public async markPhoneVerified(userId: string): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .update(usersTable)
      .set({
        isPhoneVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  }

  public async createTenant(input: TenantInsertInput): Promise<DbTenant> {
    const db = Db1Connection.getInstance();
    const now = new Date();
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const rows = await db
      .insert(companiesTable)
      .values({
        id: randomUUID(),
        code: `TEN-${Date.now().toString(36).toUpperCase()}`,
        name: input.name,
        slug: `${slug}-${Date.now().toString(36)}`,
        legalName: input.legalName ?? input.name,
        industry: input.industry,
        companySize: input.companySize,
        website: input.website,
        businessType: input.businessType,
        taxNumber: input.taxNumber,
        country: input.country,
        stateProvince: input.stateProvince,
        city: input.city,
        postalCode: input.postalCode,
        tenantType: "saas",
        status: "pending_subscription",
        onboardingStatus: "tenant_created",
        createdAt: now,
        updatedAt: now,
        version: 1,
      })
      .returning();

    return rows[0];
  }

  public async createTenantSettings(
    companyId: string,
    timezone: string,
    currencyCode: string,
  ): Promise<void> {
    const db = Db1Connection.getInstance();
    const now = new Date();

    await db.insert(companySettingsTable).values({
      id: randomUUID(),
      companyId,
      timezone,
      defaultCurrencyCode: currencyCode.toUpperCase(),
      languageCode: "en",
      dateFormat: "YYYY-MM-DD",
      timeFormat: "HH:mm:ss",
      enableMfa: false,
      enableSso: false,
      enableApiAccess: true,
      enableCustomRoles: true,
      enableMultiCompany: true,
      enableMultiWarehouse: true,
      enableAuditExports: true,
      enableWebhooks: true,
      defaultSessionTimeoutMinutes: 120,
      maxFailedLoginAttempts: 5,
      lockoutDurationMinutes: 15,
      createdAt: now,
      updatedAt: now,
    });
  }

  public async findPlanByCode(planCode: string): Promise<DbPlan | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(subscriptionPlansTable)
      .where(eq(subscriptionPlansTable.code, planCode))
      .limit(1);

    return rows[0] ?? null;
  }

  public async findSubscriptionByTenant(
    companyId: string,
  ): Promise<DbSub | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, companyId))
      .limit(1);

    return rows[0] ?? null;
  }

  public async findTenantById(companyId: string): Promise<DbTenant | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(companiesTable)
      .where(and(eq(companiesTable.id, companyId), isNull(companiesTable.deletedAt)))
      .limit(1);

    return rows[0] ?? null;
  }

  public async findRootUserAllTenants(
    userId: string,
  ): Promise<DbTenant[] | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(companiesTable)
      .where(
        and(eq(companiesTable.userId, userId), isNull(companiesTable.deletedAt)),
      );

    return rows;
  }

  public async isCompanyOwner(
    userId: string,
    companyId: string,
  ): Promise<boolean> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select({ id: companiesTable.id })
      .from(companiesTable)
      .where(
        and(
          eq(companiesTable.id, companyId),
          eq(companiesTable.userId, userId),
          isNull(companiesTable.deletedAt),
        ),
      )
      .limit(1);

    return Boolean(rows[0]);
  }

  public async listRootTenants(userId: string): Promise<DbTenant[]> {
    const companies = await this.findRootUserAllTenants(userId);
    return companies ?? [];
  }

  public async hasRoleInTenant(
    userId: string,
    companyId: string,
  ): Promise<boolean> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select({ id: userRolesTable.id })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(
        and(
          eq(userRolesTable.userId, userId),
          eq(rolesTable.companyId, companyId),
          isNull(rolesTable.deletedAt),
        ),
      )
      .limit(1);

    return Boolean(rows[0]);
  }

  public async listIamTenants(userId: string): Promise<DbTenant[]> {
    const db = Db1Connection.getInstance();
    const rows: DbTenant[] = await db
      .select({
        id: companiesTable.id,
        userId: companiesTable.userId,
        code: companiesTable.code,
        name: companiesTable.name,
        slug: companiesTable.slug,
        legalName: companiesTable.legalName,
        industry: companiesTable.industry,
        companySize: companiesTable.companySize,
        website: companiesTable.website,
        businessType: companiesTable.businessType,
        taxNumber: companiesTable.taxNumber,
        country: companiesTable.country,
        stateProvince: companiesTable.stateProvince,
        city: companiesTable.city,
        postalCode: companiesTable.postalCode,
        primaryEmail: companiesTable.primaryEmail,
        primaryPhone: companiesTable.primaryPhone,
        tenantType: companiesTable.tenantType,
        subscriptionPlanId: companiesTable.subscriptionPlanId,
        status: companiesTable.status,
        onboardingStatus: companiesTable.onboardingStatus,
        trialStartsAt: companiesTable.trialStartsAt,
        trialEndsAt: companiesTable.trialEndsAt,
        activatedAt: companiesTable.activatedAt,
        suspendedAt: companiesTable.suspendedAt,
        lastActivityAt: companiesTable.lastActivityAt,
        createdAt: companiesTable.createdAt,
        updatedAt: companiesTable.updatedAt,
        deletedAt: companiesTable.deletedAt,
        version: companiesTable.version,
      })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .innerJoin(companiesTable, eq(rolesTable.companyId, companiesTable.id))
      .where(
        and(
          eq(userRolesTable.userId, userId),
          isNull(rolesTable.deletedAt),
          isNull(companiesTable.deletedAt),
          // Exclude companies that this user OWNS — those belong to Root login only
          ne(companiesTable.userId, userId),
        ),
      )
      .orderBy(companiesTable.name);

    return rows ?? [];
  }

  public async getDefaultCompanyIdForUser(
    userId: string,
  ): Promise<string | null> {
    const owned = await this.listRootTenants(userId);
    if (owned && owned.length > 0) {
      const sorted = [...owned].sort((a, b) => {
        const t1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const t2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return t1 - t2;
      });
      return sorted[0].id;
    }

    const iam = await this.listIamTenants(userId);
    if (iam && iam.length > 0) {
      const sorted = [...iam].sort((a, b) => {
        const t1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const t2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return t1 - t2;
      });
      return sorted[0].id;
    }

    return null;
  }

  public async upsertSubscriptionDraft(
    companyId: string,
    planId: string,
    billingCycle: "monthly" | "annual",
  ): Promise<DbSub> {
    const db = Db1Connection.getInstance();
    const existing = await this.findSubscriptionByTenant(companyId);
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    if (existing) {
      const rows = await db
        .update(subscriptionsTable)
        .set({
          subscriptionPlanId: planId,
          billingCycle,
          status: "pending_payment",
        })
        .where(eq(subscriptionsTable.id, existing.id))
        .returning();

      return rows[0];
    }

    const rows = await db
      .insert(subscriptionsTable)
      .values({
        id: randomUUID(),
        userId: companyId,
        subscriptionPlanId: planId,
        subscriptionNumber: `SUB-${Date.now().toString(36).toUpperCase()}`,
        billingCycle,
        startDate: today,
        autoRenew: true,
        status: "pending_payment",
        createdAt: now,
      })
      .returning();

    return rows[0];
  }

  public async setTenantPlan(companyId: string, planId: string): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .update(companiesTable)
      .set({
        subscriptionPlanId: planId,
        onboardingStatus: "plan_selected",
        updatedAt: new Date(),
      })
      .where(eq(companiesTable.id, companyId));
  }

  public async activateSubscription(companyId: string): Promise<DbSub> {
    const db = Db1Connection.getInstance();
    const sub = await this.findSubscriptionByTenant(companyId);

    if (!sub) {
      throw new Error("Subscription not found");
    }

    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    const isAnnual = sub.billingCycle === "annual";
    end.setFullYear(end.getFullYear() + (isAnnual ? 1 : 0));
    end.setMonth(end.getMonth() + (isAnnual ? 0 : 1));

    const dateStart = start.toISOString().slice(0, 10);
    const dateEnd = end.toISOString().slice(0, 10);

    const rows = await db
      .update(subscriptionsTable)
      .set({
        startDate: dateStart,
        endDate: dateEnd,
        renewalDate: dateEnd,
        status: "active",
      })
      .where(eq(subscriptionsTable.id, sub.id))
      .returning();

    await db
      .update(companiesTable)
      .set({
        status: "active",
        onboardingStatus: "active",
        activatedAt: now,
        updatedAt: now,
      })
      .where(eq(companiesTable.id, companyId));

    return rows[0];
  }

  public async activateTrialSubscription(
    companyId: string,
    planId: string,
    trialDays: number,
  ): Promise<DbSub> {
    const db = Db1Connection.getInstance();
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + trialDays);
    const startDate = now.toISOString().slice(0, 10);
    const endDate = trialEnd.toISOString().slice(0, 10);

    const existing = await this.findSubscriptionByTenant(companyId);
    let subscription: DbSub;

    if (existing) {
      const rows = await db
        .update(subscriptionsTable)
        .set({
          subscriptionPlanId: planId,
          billingCycle: "monthly",
          startDate,
          endDate,
          renewalDate: endDate,
          trialEndsAt: trialEnd,
          autoRenew: false,
          status: "trial_active",
        })
        .where(eq(subscriptionsTable.id, existing.id))
        .returning();
      subscription = rows[0];
    } else {
      const rows = await db
        .insert(subscriptionsTable)
        .values({
          id: randomUUID(),
          userId: companyId,
          subscriptionPlanId: planId,
          subscriptionNumber: `SUB-${Date.now().toString(36).toUpperCase()}`,
          billingCycle: "monthly",
          startDate,
          endDate,
          renewalDate: endDate,
          trialEndsAt: trialEnd,
          autoRenew: false,
          status: "trial_active",
          createdAt: now,
        })
        .returning();
      subscription = rows[0];
    }

    await db
      .update(companiesTable)
      .set({
        status: "active",
        onboardingStatus: "trial_active",
        trialStartsAt: now,
        trialEndsAt: trialEnd,
        activatedAt: now,
        updatedAt: now,
      })
      .where(eq(companiesTable.id, companyId));

    return subscription;
  }

  public async createSession(input: SessionInsertInput): Promise<void> {
    const db = Db1Connection.getInstance();
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    await db.insert(sessionsTable).values({
      id: input.sessionId,
      userId: input.userId,
      deviceId: input.deviceId,
      refreshTokenHash: input.refreshHash,
      accessTokenJti: input.accessJti,
      ipAddress: input.ipAddress,
      deviceType: input.deviceType,
      browser: input.browser,
      operatingSystem: input.operatingSystem,
      loginMethod: input.loginMethod,
      loginProvider: input.loginProvider,
      lastActiveAt: now,
      expiresAt,
      createdAt: now,
    });
  }

  public async createMfaTrustSession(
    input: MfaTrustSessionInsertInput,
  ): Promise<DbMfaTrust> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .insert(mfaTrustSessionsTable)
      .values({
        id: input.id,
        companyId: input.companyId,
        userId: input.userId,
        deviceId: input.deviceId,
        browserFingerprint: input.browserFingerprint,
        deviceFingerprint: input.deviceFingerprint,
        trustTokenHash: input.trustTokenHash,
        sessionId: input.sessionId,
        trustedAt: input.trustedAt,
        expiresAt: input.expiresAt,
        createdIp: input.createdIp,
        lastSeenIp: input.lastSeenIp,
        riskScore: input.riskScore,
        metadata: input.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return rows[0];
  }

  public async getTenantMfaTrustWindowMinutes(
    companyId: string | undefined,
  ): Promise<number | null> {
    if (!companyId) {
      return null;
    }

    const db = Db1Connection.getInstance();
    const rows = await db
      .select({
        mfaTrustWindowMinutes: companySettingsTable.mfaTrustWindowMinutes,
      })
      .from(companySettingsTable)
      .where(eq(companySettingsTable.companyId, companyId))
      .limit(1);

    return rows[0]?.mfaTrustWindowMinutes ?? null;
  }

  public async findActiveMfaTrustSession(input: {
    trustSessionId: string;
    userId: string;
    companyId?: string;
    trustTokenHash: string;
  }): Promise<DbMfaTrust | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(mfaTrustSessionsTable)
      .where(
        and(
          eq(mfaTrustSessionsTable.id, input.trustSessionId),
          eq(mfaTrustSessionsTable.userId, input.userId),
          input.companyId ?
            eq(mfaTrustSessionsTable.companyId, input.companyId)
          : isNull(mfaTrustSessionsTable.companyId),
          eq(mfaTrustSessionsTable.trustTokenHash, input.trustTokenHash),
          isNull(mfaTrustSessionsTable.revokedAt),
          gt(mfaTrustSessionsTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  }

  public async findActiveMfaTrustSessionByCurrentSession(input: {
    trustSessionId?: string;
    userId: string;
    companyId?: string;
    sessionId: string;
  }): Promise<DbMfaTrust | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(mfaTrustSessionsTable)
      .where(
        and(
          input.trustSessionId ?
            eq(mfaTrustSessionsTable.id, input.trustSessionId)
          : undefined,
          eq(mfaTrustSessionsTable.userId, input.userId),
          input.companyId ?
            eq(mfaTrustSessionsTable.companyId, input.companyId)
          : isNull(mfaTrustSessionsTable.companyId),
          eq(mfaTrustSessionsTable.sessionId, input.sessionId),
          isNull(mfaTrustSessionsTable.revokedAt),
          gt(mfaTrustSessionsTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  }

  public async touchMfaTrustSession(
    trustSessionId: string,
    lastSeenIp: string | undefined,
    riskScore: number,
  ): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .update(mfaTrustSessionsTable)
      .set({
        lastSeenIp,
        riskScore,
        updatedAt: new Date(),
      })
      .where(eq(mfaTrustSessionsTable.id, trustSessionId));
  }

  public async listMfaTrustSessions(userId: string): Promise<DbMfaTrust[]> {
    const db = Db1Connection.getInstance();
    return db
      .select()
      .from(mfaTrustSessionsTable)
      .where(
        and(
          eq(mfaTrustSessionsTable.userId, userId),
          isNull(mfaTrustSessionsTable.revokedAt),
          gt(mfaTrustSessionsTable.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(mfaTrustSessionsTable.trustedAt));
  }

  public async revokeMfaTrustSession(
    userId: string,
    trustSessionId: string,
  ): Promise<boolean> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .update(mfaTrustSessionsTable)
      .set({
        revokedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(mfaTrustSessionsTable.userId, userId),
          eq(mfaTrustSessionsTable.id, trustSessionId),
          isNull(mfaTrustSessionsTable.revokedAt),
        ),
      )
      .returning();

    return Boolean(rows[0]);
  }

  public async revokeAllUserMfaTrustSessions(userId: string): Promise<number> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .update(mfaTrustSessionsTable)
      .set({
        revokedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(mfaTrustSessionsTable.userId, userId),
          isNull(mfaTrustSessionsTable.revokedAt),
        ),
      )
      .returning();

    return rows.length;
  }

  public async createOrGetDevice(
    userId: string,
    deviceIdentifier: string,
    deviceName: string | undefined,
    deviceType: string | undefined,
    operatingSystem: string | undefined,
    browser: string | undefined,
    ipAddress: string | undefined,
  ): Promise<DbDevice> {
    const db = Db1Connection.getInstance();
    const existing = await db
      .select()
      .from(userDevicesTable)
      .where(
        and(
          eq(userDevicesTable.userId, userId),
          eq(userDevicesTable.deviceIdentifier, deviceIdentifier),
        ),
      )
      .limit(1);

    if (existing[0]) {
      const rows = await db
        .update(userDevicesTable)
        .set({
          deviceName,
          deviceType,
          operatingSystem,
          browser,
          ipAddress,
          lastUsedAt: new Date(),
        })
        .where(eq(userDevicesTable.id, existing[0].id))
        .returning();

      return rows[0];
    }

    const rows = await db
      .insert(userDevicesTable)
      .values({
        id: randomUUID(),
        userId,
        deviceIdentifier,
        deviceName,
        deviceType,
        operatingSystem,
        browser,
        ipAddress,
        isTrusted: false,
        lastUsedAt: new Date(),
        createdAt: new Date(),
      })
      .returning();

    return rows[0];
  }

  public async logLoginAttempt(
    userId: string | undefined,
    companyId: string | undefined,
    email: string,
    ipAddress: string | undefined,
    userAgent: string | undefined,
    isSuccessful: boolean,
    failureReason?: string,
  ): Promise<void> {
    const db = Db1Connection.getInstance();
    await db.insert(loginAttemptsTable).values({
      id: randomUUID(),
      companyId,
      userId,
      email,
      ipAddress,
      userAgent,
      isSuccessful,
      failureReason,
      attemptedAt: new Date(),
    });
  }

  public async createOrUpdateMfaDevice(
    userId: string,
    mfaType: string,
    secretHash: string | undefined,
    email: string | undefined,
    phoneNumber: string | undefined,
    isPrimary: boolean,
    verifiedAt?: Date,
  ): Promise<DbMfa> {
    const db = Db1Connection.getInstance();
    const existing = await db
      .select()
      .from(mfaDevicesTable)
      .where(
        and(
          eq(mfaDevicesTable.userId, userId),
          eq(mfaDevicesTable.mfaType, mfaType),
        ),
      )
      .orderBy(
        desc(mfaDevicesTable.verifiedAt),
        desc(mfaDevicesTable.createdAt),
      )
      .limit(1);

    if (existing[0]) {
      const rows = await db
        .update(mfaDevicesTable)
        .set({
          secretHash,
          email,
          phoneNumber,
          isPrimary,
          verifiedAt,
        })
        .where(eq(mfaDevicesTable.id, existing[0].id))
        .returning();
      return rows[0];
    }

    const rows = await db
      .insert(mfaDevicesTable)
      .values({
        id: randomUUID(),
        userId,
        mfaType,
        secretHash,
        email,
        phoneNumber,
        isPrimary,
        verifiedAt,
        createdAt: new Date(),
      })
      .returning();

    return rows[0];
  }

  public async listMfaDevices(userId: string): Promise<DbMfa[]> {
    const db = Db1Connection.getInstance();
    return db
      .select()
      .from(mfaDevicesTable)
      .where(eq(mfaDevicesTable.userId, userId))
      .orderBy(desc(mfaDevicesTable.createdAt));
  }

  public async replaceBackupCodes(
    userId: string,
    codeHashes: string[],
  ): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .delete(backupCodesTable)
      .where(eq(backupCodesTable.userId, userId));

    if (!codeHashes.length) {
      return;
    }

    await db.insert(backupCodesTable).values(
      codeHashes.map((codeHash) => ({
        id: randomUUID(),
        userId,
        codeHash,
        isUsed: false,
        createdAt: new Date(),
      })),
    );
  }

  public async useBackupCode(
    userId: string,
    codeHash: string,
  ): Promise<boolean> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .update(backupCodesTable)
      .set({
        isUsed: true,
        usedAt: new Date(),
      })
      .where(
        and(
          eq(backupCodesTable.userId, userId),
          eq(backupCodesTable.codeHash, codeHash),
          eq(backupCodesTable.isUsed, false),
        ),
      )
      .returning();

    return Boolean(rows[0]);
  }

  public async findMfaDevice(
    userId: string,
    mfaType: string,
  ): Promise<DbMfa | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(mfaDevicesTable)
      .where(
        and(
          eq(mfaDevicesTable.userId, userId),
          eq(mfaDevicesTable.mfaType, mfaType),
        ),
      )
      .orderBy(
        desc(mfaDevicesTable.verifiedAt),
        desc(mfaDevicesTable.createdAt),
      )
      .limit(1);

    return rows[0] ?? null;
  }

  public async markUserMfaEnabled(userId: string): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .update(usersTable)
      .set({
        isMfaEnabled: true,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  }

  public async listActiveSessions(userId: string): Promise<DbSession[]> {
    const db = Db1Connection.getInstance();
    return db
      .select()
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.userId, userId),
          isNull(sessionsTable.revokedAt),
          gt(sessionsTable.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(sessionsTable.createdAt));
  }

  public async revokeSession(
    userId: string,
    sessionId: string,
    reason: string,
  ): Promise<boolean> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .update(sessionsTable)
      .set({
        revokedAt: new Date(),
        revokedReason: reason,
      })
      .where(
        and(
          eq(sessionsTable.id, sessionId),
          eq(sessionsTable.userId, userId),
          isNull(sessionsTable.revokedAt),
        ),
      )
      .returning();

    return Boolean(rows[0]);
  }

  public async revokeAllOtherSessions(
    userId: string,
    currentSessionId: string,
    reason: string,
  ): Promise<number> {
    const sessions = await this.listActiveSessions(userId);
    let count = 0;

    for (const session of sessions) {
      if (session.id === currentSessionId) {
        continue;
      }

      const revoked = await this.revokeSession(userId, session.id, reason);
      if (revoked) {
        count += 1;
      }
    }

    return count;
  }

  public async revokeAllSessions(
    userId: string,
    reason: string,
  ): Promise<number> {
    const sessions = await this.listActiveSessions(userId);
    let count = 0;

    for (const session of sessions) {
      const revoked = await this.revokeSession(userId, session.id, reason);
      if (revoked) {
        count += 1;
      }
    }

    return count;
  }

  public async isSessionActive(
    userId: string,
    sessionId: string,
  ): Promise<boolean> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.id, sessionId),
          eq(sessionsTable.userId, userId),
          isNull(sessionsTable.revokedAt),
          gt(sessionsTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return Boolean(rows[0]);
  }

  public async findSessionById(sessionId: string): Promise<DbSession | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, sessionId))
      .limit(1);

    return rows[0] ?? null;
  }

  public async rotateSession(
    sessionId: string,
    accessJti: string,
    refreshHash: string,
    ipAddress?: string,
  ): Promise<void> {
    const db = Db1Connection.getInstance();
    await db
      .update(sessionsTable)
      .set({
        accessTokenJti: accessJti,
        refreshTokenHash: refreshHash,
        ipAddress,
        lastActiveAt: new Date(),
      })
      .where(eq(sessionsTable.id, sessionId));
  }

  public async countUsers(companyId: string): Promise<number> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .innerJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(
        and(
          eq(rolesTable.companyId, companyId),
          isNull(usersTable.deletedAt),
          isNull(rolesTable.deletedAt),
        ),
      );

    const uniqueUsers = new Set(rows.map((r) => r.id));
    return uniqueUsers.size;
  }

  public async ensurePermGroup(moduleName: string): Promise<string> {
    const db = Db1Connection.getInstance();
    const existing = await db
      .select()
      .from(permissionGroupsTable)
      .where(eq(permissionGroupsTable.moduleName, moduleName))
      .limit(1);

    if (existing[0]) {
      return existing[0].id;
    }

    const rows = await db
      .insert(permissionGroupsTable)
      .values({
        id: randomUUID(),
        moduleName,
        displayName: moduleName,
        description: moduleName,
        sortOrder: 100,
      })
      .returning();

    return rows[0].id;
  }

  public async findPermByKey(key: string): Promise<DbPerm | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(permissionsTable)
      .where(eq(permissionsTable.permissionKey, key))
      .limit(1);

    return rows[0] ?? null;
  }

  public async createPerm(
    groupId: string,
    module: string,
    resource: string,
    action: string,
    key: string,
    description: string,
  ): Promise<string> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .insert(permissionsTable)
      .values({
        id: randomUUID(),
        permissionGroupId: groupId,
        module,
        resource,
        action,
        permissionKey: key,
        description,
        createdAt: new Date(),
      })
      .onConflictDoNothing()
      .returning();

    if (rows[0]) {
      return rows[0].id;
    }

    const existing = await this.findPermByKey(key);
    if (!existing) {
      throw new Error("Permission create failed");
    }

    return existing.id;
  }

  public async listAllPerms(): Promise<DbPerm[]> {
    const db = Db1Connection.getInstance();
    return db.select().from(permissionsTable);
  }

  public async listPermsByIds(ids: string[]): Promise<DbPerm[]> {
    if (!ids.length) {
      return [];
    }

    const db = Db1Connection.getInstance();
    return db
      .select()
      .from(permissionsTable)
      .where(inArray(permissionsTable.id, ids));
  }

  public async listPermsByKeys(keys: string[]): Promise<DbPerm[]> {
    if (!keys.length) {
      return [];
    }

    const db = Db1Connection.getInstance();
    return db
      .select()
      .from(permissionsTable)
      .where(inArray(permissionsTable.permissionKey, keys));
  }

  public async createRole(
    companyId: string,
    createdBy: string,
    name: string,
    description: string,
    isSystemRole: boolean,
  ): Promise<DbRole> {
    const db = Db1Connection.getInstance();
    const now = new Date();

    const rows = await db
      .insert(rolesTable)
      .values({
        id: randomUUID(),
        companyId,
        name,
        description,
        isSystemRole,
        isDefaultRole: false,
        canBeDeleted: !isSystemRole,
        priority: isSystemRole ? 90 : 50,
        createdBy,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return rows[0];
  }

  public async findRoleById(roleId: string): Promise<DbRole | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(rolesTable)
      .where(and(eq(rolesTable.id, roleId), isNull(rolesTable.deletedAt)))
      .limit(1);

    return rows[0] ?? null;
  }

  public async findRoleByName(
    companyId: string,
    roleName: string,
  ): Promise<DbRole | null> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select()
      .from(rolesTable)
      .where(
        and(
          eq(rolesTable.companyId, companyId),
          eq(rolesTable.name, roleName),
          isNull(rolesTable.deletedAt),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  }

  public async listRolesByTenant(companyId: string): Promise<DbRole[]> {
    const db = Db1Connection.getInstance();
    return db
      .select()
      .from(rolesTable)
      .where(
        and(eq(rolesTable.companyId, companyId), isNull(rolesTable.deletedAt)),
      )
      .orderBy(desc(rolesTable.priority), rolesTable.name);
  }

  public async listRolePermissionIds(roleId: string): Promise<string[]> {
    const db = Db1Connection.getInstance();
    const rows = await db
      .select({ permissionId: rolePermissionsTable.permissionId })
      .from(rolePermissionsTable)
      .where(eq(rolePermissionsTable.roleId, roleId));

    return rows
      .map((row) => row.permissionId)
      .filter((permissionId): permissionId is string => Boolean(permissionId));
  }

  public async assignPerms(
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    if (!permissionIds.length) {
      return;
    }

    const db = Db1Connection.getInstance();
    await db.insert(rolePermissionsTable).values(
      permissionIds.map((permissionId) => ({
        id: randomUUID(),
        roleId,
        permissionId,
        createdAt: new Date(),
      })),
    );
  }

  public async assignRole(
    userId: string,
    roleId: string,
    assignedBy: string,
  ): Promise<void> {
    const db = Db1Connection.getInstance();
    await db.insert(userRolesTable).values({
      id: randomUUID(),
      userId,
      roleId,
      assignedBy,
      assignedAt: new Date(),
    });
  }

  public async listUserRoles(
    userId: string,
    companyId?: string,
  ): Promise<DbRole[]> {
    const db = Db1Connection.getInstance();
    const conditions = [
      eq(userRolesTable.userId, userId),
      isNull(rolesTable.deletedAt),
    ];

    if (companyId) {
      conditions.push(eq(rolesTable.companyId, companyId));
    }

    return db
      .select({
        id: rolesTable.id,
        companyId: rolesTable.companyId,
        name: rolesTable.name,
        description: rolesTable.description,
        color: rolesTable.color,
        priority: rolesTable.priority,
        icon: rolesTable.icon,
        isSystemRole: rolesTable.isSystemRole,
        isDefaultRole: rolesTable.isDefaultRole,
        canBeDeleted: rolesTable.canBeDeleted,
        createdBy: rolesTable.createdBy,
        parentRoleId: rolesTable.parentRoleId,
        isRetired: rolesTable.isRetired,
        createdAt: rolesTable.createdAt,
        updatedAt: rolesTable.updatedAt,
        deletedAt: rolesTable.deletedAt,
      })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(and(...conditions));
  }

  public async listUserPerms(
    userId: string,
    companyId?: string,
  ): Promise<DbPerm[]> {
    const db = Db1Connection.getInstance();
    const conditions = [
      eq(userRolesTable.userId, userId),
      isNull(rolesTable.deletedAt),
    ];

    if (companyId) {
      conditions.push(eq(rolesTable.companyId, companyId));
    }

    const rows = await db
      .select({
        id: permissionsTable.id,
        permissionGroupId: permissionsTable.permissionGroupId,
        module: permissionsTable.module,
        resource: permissionsTable.resource,
        action: permissionsTable.action,
        permissionKey: permissionsTable.permissionKey,
        description: permissionsTable.description,
        createdAt: permissionsTable.createdAt,
      })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .innerJoin(
        rolePermissionsTable,
        eq(rolePermissionsTable.roleId, rolesTable.id),
      )
      .innerJoin(
        permissionsTable,
        eq(permissionsTable.id, rolePermissionsTable.permissionId),
      )
      .where(and(...conditions));

    const dedup = new Map<string, DbPerm>();
    for (const row of rows) {
      dedup.set(row.permissionKey ?? "", row);
    }

    return [...dedup.values()].filter((perm) => perm.permissionKey !== null);
  }
}
