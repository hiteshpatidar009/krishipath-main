CREATE TABLE "ai_chats" (
	"id" uuid PRIMARY KEY NOT NULL,
	"farmer_id" uuid NOT NULL,
	"title" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"chat_id" uuid NOT NULL,
	"role" varchar NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"farmer_id" uuid NOT NULL,
	"date" date NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"user_id" uuid,
	"module_name" varchar,
	"entity_type" varchar,
	"entity_id" uuid,
	"action" varchar,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" varchar,
	"user_agent" text,
	"correlation_id" varchar,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "backup_codes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"code_hash" varchar,
	"is_used" boolean,
	"used_at" timestamp,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"legal_name" varchar,
	"industry" varchar,
	"company_size" varchar,
	"website" varchar,
	"business_type" varchar,
	"tax_number" varchar,
	"country" varchar,
	"state_province" varchar,
	"city" varchar,
	"postal_code" varchar,
	"primary_email" varchar,
	"primary_phone" varchar,
	"company_type" varchar,
	"subscription_plan_id" uuid,
	"status" varchar,
	"onboarding_status" varchar,
	"trial_starts_at" timestamp,
	"trial_ends_at" timestamp,
	"activated_at" timestamp,
	"suspended_at" timestamp,
	"last_activity_at" timestamp,
	"created_at" timestamp,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	"version" integer,
	CONSTRAINT "companies_code_unique" UNIQUE("code"),
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "company_feature_flags" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"feature_key" varchar,
	"feature_name" varchar,
	"is_enabled" boolean,
	"enabled_by" uuid,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "company_settings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"timezone" varchar,
	"default_currency_code" varchar,
	"date_format" varchar,
	"time_format" varchar,
	"language_code" varchar,
	"logo_url" varchar,
	"favicon_url" varchar,
	"theme_color" varchar,
	"enable_mfa" boolean,
	"enable_sso" boolean,
	"enable_api_access" boolean,
	"enable_custom_roles" boolean,
	"enable_multi_company" boolean,
	"enable_multi_warehouse" boolean,
	"enable_audit_exports" boolean,
	"enable_webhooks" boolean,
	"default_session_timeout_minutes" integer,
	"mfa_trust_window_minutes" integer,
	"password_expiry_days" integer,
	"max_failed_login_attempts" integer,
	"lockout_duration_minutes" integer,
	"created_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "company_settings_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "concept_dictionary" (
	"id" uuid PRIMARY KEY NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" uuid NOT NULL,
	"term" varchar NOT NULL,
	"language_code" varchar,
	"trader_id" uuid,
	"confidence_weight" integer DEFAULT 100
);
--> statement-breakpoint
CREATE TABLE "districts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"state_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"status" varchar DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entity_translations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" uuid NOT NULL,
	"field_name" varchar NOT NULL,
	"language_code" varchar(10) NOT NULL,
	"value" text NOT NULL,
	"status" varchar DEFAULT 'APPROVED' NOT NULL,
	"translated_by" uuid,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farmer_crops" (
	"id" uuid PRIMARY KEY NOT NULL,
	"farmer_id" uuid NOT NULL,
	"crop_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farmer_mandis" (
	"id" uuid PRIMARY KEY NOT NULL,
	"farmer_id" uuid NOT NULL,
	"mandi_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farmer_wallets" (
	"farmer_id" uuid PRIMARY KEY NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"lifetime_earned" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farmers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"phone" varchar NOT NULL,
	"state_id" uuid,
	"district_id" uuid,
	"village" varchar,
	"preferred_mandi_id" uuid,
	"land_size_acres" numeric,
	"irrigation_type" varchar,
	"soil_type" varchar,
	"experience_years" integer,
	"aadhaar_number" varchar,
	"pm_kisan_id" varchar,
	"kcc_number" varchar,
	"alternate_phone" varchar,
	"dob" date,
	"gender" varchar,
	"profile_photo_url" varchar,
	"profile_status" varchar DEFAULT 'INCOMPLETE' NOT NULL,
	"gps_lat" numeric,
	"gps_lng" numeric,
	"gps_consent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "farmers_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "feed_sources" (
	"id" uuid PRIMARY KEY NOT NULL,
	"trader_id" uuid NOT NULL,
	"source_type" varchar NOT NULL,
	"source_identifier" varchar
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"email" varchar NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"role_id" uuid,
	"warehouse_access" jsonb,
	"message" text,
	"token" varchar NOT NULL,
	"invited_by" uuid,
	"status" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "krishi_points_ledger" (
	"id" uuid PRIMARY KEY NOT NULL,
	"farmer_id" uuid NOT NULL,
	"action_id" varchar NOT NULL,
	"points" integer NOT NULL,
	"description" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar NOT NULL,
	"native_name" varchar NOT NULL,
	"is_rtl" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "languages_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"user_id" uuid,
	"email" varchar,
	"ip_address" varchar,
	"user_agent" text,
	"is_successful" boolean,
	"failure_reason" varchar,
	"attempted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "mandi_duplicate_jobs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source_mandi_id" uuid NOT NULL,
	"target_mandi_id" uuid,
	"target_name" varchar NOT NULL,
	"copy_options" jsonb NOT NULL,
	"status" varchar DEFAULT 'PENDING' NOT NULL,
	"error" text,
	"created_by" uuid,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mandi_price_history" (
	"id" uuid PRIMARY KEY NOT NULL,
	"trader_id" uuid,
	"mandi_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"price_per_quintal" numeric NOT NULL,
	"updated_by" uuid NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mandi_products" (
	"id" uuid PRIMARY KEY NOT NULL,
	"mandi_id" uuid NOT NULL,
	"crop_id" uuid NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"price_init_strategy" varchar DEFAULT 'EMPTY' NOT NULL,
	"source_price_mandi_id" uuid,
	"enabled_at" timestamp DEFAULT now() NOT NULL,
	"disabled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mandi_trader_assignments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"mandi_id" uuid NOT NULL,
	"trader_id" uuid NOT NULL,
	"status" varchar DEFAULT 'ACTIVE' NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"removed_at" timestamp,
	"notes" text,
	"assigned_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mandis" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar,
	"slug" varchar,
	"state_id" uuid NOT NULL,
	"district_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"address" text,
	"latitude" numeric,
	"longitude" numeric,
	"opening_time" varchar,
	"closing_time" varchar,
	"working_days" jsonb,
	"description" text,
	"image_urls" jsonb,
	"currency" varchar DEFAULT 'INR' NOT NULL,
	"default_unit" varchar DEFAULT 'QUINTAL' NOT NULL,
	"default_language_code" varchar(10) DEFAULT 'hi',
	"weather_mapping_data" jsonb,
	"ai_prediction_enabled" boolean DEFAULT false NOT NULL,
	"notifications_enabled" boolean DEFAULT true NOT NULL,
	"price_visibility" varchar DEFAULT 'PUBLIC' NOT NULL,
	"analytics_enabled" boolean DEFAULT true NOT NULL,
	"status" varchar DEFAULT 'ACTIVE' NOT NULL,
	"archived_at" timestamp,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mandis_code_unique" UNIQUE("code"),
	CONSTRAINT "mandis_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "market_insights" (
	"id" uuid PRIMARY KEY NOT NULL,
	"crop_id" uuid NOT NULL,
	"mandi_id" uuid,
	"scope" varchar NOT NULL,
	"recommendation" varchar NOT NULL,
	"current_price" numeric,
	"target_price" numeric,
	"expected_range_min" numeric,
	"expected_range_max" numeric,
	"delta" numeric,
	"confidence_percent" integer,
	"summary" text,
	"positive_factors" jsonb,
	"risk_factors" jsonb,
	"best_window_from" date,
	"best_window_to" date,
	"expected_duration" varchar,
	"chart_data_url" varchar,
	"featured_image_url" varchar,
	"publish_at" timestamp,
	"expires_at" timestamp,
	"status" varchar DEFAULT 'DRAFT' NOT NULL,
	"source" varchar DEFAULT 'ADMIN' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "master_data_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"type" varchar(40) NOT NULL,
	"name" varchar NOT NULL,
	"code" varchar(40) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mfa_devices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"mfa_type" varchar,
	"secret_hash" varchar,
	"phone_number" varchar,
	"email" varchar,
	"is_primary" boolean,
	"verified_at" timestamp,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "mfa_trust_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"user_id" uuid,
	"device_id" varchar,
	"browser_fingerprint" varchar,
	"device_fingerprint" varchar,
	"trust_token_hash" varchar,
	"session_id" uuid,
	"trusted_at" timestamp,
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"created_ip" varchar,
	"last_seen_ip" varchar,
	"risk_score" integer,
	"metadata" jsonb,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "official_mandi_prices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"mandi_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"price_min" numeric,
	"price_max" numeric,
	"price_modal" numeric NOT NULL,
	"price_date" date NOT NULL,
	"source" varchar DEFAULT 'ADMIN' NOT NULL,
	"set_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_histories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"password_hash" varchar,
	"password_salt" varchar,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "password_reset_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"token_hash" varchar,
	"used" boolean DEFAULT false,
	"used_at" timestamp,
	"invalidated_at" timestamp,
	"ip_address" varchar,
	"user_agent" text,
	"expires_at" timestamp,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"token_hash" varchar,
	"expires_at" timestamp,
	"used_at" timestamp,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "permission_groups" (
	"id" uuid PRIMARY KEY NOT NULL,
	"module_name" varchar,
	"display_name" varchar,
	"description" text,
	"sort_order" integer
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"permission_group_id" uuid,
	"module" varchar,
	"resource" varchar,
	"action" varchar,
	"permission_key" varchar,
	"description" text,
	"created_at" timestamp,
	CONSTRAINT "permissions_permission_key_unique" UNIQUE("permission_key")
);
--> statement-breakpoint
CREATE TABLE "price_aggregations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"mandi_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"live_average" numeric,
	"highest_price" numeric,
	"lowest_price" numeric,
	"median_price" numeric,
	"active_trader_count" integer,
	"aggregated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_aliases" (
	"id" uuid PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"alias" varchar NOT NULL,
	"lang" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_classification_variants" (
	"id" uuid PRIMARY KEY NOT NULL,
	"classification_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"min_price" numeric,
	"max_price" numeric,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_classifications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"min_price" numeric,
	"max_price" numeric,
	"unit_id" uuid,
	"sort_order" integer DEFAULT 0,
	"status" varchar DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_mandi_assignments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"mandi_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"grade_name" varchar NOT NULL,
	"unit" varchar NOT NULL,
	"status" varchar DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar,
	"name" varchar NOT NULL,
	"slug" varchar,
	"category" varchar NOT NULL,
	"category_id" uuid,
	"subcategory_id" uuid,
	"description" text,
	"image_url" varchar,
	"status" varchar DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_code_unique" UNIQUE("code"),
	CONSTRAINT "products_name_unique" UNIQUE("name"),
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "raw_market_messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"feed_source_id" uuid NOT NULL,
	"raw_text" text NOT NULL,
	"received_at" timestamp NOT NULL,
	"extracted_json" jsonb,
	"parser_version" varchar,
	"confidence_score" integer,
	"status" varchar,
	"validation_errors" jsonb
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"role_id" uuid,
	"permission_id" uuid,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "role_warehouse_access" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"role_id" uuid,
	"all_warehouses" boolean DEFAULT false,
	"warehouse_ids" jsonb,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"name" varchar,
	"description" text,
	"color" varchar,
	"priority" integer,
	"icon" varchar,
	"is_system_role" boolean,
	"is_default_role" boolean,
	"can_be_deleted" boolean,
	"created_by" uuid,
	"parent_role_id" uuid,
	"is_retired" boolean DEFAULT false,
	"created_at" timestamp,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"device_id" uuid,
	"refresh_token_hash" varchar,
	"access_token_jti" varchar,
	"ip_address" varchar,
	"device_type" varchar,
	"browser" varchar,
	"operating_system" varchar,
	"country" varchar,
	"city" varchar,
	"login_method" varchar,
	"login_provider" varchar,
	"last_active_at" timestamp,
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"revoked_reason" varchar,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"status" varchar DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "states_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar,
	"code" varchar,
	"description" text,
	"monthly_price" numeric,
	"annual_price" numeric,
	"currency_code" varchar,
	"monthly_duration_months" integer,
	"annual_duration_months" integer,
	"max_users" integer,
	"max_warehouses" integer,
	"max_companies" integer,
	"max_organizations" integer,
	"max_products" integer,
	"max_suppliers" integer,
	"max_customers" integer,
	"max_purchase_orders" integer,
	"max_sales_orders" integer,
	"max_api_keys" integer,
	"max_webhooks" integer,
	"max_integrations" integer,
	"max_api_requests_per_month" integer,
	"max_storage_gb" integer,
	"supports_api" boolean,
	"supports_sso" boolean,
	"supports_custom_roles" boolean,
	"supports_multi_entity" boolean,
	"supports_advanced_reporting" boolean,
	"supports_sandbox" boolean,
	"enterprise_enabled" boolean,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"subscription_plan_id" uuid,
	"subscription_number" varchar,
	"billing_cycle" varchar,
	"start_date" date,
	"end_date" date,
	"renewal_date" date,
	"trial_ends_at" timestamp,
	"auto_renew" boolean,
	"status" varchar,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY NOT NULL,
	"team_id" uuid,
	"user_id" uuid,
	"joined_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"team_name" varchar,
	"team_code" varchar,
	"description" text,
	"manager_user_id" uuid,
	"created_by" uuid,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "trader_mandi_prices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"trader_id" uuid NOT NULL,
	"mandi_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"price_per_quintal" numeric NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trader_parser_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"trader_id" uuid NOT NULL,
	"separator_tokens" jsonb,
	"alias_mappings" jsonb,
	"confidence_rules" jsonb
);
--> statement-breakpoint
CREATE TABLE "trader_price_history" (
	"id" uuid PRIMARY KEY NOT NULL,
	"raw_message_id" uuid,
	"trader_id" uuid,
	"mandi_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"price_min" numeric,
	"price_max" numeric,
	"price_modal" numeric NOT NULL,
	"confidence_score" integer,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar DEFAULT 'ACTIVE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "traders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"shop_name" varchar NOT NULL,
	"license_number" varchar,
	"primary_mandi_id" uuid NOT NULL,
	"crop_specializations" jsonb,
	"verification_status" varchar DEFAULT 'PENDING' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "translation_audit_log" (
	"id" uuid PRIMARY KEY NOT NULL,
	"translation_id" uuid NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" uuid NOT NULL,
	"field_name" varchar NOT NULL,
	"language_code" varchar(10) NOT NULL,
	"old_value" text,
	"new_value" text NOT NULL,
	"action" varchar NOT NULL,
	"changed_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_devices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"device_identifier" varchar,
	"device_name" varchar,
	"device_type" varchar,
	"operating_system" varchar,
	"browser" varchar,
	"ip_address" varchar,
	"country" varchar,
	"city" varchar,
	"is_trusted" boolean,
	"last_used_at" timestamp,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"timezone" varchar,
	"language_code" varchar(10) DEFAULT 'en',
	"date_format" varchar,
	"time_format" varchar,
	"dashboard_layout" jsonb,
	"sidebar_preferences" jsonb,
	"notification_preferences" jsonb,
	"theme_preference" varchar,
	"created_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"role_id" uuid,
	"company_id" uuid,
	"branch_id" uuid,
	"warehouse_scope_id" uuid,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"assigned_by" uuid,
	"assigned_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_warehouse_access" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"user_id" uuid,
	"all_warehouses" boolean DEFAULT false,
	"warehouse_ids" jsonb,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"global_identity_key" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"display_name" varchar,
	"email" varchar,
	"phone" varchar,
	"username" varchar,
	"password_hash" varchar,
	"password_salt" varchar,
	"avatar_url" varchar,
	"is_email_verified" boolean,
	"is_phone_verified" boolean,
	"is_mfa_enabled" boolean,
	"is_sso_user" boolean,
	"preferred_mfa_method" varchar,
	"last_login_at" timestamp,
	"last_password_changed_at" timestamp,
	"failed_login_attempts" integer,
	"last_failed_login_at" timestamp,
	"locked_until" timestamp,
	"status" varchar,
	"user_type" varchar,
	"profile_status" varchar,
	"created_at" timestamp,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	"version" integer,
	CONSTRAINT "users_global_identity_key_unique" UNIQUE("global_identity_key"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "ai_chats" ADD CONSTRAINT "ai_chats_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_chat_id_ai_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."ai_chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_codes" ADD CONSTRAINT "backup_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_feature_flags" ADD CONSTRAINT "company_feature_flags_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_feature_flags" ADD CONSTRAINT "company_feature_flags_enabled_by_users_id_fk" FOREIGN KEY ("enabled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_dictionary" ADD CONSTRAINT "concept_dictionary_trader_id_users_id_fk" FOREIGN KEY ("trader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "districts" ADD CONSTRAINT "districts_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_translations" ADD CONSTRAINT "entity_translations_language_code_languages_code_fk" FOREIGN KEY ("language_code") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_translations" ADD CONSTRAINT "entity_translations_translated_by_users_id_fk" FOREIGN KEY ("translated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_translations" ADD CONSTRAINT "entity_translations_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_crops" ADD CONSTRAINT "farmer_crops_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_crops" ADD CONSTRAINT "farmer_crops_crop_id_products_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_mandis" ADD CONSTRAINT "farmer_mandis_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_mandis" ADD CONSTRAINT "farmer_mandis_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_wallets" ADD CONSTRAINT "farmer_wallets_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_preferred_mandi_id_mandis_id_fk" FOREIGN KEY ("preferred_mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_sources" ADD CONSTRAINT "feed_sources_trader_id_users_id_fk" FOREIGN KEY ("trader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "krishi_points_ledger" ADD CONSTRAINT "krishi_points_ledger_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_duplicate_jobs" ADD CONSTRAINT "mandi_duplicate_jobs_source_mandi_id_mandis_id_fk" FOREIGN KEY ("source_mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_duplicate_jobs" ADD CONSTRAINT "mandi_duplicate_jobs_target_mandi_id_mandis_id_fk" FOREIGN KEY ("target_mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_duplicate_jobs" ADD CONSTRAINT "mandi_duplicate_jobs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_price_history" ADD CONSTRAINT "mandi_price_history_trader_id_traders_id_fk" FOREIGN KEY ("trader_id") REFERENCES "public"."traders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_price_history" ADD CONSTRAINT "mandi_price_history_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_price_history" ADD CONSTRAINT "mandi_price_history_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_price_history" ADD CONSTRAINT "mandi_price_history_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_products" ADD CONSTRAINT "mandi_products_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_products" ADD CONSTRAINT "mandi_products_crop_id_products_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_products" ADD CONSTRAINT "mandi_products_source_price_mandi_id_mandis_id_fk" FOREIGN KEY ("source_price_mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_trader_assignments" ADD CONSTRAINT "mandi_trader_assignments_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_trader_assignments" ADD CONSTRAINT "mandi_trader_assignments_trader_id_traders_id_fk" FOREIGN KEY ("trader_id") REFERENCES "public"."traders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_trader_assignments" ADD CONSTRAINT "mandi_trader_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandis" ADD CONSTRAINT "mandis_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandis" ADD CONSTRAINT "mandis_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandis" ADD CONSTRAINT "mandis_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_insights" ADD CONSTRAINT "market_insights_crop_id_products_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_insights" ADD CONSTRAINT "market_insights_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_insights" ADD CONSTRAINT "market_insights_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_devices" ADD CONSTRAINT "mfa_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_trust_sessions" ADD CONSTRAINT "mfa_trust_sessions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_trust_sessions" ADD CONSTRAINT "mfa_trust_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_trust_sessions" ADD CONSTRAINT "mfa_trust_sessions_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_mandi_prices" ADD CONSTRAINT "official_mandi_prices_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_mandi_prices" ADD CONSTRAINT "official_mandi_prices_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_mandi_prices" ADD CONSTRAINT "official_mandi_prices_set_by_users_id_fk" FOREIGN KEY ("set_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_histories" ADD CONSTRAINT "password_histories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_sessions" ADD CONSTRAINT "password_reset_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_permission_group_id_permission_groups_id_fk" FOREIGN KEY ("permission_group_id") REFERENCES "public"."permission_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_aggregations" ADD CONSTRAINT "price_aggregations_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_aggregations" ADD CONSTRAINT "price_aggregations_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_aliases" ADD CONSTRAINT "product_aliases_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_classification_variants" ADD CONSTRAINT "product_classification_variants_classification_id_product_classifications_id_fk" FOREIGN KEY ("classification_id") REFERENCES "public"."product_classifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_classifications" ADD CONSTRAINT "product_classifications_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_mandi_assignments" ADD CONSTRAINT "product_mandi_assignments_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_mandi_assignments" ADD CONSTRAINT "product_mandi_assignments_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_market_messages" ADD CONSTRAINT "raw_market_messages_feed_source_id_feed_sources_id_fk" FOREIGN KEY ("feed_source_id") REFERENCES "public"."feed_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_warehouse_access" ADD CONSTRAINT "role_warehouse_access_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_warehouse_access" ADD CONSTRAINT "role_warehouse_access_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_parent_role_id_roles_id_fk" FOREIGN KEY ("parent_role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_device_id_user_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."user_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscription_plan_id_subscription_plans_id_fk" FOREIGN KEY ("subscription_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_manager_user_id_users_id_fk" FOREIGN KEY ("manager_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trader_mandi_prices" ADD CONSTRAINT "trader_mandi_prices_trader_id_traders_id_fk" FOREIGN KEY ("trader_id") REFERENCES "public"."traders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trader_mandi_prices" ADD CONSTRAINT "trader_mandi_prices_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trader_mandi_prices" ADD CONSTRAINT "trader_mandi_prices_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trader_mandi_prices" ADD CONSTRAINT "trader_mandi_prices_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trader_parser_profiles" ADD CONSTRAINT "trader_parser_profiles_trader_id_users_id_fk" FOREIGN KEY ("trader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trader_price_history" ADD CONSTRAINT "trader_price_history_raw_message_id_raw_market_messages_id_fk" FOREIGN KEY ("raw_message_id") REFERENCES "public"."raw_market_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trader_price_history" ADD CONSTRAINT "trader_price_history_trader_id_users_id_fk" FOREIGN KEY ("trader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trader_price_history" ADD CONSTRAINT "trader_price_history_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trader_price_history" ADD CONSTRAINT "trader_price_history_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traders" ADD CONSTRAINT "traders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traders" ADD CONSTRAINT "traders_primary_mandi_id_mandis_id_fk" FOREIGN KEY ("primary_mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translation_audit_log" ADD CONSTRAINT "translation_audit_log_translation_id_entity_translations_id_fk" FOREIGN KEY ("translation_id") REFERENCES "public"."entity_translations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translation_audit_log" ADD CONSTRAINT "translation_audit_log_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_warehouse_access" ADD CONSTRAINT "user_warehouse_access_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_warehouse_access" ADD CONSTRAINT "user_warehouse_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unq_farmer_date" ON "ai_usage_logs" USING btree ("farmer_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_entity_field_lang" ON "entity_translations" USING btree ("entity_type","entity_id","field_name","language_code");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_mandi_crop" ON "mandi_products" USING btree ("mandi_id","crop_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_mandi_trader" ON "mandi_trader_assignments" USING btree ("mandi_id","trader_id");--> statement-breakpoint
CREATE UNIQUE INDEX "master_data_items_type_code_unique" ON "master_data_items" USING btree ("type","code");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_official_mandi_price" ON "official_mandi_prices" USING btree ("mandi_id","variant_id","price_date");--> statement-breakpoint
CREATE UNIQUE INDEX "product_mandi_assignments_unique" ON "product_mandi_assignments" USING btree ("product_id","mandi_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_trader_mandi_variant" ON "trader_mandi_prices" USING btree ("trader_id","mandi_id","variant_id");