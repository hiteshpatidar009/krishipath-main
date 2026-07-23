-- Active: 1782299472968@@rsb-db-1.c1qo6kwis0dl.ap-south-1.rds.amazonaws.com@5432@postgres
-- RSBC DB1
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "addresses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"address_type" varchar,
	"line1" varchar,
	"line2" varchar,
	"landmark" varchar,
	"city" varchar,
	"district" varchar,
	"state" varchar,
	"postal_code" varchar,
	"country" varchar,
	"latitude" numeric,
	"longitude" numeric,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "api_keys" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"user_id" uuid,
	"key_name" varchar,
	"key_prefix" varchar,
	"api_key_hash" varchar,
	"scopes" jsonb,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "approval_decisions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"approval_request_id" uuid,
	"workflow_step_id" uuid,
	"approver_user_id" uuid,
	"decision" varchar,
	"comments" text,
	"decided_at" timestamp
);
CREATE TABLE IF NOT EXISTS "approval_requests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"workflow_definition_id" uuid,
	"entity_type" varchar,
	"entity_id" uuid,
	"requested_by" uuid,
	"current_step_order" integer,
	"status" varchar,
	"requested_at" timestamp,
	"completed_at" timestamp
);
CREATE TABLE IF NOT EXISTS "audit_logs" (
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
CREATE TABLE IF NOT EXISTS "background_jobs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"job_type" varchar,
	"queue_name" varchar,
	"payload" jsonb,
	"priority" integer,
	"status" varchar,
	"retry_count" integer,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp
);
CREATE TABLE IF NOT EXISTS "backup_codes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"code_hash" varchar,
	"is_used" boolean,
	"used_at" timestamp,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "billing_invoices" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"subscription_id" uuid,
	"invoice_number" varchar,
	"subtotal" numeric,
	"tax_amount" numeric,
	"discount_amount" numeric,
	"total_amount" numeric,
	"paid_amount" numeric,
	"currency_code" varchar,
	"invoice_status" varchar,
	"due_date" date,
	"paid_at" timestamp,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "billing_payments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"billing_invoice_id" uuid,
	"payment_gateway" varchar,
	"transaction_reference" varchar,
	"payment_method" varchar,
	"amount" numeric,
	"currency_code" varchar,
	"payment_status" varchar,
	"failure_reason" text,
	"paid_at" timestamp,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "credits" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"credit_type" varchar,
	"amount" numeric,
	"remaining_amount" numeric,
	"expiry_date" date,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"token_hash" varchar,
	"expires_at" timestamp,
	"verified_at" timestamp,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "event_outbox" (
	"id" uuid PRIMARY KEY NOT NULL,
	"aggregate_type" varchar,
	"aggregate_id" uuid,
	"event_type" varchar,
	"payload" jsonb,
	"status" varchar,
	"retry_count" integer,
	"created_at" timestamp,
	"processed_at" timestamp
);
CREATE TABLE IF NOT EXISTS "export_jobs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"module_name" varchar,
	"export_format" varchar,
	"filters" jsonb,
	"file_url" text,
	"status" varchar,
	"created_by" uuid,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "field_level_permissions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"role_id" uuid,
	"module_name" varchar,
	"entity_name" varchar,
	"field_name" varchar,
	"can_view" boolean,
	"can_edit" boolean
);
CREATE TABLE IF NOT EXISTS "idempotency_keys" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"idempotency_key" varchar,
	"request_hash" varchar,
	"response_snapshot" jsonb,
	"expires_at" timestamp,
	"created_at" timestamp,
	CONSTRAINT "idempotency_keys_idempotency_key_unique" UNIQUE("idempotency_key")
);
CREATE TABLE IF NOT EXISTS "import_jobs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"module_name" varchar,
	"file_url" text,
	"total_records" integer,
	"processed_records" integer,
	"failed_records" integer,
	"status" varchar,
	"created_by" uuid,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "integration_connections" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"provider_name" varchar,
	"connection_name" varchar,
	"credentials" jsonb,
	"sync_frequency" varchar,
	"last_sync_at" timestamp,
	"connection_status" varchar,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "login_attempts" (
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
CREATE TABLE IF NOT EXISTS "mfa_devices" (
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
CREATE TABLE IF NOT EXISTS "mfa_trust_sessions" (
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
CREATE TABLE IF NOT EXISTS "notification_templates" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"template_name" varchar,
	"notification_type" varchar,
	"subject" varchar,
	"body" text,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"user_id" uuid,
	"type" varchar,
	"channel" varchar,
	"title" varchar,
	"message" text,
	"entity_type" varchar,
	"entity_id" uuid,
	"priority" varchar,
	"is_read" boolean,
	"read_at" timestamp,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "oauth_clients" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"client_name" varchar,
	"client_id" varchar,
	"client_secret_hash" varchar,
	"redirect_uri" text,
	"allowed_scopes" jsonb,
	"created_at" timestamp,
	CONSTRAINT "oauth_clients_client_id_unique" UNIQUE("client_id")
);
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"name" varchar,
	"legal_name" varchar,
	"organization_code" varchar,
	"registration_number" varchar,
	"tax_registration_number" varchar,
	"email" varchar,
	"phone" varchar,
	"website" varchar,
	"logo_url" varchar,
	"address_id" uuid,
	"status" varchar,
	"created_at" timestamp,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
CREATE TABLE IF NOT EXISTS "password_histories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"password_hash" varchar,
	"password_salt" varchar,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "password_reset_sessions" (
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
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"token_hash" varchar,
	"expires_at" timestamp,
	"used_at" timestamp,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "permission_groups" (
	"id" uuid PRIMARY KEY NOT NULL,
	"module_name" varchar,
	"display_name" varchar,
	"description" text,
	"sort_order" integer
);
CREATE TABLE IF NOT EXISTS "permissions" (
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
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"role_id" uuid,
	"permission_id" uuid,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "roles" (
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
	"parent_role_id" uuid REFERENCES "roles" ("id"),
	"is_retired" boolean DEFAULT false,
	"created_at" timestamp,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
CREATE TABLE IF NOT EXISTS "sessions" (
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
CREATE TABLE IF NOT EXISTS "subscription_plans" (
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
	"max_api_requests_per_month" integer,
	"max_storage_gb" integer,
	"max_organizations" integer,
	"max_products" integer,
	"max_suppliers" integer,
	"max_customers" integer,
	"max_purchase_orders" integer,
	"max_sales_orders" integer,
	"max_api_keys" integer,
	"max_webhooks" integer,
	"max_integrations" integer,
	"supports_api" boolean,
	"supports_sso" boolean,
	"supports_custom_roles" boolean,
	"supports_multi_entity" boolean,
	"supports_advanced_reporting" boolean,
	"supports_sandbox" boolean,
	"created_at" timestamp,
	"updated_at" timestamp
);
CREATE TABLE IF NOT EXISTS "subscription_usage" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"subscription_id" uuid,
	"metric_name" varchar,
	"metric_value" numeric,
	"usage_period_start" date,
	"usage_period_end" date,
	"updated_at" timestamp
);
CREATE TABLE IF NOT EXISTS "subscriptions" (
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
	"purchased_plan_snapshot" jsonb,
	"purchased_price_amount" numeric,
	"purchased_currency_code" varchar,
	"purchased_duration_months" integer,
	"stripe_checkout_session_id" varchar,
	"stripe_payment_intent_id" varchar,
	"activated_by_payment_id" varchar,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"created_at" timestamp,
	"updated_at" timestamp
);
CREATE TABLE IF NOT EXISTS "team_members" (
	"id" uuid PRIMARY KEY NOT NULL,
	"team_id" uuid,
	"user_id" uuid,
	"joined_at" timestamp
);
CREATE TABLE IF NOT EXISTS "teams" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"team_name" varchar,
	"team_code" varchar,
	"description" text,
	"manager_user_id" uuid,
	"created_by" uuid,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "company_feature_flags" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"feature_key" varchar,
	"feature_name" varchar,
	"is_enabled" boolean,
	"enabled_by" uuid,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "company_settings" (
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
	"password_expiry_days" integer,
	"max_failed_login_attempts" integer,
	"lockout_duration_minutes" integer,
	"created_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "company_settings_company_id_unique" UNIQUE("company_id")
);
CREATE TABLE IF NOT EXISTS "companies" (
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
CREATE TABLE IF NOT EXISTS "user_devices" (
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
CREATE TABLE IF NOT EXISTS "user_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"timezone" varchar,
	"language_code" varchar,
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
CREATE TABLE IF NOT EXISTS "user_roles" (
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
CREATE TABLE IF NOT EXISTS "users" (
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
	"created_at" timestamp,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	"version" integer,
	CONSTRAINT "users_global_identity_key_unique" UNIQUE("global_identity_key"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
CREATE TABLE IF NOT EXISTS "webhook_subscriptions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"event_name" varchar,
	"endpoint_url" text,
	"signing_secret" varchar,
	"retry_count" integer,
	"status" varchar,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "workflow_definitions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid,
	"module_name" varchar,
	"workflow_name" varchar,
	"trigger_event" varchar,
	"entity_type" varchar,
	"description" text,
	"is_active" boolean,
	"created_by" uuid,
	"created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "workflow_steps" (
	"id" uuid PRIMARY KEY NOT NULL,
	"workflow_definition_id" uuid,
	"step_order" integer,
	"step_name" varchar,
	"approver_role_id" uuid,
	"approver_user_id" uuid,
	"minimum_approvals" integer,
	"conditions" jsonb,
	"action_type" varchar
);
-- Additive compatibility repairs for existing partially-created databases.
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "address_type" varchar;
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "line1" varchar;
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "line2" varchar;
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "landmark" varchar;
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "city" varchar;
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "district" varchar;
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "state" varchar;
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "postal_code" varchar;
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "country" varchar;
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "latitude" numeric;
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "longitude" numeric;
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "key_name" varchar;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "key_prefix" varchar;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "api_key_hash" varchar;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "scopes" jsonb;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "last_used_at" timestamp;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "expires_at" timestamp;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "revoked_at" timestamp;
ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "approval_decisions" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "approval_decisions" ADD COLUMN IF NOT EXISTS "approval_request_id" uuid;
ALTER TABLE "approval_decisions" ADD COLUMN IF NOT EXISTS "workflow_step_id" uuid;
ALTER TABLE "approval_decisions" ADD COLUMN IF NOT EXISTS "approver_user_id" uuid;
ALTER TABLE "approval_decisions" ADD COLUMN IF NOT EXISTS "decision" varchar;
ALTER TABLE "approval_decisions" ADD COLUMN IF NOT EXISTS "comments" text;
ALTER TABLE "approval_decisions" ADD COLUMN IF NOT EXISTS "decided_at" timestamp;
ALTER TABLE "approval_requests" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "approval_requests" ADD COLUMN IF NOT EXISTS "workflow_definition_id" uuid;
ALTER TABLE "approval_requests" ADD COLUMN IF NOT EXISTS "entity_type" varchar;
ALTER TABLE "approval_requests" ADD COLUMN IF NOT EXISTS "entity_id" uuid;
ALTER TABLE "approval_requests" ADD COLUMN IF NOT EXISTS "requested_by" uuid;
ALTER TABLE "approval_requests" ADD COLUMN IF NOT EXISTS "current_step_order" integer;
ALTER TABLE "approval_requests" ADD COLUMN IF NOT EXISTS "status" varchar;
ALTER TABLE "approval_requests" ADD COLUMN IF NOT EXISTS "requested_at" timestamp;
ALTER TABLE "approval_requests" ADD COLUMN IF NOT EXISTS "completed_at" timestamp;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "module_name" varchar;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "entity_type" varchar;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "entity_id" uuid;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "action" varchar;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "old_values" jsonb;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "new_values" jsonb;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "ip_address" varchar;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "user_agent" text;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "correlation_id" varchar;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "background_jobs" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "background_jobs" ADD COLUMN IF NOT EXISTS "job_type" varchar;
ALTER TABLE "background_jobs" ADD COLUMN IF NOT EXISTS "queue_name" varchar;
ALTER TABLE "background_jobs" ADD COLUMN IF NOT EXISTS "payload" jsonb;
ALTER TABLE "background_jobs" ADD COLUMN IF NOT EXISTS "priority" integer;
ALTER TABLE "background_jobs" ADD COLUMN IF NOT EXISTS "status" varchar;
ALTER TABLE "background_jobs" ADD COLUMN IF NOT EXISTS "retry_count" integer;
ALTER TABLE "background_jobs" ADD COLUMN IF NOT EXISTS "scheduled_at" timestamp;
ALTER TABLE "background_jobs" ADD COLUMN IF NOT EXISTS "started_at" timestamp;
ALTER TABLE "background_jobs" ADD COLUMN IF NOT EXISTS "completed_at" timestamp;
ALTER TABLE "backup_codes" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "backup_codes" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "backup_codes" ADD COLUMN IF NOT EXISTS "code_hash" varchar;
ALTER TABLE "backup_codes" ADD COLUMN IF NOT EXISTS "is_used" boolean;
ALTER TABLE "backup_codes" ADD COLUMN IF NOT EXISTS "used_at" timestamp;
ALTER TABLE "backup_codes" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "billing_invoices" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "billing_invoices" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "billing_invoices" ADD COLUMN IF NOT EXISTS "subscription_id" uuid;
ALTER TABLE "billing_invoices" ADD COLUMN IF NOT EXISTS "invoice_number" varchar;
ALTER TABLE "billing_invoices" ADD COLUMN IF NOT EXISTS "subtotal" numeric;
ALTER TABLE "billing_invoices" ADD COLUMN IF NOT EXISTS "tax_amount" numeric;
ALTER TABLE "billing_invoices" ADD COLUMN IF NOT EXISTS "discount_amount" numeric;
ALTER TABLE "billing_invoices" ADD COLUMN IF NOT EXISTS "total_amount" numeric;
ALTER TABLE "billing_invoices" ADD COLUMN IF NOT EXISTS "paid_amount" numeric;
ALTER TABLE "billing_invoices" ADD COLUMN IF NOT EXISTS "currency_code" varchar;
ALTER TABLE "billing_invoices" ADD COLUMN IF NOT EXISTS "invoice_status" varchar;
ALTER TABLE "billing_invoices" ADD COLUMN IF NOT EXISTS "due_date" date;
ALTER TABLE "billing_invoices" ADD COLUMN IF NOT EXISTS "paid_at" timestamp;
ALTER TABLE "billing_invoices" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "billing_payments" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "billing_payments" ADD COLUMN IF NOT EXISTS "billing_invoice_id" uuid;
ALTER TABLE "billing_payments" ADD COLUMN IF NOT EXISTS "payment_gateway" varchar;
ALTER TABLE "billing_payments" ADD COLUMN IF NOT EXISTS "transaction_reference" varchar;
ALTER TABLE "billing_payments" ADD COLUMN IF NOT EXISTS "payment_method" varchar;
ALTER TABLE "billing_payments" ADD COLUMN IF NOT EXISTS "amount" numeric;
ALTER TABLE "billing_payments" ADD COLUMN IF NOT EXISTS "currency_code" varchar;
ALTER TABLE "billing_payments" ADD COLUMN IF NOT EXISTS "payment_status" varchar;
ALTER TABLE "billing_payments" ADD COLUMN IF NOT EXISTS "failure_reason" text;
ALTER TABLE "billing_payments" ADD COLUMN IF NOT EXISTS "paid_at" timestamp;
ALTER TABLE "billing_payments" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "organization_id" uuid;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "name" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "code" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "company_type" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "registration_number" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "tax_number" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "email" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "phone" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "address_id" uuid;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "base_currency_code" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "fiscal_year_start_month" integer;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "status" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "updated_at" timestamp;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
ALTER TABLE "credits" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "credits" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "credits" ADD COLUMN IF NOT EXISTS "credit_type" varchar;
ALTER TABLE "credits" ADD COLUMN IF NOT EXISTS "amount" numeric;
ALTER TABLE "credits" ADD COLUMN IF NOT EXISTS "remaining_amount" numeric;
ALTER TABLE "credits" ADD COLUMN IF NOT EXISTS "expiry_date" date;
ALTER TABLE "credits" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "email_verification_tokens" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "email_verification_tokens" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "email_verification_tokens" ADD COLUMN IF NOT EXISTS "token_hash" varchar;
ALTER TABLE "email_verification_tokens" ADD COLUMN IF NOT EXISTS "expires_at" timestamp;
ALTER TABLE "email_verification_tokens" ADD COLUMN IF NOT EXISTS "verified_at" timestamp;
ALTER TABLE "email_verification_tokens" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "event_outbox" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "event_outbox" ADD COLUMN IF NOT EXISTS "aggregate_type" varchar;
ALTER TABLE "event_outbox" ADD COLUMN IF NOT EXISTS "aggregate_id" uuid;
ALTER TABLE "event_outbox" ADD COLUMN IF NOT EXISTS "event_type" varchar;
ALTER TABLE "event_outbox" ADD COLUMN IF NOT EXISTS "payload" jsonb;
ALTER TABLE "event_outbox" ADD COLUMN IF NOT EXISTS "status" varchar;
ALTER TABLE "event_outbox" ADD COLUMN IF NOT EXISTS "retry_count" integer;
ALTER TABLE "event_outbox" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "event_outbox" ADD COLUMN IF NOT EXISTS "processed_at" timestamp;
ALTER TABLE "export_jobs" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "export_jobs" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "export_jobs" ADD COLUMN IF NOT EXISTS "module_name" varchar;
ALTER TABLE "export_jobs" ADD COLUMN IF NOT EXISTS "export_format" varchar;
ALTER TABLE "export_jobs" ADD COLUMN IF NOT EXISTS "filters" jsonb;
ALTER TABLE "export_jobs" ADD COLUMN IF NOT EXISTS "file_url" text;
ALTER TABLE "export_jobs" ADD COLUMN IF NOT EXISTS "status" varchar;
ALTER TABLE "export_jobs" ADD COLUMN IF NOT EXISTS "created_by" uuid;
ALTER TABLE "export_jobs" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "field_level_permissions" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "field_level_permissions" ADD COLUMN IF NOT EXISTS "role_id" uuid;
ALTER TABLE "field_level_permissions" ADD COLUMN IF NOT EXISTS "module_name" varchar;
ALTER TABLE "field_level_permissions" ADD COLUMN IF NOT EXISTS "entity_name" varchar;
ALTER TABLE "field_level_permissions" ADD COLUMN IF NOT EXISTS "field_name" varchar;
ALTER TABLE "field_level_permissions" ADD COLUMN IF NOT EXISTS "can_view" boolean;
ALTER TABLE "field_level_permissions" ADD COLUMN IF NOT EXISTS "can_edit" boolean;
ALTER TABLE "idempotency_keys" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "idempotency_keys" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "idempotency_keys" ADD COLUMN IF NOT EXISTS "idempotency_key" varchar;
ALTER TABLE "idempotency_keys" ADD COLUMN IF NOT EXISTS "request_hash" varchar;
ALTER TABLE "idempotency_keys" ADD COLUMN IF NOT EXISTS "response_snapshot" jsonb;
ALTER TABLE "idempotency_keys" ADD COLUMN IF NOT EXISTS "status" varchar NOT NULL DEFAULT 'in_progress';
ALTER TABLE "idempotency_keys" ADD COLUMN IF NOT EXISTS "status_code" integer;
ALTER TABLE "idempotency_keys" ADD COLUMN IF NOT EXISTS "expires_at" timestamp;
ALTER TABLE "idempotency_keys" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "idempotency_keys" ADD COLUMN IF NOT EXISTS "completed_at" timestamp;
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_status_expires
  ON "idempotency_keys" ("status", "expires_at");
ALTER TABLE "import_jobs" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "import_jobs" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "import_jobs" ADD COLUMN IF NOT EXISTS "module_name" varchar;
ALTER TABLE "import_jobs" ADD COLUMN IF NOT EXISTS "file_url" text;
ALTER TABLE "import_jobs" ADD COLUMN IF NOT EXISTS "total_records" integer;
ALTER TABLE "import_jobs" ADD COLUMN IF NOT EXISTS "processed_records" integer;
ALTER TABLE "import_jobs" ADD COLUMN IF NOT EXISTS "failed_records" integer;
ALTER TABLE "import_jobs" ADD COLUMN IF NOT EXISTS "status" varchar;
ALTER TABLE "import_jobs" ADD COLUMN IF NOT EXISTS "created_by" uuid;
ALTER TABLE "import_jobs" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "integration_connections" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "integration_connections" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "integration_connections" ADD COLUMN IF NOT EXISTS "provider_name" varchar;
ALTER TABLE "integration_connections" ADD COLUMN IF NOT EXISTS "connection_name" varchar;
ALTER TABLE "integration_connections" ADD COLUMN IF NOT EXISTS "credentials" jsonb;
ALTER TABLE "integration_connections" ADD COLUMN IF NOT EXISTS "sync_frequency" varchar;
ALTER TABLE "integration_connections" ADD COLUMN IF NOT EXISTS "last_sync_at" timestamp;
ALTER TABLE "integration_connections" ADD COLUMN IF NOT EXISTS "connection_status" varchar;
ALTER TABLE "integration_connections" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "login_attempts" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "login_attempts" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "login_attempts" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "login_attempts" ADD COLUMN IF NOT EXISTS "email" varchar;
ALTER TABLE "login_attempts" ADD COLUMN IF NOT EXISTS "ip_address" varchar;
ALTER TABLE "login_attempts" ADD COLUMN IF NOT EXISTS "user_agent" text;
ALTER TABLE "login_attempts" ADD COLUMN IF NOT EXISTS "is_successful" boolean;
ALTER TABLE "login_attempts" ADD COLUMN IF NOT EXISTS "failure_reason" varchar;
ALTER TABLE "login_attempts" ADD COLUMN IF NOT EXISTS "attempted_at" timestamp;
ALTER TABLE "mfa_devices" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "mfa_devices" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "mfa_devices" ADD COLUMN IF NOT EXISTS "mfa_type" varchar;
ALTER TABLE "mfa_devices" ADD COLUMN IF NOT EXISTS "secret_hash" varchar;
ALTER TABLE "mfa_devices" ADD COLUMN IF NOT EXISTS "phone_number" varchar;
ALTER TABLE "mfa_devices" ADD COLUMN IF NOT EXISTS "email" varchar;
ALTER TABLE "mfa_devices" ADD COLUMN IF NOT EXISTS "is_primary" boolean;
ALTER TABLE "mfa_devices" ADD COLUMN IF NOT EXISTS "verified_at" timestamp;
ALTER TABLE "mfa_devices" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "device_id" varchar;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "browser_fingerprint" varchar;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "device_fingerprint" varchar;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "trust_token_hash" varchar;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "session_id" uuid;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "trusted_at" timestamp;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "expires_at" timestamp;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "revoked_at" timestamp;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "created_ip" varchar;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "last_seen_ip" varchar;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "risk_score" integer;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "metadata" jsonb;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "mfa_trust_sessions" ADD COLUMN IF NOT EXISTS "updated_at" timestamp;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "mfa_trust_window_minutes" integer;
ALTER TABLE "notification_templates" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "notification_templates" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "notification_templates" ADD COLUMN IF NOT EXISTS "template_name" varchar;
ALTER TABLE "notification_templates" ADD COLUMN IF NOT EXISTS "notification_type" varchar;
ALTER TABLE "notification_templates" ADD COLUMN IF NOT EXISTS "subject" varchar;
ALTER TABLE "notification_templates" ADD COLUMN IF NOT EXISTS "body" text;
ALTER TABLE "notification_templates" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "type" varchar;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "channel" varchar;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "title" varchar;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "message" text;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "entity_type" varchar;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "entity_id" uuid;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "priority" varchar;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "is_read" boolean;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "read_at" timestamp;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "oauth_clients" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "oauth_clients" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "oauth_clients" ADD COLUMN IF NOT EXISTS "client_name" varchar;
ALTER TABLE "oauth_clients" ADD COLUMN IF NOT EXISTS "client_id" varchar;
ALTER TABLE "oauth_clients" ADD COLUMN IF NOT EXISTS "client_secret_hash" varchar;
ALTER TABLE "oauth_clients" ADD COLUMN IF NOT EXISTS "redirect_uri" text;
ALTER TABLE "oauth_clients" ADD COLUMN IF NOT EXISTS "allowed_scopes" jsonb;
ALTER TABLE "oauth_clients" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "name" varchar;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "legal_name" varchar;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "organization_code" varchar;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "registration_number" varchar;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "tax_registration_number" varchar;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "email" varchar;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "phone" varchar;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "website" varchar;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "logo_url" varchar;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "address_id" uuid;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "status" varchar;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "updated_at" timestamp;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
ALTER TABLE "password_histories" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "password_histories" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "password_histories" ADD COLUMN IF NOT EXISTS "password_hash" varchar;
ALTER TABLE "password_histories" ADD COLUMN IF NOT EXISTS "password_salt" varchar;
ALTER TABLE "password_histories" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "password_reset_sessions" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "password_reset_sessions" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "password_reset_sessions" ADD COLUMN IF NOT EXISTS "token_hash" varchar;
ALTER TABLE "password_reset_sessions" ADD COLUMN IF NOT EXISTS "used" boolean;
ALTER TABLE "password_reset_sessions" ADD COLUMN IF NOT EXISTS "used_at" timestamp;
ALTER TABLE "password_reset_sessions" ADD COLUMN IF NOT EXISTS "invalidated_at" timestamp;
ALTER TABLE "password_reset_sessions" ADD COLUMN IF NOT EXISTS "ip_address" varchar;
ALTER TABLE "password_reset_sessions" ADD COLUMN IF NOT EXISTS "user_agent" text;
ALTER TABLE "password_reset_sessions" ADD COLUMN IF NOT EXISTS "expires_at" timestamp;
ALTER TABLE "password_reset_sessions" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "password_reset_tokens" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "password_reset_tokens" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "password_reset_tokens" ADD COLUMN IF NOT EXISTS "token_hash" varchar;
ALTER TABLE "password_reset_tokens" ADD COLUMN IF NOT EXISTS "expires_at" timestamp;
ALTER TABLE "password_reset_tokens" ADD COLUMN IF NOT EXISTS "used_at" timestamp;
ALTER TABLE "password_reset_tokens" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
CREATE UNIQUE INDEX IF NOT EXISTS "idx_password_reset_sessions_token_hash"
	ON "password_reset_sessions" ("token_hash");
CREATE INDEX IF NOT EXISTS "idx_password_reset_sessions_user_active"
	ON "password_reset_sessions" ("user_id", "used", "invalidated_at", "expires_at");
CREATE INDEX IF NOT EXISTS "idx_password_histories_user_created"
	ON "password_histories" ("user_id", "created_at");
ALTER TABLE "permission_groups" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "permission_groups" ADD COLUMN IF NOT EXISTS "module_name" varchar;
ALTER TABLE "permission_groups" ADD COLUMN IF NOT EXISTS "display_name" varchar;
ALTER TABLE "permission_groups" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "permission_groups" ADD COLUMN IF NOT EXISTS "sort_order" integer;
ALTER TABLE "permissions" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "permissions" ADD COLUMN IF NOT EXISTS "permission_group_id" uuid;
ALTER TABLE "permissions" ADD COLUMN IF NOT EXISTS "module" varchar;
ALTER TABLE "permissions" ADD COLUMN IF NOT EXISTS "resource" varchar;
ALTER TABLE "permissions" ADD COLUMN IF NOT EXISTS "action" varchar;
ALTER TABLE "permissions" ADD COLUMN IF NOT EXISTS "permission_key" varchar;
ALTER TABLE "permissions" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "permissions" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "role_permissions" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "role_permissions" ADD COLUMN IF NOT EXISTS "role_id" uuid;
ALTER TABLE "role_permissions" ADD COLUMN IF NOT EXISTS "permission_id" uuid;
ALTER TABLE "role_permissions" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "name" varchar;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "color" varchar;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "priority" integer;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "icon" varchar;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "is_system_role" boolean;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "is_default_role" boolean;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "can_be_deleted" boolean;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "created_by" uuid;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "updated_at" timestamp;
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "device_id" uuid;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "refresh_token_hash" varchar;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "access_token_jti" varchar;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "ip_address" varchar;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "device_type" varchar;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "browser" varchar;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "operating_system" varchar;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "country" varchar;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "city" varchar;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "login_method" varchar;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "login_provider" varchar;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "last_active_at" timestamp;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "expires_at" timestamp;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "revoked_at" timestamp;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "revoked_reason" varchar;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "name" varchar;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "code" varchar;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "monthly_price" numeric;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "annual_price" numeric;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "currency_code" varchar;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "monthly_duration_months" integer;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "annual_duration_months" integer;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "max_users" integer;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "max_warehouses" integer;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "max_companies" integer;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "max_api_requests_per_month" integer;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "max_storage_gb" integer;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "supports_api" boolean;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "supports_sso" boolean;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "supports_custom_roles" boolean;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "supports_multi_entity" boolean;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "supports_advanced_reporting" boolean;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "supports_sandbox" boolean;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "max_organizations" integer;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "max_products" integer;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "max_suppliers" integer;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "max_customers" integer;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "max_purchase_orders" integer;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "max_sales_orders" integer;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "max_api_keys" integer;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "max_webhooks" integer;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "max_integrations" integer;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "updated_at" timestamp;
ALTER TABLE "subscription_usage" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "subscription_usage" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "subscription_usage" ADD COLUMN IF NOT EXISTS "subscription_id" uuid;
ALTER TABLE "subscription_usage" ADD COLUMN IF NOT EXISTS "metric_name" varchar;
ALTER TABLE "subscription_usage" ADD COLUMN IF NOT EXISTS "metric_value" numeric;
ALTER TABLE "subscription_usage" ADD COLUMN IF NOT EXISTS "usage_period_start" date;
ALTER TABLE "subscription_usage" ADD COLUMN IF NOT EXISTS "usage_period_end" date;
ALTER TABLE "subscription_usage" ADD COLUMN IF NOT EXISTS "updated_at" timestamp;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "subscription_plan_id" uuid;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "subscription_number" varchar;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "billing_cycle" varchar;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "start_date" date;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "end_date" date;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "renewal_date" date;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "trial_ends_at" timestamp;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "auto_renew" boolean;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "status" varchar;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "purchased_plan_snapshot" jsonb;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "purchased_price_amount" numeric;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "purchased_currency_code" varchar;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "purchased_duration_months" integer;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "stripe_checkout_session_id" varchar;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "stripe_payment_intent_id" varchar;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "activated_by_payment_id" varchar;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "cancelled_at" timestamp;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "cancellation_reason" text;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "updated_at" timestamp;
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "team_id" uuid;
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "joined_at" timestamp;
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "team_name" varchar;
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "team_code" varchar;
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "manager_user_id" uuid;
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "created_by" uuid;
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "company_feature_flags" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "company_feature_flags" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "company_feature_flags" ADD COLUMN IF NOT EXISTS "feature_key" varchar;
ALTER TABLE "company_feature_flags" ADD COLUMN IF NOT EXISTS "feature_name" varchar;
ALTER TABLE "company_feature_flags" ADD COLUMN IF NOT EXISTS "is_enabled" boolean;
ALTER TABLE "company_feature_flags" ADD COLUMN IF NOT EXISTS "enabled_by" uuid;
ALTER TABLE "company_feature_flags" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "timezone" varchar;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "default_currency_code" varchar;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "date_format" varchar;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "time_format" varchar;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "language_code" varchar;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "logo_url" varchar;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "favicon_url" varchar;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "theme_color" varchar;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "enable_mfa" boolean;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "enable_sso" boolean;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "enable_api_access" boolean;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "enable_custom_roles" boolean;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "enable_multi_company" boolean;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "enable_multi_warehouse" boolean;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "enable_audit_exports" boolean;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "enable_webhooks" boolean;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "default_session_timeout_minutes" integer;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "password_expiry_days" integer;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "max_failed_login_attempts" integer;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "lockout_duration_minutes" integer;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "company_settings" ADD COLUMN IF NOT EXISTS "updated_at" timestamp;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "owner_user_id" uuid;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "code" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "name" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "slug" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "legal_name" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "industry" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "company_size" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "website" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "business_type" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "tax_number" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "country" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "state_province" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "city" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "postal_code" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "primary_email" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "primary_phone" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "company_type" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "subscription_plan_id" uuid;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "status" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "onboarding_status" varchar;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "trial_starts_at" timestamp;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "trial_ends_at" timestamp;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "activated_at" timestamp;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "suspended_at" timestamp;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "last_activity_at" timestamp;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "updated_at" timestamp;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "version" integer;
ALTER TABLE "user_devices" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "user_devices" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "user_devices" ADD COLUMN IF NOT EXISTS "device_identifier" varchar;
ALTER TABLE "user_devices" ADD COLUMN IF NOT EXISTS "device_name" varchar;
ALTER TABLE "user_devices" ADD COLUMN IF NOT EXISTS "device_type" varchar;
ALTER TABLE "user_devices" ADD COLUMN IF NOT EXISTS "operating_system" varchar;
ALTER TABLE "user_devices" ADD COLUMN IF NOT EXISTS "browser" varchar;
ALTER TABLE "user_devices" ADD COLUMN IF NOT EXISTS "ip_address" varchar;
ALTER TABLE "user_devices" ADD COLUMN IF NOT EXISTS "country" varchar;
ALTER TABLE "user_devices" ADD COLUMN IF NOT EXISTS "city" varchar;
ALTER TABLE "user_devices" ADD COLUMN IF NOT EXISTS "is_trusted" boolean;
ALTER TABLE "user_devices" ADD COLUMN IF NOT EXISTS "last_used_at" timestamp;
ALTER TABLE "user_devices" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "timezone" varchar;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "language_code" varchar;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "date_format" varchar;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "time_format" varchar;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "dashboard_layout" jsonb;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "sidebar_preferences" jsonb;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "notification_preferences" jsonb;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "theme_preference" varchar;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "updated_at" timestamp;
ALTER TABLE "user_roles" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "user_roles" ADD COLUMN IF NOT EXISTS "user_id" uuid;
ALTER TABLE "user_roles" ADD COLUMN IF NOT EXISTS "role_id" uuid;
ALTER TABLE "user_roles" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "user_roles" ADD COLUMN IF NOT EXISTS "branch_id" uuid;
ALTER TABLE "user_roles" ADD COLUMN IF NOT EXISTS "warehouse_scope_id" uuid;
ALTER TABLE "user_roles" ADD COLUMN IF NOT EXISTS "starts_at" timestamp;
ALTER TABLE "user_roles" ADD COLUMN IF NOT EXISTS "ends_at" timestamp;
ALTER TABLE "user_roles" ADD COLUMN IF NOT EXISTS "assigned_by" uuid;
ALTER TABLE "user_roles" ADD COLUMN IF NOT EXISTS "assigned_at" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "global_identity_key" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "display_name" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_salt" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_email_verified" boolean;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_phone_verified" boolean;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_mfa_enabled" boolean;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_sso_user" boolean;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferred_mfa_method" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_at" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_password_changed_at" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "failed_login_attempts" integer;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_failed_login_at" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locked_until" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_at" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "version" integer;
ALTER TABLE "webhook_subscriptions" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "webhook_subscriptions" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "webhook_subscriptions" ADD COLUMN IF NOT EXISTS "event_name" varchar;
ALTER TABLE "webhook_subscriptions" ADD COLUMN IF NOT EXISTS "endpoint_url" text;
ALTER TABLE "webhook_subscriptions" ADD COLUMN IF NOT EXISTS "signing_secret" varchar;
ALTER TABLE "webhook_subscriptions" ADD COLUMN IF NOT EXISTS "retry_count" integer;
ALTER TABLE "webhook_subscriptions" ADD COLUMN IF NOT EXISTS "status" varchar;
ALTER TABLE "webhook_subscriptions" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "workflow_definitions" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "workflow_definitions" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "workflow_definitions" ADD COLUMN IF NOT EXISTS "module_name" varchar;
ALTER TABLE "workflow_definitions" ADD COLUMN IF NOT EXISTS "workflow_name" varchar;
ALTER TABLE "workflow_definitions" ADD COLUMN IF NOT EXISTS "trigger_event" varchar;
ALTER TABLE "workflow_definitions" ADD COLUMN IF NOT EXISTS "entity_type" varchar;
ALTER TABLE "workflow_definitions" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "workflow_definitions" ADD COLUMN IF NOT EXISTS "is_active" boolean;
ALTER TABLE "workflow_definitions" ADD COLUMN IF NOT EXISTS "created_by" uuid;
ALTER TABLE "workflow_definitions" ADD COLUMN IF NOT EXISTS "created_at" timestamp;
ALTER TABLE "workflow_steps" ADD COLUMN IF NOT EXISTS "id" uuid;
ALTER TABLE "workflow_steps" ADD COLUMN IF NOT EXISTS "workflow_definition_id" uuid;
ALTER TABLE "workflow_steps" ADD COLUMN IF NOT EXISTS "step_order" integer;
ALTER TABLE "workflow_steps" ADD COLUMN IF NOT EXISTS "step_name" varchar;
ALTER TABLE "workflow_steps" ADD COLUMN IF NOT EXISTS "approver_role_id" uuid;
ALTER TABLE "workflow_steps" ADD COLUMN IF NOT EXISTS "approver_user_id" uuid;
ALTER TABLE "workflow_steps" ADD COLUMN IF NOT EXISTS "minimum_approvals" integer;
ALTER TABLE "workflow_steps" ADD COLUMN IF NOT EXISTS "conditions" jsonb;
ALTER TABLE "workflow_steps" ADD COLUMN IF NOT EXISTS "action_type" varchar;

-- BEGIN MERGED DB1 PATCHES
-- Source patch: 2026-05-18-db1-auth-device-location.sql
-- DB1 auth device/session location columns
-- Required by Drizzle auth schema and auth token finalization.

ALTER TABLE user_devices
  ADD COLUMN IF NOT EXISTS country VARCHAR(120),
  ADD COLUMN IF NOT EXISTS city VARCHAR(120);

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS country VARCHAR(120),
  ADD COLUMN IF NOT EXISTS city VARCHAR(120);

-- Source patch: 2026-05-19-db1-company-lifecycle-columns.sql
-- DB1 company lifecycle columns
-- Required by Drizzle auth company schema and company onboarding APIs.

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS company_type VARCHAR(40) DEFAULT 'saas',
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

UPDATE companies
SET company_type = COALESCE(company_type, 'saas'),
    version = COALESCE(version, 1);

-- Source patch: 2026-05-22-db1-rbac-uniqueness.sql
-- Prevent duplicate active role names inside same company/company.
CREATE UNIQUE INDEX IF NOT EXISTS uq_roles_company_lower_name_active
  ON roles (company_id, lower(name))
  WHERE deleted_at IS NULL;

-- Prevent duplicate permission group rows during concurrent bootstrap.
CREATE UNIQUE INDEX IF NOT EXISTS uq_permission_groups_module_name
  ON permission_groups (module_name);

-- Prevent duplicate permission assignments to same role.
CREATE UNIQUE INDEX IF NOT EXISTS uq_role_permissions_role_permission
  ON role_permissions (role_id, permission_id);

-- Source patch: 2026-05-22-db1-root-iam-login.sql
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id);

UPDATE companies AS company
SET owner_user_id = owner.id
FROM (
  SELECT DISTINCT ON (company_id) id, company_id
  FROM users
  WHERE company_id IS NOT NULL
    AND deleted_at IS NULL
  ORDER BY company_id, created_at ASC NULLS LAST
) AS owner
WHERE company.id = owner.company_id
  AND company.owner_user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_companies_owner_user_id
  ON companies (owner_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_owner_normalized_name_active
  ON companies (owner_user_id, lower(name))
  WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_active_state
  ON subscriptions (user_id)
  WHERE status IN ('active', 'trial', 'trial_active', 'past_due', 'suspended', 'queued')
    AND cancelled_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_roles_company_id
  ON roles (company_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_role
  ON user_roles (user_id, role_id);

-- Source patch: 2026-05-22-db1-subscription-stripe-purchase.sql
ALTER TABLE subscription_plans
  ADD COLUMN IF NOT EXISTS monthly_price NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS annual_price NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS currency_code CHAR(3) NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS monthly_duration_months INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS annual_duration_months INTEGER NOT NULL DEFAULT 12,
  ADD COLUMN IF NOT EXISTS max_users INTEGER,
  ADD COLUMN IF NOT EXISTS max_warehouses INTEGER,
  ADD COLUMN IF NOT EXISTS max_companies INTEGER,
  ADD COLUMN IF NOT EXISTS max_api_requests_per_month INTEGER,
  ADD COLUMN IF NOT EXISTS max_storage_gb INTEGER,
  ADD COLUMN IF NOT EXISTS supports_api BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS supports_sso BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS supports_custom_roles BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS supports_multi_entity BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS supports_advanced_reporting BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS supports_sandbox BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS purchased_plan_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS purchased_price_amount NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS purchased_currency_code CHAR(3),
  ADD COLUMN IF NOT EXISTS purchased_duration_months INTEGER,
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS activated_by_payment_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_checkout_session_id
  ON subscriptions (stripe_checkout_session_id);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_code
  ON subscription_plans (code);

CREATE INDEX IF NOT EXISTS idx_mfa_trust_sessions_user_active
  ON mfa_trust_sessions (user_id, company_id, expires_at)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_mfa_trust_sessions_token_hash
  ON mfa_trust_sessions (trust_token_hash)
  WHERE revoked_at IS NULL;

-- Source patch: 2026-05-22-db1-company-settings-branding-columns.sql
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS favicon_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS theme_color VARCHAR(32),
  ADD COLUMN IF NOT EXISTS password_expiry_days INTEGER;

-- Source patch: 2026-05-29-db1-enterprise-billing.sql
CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  previous_plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(40) NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL,
  renewal_mode VARCHAR(20) NOT NULL DEFAULT 'manual',
  start_date TIMESTAMP NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  next_billing_at TIMESTAMP,
  grace_ends_at TIMESTAMP,
  trial_ends_at TIMESTAMP,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_at TIMESTAMP,
  auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
  default_payment_method_id UUID,
  last_invoice_id UUID,
  gateway_customer_id VARCHAR(150),
  gateway_subscription_id VARCHAR(150),
  purchased_plan_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  purchased_price_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  purchased_currency_code CHAR(3) NOT NULL DEFAULT 'INR',
  purchased_duration_months INTEGER NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_payment_methods (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  type VARCHAR(40) NOT NULL,
  status VARCHAR(40) NOT NULL,
  stripe_customer_id VARCHAR(150),
  stripe_payment_method_id VARCHAR(150),
  stripe_setup_intent_id VARCHAR(150),
  display_brand VARCHAR(80),
  last4 VARCHAR(4),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS billing_subscription_changes (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  subscription_id UUID NOT NULL REFERENCES billing_subscriptions(id),
  from_plan_id UUID REFERENCES subscription_plans(id),
  to_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  change_type VARCHAR(40) NOT NULL,
  policy VARCHAR(40) NOT NULL,
  status VARCHAR(40) NOT NULL,
  effective_at TIMESTAMP NOT NULL,
  remaining_credit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  prorated_charge_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency_code CHAR(3) NOT NULL DEFAULT 'INR',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_subscription_events (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  subscription_id UUID REFERENCES billing_subscriptions(id),
  event_name VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(150) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE billing_subscriptions
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS previous_plan_id UUID,
  ADD COLUMN IF NOT EXISTS renewal_mode VARCHAR(20) NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS next_billing_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS grace_ends_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS default_payment_method_id UUID,
  ADD COLUMN IF NOT EXISTS last_invoice_id UUID,
  ADD COLUMN IF NOT EXISTS purchased_plan_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS purchased_price_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS purchased_currency_code CHAR(3) NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS purchased_duration_months INTEGER NOT NULL DEFAULT 1;

ALTER TABLE IF EXISTS billing_payment_methods ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE IF EXISTS billing_subscription_changes ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE IF EXISTS billing_subscription_events ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE IF EXISTS billing_idempotency_keys ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE IF EXISTS billing_payment_profiles ADD COLUMN IF NOT EXISTS company_id UUID;


ALTER TABLE billing_invoices
  ADD COLUMN IF NOT EXISTS status VARCHAR(40),
  ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS credit_applied_amount NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS period_start TIMESTAMP,
  ADD COLUMN IF NOT EXISTS period_end TIMESTAMP,
  ADD COLUMN IF NOT EXISTS gateway_invoice_id VARCHAR(150),
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(150),
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

ALTER TABLE billing_invoices
  DROP CONSTRAINT IF EXISTS billing_invoices_subscription_id_subscriptions_id_fk;

ALTER TABLE billing_payments
  ADD COLUMN IF NOT EXISTS company_id UUID,
  ADD COLUMN IF NOT EXISTS invoice_id UUID,
  ADD COLUMN IF NOT EXISTS subscription_id UUID,
  ADD COLUMN IF NOT EXISTS gateway VARCHAR(40),
  ADD COLUMN IF NOT EXISTS gateway_payment_id VARCHAR(150),
  ADD COLUMN IF NOT EXISTS status VARCHAR(40),
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(150),
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_user_status
  ON billing_subscriptions (user_id, status, current_period_end);
CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_subscriptions_user_active_state
  ON billing_subscriptions (user_id)
  WHERE status IN ('active', 'trial', 'past_due', 'suspended', 'queued')
    AND cancelled_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_billing_payment_methods_company_default
  ON billing_payment_methods (company_id, is_default)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_billing_subscription_changes_company_effective
  ON billing_subscription_changes (company_id, effective_at, status);

CREATE INDEX IF NOT EXISTS idx_billing_subscription_events_company_event
  ON billing_subscription_events (company_id, event_name, created_at);

CREATE TABLE IF NOT EXISTS billing_credits (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  invoice_id UUID,
  status VARCHAR(40) NOT NULL,
  amount NUMERIC NOT NULL,
  remaining_amount NUMERIC NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  reason TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_by UUID,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE billing_credits
  ADD COLUMN IF NOT EXISTS company_id UUID,
  ADD COLUMN IF NOT EXISTS invoice_id UUID,
  ADD COLUMN IF NOT EXISTS status VARCHAR(40),
  ADD COLUMN IF NOT EXISTS amount NUMERIC,
  ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS currency_code VARCHAR(3),
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_billing_credits_company_status
  ON billing_credits (company_id, status, expires_at);

CREATE TABLE IF NOT EXISTS billing_refunds (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  payment_id UUID NOT NULL,
  invoice_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  status VARCHAR(40) NOT NULL,
  reason TEXT NOT NULL,
  gateway_refund_id VARCHAR(150),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE billing_refunds
  ADD COLUMN IF NOT EXISTS company_id UUID,
  ADD COLUMN IF NOT EXISTS payment_id UUID,
  ADD COLUMN IF NOT EXISTS invoice_id UUID,
  ADD COLUMN IF NOT EXISTS amount NUMERIC,
  ADD COLUMN IF NOT EXISTS currency_code VARCHAR(3),
  ADD COLUMN IF NOT EXISTS status VARCHAR(40),
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS gateway_refund_id VARCHAR(150),
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_billing_refunds_company_payment
  ON billing_refunds (company_id, payment_id, created_at);
-- END MERGED DB1 PATCHES

ALTER TABLE "addresses" DROP CONSTRAINT IF EXISTS "addresses_company_id_companies_id_fk";
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "api_keys" DROP CONSTRAINT IF EXISTS "api_keys_company_id_companies_id_fk";
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "api_keys" DROP CONSTRAINT IF EXISTS "api_keys_user_id_users_id_fk";
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "approval_decisions" DROP CONSTRAINT IF EXISTS "approval_decisions_approval_request_id_approval_requests_id_fk";
ALTER TABLE "approval_decisions" ADD CONSTRAINT "approval_decisions_approval_request_id_approval_requests_id_fk" FOREIGN KEY ("approval_request_id") REFERENCES "public"."approval_requests"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "approval_decisions" DROP CONSTRAINT IF EXISTS "approval_decisions_workflow_step_id_workflow_steps_id_fk";
ALTER TABLE "approval_decisions" ADD CONSTRAINT "approval_decisions_workflow_step_id_workflow_steps_id_fk" FOREIGN KEY ("workflow_step_id") REFERENCES "public"."workflow_steps"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "approval_decisions" DROP CONSTRAINT IF EXISTS "approval_decisions_approver_user_id_users_id_fk";
ALTER TABLE "approval_decisions" ADD CONSTRAINT "approval_decisions_approver_user_id_users_id_fk" FOREIGN KEY ("approver_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "approval_requests" DROP CONSTRAINT IF EXISTS "approval_requests_workflow_definition_id_workflow_definitions_id_fk";
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_workflow_definition_id_workflow_definitions_id_fk" FOREIGN KEY ("workflow_definition_id") REFERENCES "public"."workflow_definitions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "approval_requests" DROP CONSTRAINT IF EXISTS "approval_requests_requested_by_users_id_fk";
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_company_id_companies_id_fk";
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_user_id_users_id_fk";
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "backup_codes" DROP CONSTRAINT IF EXISTS "backup_codes_user_id_users_id_fk";
ALTER TABLE "backup_codes" ADD CONSTRAINT "backup_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "billing_invoices" DROP CONSTRAINT IF EXISTS "billing_invoices_company_id_companies_id_fk";
ALTER TABLE "billing_invoices" ALTER COLUMN "company_id" DROP NOT NULL;
ALTER TABLE "billing_invoices" DROP CONSTRAINT IF EXISTS "billing_invoices_subscription_id_subscriptions_id_fk";
DELETE FROM "billing_invoices" WHERE "subscription_id" IS NOT NULL AND "subscription_id" NOT IN (SELECT "id" FROM "subscriptions");
ALTER TABLE "billing_invoices" ADD CONSTRAINT "billing_invoices_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "role_permissions_permission_id_permissions_id_fk";
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "roles" DROP CONSTRAINT IF EXISTS "roles_company_id_companies_id_fk";
ALTER TABLE "roles" ADD CONSTRAINT "roles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "roles" DROP CONSTRAINT IF EXISTS "roles_created_by_users_id_fk";
ALTER TABLE "roles" ADD CONSTRAINT "roles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_user_id_users_id_fk";
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_device_id_user_devices_id_fk";
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_device_id_user_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."user_devices"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "subscription_usage" DROP CONSTRAINT IF EXISTS "subscription_usage_company_id_companies_id_fk";
ALTER TABLE "subscription_usage" ADD CONSTRAINT "subscription_usage_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "subscription_usage" DROP CONSTRAINT IF EXISTS "subscription_usage_subscription_id_subscriptions_id_fk";
ALTER TABLE "subscription_usage" ADD CONSTRAINT "subscription_usage_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_user_id_users_id_fk";
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_subscription_plan_id_subscription_plans_id_fk";
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscription_plan_id_subscription_plans_id_fk" FOREIGN KEY ("subscription_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "team_members_team_id_teams_id_fk";
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "team_members_user_id_users_id_fk";
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "teams_company_id_companies_id_fk";
ALTER TABLE "teams" ADD CONSTRAINT "teams_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "teams_manager_user_id_users_id_fk";
ALTER TABLE "teams" ADD CONSTRAINT "teams_manager_user_id_users_id_fk" FOREIGN KEY ("manager_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "teams_created_by_users_id_fk";
ALTER TABLE "teams" ADD CONSTRAINT "teams_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "company_feature_flags" DROP CONSTRAINT IF EXISTS "company_feature_flags_company_id_companies_id_fk";
ALTER TABLE "company_feature_flags" ADD CONSTRAINT "company_feature_flags_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "company_feature_flags" DROP CONSTRAINT IF EXISTS "company_feature_flags_enabled_by_users_id_fk";
ALTER TABLE "company_feature_flags" ADD CONSTRAINT "company_feature_flags_enabled_by_users_id_fk" FOREIGN KEY ("enabled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "company_settings" DROP CONSTRAINT IF EXISTS "company_settings_company_id_companies_id_fk";
ALTER TABLE "company_settings" ADD CONSTRAINT "company_settings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "companies" DROP CONSTRAINT IF EXISTS "companies_owner_user_id_users_id_fk";
ALTER TABLE "companies" ADD CONSTRAINT "companies_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_devices" DROP CONSTRAINT IF EXISTS "user_devices_user_id_users_id_fk";
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_profiles" DROP CONSTRAINT IF EXISTS "user_profiles_user_id_users_id_fk";
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_user_id_users_id_fk";
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_role_id_roles_id_fk";
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_company_id_companies_id_fk";
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_assigned_by_users_id_fk";
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_company_id_companies_id_fk";
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "webhook_subscriptions" DROP CONSTRAINT IF EXISTS "webhook_subscriptions_company_id_companies_id_fk";
ALTER TABLE "webhook_subscriptions" ADD CONSTRAINT "webhook_subscriptions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "workflow_definitions" DROP CONSTRAINT IF EXISTS "workflow_definitions_company_id_companies_id_fk";
ALTER TABLE "workflow_definitions" ADD CONSTRAINT "workflow_definitions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "workflow_definitions" DROP CONSTRAINT IF EXISTS "workflow_definitions_created_by_users_id_fk";
ALTER TABLE "workflow_definitions" ADD CONSTRAINT "workflow_definitions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "workflow_steps" DROP CONSTRAINT IF EXISTS "workflow_steps_workflow_definition_id_workflow_definitions_id_fk";
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflow_definition_id_workflow_definitions_id_fk" FOREIGN KEY ("workflow_definition_id") REFERENCES "public"."workflow_definitions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "workflow_steps" DROP CONSTRAINT IF EXISTS "workflow_steps_approver_role_id_roles_id_fk";
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_approver_role_id_roles_id_fk" FOREIGN KEY ("approver_role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "workflow_steps" DROP CONSTRAINT IF EXISTS "workflow_steps_approver_user_id_users_id_fk";
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_approver_user_id_users_id_fk" FOREIGN KEY ("approver_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;



CREATE TABLE IF NOT EXISTS billing_idempotency_keys (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  idempotency_key VARCHAR(150) NOT NULL,
  request_hash VARCHAR(128) NOT NULL,
  response_snapshot JSONB,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_idempotency_lookup
  ON billing_idempotency_keys (company_id, idempotency_key, request_hash, expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_idempotency_unique
  ON billing_idempotency_keys (company_id, idempotency_key, request_hash);

CREATE TABLE IF NOT EXISTS billing_payment_profiles (
  id UUID PRIMARY KEY,
  company_id UUID,
  user_id UUID REFERENCES users(id),
  full_name VARCHAR(255) NOT NULL,
  card_number_encrypted TEXT NOT NULL,
  expiry_month INTEGER NOT NULL,
  expiry_year INTEGER NOT NULL,
  cvc_encrypted TEXT NOT NULL,
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  last4 VARCHAR(4) NOT NULL,
  display_brand VARCHAR(80) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP
);

ALTER TABLE IF EXISTS billing_payment_profiles
  ALTER COLUMN company_id DROP NOT NULL;

ALTER TABLE IF EXISTS billing_payments
  ALTER COLUMN company_id DROP NOT NULL;

ALTER TABLE IF EXISTS billing_subscription_events
  ALTER COLUMN company_id DROP NOT NULL;

DO $$
DECLARE
  constraint_record record;
BEGIN
  FOR constraint_record IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'billing_payment_profiles'::regclass
      AND contype = 'f'
      AND pg_get_constraintdef(oid) ILIKE '%company_id%'
      AND pg_get_constraintdef(oid) ILIKE '%companies%'
  LOOP
    EXECUTE format('ALTER TABLE billing_payment_profiles DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_billing_payment_profiles_company_default
  ON billing_payment_profiles (company_id, is_default)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_billing_payment_profiles_user_default
  ON billing_payment_profiles (user_id, is_default)
  WHERE company_id IS NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS "invitations" (
  "id" uuid PRIMARY KEY NOT NULL,
  "company_id" uuid REFERENCES "companies" ("id"),
  "email" varchar NOT NULL,
  "first_name" varchar,
  "last_name" varchar,
  "role_id" uuid REFERENCES "roles" ("id"),
  "warehouse_access" jsonb,
  "message" text,
  "token" varchar UNIQUE NOT NULL,
  "invited_by" uuid REFERENCES "users" ("id"),
  "status" varchar NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "role_warehouse_access" (
  "id" uuid PRIMARY KEY NOT NULL,
  "company_id" uuid REFERENCES "companies" ("id"),
  "role_id" uuid REFERENCES "roles" ("id"),
  "all_warehouses" boolean DEFAULT false,
  "warehouse_ids" jsonb,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_warehouse_access" (
  "id" uuid PRIMARY KEY NOT NULL,
  "company_id" uuid REFERENCES "companies" ("id"),
  "user_id" uuid REFERENCES "users" ("id"),
  "all_warehouses" boolean DEFAULT false,
  "warehouse_ids" jsonb,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

-- Enterprise Management additive DB1 schema.
ALTER TABLE "subscription_plans"
  ADD COLUMN IF NOT EXISTS "enterprise_enabled" boolean NOT NULL DEFAULT false;

UPDATE "subscription_plans"
SET "enterprise_enabled" = true
WHERE lower(coalesce("code", '')) = 'enterprise';

CREATE TABLE IF NOT EXISTS "enterprises" (
  "id" uuid PRIMARY KEY NOT NULL,
"code" varchar NOT NULL,
  "name" varchar NOT NULL,
  "enterprise_type" varchar NOT NULL DEFAULT 'PARENT_ENTERPRISE',
  "parent_enterprise_id" uuid REFERENCES "enterprises" ("id"),
  "hierarchy_level" integer NOT NULL DEFAULT 0,
  "hierarchy_path" text NOT NULL DEFAULT '',
  "description" text,
  "status" varchar NOT NULL DEFAULT 'ACTIVE',
  "legal_name" varchar,
  "tax_id" varchar,
  "country" varchar,
  "state" varchar,
  "city" varchar,
  "postal_code" varchar,
  "address" text,
  "timezone" varchar,
  "currency" varchar,
  "compliance_score" integer NOT NULL DEFAULT 100,
  "compliance_status" varchar NOT NULL DEFAULT 'COMPLIANT',
  "owner_user_id" uuid REFERENCES "users" ("id"),
  "created_by" uuid REFERENCES "users" ("id"),
  "updated_by" uuid REFERENCES "users" ("id"),
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "enterprise_type" varchar NOT NULL DEFAULT 'PARENT_ENTERPRISE';
ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "parent_enterprise_id" uuid REFERENCES "enterprises" ("id");
ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "hierarchy_level" integer NOT NULL DEFAULT 0;
ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "hierarchy_path" text NOT NULL DEFAULT '';
ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "legal_name" varchar;
ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "tax_id" varchar;
ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "country" varchar;
ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "state" varchar;
ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "city" varchar;
ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "postal_code" varchar;
ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "address" text;
ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "timezone" varchar;
ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "currency" varchar;
ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "compliance_score" integer NOT NULL DEFAULT 100;
ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "compliance_status" varchar NOT NULL DEFAULT 'COMPLIANT';
ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "created_by" uuid REFERENCES "users" ("id");
ALTER TABLE "enterprises" ADD COLUMN IF NOT EXISTS "updated_by" uuid REFERENCES "users" ("id");

CREATE TABLE IF NOT EXISTS "enterprise_companies" (
  "id" uuid PRIMARY KEY NOT NULL,
  "enterprise_id" uuid NOT NULL REFERENCES "enterprises" ("id"),
  "company_id" uuid NOT NULL REFERENCES "companies" ("id"),
  "joined_at" timestamp NOT NULL DEFAULT now(),
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "enterprise_users" (
  "id" uuid PRIMARY KEY NOT NULL,
  "enterprise_id" uuid NOT NULL REFERENCES "enterprises" ("id"),
  "user_id" uuid NOT NULL REFERENCES "users" ("id"),
  "role" varchar NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "enterprise_settings" (
  "id" uuid PRIMARY KEY NOT NULL,
  "enterprise_id" uuid NOT NULL UNIQUE REFERENCES "enterprises" ("id"),
  "default_currency" varchar,
  "default_timezone" varchar,
  "shared_catalog_enabled" boolean NOT NULL DEFAULT false,
  "intercompany_transfer_enabled" boolean NOT NULL DEFAULT false,
  "intercompany_billing_enabled" boolean NOT NULL DEFAULT false,
  "consolidated_reporting_enabled" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "enterprise_configuration_settings" (
  "id" uuid PRIMARY KEY NOT NULL,
  "enterprise_id" uuid NOT NULL REFERENCES "enterprises" ("id"),
  "section" varchar NOT NULL,
  "setting_key" varchar NOT NULL,
  "setting_value" jsonb,
  "inherited_from" uuid REFERENCES "enterprises" ("id"),
  "source_enterprise_id" uuid REFERENCES "enterprises" ("id"),
  "override_allowed" boolean NOT NULL DEFAULT true,
  "override_status" varchar NOT NULL DEFAULT 'UNCONFIGURED',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "enterprise_documents" (
  "id" uuid PRIMARY KEY NOT NULL,
  "enterprise_id" uuid NOT NULL REFERENCES "enterprises" ("id"),
  "document_name" varchar NOT NULL,
  "category" varchar NOT NULL,
  "status" varchar NOT NULL DEFAULT 'ACTIVE',
  "version" integer NOT NULL DEFAULT 1,
  "file_key" text,
  "file_url" text,
  "uploaded_by" uuid REFERENCES "users" ("id"),
  "deleted_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "intercompany_transfers" (
  "id" uuid PRIMARY KEY NOT NULL,
  "enterprise_id" uuid NOT NULL REFERENCES "enterprises" ("id"),
  "source_enterprise_id" uuid REFERENCES "enterprises" ("id"),
  "destination_enterprise_id" uuid REFERENCES "enterprises" ("id"),
  "source_company_id" uuid REFERENCES "companies" ("id"),
  "destination_company_id" uuid REFERENCES "companies" ("id"),
  "source_organization_id" uuid REFERENCES "organizations" ("id"),
  "destination_organization_id" uuid REFERENCES "organizations" ("id"),
  "source_warehouse_id" uuid,
  "destination_warehouse_id" uuid,
  "transfer_number" varchar NOT NULL,
  "reference_number" varchar,
  "transfer_type" varchar NOT NULL DEFAULT 'STOCK_TRANSFER',
  "transfer_date" date,
  "planned_ship_date" date,
  "expected_delivery_date" date,
  "priority" varchar NOT NULL DEFAULT 'NORMAL',
  "reason" varchar,
  "shipping_method" varchar,
  "carrier" varchar,
  "tracking_number" varchar,
  "special_instructions" text,
  "internal_notes" text,
  "settlement_method" varchar,
  "billing_enterprise_id" uuid REFERENCES "enterprises" ("id"),
  "currency" varchar,
  "tax_handling" varchar,
  "invoice_generation" varchar,
  "total_items" integer NOT NULL DEFAULT 0,
  "total_quantity" numeric NOT NULL DEFAULT 0,
  "total_value" numeric NOT NULL DEFAULT 0,
  "settlement_status" varchar NOT NULL DEFAULT 'UNSETTLED',
  "workflow_status" varchar NOT NULL DEFAULT 'DRAFT',
  "approval_note" text,
  "business_justification" text,
  "risk_acknowledged" boolean NOT NULL DEFAULT false,
  "policy_acknowledged" boolean NOT NULL DEFAULT false,
  "submitted_at" timestamp,
  "submitted_by" uuid REFERENCES "users" ("id"),
  "status" varchar NOT NULL DEFAULT 'DRAFT',
  "created_by" uuid REFERENCES "users" ("id"),
  "approved_by" uuid REFERENCES "users" ("id"),
  "approved_at" timestamp,
  "rejected_by" uuid REFERENCES "users" ("id"),
  "rejected_at" timestamp,
  "dispatched_at" timestamp,
  "received_at" timestamp,
  "completed_at" timestamp,
  "cancelled_at" timestamp,
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "created_at" timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "source_enterprise_id" uuid REFERENCES "enterprises" ("id");
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "destination_enterprise_id" uuid REFERENCES "enterprises" ("id");
ALTER TABLE "intercompany_transfers" ALTER COLUMN "source_company_id" DROP NOT NULL;
ALTER TABLE "intercompany_transfers" ALTER COLUMN "destination_company_id" DROP NOT NULL;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "reference_number" varchar;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "transfer_type" varchar NOT NULL DEFAULT 'STOCK_TRANSFER';
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "transfer_date" date;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "planned_ship_date" date;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "expected_delivery_date" date;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "priority" varchar NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "reason" varchar;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "shipping_method" varchar;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "carrier" varchar;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "tracking_number" varchar;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "special_instructions" text;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "internal_notes" text;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "settlement_method" varchar;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "billing_enterprise_id" uuid REFERENCES "enterprises" ("id");
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "currency" varchar;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "total_items" integer NOT NULL DEFAULT 0;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "total_quantity" numeric NOT NULL DEFAULT 0;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "total_value" numeric NOT NULL DEFAULT 0;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "settlement_status" varchar NOT NULL DEFAULT 'UNSETTLED';
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "workflow_status" varchar NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "approval_note" text;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "business_justification" text;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "risk_acknowledged" boolean NOT NULL DEFAULT false;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "policy_acknowledged" boolean NOT NULL DEFAULT false;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "submitted_at" timestamp;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "submitted_by" uuid REFERENCES "users" ("id");
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "approved_at" timestamp;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "rejected_by" uuid REFERENCES "users" ("id");
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "rejected_at" timestamp;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "dispatched_at" timestamp;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "received_at" timestamp;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "completed_at" timestamp;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "cancelled_at" timestamp;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "updated_at" timestamp NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS "intercompany_transfer_items" (
  "id" uuid PRIMARY KEY NOT NULL,
  "transfer_id" uuid NOT NULL REFERENCES "intercompany_transfers" ("id"),
  "product_id" uuid,
  "product_sku" varchar NOT NULL,
  "product_name" varchar NOT NULL,
  "product_category" varchar,
  "product_image_url" text,
  "available_stock" numeric NOT NULL DEFAULT 0,
  "transfer_quantity" numeric NOT NULL,
  "uom" varchar NOT NULL,
  "unit_cost" numeric NOT NULL DEFAULT 0,
  "subtotal" numeric NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "intercompany_transfer_attachments" (
  "id" uuid PRIMARY KEY NOT NULL,
  "transfer_id" uuid NOT NULL REFERENCES "intercompany_transfers" ("id"),
  "file_name" varchar NOT NULL,
  "file_type" varchar,
  "file_size" varchar,
  "file_key" text,
  "file_url" text,
  "uploaded_by" uuid REFERENCES "users" ("id"),
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "intercompany_transfer_approval_steps" (
  "id" uuid PRIMARY KEY NOT NULL,
  "transfer_id" uuid NOT NULL REFERENCES "intercompany_transfers" ("id"),
  "step_order" integer NOT NULL,
  "step_name" varchar NOT NULL,
  "approver_role" varchar NOT NULL,
  "approver_user_id" uuid REFERENCES "users" ("id"),
  "status" varchar NOT NULL DEFAULT 'PENDING',
  "decision" varchar,
  "decision_comment" text,
  "decided_at" timestamp,
  "sla_hours" integer,
  "escalation_after_hours" integer,
  "escalation_role" varchar,
  "applied_policy" varchar,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "intercompany_transfer_timeline" (
  "id" uuid PRIMARY KEY NOT NULL,
  "transfer_id" uuid NOT NULL REFERENCES "intercompany_transfers" ("id"),
  "event_type" varchar NOT NULL,
  "event_label" varchar NOT NULL,
  "event_status" varchar NOT NULL,
  "actor_user_id" uuid REFERENCES "users" ("id"),
  "comment" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "intercompany_transfer_policy_checks" (
  "id" uuid PRIMARY KEY NOT NULL,
  "transfer_id" uuid NOT NULL REFERENCES "intercompany_transfers" ("id"),
  "check_key" varchar NOT NULL,
  "check_label" varchar NOT NULL,
  "status" varchar NOT NULL,
  "message" text,
  "severity" varchar NOT NULL DEFAULT 'INFO',
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "intercompany_settlements" (
  "id" uuid PRIMARY KEY NOT NULL,
  "transfer_id" uuid NOT NULL REFERENCES "intercompany_transfers" ("id"),
  "settlement_method" varchar NOT NULL,
  "billing_enterprise_id" uuid REFERENCES "enterprises" ("id"),
  "currency" varchar NOT NULL,
  "amount" numeric NOT NULL DEFAULT 0,
  "status" varchar NOT NULL DEFAULT 'UNSETTLED',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "intercompany_invoices" (
  "id" uuid PRIMARY KEY NOT NULL,
  "transfer_id" uuid REFERENCES "intercompany_transfers" ("id"),
  "source_company_id" uuid NOT NULL REFERENCES "companies" ("id"),
  "destination_company_id" uuid NOT NULL REFERENCES "companies" ("id"),
  "invoice_number" varchar NOT NULL,
  "amount" numeric NOT NULL,
  "currency" varchar NOT NULL,
  "status" varchar NOT NULL DEFAULT 'DRAFT',
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_enterprise_company_active
  ON "enterprise_companies" ("company_id");

CREATE UNIQUE INDEX IF NOT EXISTS uq_enterprise_user_role
  ON "enterprise_users" ("enterprise_id", "user_id");

CREATE INDEX IF NOT EXISTS idx_enterprises_owner_user_id
  ON "enterprises" ("owner_user_id");

CREATE INDEX IF NOT EXISTS idx_enterprises_parent_enterprise_id
  ON "enterprises" ("parent_enterprise_id");

CREATE INDEX IF NOT EXISTS idx_enterprises_hierarchy_path
  ON "enterprises" ("hierarchy_path");

CREATE INDEX IF NOT EXISTS idx_enterprise_companies_enterprise_id
  ON "enterprise_companies" ("enterprise_id");

CREATE UNIQUE INDEX IF NOT EXISTS uq_enterprise_configuration_setting
  ON "enterprise_configuration_settings" ("enterprise_id", "section", "setting_key");

CREATE INDEX IF NOT EXISTS idx_enterprise_configuration_source
  ON "enterprise_configuration_settings" ("source_enterprise_id");

CREATE INDEX IF NOT EXISTS idx_enterprise_documents_enterprise_id
  ON "enterprise_documents" ("enterprise_id")
  WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS idx_intercompany_transfers_enterprise_id
  ON "intercompany_transfers" ("enterprise_id");

CREATE INDEX IF NOT EXISTS idx_intercompany_transfers_status
  ON "intercompany_transfers" ("enterprise_id", "status", "created_at" DESC);

CREATE INDEX IF NOT EXISTS idx_intercompany_transfers_source_destination
  ON "intercompany_transfers" ("source_enterprise_id", "destination_enterprise_id");

CREATE INDEX IF NOT EXISTS idx_intercompany_transfer_items_transfer_id
  ON "intercompany_transfer_items" ("transfer_id");

CREATE INDEX IF NOT EXISTS idx_intercompany_transfer_approval_steps_transfer_id
  ON "intercompany_transfer_approval_steps" ("transfer_id", "step_order");

CREATE INDEX IF NOT EXISTS idx_intercompany_transfer_timeline_transfer_id
  ON "intercompany_transfer_timeline" ("transfer_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS idx_intercompany_settlements_transfer_id
  ON "intercompany_settlements" ("transfer_id");

CREATE INDEX IF NOT EXISTS idx_intercompany_invoices_transfer_id
  ON "intercompany_invoices" ("transfer_id");

CREATE TABLE IF NOT EXISTS "user_zone_access" (
  "id" uuid PRIMARY KEY NOT NULL,
  "company_id" uuid REFERENCES "companies" ("id"),
  "user_id" uuid REFERENCES "users" ("id"),
  "all_zones" boolean DEFAULT false,
  "zone_ids" jsonb,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

-- Source patch: 2026-06-26-company-scoped-identity-constraints.sql
ALTER TABLE "enterprises" DROP CONSTRAINT IF EXISTS "enterprises_code_unique";
DROP INDEX IF EXISTS idx_enterprises_owner_code;
CREATE UNIQUE INDEX IF NOT EXISTS idx_enterprises_owner_code
  ON enterprises (owner_user_id, lower(trim(code)));

DROP INDEX IF EXISTS idx_organizations_company_name_active;
CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_company_name_active
  ON organizations (company_id, lower(trim(name)))
  WHERE deleted_at IS NULL AND name IS NOT NULL;

DROP INDEX IF EXISTS idx_organizations_company_code_active;
CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_company_code_active
  ON organizations (company_id, lower(trim(organization_code)))
  WHERE deleted_at IS NULL AND organization_code IS NOT NULL;

-- Hierarchy Membership Architecture
CREATE TABLE IF NOT EXISTS enterprise_memberships (
  id UUID PRIMARY KEY,
  enterprise_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role_id UUID,
  permission_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR NOT NULL DEFAULT 'ACTIVE',
  invitation_source VARCHAR,
  effective_from TIMESTAMP,
  effective_to TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (enterprise_id, user_id)
);

CREATE TABLE IF NOT EXISTS company_memberships (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  enterprise_id UUID,
  user_id UUID NOT NULL,
  role_id UUID,
  permission_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR NOT NULL DEFAULT 'ACTIVE',
  invitation_source VARCHAR,
  effective_from TIMESTAMP,
  effective_to TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);

CREATE TABLE IF NOT EXISTS organization_memberships (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role_id UUID,
  permission_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR NOT NULL DEFAULT 'ACTIVE',
  invitation_source VARCHAR,
  effective_from TIMESTAMP,
  effective_to TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS warehouse_memberships (
  id UUID PRIMARY KEY,
  warehouse_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role_id UUID,
  permission_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR NOT NULL DEFAULT 'ACTIVE',
  invitation_source VARCHAR,
  effective_from TIMESTAMP,
  effective_to TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (warehouse_id, user_id)
);

CREATE TABLE IF NOT EXISTS plan_limits (
  id UUID PRIMARY KEY,
  plan_id UUID NOT NULL UNIQUE,
  max_enterprises INTEGER,
  max_companies_per_enterprise INTEGER,
  max_standalone_companies INTEGER,
  max_organizations_per_company INTEGER,
  max_warehouses_per_organization INTEGER,
  max_users INTEGER,
  max_storage_bytes INTEGER,
  max_api_requests INTEGER,
  max_integrations INTEGER,
  trial_days INTEGER,
  custom_limits_allowed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usage_counters (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  enterprise_id UUID,
  company_id UUID,
  organization_id UUID,
  warehouse_id UUID,
  counter_key VARCHAR NOT NULL,
  counter_value INTEGER NOT NULL DEFAULT 0,
  refreshed_at TIMESTAMP NOT NULL DEFAULT now(),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (user_id, enterprise_id, company_id, organization_id, warehouse_id, counter_key)
);

CREATE TABLE IF NOT EXISTS membership_audit (
  id UUID PRIMARY KEY,
  membership_id UUID,
  membership_type VARCHAR NOT NULL,
  user_id UUID NOT NULL,
  enterprise_id UUID,
  company_id UUID,
  organization_id UUID,
  warehouse_id UUID,
  action VARCHAR NOT NULL,
  result VARCHAR NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  request_id VARCHAR,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "tax_handling" varchar;
ALTER TABLE "intercompany_transfers" ADD COLUMN IF NOT EXISTS "invoice_generation" varchar;

ALTER TABLE "intercompany_transfer_approval_steps" ADD COLUMN IF NOT EXISTS "sla_hours" integer;
ALTER TABLE "intercompany_transfer_approval_steps" ADD COLUMN IF NOT EXISTS "escalation_after_hours" integer;
ALTER TABLE "intercompany_transfer_approval_steps" ADD COLUMN IF NOT EXISTS "escalation_role" varchar;
ALTER TABLE "intercompany_transfer_approval_steps" ADD COLUMN IF NOT EXISTS "applied_policy" varchar;

COMMIT;
