import { boolean, date, integer, jsonb, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar, } from "drizzle-orm/pg-core";
export const companiesTable = pgTable("companies", {
    id: uuid("id").primaryKey(),
    userId: uuid("owner_user_id").references(() => usersTable.id),
    code: varchar("code").notNull().unique(),
    name: varchar("name").notNull(),
    slug: varchar("slug").notNull().unique(),
    legalName: varchar("legal_name"),
    industry: varchar("industry"),
    companySize: varchar("company_size"),
    website: varchar("website"),
    businessType: varchar("business_type"),
    taxNumber: varchar("tax_number"),
    country: varchar("country"),
    stateProvince: varchar("state_province"),
    city: varchar("city"),
    postalCode: varchar("postal_code"),
    primaryEmail: varchar("primary_email"),
    primaryPhone: varchar("primary_phone"),
    tenantType: varchar("company_type"),
    subscriptionPlanId: uuid("subscription_plan_id"),
    status: varchar("status"),
    onboardingStatus: varchar("onboarding_status"),
    trialStartsAt: timestamp("trial_starts_at"),
    trialEndsAt: timestamp("trial_ends_at"),
    activatedAt: timestamp("activated_at"),
    suspendedAt: timestamp("suspended_at"),
    lastActivityAt: timestamp("last_activity_at"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
    deletedAt: timestamp("deleted_at"),
    version: integer("version"),
});
export const companySettingsTable = pgTable("company_settings", {
    id: uuid("id").primaryKey(),
    companyId: uuid("company_id")
        .unique()
        .references(() => companiesTable.id),
    timezone: varchar("timezone"),
    defaultCurrencyCode: varchar("default_currency_code"),
    dateFormat: varchar("date_format"),
    timeFormat: varchar("time_format"),
    languageCode: varchar("language_code"),
    logoUrl: varchar("logo_url"),
    faviconUrl: varchar("favicon_url"),
    themeColor: varchar("theme_color"),
    enableMfa: boolean("enable_mfa"),
    enableSso: boolean("enable_sso"),
    enableApiAccess: boolean("enable_api_access"),
    enableCustomRoles: boolean("enable_custom_roles"),
    enableMultiCompany: boolean("enable_multi_company"),
    enableMultiWarehouse: boolean("enable_multi_warehouse"),
    enableAuditExports: boolean("enable_audit_exports"),
    enableWebhooks: boolean("enable_webhooks"),
    defaultSessionTimeoutMinutes: integer("default_session_timeout_minutes"),
    mfaTrustWindowMinutes: integer("mfa_trust_window_minutes"),
    passwordExpiryDays: integer("password_expiry_days"),
    maxFailedLoginAttempts: integer("max_failed_login_attempts"),
    lockoutDurationMinutes: integer("lockout_duration_minutes"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});
export const usersTable = pgTable("users", {
    id: uuid("id").primaryKey(),
    companyId: uuid("company_id"),
    globalIdentityKey: varchar("global_identity_key").unique(),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    displayName: varchar("display_name"),
    email: varchar("email").unique(),
    phone: varchar("phone"),
    username: varchar("username").unique(),
    passwordHash: varchar("password_hash"),
    passwordSalt: varchar("password_salt"),
    avatarUrl: varchar("avatar_url"),
    isEmailVerified: boolean("is_email_verified"),
    isPhoneVerified: boolean("is_phone_verified"),
    isMfaEnabled: boolean("is_mfa_enabled"),
    isSsoUser: boolean("is_sso_user"),
    preferredMfaMethod: varchar("preferred_mfa_method"),
    lastLoginAt: timestamp("last_login_at"),
    lastPasswordChangedAt: timestamp("last_password_changed_at"),
    failedLoginAttempts: integer("failed_login_attempts"),
    lastFailedLoginAt: timestamp("last_failed_login_at"),
    lockedUntil: timestamp("locked_until"),
    status: varchar("status"),
    userType: varchar("user_type"),
    profileStatus: varchar("profile_status"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
    deletedAt: timestamp("deleted_at"),
    version: integer("version"),
});
export const userProfilesTable = pgTable("user_profiles", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
        .unique()
        .references(() => usersTable.id),
    timezone: varchar("timezone"),
    preferredLanguage: varchar("language_code", { length: 10 }).default("en"), // 'en', 'hi', 'mr', 'gu', 'te'
    dateFormat: varchar("date_format"),
    timeFormat: varchar("time_format"),
    dashboardLayout: jsonb("dashboard_layout"),
    sidebarPreferences: jsonb("sidebar_preferences"),
    notificationPreferences: jsonb("notification_preferences"),
    themePreference: varchar("theme_preference"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});
export const userDevicesTable = pgTable("user_devices", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").references(() => usersTable.id),
    deviceIdentifier: varchar("device_identifier"),
    deviceName: varchar("device_name"),
    deviceType: varchar("device_type"),
    operatingSystem: varchar("operating_system"),
    browser: varchar("browser"),
    ipAddress: varchar("ip_address"),
    country: varchar("country"),
    city: varchar("city"),
    isTrusted: boolean("is_trusted"),
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at"),
});
export const mfaDevicesTable = pgTable("mfa_devices", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").references(() => usersTable.id),
    mfaType: varchar("mfa_type"),
    secretHash: varchar("secret_hash"),
    phoneNumber: varchar("phone_number"),
    email: varchar("email"),
    isPrimary: boolean("is_primary"),
    verifiedAt: timestamp("verified_at"),
    createdAt: timestamp("created_at"),
});
export const mfaTrustSessionsTable = pgTable("mfa_trust_sessions", {
    id: uuid("id").primaryKey(),
    companyId: uuid("company_id").references(() => companiesTable.id),
    userId: uuid("user_id").references(() => usersTable.id),
    deviceId: varchar("device_id"),
    browserFingerprint: varchar("browser_fingerprint"),
    deviceFingerprint: varchar("device_fingerprint"),
    trustTokenHash: varchar("trust_token_hash"),
    sessionId: uuid("session_id").references(() => sessionsTable.id),
    trustedAt: timestamp("trusted_at"),
    expiresAt: timestamp("expires_at"),
    revokedAt: timestamp("revoked_at"),
    createdIp: varchar("created_ip"),
    lastSeenIp: varchar("last_seen_ip"),
    riskScore: integer("risk_score"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});
export const backupCodesTable = pgTable("backup_codes", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").references(() => usersTable.id),
    codeHash: varchar("code_hash"),
    isUsed: boolean("is_used"),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at"),
});
export const passwordResetTokensTable = pgTable("password_reset_tokens", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").references(() => usersTable.id),
    tokenHash: varchar("token_hash"),
    expiresAt: timestamp("expires_at"),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at"),
});
export const passwordHistoriesTable = pgTable("password_histories", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").references(() => usersTable.id),
    passwordHash: varchar("password_hash"),
    passwordSalt: varchar("password_salt"),
    createdAt: timestamp("created_at"),
});
export const passwordResetSessionsTable = pgTable("password_reset_sessions", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").references(() => usersTable.id),
    tokenHash: varchar("token_hash"),
    used: boolean("used").default(false),
    usedAt: timestamp("used_at"),
    invalidatedAt: timestamp("invalidated_at"),
    ipAddress: varchar("ip_address"),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at"),
});
export const sessionsTable = pgTable("sessions", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").references(() => usersTable.id),
    deviceId: uuid("device_id").references(() => userDevicesTable.id),
    refreshTokenHash: varchar("refresh_token_hash"),
    accessTokenJti: varchar("access_token_jti"),
    ipAddress: varchar("ip_address"),
    deviceType: varchar("device_type"),
    browser: varchar("browser"),
    operatingSystem: varchar("operating_system"),
    country: varchar("country"),
    city: varchar("city"),
    loginMethod: varchar("login_method"),
    loginProvider: varchar("login_provider"),
    lastActiveAt: timestamp("last_active_at"),
    expiresAt: timestamp("expires_at"),
    revokedAt: timestamp("revoked_at"),
    revokedReason: varchar("revoked_reason"),
    createdAt: timestamp("created_at"),
});
export const loginAttemptsTable = pgTable("login_attempts", {
    id: uuid("id").primaryKey(),
    companyId: uuid("company_id").references(() => companiesTable.id),
    userId: uuid("user_id").references(() => usersTable.id),
    email: varchar("email"),
    ipAddress: varchar("ip_address"),
    userAgent: text("user_agent"),
    isSuccessful: boolean("is_successful"),
    failureReason: varchar("failure_reason"),
    attemptedAt: timestamp("attempted_at"),
});
export const rolesTable = pgTable("roles", {
    id: uuid("id").primaryKey(),
    companyId: uuid("company_id").references(() => companiesTable.id),
    name: varchar("name"),
    description: text("description"),
    color: varchar("color"),
    priority: integer("priority"),
    icon: varchar("icon"),
    isSystemRole: boolean("is_system_role"),
    isDefaultRole: boolean("is_default_role"),
    canBeDeleted: boolean("can_be_deleted"),
    createdBy: uuid("created_by").references(() => usersTable.id),
    parentRoleId: uuid("parent_role_id").references(() => rolesTable.id),
    isRetired: boolean("is_retired").default(false),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
    deletedAt: timestamp("deleted_at"),
});
export const permissionGroupsTable = pgTable("permission_groups", {
    id: uuid("id").primaryKey(),
    moduleName: varchar("module_name"),
    displayName: varchar("display_name"),
    description: text("description"),
    sortOrder: integer("sort_order"),
});
export const permissionsTable = pgTable("permissions", {
    id: uuid("id").primaryKey(),
    permissionGroupId: uuid("permission_group_id").references(() => permissionGroupsTable.id),
    module: varchar("module"),
    resource: varchar("resource"),
    action: varchar("action"),
    permissionKey: varchar("permission_key").unique(),
    description: text("description"),
    createdAt: timestamp("created_at"),
});
export const rolePermissionsTable = pgTable("role_permissions", {
    id: uuid("id").primaryKey(),
    roleId: uuid("role_id").references(() => rolesTable.id),
    permissionId: uuid("permission_id").references(() => permissionsTable.id),
    createdAt: timestamp("created_at"),
});
export const userRolesTable = pgTable("user_roles", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").references(() => usersTable.id),
    roleId: uuid("role_id").references(() => rolesTable.id),
    companyId: uuid("company_id").references(() => companiesTable.id),
    branchId: uuid("branch_id"),
    warehouseScopeId: uuid("warehouse_scope_id"),
    startsAt: timestamp("starts_at"),
    endsAt: timestamp("ends_at"),
    assignedBy: uuid("assigned_by").references(() => usersTable.id),
    assignedAt: timestamp("assigned_at"),
});
export const teamsTable = pgTable("teams", {
    id: uuid("id").primaryKey(),
    companyId: uuid("company_id").references(() => companiesTable.id),
    teamName: varchar("team_name"),
    teamCode: varchar("team_code"),
    description: text("description"),
    managerUserId: uuid("manager_user_id").references(() => usersTable.id),
    createdBy: uuid("created_by").references(() => usersTable.id),
    createdAt: timestamp("created_at"),
});
export const teamMembersTable = pgTable("team_members", {
    id: uuid("id").primaryKey(),
    teamId: uuid("team_id").references(() => teamsTable.id),
    userId: uuid("user_id").references(() => usersTable.id),
    joinedAt: timestamp("joined_at"),
});
export const subscriptionPlansTable = pgTable("subscription_plans", {
    id: uuid("id").primaryKey(),
    name: varchar("name"),
    code: varchar("code"),
    description: text("description"),
    monthlyPrice: numeric("monthly_price"),
    annualPrice: numeric("annual_price"),
    currencyCode: varchar("currency_code"),
    monthlyDurationMonths: integer("monthly_duration_months"),
    annualDurationMonths: integer("annual_duration_months"),
    maxUsers: integer("max_users"),
    maxWarehouses: integer("max_warehouses"),
    maxCompanies: integer("max_companies"),
    maxOrganizations: integer("max_organizations"),
    maxProducts: integer("max_products"),
    maxSuppliers: integer("max_suppliers"),
    maxCustomers: integer("max_customers"),
    maxPurchaseOrders: integer("max_purchase_orders"),
    maxSalesOrders: integer("max_sales_orders"),
    maxApiKeys: integer("max_api_keys"),
    maxWebhooks: integer("max_webhooks"),
    maxIntegrations: integer("max_integrations"),
    maxApiRequestsPerMonth: integer("max_api_requests_per_month"),
    maxStorageGb: integer("max_storage_gb"),
    supportsApi: boolean("supports_api"),
    supportsSso: boolean("supports_sso"),
    supportsCustomRoles: boolean("supports_custom_roles"),
    supportsMultiEntity: boolean("supports_multi_entity"),
    supportsAdvancedReporting: boolean("supports_advanced_reporting"),
    supportsSandbox: boolean("supports_sandbox"),
    enterpriseEnabled: boolean("enterprise_enabled"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});
export const subscriptionsTable = pgTable("subscriptions", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").references(() => usersTable.id),
    subscriptionPlanId: uuid("subscription_plan_id").references(() => subscriptionPlansTable.id),
    subscriptionNumber: varchar("subscription_number"),
    billingCycle: varchar("billing_cycle"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    renewalDate: date("renewal_date"),
    trialEndsAt: timestamp("trial_ends_at"),
    autoRenew: boolean("auto_renew"),
    status: varchar("status"),
    cancelledAt: timestamp("cancelled_at"),
    cancellationReason: text("cancellation_reason"),
    createdAt: timestamp("created_at"),
});
export const companyFeatureFlagsTable = pgTable("company_feature_flags", {
    id: uuid("id").primaryKey(),
    companyId: uuid("company_id").references(() => companiesTable.id),
    featureKey: varchar("feature_key"),
    featureName: varchar("feature_name"),
    isEnabled: boolean("is_enabled"),
    enabledBy: uuid("enabled_by").references(() => usersTable.id),
    createdAt: timestamp("created_at"),
});
export const auditLogsTable = pgTable("audit_logs", {
    id: uuid("id").primaryKey(),
    companyId: uuid("company_id").references(() => companiesTable.id),
    userId: uuid("user_id").references(() => usersTable.id),
    moduleName: varchar("module_name"),
    entityType: varchar("entity_type"),
    entityId: uuid("entity_id"),
    action: varchar("action"),
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    ipAddress: varchar("ip_address"),
    userAgent: text("user_agent"),
    correlationId: varchar("correlation_id"),
    createdAt: timestamp("created_at"),
});
export const invitationsTable = pgTable("invitations", {
    id: uuid("id").primaryKey(),
    companyId: uuid("company_id").references(() => companiesTable.id),
    email: varchar("email").notNull(),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    roleId: uuid("role_id").references(() => rolesTable.id),
    warehouseAccess: jsonb("warehouse_access"),
    message: text("message"),
    token: varchar("token").unique().notNull(),
    invitedBy: uuid("invited_by").references(() => usersTable.id),
    status: varchar("status").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});
export const roleWarehouseAccessTable = pgTable("role_warehouse_access", {
    id: uuid("id").primaryKey(),
    companyId: uuid("company_id").references(() => companiesTable.id),
    roleId: uuid("role_id").references(() => rolesTable.id),
    allWarehouses: boolean("all_warehouses").default(false),
    warehouseIds: jsonb("warehouse_ids"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});
export const userWarehouseAccessTable = pgTable("user_warehouse_access", {
    id: uuid("id").primaryKey(),
    companyId: uuid("company_id").references(() => companiesTable.id),
    userId: uuid("user_id").references(() => usersTable.id),
    allWarehouses: boolean("all_warehouses").default(false),
    warehouseIds: jsonb("warehouse_ids"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});
// ==========================================
// KRISHIPATH CORE AGRITECH SCHEMAS (PHASE 2)
// ==========================================
export const statesTable = pgTable("states", {
    id: uuid("id").primaryKey(),
    name: varchar("name").notNull().unique(),
    status: varchar("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const districtsTable = pgTable("districts", {
    id: uuid("id").primaryKey(),
    stateId: uuid("state_id").notNull().references(() => statesTable.id),
    name: varchar("name").notNull(),
    status: varchar("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const mandisTable = pgTable("mandis", {
    id: uuid("id").primaryKey(),
    code: varchar("code").unique(), // e.g. MANDI_000001
    slug: varchar("slug").unique(), // e.g. indore-agriculture-market
    stateId: uuid("state_id").notNull().references(() => statesTable.id),
    districtId: uuid("district_id").notNull().references(() => districtsTable.id),
    name: varchar("name").notNull(),
    address: text("address"),
    latitude: numeric("latitude"),
    longitude: numeric("longitude"),
    openingTime: varchar("opening_time"),
    closingTime: varchar("closing_time"),
    workingDays: jsonb("working_days"), // ['MON','TUE','WED','THU','FRI','SAT']
    description: text("description"),
    imageUrls: jsonb("image_urls"), // string[]
    currency: varchar("currency").notNull().default("INR"),
    defaultUnit: varchar("default_unit").notNull().default("QUINTAL"), // QUINTAL | KG | TON
    defaultLanguageCode: varchar("default_language_code", { length: 10 }).default("hi"),
    weatherMappingData: jsonb("weather_mapping_data"), // { stationId, lat, lng }
    aiPredictionEnabled: boolean("ai_prediction_enabled").notNull().default(false),
    notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
    priceVisibility: varchar("price_visibility").notNull().default("PUBLIC"), // PUBLIC | REGISTERED | PRIVATE
    analyticsEnabled: boolean("analytics_enabled").notNull().default(true),
    status: varchar("status").notNull().default("ACTIVE"), // ACTIVE | INACTIVE | SEASONAL | MAINTENANCE | ARCHIVED
    archivedAt: timestamp("archived_at"),
    createdBy: uuid("created_by").references(() => usersTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const productsTable = pgTable("products", {
    id: uuid("id").primaryKey(),
    code: varchar("code").unique(), // e.g. CROP_000001
    name: varchar("name").notNull().unique(), // English canonical name
    slug: varchar("slug").unique(),
    category: varchar("category").notNull(), // kept for legacy compat
    categoryId: uuid("category_id"), // FK to master_data_items
    subcategoryId: uuid("subcategory_id"), // FK to master_data_items
    aliases: jsonb("aliases").default("[]"), // Crop Master dictionary
    description: text("description"),
    imageUrl: varchar("image_url"),
    status: varchar("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
// Platform-level reference values managed from the admin console.  Keeping
// these in one table makes categories, grades, units and languages consistent
// without inventing an artificial product hierarchy.
export const productVariantsTable = pgTable("product_variants", {
    id: uuid("id").primaryKey(),
    productId: uuid("product_id").notNull().references(() => productsTable.id),
    gradeName: varchar("grade_name").notNull(),
    unit: varchar("unit").notNull(),
    status: varchar("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
// ── Product Classifications ────────────────────────────────────────────────────
// Each product can have multiple classifications (e.g. "Red Onion", "White Onion")
export const productClassificationsTable = pgTable("product_classifications", {
    id: uuid("id").primaryKey(),
    productId: uuid("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
    name: varchar("name").notNull(), // e.g. "Red Onion"
    minPrice: numeric("min_price"),
    maxPrice: numeric("max_price"),
    unitId: uuid("unit_id"), // FK to master_data_items (unit type)
    sortOrder: integer("sort_order").default(0),
    status: varchar("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
// ── Product Classification Variants ───────────────────────────────────────────
// Each classification has variants (Super, Average, Golta…) with individual price ranges
export const productClassificationVariantsTable = pgTable("product_classification_variants", {
    id: uuid("id").primaryKey(),
    classificationId: uuid("classification_id").notNull().references(() => productClassificationsTable.id, { onDelete: "cascade" }),
    name: varchar("name").notNull(), // e.g. "Super"
    minPrice: numeric("min_price"),
    maxPrice: numeric("max_price"),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
// ── Product Aliases ───────────────────────────────────────────────────────────
// Local names and alternate spellings (Pyaj, प्याज, ಈರುಳ್ಳಿ…)
export const productAliasesTable = pgTable("product_aliases", {
    id: uuid("id").primaryKey(),
    productId: uuid("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
    alias: varchar("alias").notNull(),
    lang: varchar("lang", { length: 10 }), // optional lang tag
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
// ── Product Mandi Assignments ─────────────────────────────────────────────────
// Which mandis carry a given product
export const productMandiAssignmentsTable = pgTable("product_mandi_assignments", {
    id: uuid("id").primaryKey(),
    productId: uuid("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
    mandiId: uuid("mandi_id").notNull().references(() => mandisTable.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
    uniqueProductMandi: uniqueIndex("product_mandi_assignments_unique").on(t.productId, t.mandiId),
}));
export const masterDataItemsTable = pgTable("master_data_items", {
    id: uuid("id").primaryKey(),
    type: varchar("type", { length: 40 }).notNull(),
    name: varchar("name").notNull(),
    code: varchar("code", { length: 40 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 20 }).notNull().default("ACTIVE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
    typeCodeUnique: uniqueIndex("master_data_items_type_code_unique").on(table.type, table.code),
}));
export const farmersTable = pgTable("farmers", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").notNull().references(() => usersTable.id),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    phone: varchar("phone").notNull().unique(),
    stateId: uuid("state_id").references(() => statesTable.id),
    districtId: uuid("district_id").references(() => districtsTable.id),
    village: varchar("village"),
    preferredMandiId: uuid("preferred_mandi_id").references(() => mandisTable.id),
    landSizeAcres: numeric("land_size_acres"),
    irrigationType: varchar("irrigation_type"),
    soilType: varchar("soil_type"),
    experienceYears: integer("experience_years"),
    aadhaarNumber: varchar("aadhaar_number"),
    pmKisanId: varchar("pm_kisan_id"),
    kccNumber: varchar("kcc_number"),
    alternatePhone: varchar("alternate_phone"),
    dob: date("dob"),
    gender: varchar("gender"),
    profilePhotoUrl: varchar("profile_photo_url"),
    profileStatus: varchar("profile_status").notNull().default("INCOMPLETE"), // INCOMPLETE, COMPLETE
    gpsLat: numeric("gps_lat"),
    gpsLng: numeric("gps_lng"),
    gpsConsent: boolean("gps_consent").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const farmerCropsTable = pgTable("farmer_crops", {
    id: uuid("id").primaryKey(),
    farmerId: uuid("farmer_id").notNull().references(() => farmersTable.id),
    productId: uuid("crop_id").notNull().references(() => productsTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const farmerMandisTable = pgTable("farmer_mandis", {
    id: uuid("id").primaryKey(),
    farmerId: uuid("farmer_id").notNull().references(() => farmersTable.id),
    mandiId: uuid("mandi_id").notNull().references(() => mandisTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const farmerMarketWatchlistTable = pgTable("farmer_market_watchlist", {
    id: uuid("id").primaryKey().defaultRandom(),
    farmerId: uuid("farmer_id").notNull().references(() => farmersTable.id, { onDelete: "cascade" }),
    mandiId: uuid("mandi_id").notNull().references(() => mandisTable.id, { onDelete: "cascade" }),
    productId: uuid("crop_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
    uniqueFarmerMarketWatch: uniqueIndex("farmer_market_watchlist_unique")
        .on(table.farmerId, table.mandiId, table.productId),
}));
export const farmerCalendarEventsTable = pgTable("farmer_calendar_events", {
    id: uuid("id").primaryKey().defaultRandom(),
    farmerId: uuid("farmer_id").notNull().references(() => farmersTable.id, { onDelete: "cascade" }),
    productId: uuid("crop_id").references(() => productsTable.id),
    eventDate: date("event_date").notNull(),
    eventType: varchar("event_type").notNull().default("FARM_ACTIVITY"),
    title: varchar("title").notNull(),
    description: text("description"),
    status: varchar("status").notNull().default("SCHEDULED"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const farmerTasksTable = pgTable("farmer_tasks", {
    id: uuid("id").primaryKey().defaultRandom(),
    farmerId: uuid("farmer_id").notNull().references(() => farmersTable.id, { onDelete: "cascade" }),
    productId: uuid("crop_id").references(() => productsTable.id),
    title: varchar("title").notNull(),
    description: text("description"),
    dueDate: date("due_date").notNull(),
    priority: varchar("priority").notNull().default("MEDIUM"),
    status: varchar("status").notNull().default("PENDING"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const tradersTable = pgTable("traders", {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").notNull().references(() => usersTable.id),
    shopName: varchar("shop_name").notNull(),
    licenseNumber: varchar("license_number"),
    primaryMandiId: uuid("primary_mandi_id").notNull().references(() => mandisTable.id),
    cropSpecializations: jsonb("crop_specializations"),
    verificationStatus: varchar("verification_status").notNull().default("PENDING"), // PENDING, APPROVED, REJECTED
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const traderMandiPricesTable = pgTable("trader_mandi_prices", {
    id: uuid("id").primaryKey(),
    traderId: uuid("trader_id").notNull().references(() => tradersTable.id),
    mandiId: uuid("mandi_id").notNull().references(() => mandisTable.id),
    // Database column is crop_id. Keep the variantId property name for legacy
    // service compatibility, but it references the product (not a grade row).
    variantId: uuid("crop_id").notNull().references(() => productsTable.id),
    pricePerQuintal: numeric("price_per_quintal").notNull(),
    priceDate: date("price_date").notNull().defaultNow(),
    grade: varchar("grade"),
    updatedBy: uuid("updated_by").notNull().references(() => usersTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
    unq_trader_mandi_crop: uniqueIndex("unq_trader_mandi_variant").on(t.traderId, t.mandiId, t.variantId)
}));
export const mandiPriceHistoryTable = pgTable("mandi_price_history", {
    id: uuid("id").primaryKey(),
    traderId: uuid("trader_id").references(() => tradersTable.id), // Null if updated by Admin directly
    mandiId: uuid("mandi_id").notNull().references(() => mandisTable.id),
    variantId: uuid("crop_id").notNull().references(() => productsTable.id),
    pricePerQuintal: numeric("price_per_quintal").notNull(),
    updatedBy: uuid("updated_by").notNull().references(() => usersTable.id),
    recordedAt: timestamp("recorded_at").notNull().defaultNow(),
});
export const marketInsightsTable = pgTable("market_insights", {
    id: uuid("id").primaryKey(),
    productId: uuid("crop_id").notNull().references(() => productsTable.id),
    mandiId: uuid("mandi_id").references(() => mandisTable.id), // Null for broader scope
    scope: varchar("scope").notNull(), // NATIONAL, STATE, DISTRICT, MANDI
    recommendation: varchar("recommendation").notNull(), // SELL, HOLD, WAIT
    currentPrice: numeric("current_price"),
    targetPrice: numeric("target_price"),
    expectedRangeMin: numeric("expected_range_min"),
    expectedRangeMax: numeric("expected_range_max"),
    delta: numeric("delta"),
    confidencePercent: integer("confidence_percent"),
    summary: text("summary"),
    positiveFactors: jsonb("positive_factors"),
    riskFactors: jsonb("risk_factors"),
    bestWindowFrom: date("best_window_from"),
    bestWindowTo: date("best_window_to"),
    expectedDuration: varchar("expected_duration"),
    weatherImpact: jsonb("weather_impact"),
    storageAdvice: text("storage_advice"),
    storageExpectedGainMin: numeric("storage_expected_gain_min"),
    storageExpectedGainMax: numeric("storage_expected_gain_max"),
    chartDataUrl: varchar("chart_data_url"),
    featuredImageUrl: varchar("featured_image_url"),
    publishAt: timestamp("publish_at"),
    expiresAt: timestamp("expires_at"),
    status: varchar("status").notNull().default("DRAFT"), // DRAFT, PUBLISHED, ARCHIVED
    source: varchar("source").notNull().default("ADMIN"), // ADMIN, AI
    version: integer("version").notNull().default(1),
    createdBy: uuid("created_by").notNull().references(() => usersTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
// ==========================================
// PHASE 3 - GAMIFICATION & REWARDS
// ==========================================
export const krishiPointsLedgerTable = pgTable("krishi_points_ledger", {
    id: uuid("id").primaryKey(),
    farmerId: uuid("farmer_id").notNull().references(() => farmersTable.id),
    actionId: varchar("action_id").notNull(), // e.g. "DAILY_LOGIN", "AI_CHAT", "REEL_VIEW"
    points: integer("points").notNull(),
    description: varchar("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const farmerWalletsTable = pgTable("farmer_wallets", {
    farmerId: uuid("farmer_id").primaryKey().references(() => farmersTable.id),
    balance: integer("balance").notNull().default(0),
    lifetimeEarned: integer("lifetime_earned").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const rewardCatalogTable = pgTable("reward_catalog", {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 80 }).notNull().unique(),
    title: varchar("title").notNull(),
    description: text("description"),
    pointsCost: integer("points_cost").notNull(),
    icon: varchar("icon", { length: 16 }),
    stock: integer("stock"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const rewardRedemptionsTable = pgTable("reward_redemptions", {
    id: uuid("id").primaryKey().defaultRandom(),
    farmerId: uuid("farmer_id").notNull().references(() => farmersTable.id),
    catalogItemId: uuid("catalog_item_id").notNull().references(() => rewardCatalogTable.id),
    pointsCost: integer("points_cost").notNull(),
    status: varchar("status", { length: 30 }).notNull().default("REQUESTED"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
// ==========================================
// PHASE 3 - KRISHIGURU AI
// ==========================================
export const aiChatsTable = pgTable("ai_chats", {
    id: uuid("id").primaryKey(),
    farmerId: uuid("farmer_id").notNull().references(() => farmersTable.id),
    title: varchar("title"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const aiMessagesTable = pgTable("ai_messages", {
    id: uuid("id").primaryKey(),
    chatId: uuid("chat_id").notNull().references(() => aiChatsTable.id),
    role: varchar("role").notNull(), // "user" or "assistant"
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const aiUsageLogsTable = pgTable("ai_usage_logs", {
    id: uuid("id").primaryKey(),
    farmerId: uuid("farmer_id").notNull().references(() => farmersTable.id),
    date: date("date").notNull(),
    requestCount: integer("request_count").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
    return {
        unq_farmer_date: uniqueIndex("unq_farmer_date").on(table.farmerId, table.date),
    };
});
// ==========================================
// PART 13 — LOCALIZATION & MULTI-LANGUAGE
// ==========================================
export const languagesTable = pgTable("languages", {
    id: uuid("id").primaryKey(),
    code: varchar("code", { length: 10 }).notNull().unique(), // 'en', 'hi', 'mr', 'gu'
    name: varchar("name").notNull(), // English name: "Hindi"
    nativeName: varchar("native_name").notNull(), // Native: "हिन्दी"
    isRtl: boolean("is_rtl").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    isDefault: boolean("is_default").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const entityTranslationsTable = pgTable("entity_translations", {
    id: uuid("id").primaryKey(),
    entityType: varchar("entity_type").notNull(), // 'product', 'mandi', 'category', etc.
    entityId: uuid("entity_id").notNull(), // References the business record
    fieldName: varchar("field_name").notNull(), // 'name', 'description', 'summary'
    languageCode: varchar("language_code", { length: 10 }).notNull()
        .references(() => languagesTable.code),
    value: text("value").notNull(), // The translated text
    status: varchar("status").notNull().default("APPROVED"), // DRAFT | APPROVED | REVIEW_NEEDED
    translatedBy: uuid("translated_by")
        .references(() => usersTable.id), // null = AI / system
    reviewedBy: uuid("reviewed_by")
        .references(() => usersTable.id),
    reviewedAt: timestamp("reviewed_at"),
    aiGenerated: boolean("ai_generated").notNull().default(false),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
    unq_entity_field_lang: uniqueIndex("unq_entity_field_lang")
        .on(t.entityType, t.entityId, t.fieldName, t.languageCode),
}));
export const translationAuditLogTable = pgTable("translation_audit_log", {
    id: uuid("id").primaryKey(),
    translationId: uuid("translation_id")
        .notNull()
        .references(() => entityTranslationsTable.id),
    entityType: varchar("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    fieldName: varchar("field_name").notNull(),
    languageCode: varchar("language_code", { length: 10 }).notNull(),
    oldValue: text("old_value"),
    newValue: text("new_value").notNull(),
    action: varchar("action").notNull(), // CREATED | UPDATED | STATUS_CHANGED
    changedBy: uuid("changed_by")
        .references(() => usersTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
// ==========================================
// PART 3.5 — ENHANCED MANDI MANAGEMENT
// ==========================================
export const mandiProductsTable = pgTable("mandi_products", {
    id: uuid("id").primaryKey(),
    mandiId: uuid("mandi_id").notNull()
        .references(() => mandisTable.id),
    productId: uuid("crop_id").notNull()
        .references(() => productsTable.id),
    isEnabled: boolean("is_enabled").notNull().default(true),
    priceInitStrategy: varchar("price_init_strategy").notNull().default("EMPTY"), // EMPTY | COPY_FROM_MANDI | DEFAULT_VALUES
    sourcePriceMandiId: uuid("source_price_mandi_id")
        .references(() => mandisTable.id),
    enabledAt: timestamp("enabled_at").notNull().defaultNow(),
    disabledAt: timestamp("disabled_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
    unq_mandi_crop: uniqueIndex("unq_mandi_crop").on(t.mandiId, t.productId),
}));
export const mandiTraderAssignmentsTable = pgTable("mandi_trader_assignments", {
    id: uuid("id").primaryKey(),
    mandiId: uuid("mandi_id").notNull()
        .references(() => mandisTable.id),
    traderId: uuid("trader_id").notNull()
        .references(() => tradersTable.id),
    status: varchar("status").notNull().default("ACTIVE"), // ACTIVE | SUSPENDED | REMOVED
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
    removedAt: timestamp("removed_at"),
    notes: text("notes"),
    assignedBy: uuid("assigned_by")
        .references(() => usersTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
    unq_mandi_trader: uniqueIndex("unq_mandi_trader").on(t.mandiId, t.traderId),
}));
export const officialMandiPricesTable = pgTable("official_mandi_prices", {
    id: uuid("id").primaryKey(),
    mandiId: uuid("mandi_id").notNull()
        .references(() => mandisTable.id),
    cropId: uuid("crop_id").notNull()
        .references(() => productsTable.id),
    grade: varchar("grade"),
    unit: varchar("unit").notNull().default("QUINTAL"),
    priceMin: numeric("price_min"),
    priceMax: numeric("price_max"),
    priceModal: numeric("price_modal").notNull(), // Modal/official price
    priceDate: date("price_date").notNull(),
    arrivalQuantity: numeric("arrival_quantity"),
    arrivalUnit: varchar("arrival_unit"),
    source: varchar("source").notNull().default("ADMIN"), // ADMIN | GOVERNMENT_API
    setBy: uuid("set_by")
        .references(() => usersTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
    unq_official_price: uniqueIndex("unq_official_mandi_price")
        .on(t.mandiId, t.cropId, t.priceDate),
}));
export const mandiDuplicateJobsTable = pgTable("mandi_duplicate_jobs", {
    id: uuid("id").primaryKey(),
    sourceMandiId: uuid("source_mandi_id").notNull()
        .references(() => mandisTable.id),
    targetMandiId: uuid("target_mandi_id")
        .references(() => mandisTable.id), // null until created
    targetName: varchar("target_name").notNull(),
    copyOptions: jsonb("copy_options").notNull(), // { products, grades, attributes, settings, traders, prices }
    status: varchar("status").notNull().default("PENDING"), // PENDING | IN_PROGRESS | COMPLETED | FAILED
    error: text("error"),
    createdBy: uuid("created_by")
        .references(() => usersTable.id),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
// ==========================================
// MASTER DATA MANAGEMENT (MDM) & PIM
// ==========================================
export const conceptDictionaryTable = pgTable("concept_dictionary", {
    id: uuid("id").primaryKey(),
    entityType: varchar("entity_type").notNull(), // PRODUCT, VARIANT, CATEGORY, UNIT
    entityId: uuid("entity_id").notNull(),
    term: varchar("term").notNull(),
    languageCode: varchar("language_code"),
    traderId: uuid("trader_id").references(() => usersTable.id), // Link to usersTable for now (trader is a user)
    confidenceWeight: integer("confidence_weight").default(100),
});
export const traderParserProfilesTable = pgTable("trader_parser_profiles", {
    id: uuid("id").primaryKey(),
    traderId: uuid("trader_id").notNull().references(() => usersTable.id),
    separatorTokens: jsonb("separator_tokens"),
    aliasMappings: jsonb("alias_mappings"),
    confidenceRules: jsonb("confidence_rules"),
});
export const feedSourcesTable = pgTable("feed_sources", {
    id: uuid("id").primaryKey(),
    traderId: uuid("trader_id").notNull().references(() => usersTable.id),
    sourceType: varchar("source_type").notNull(), // WHATSAPP, PORTAL, API
    sourceIdentifier: varchar("source_identifier"),
});
export const rawMarketMessagesTable = pgTable("raw_market_messages", {
    id: uuid("id").primaryKey(),
    feedSourceId: uuid("feed_source_id").notNull().references(() => feedSourcesTable.id),
    rawText: text("raw_text").notNull(),
    receivedAt: timestamp("received_at").notNull(),
    extractedJson: jsonb("extracted_json"),
    parserVersion: varchar("parser_version"),
    confidenceScore: integer("confidence_score"),
    status: varchar("status"), // PENDING, PARSED, VALIDATION_FAILED, REJECTED, APPROVED
    validationErrors: jsonb("validation_errors"),
});
export const traderPriceHistoryTable = pgTable("trader_price_history", {
    id: uuid("id").primaryKey(),
    rawMessageId: uuid("raw_message_id").references(() => rawMarketMessagesTable.id),
    traderId: uuid("trader_id").references(() => usersTable.id),
    mandiId: uuid("mandi_id").notNull().references(() => mandisTable.id),
    variantId: uuid("variant_id").notNull().references(() => productVariantsTable.id),
    priceMin: numeric("price_min"),
    priceMax: numeric("price_max"),
    priceModal: numeric("price_modal").notNull(),
    confidenceScore: integer("confidence_score"),
    recordedAt: timestamp("recorded_at").notNull().defaultNow(),
    status: varchar("status").notNull().default("ACTIVE"),
});
export const priceAggregationsTable = pgTable("price_aggregations", {
    id: uuid("id").primaryKey(),
    mandiId: uuid("mandi_id").notNull().references(() => mandisTable.id),
    variantId: uuid("variant_id").notNull().references(() => productVariantsTable.id),
    date: timestamp("date").notNull(),
    liveAverage: numeric("live_average"),
    highestPrice: numeric("highest_price"),
    lowestPrice: numeric("lowest_price"),
    medianPrice: numeric("median_price"),
    activeTraderCount: integer("active_trader_count"),
    aggregatedAt: timestamp("aggregated_at").defaultNow(),
});
// ==========================================
// CONTENT MANAGEMENT (HOME SCREEN)
// ==========================================
export const contentSchemesTable = pgTable("content_schemes", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title").notNull(),
    description: text("description"),
    category: varchar("category"), // PM-KISAN, Kisan Credit, etc.
    state: varchar("state"), // e.g. "maharashtra"
    link: varchar("link"),
    imageUrl: varchar("image_url"),
    status: varchar("status").notNull().default("ACTIVE"), // ACTIVE, INACTIVE
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const contentPredictionsTable = pgTable("content_predictions", {
    id: uuid("id").primaryKey().defaultRandom(),
    cropId: uuid("crop_id").notNull().references(() => productsTable.id),
    mandiId: uuid("mandi_id").references(() => mandisTable.id), // Optional: if specific to mandi
    predictedPrice: numeric("predicted_price").notNull(),
    direction: varchar("direction").notNull(), // UP, DOWN, STABLE
    period: varchar("period").notNull(), // e.g., "Next 7 Days", "Next Month"
    confidence: integer("confidence").notNull(), // e.g., 85
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const contentPollsTable = pgTable("content_polls", {
    id: uuid("id").primaryKey().defaultRandom(),
    question: varchar("question").notNull(),
    region: varchar("region"), // e.g., "maharashtra"
    targetDistricts: jsonb("target_districts"), // array of strings
    isActive: boolean("is_active").notNull().default(true),
    totalVotes: integer("total_votes").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const contentPollOptionsTable = pgTable("content_poll_options", {
    id: uuid("id").primaryKey().defaultRandom(),
    pollId: uuid("poll_id").notNull().references(() => contentPollsTable.id, { onDelete: 'cascade' }),
    text: varchar("text").notNull(),
    votes: integer("votes").notNull().default(0),
});
export const contentPollVotesTable = pgTable("content_poll_votes", {
    id: uuid("id").primaryKey().defaultRandom(),
    pollId: uuid("poll_id").notNull().references(() => contentPollsTable.id, { onDelete: "cascade" }),
    optionId: uuid("option_id").notNull().references(() => contentPollOptionsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
    uniquePollUserVote: uniqueIndex("content_poll_votes_poll_user_unique").on(table.pollId, table.userId),
}));
export const contentCreatorsTable = pgTable("content_creators", {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerUserId: uuid("owner_user_id").unique().references(() => usersTable.id, { onDelete: "set null" }),
    name: varchar("name").notNull(),
    bio: text("bio"),
    avatarUrl: varchar("avatar_url"),
    specialty: varchar("specialty"), // e.g., "Organic Farming"
    followersK: numeric("followers_k").notNull().default('0'), // e.g., 14.5
    status: varchar("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const contentShortsTable = pgTable("content_shorts", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title").notNull(),
    videoUrl: varchar("video_url").notNull(),
    thumbnailUrl: varchar("thumbnail_url"),
    creatorId: uuid("creator_id").references(() => contentCreatorsTable.id),
    views: integer("views").notNull().default(0),
    likes: integer("likes").notNull().default(0),
    shares: integer("shares").notNull().default(0),
    language: varchar("language").default('hi'),
    status: varchar("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const contentShortReactionsTable = pgTable("content_short_reactions", {
    id: uuid("id").primaryKey().defaultRandom(),
    shortId: uuid("short_id").notNull().references(() => contentShortsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
    uniqueShortReaction: uniqueIndex("content_short_reactions_unique").on(table.shortId, table.userId),
}));
export const contentShortSavesTable = pgTable("content_short_saves", {
    id: uuid("id").primaryKey().defaultRandom(),
    shortId: uuid("short_id").notNull().references(() => contentShortsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
    uniqueShortSave: uniqueIndex("content_short_saves_unique").on(table.shortId, table.userId),
}));
export const contentCreatorFollowsTable = pgTable("content_creator_follows", {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id").notNull().references(() => contentCreatorsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
    uniqueCreatorFollow: uniqueIndex("content_creator_follows_unique").on(table.creatorId, table.userId),
}));
export const contentShortCommentsTable = pgTable("content_short_comments", {
    id: uuid("id").primaryKey().defaultRandom(),
    shortId: uuid("short_id").notNull().references(() => contentShortsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    status: varchar("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
