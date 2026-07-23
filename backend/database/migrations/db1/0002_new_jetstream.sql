CREATE TABLE "plan_limits" (
	"id" uuid PRIMARY KEY NOT NULL,
	"plan_id" uuid NOT NULL,
	"max_enterprises" integer,
	"max_companies_per_enterprise" integer,
	"max_standalone_companies" integer,
	"max_organizations_per_company" integer,
	"max_warehouses_per_organization" integer,
	"max_users" integer,
	"max_storage_bytes" integer,
	"max_api_requests" integer,
	"max_integrations" integer,
	"trial_days" integer,
	"custom_limits_allowed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_counters" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid,
	"company_id" uuid,
	"organization_id" uuid,
	"warehouse_id" uuid,
	"counter_key" varchar NOT NULL,
	"counter_value" integer DEFAULT 0 NOT NULL,
	"refreshed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_memberships" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid NOT NULL,
	"enterprise_id" uuid,
	"user_id" uuid NOT NULL,
	"role_id" uuid,
	"permission_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar DEFAULT 'ACTIVE' NOT NULL,
	"invitation_source" varchar,
	"effective_from" timestamp,
	"effective_to" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enterprise_memberships" (
	"id" uuid PRIMARY KEY NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid,
	"permission_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar DEFAULT 'ACTIVE' NOT NULL,
	"invitation_source" varchar,
	"effective_from" timestamp,
	"effective_to" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership_audit" (
	"id" uuid PRIMARY KEY NOT NULL,
	"membership_id" uuid,
	"membership_type" varchar NOT NULL,
	"user_id" uuid NOT NULL,
	"enterprise_id" uuid,
	"company_id" uuid,
	"organization_id" uuid,
	"warehouse_id" uuid,
	"action" varchar NOT NULL,
	"result" varchar NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"request_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_memberships" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid,
	"permission_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar DEFAULT 'ACTIVE' NOT NULL,
	"invitation_source" varchar,
	"effective_from" timestamp,
	"effective_to" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouse_memberships" (
	"id" uuid PRIMARY KEY NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid,
	"permission_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar DEFAULT 'ACTIVE' NOT NULL,
	"invitation_source" varchar,
	"effective_from" timestamp,
	"effective_to" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_source_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_source_id" uuid NOT NULL,
	"total_messages" integer DEFAULT 0,
	"total_parsed_prices" integer DEFAULT 0,
	"products_covered" integer DEFAULT 0,
	"average_ai_confidence" numeric DEFAULT '0',
	"average_daily_messages" numeric DEFAULT '0',
	"most_reported_product_id" uuid,
	"monthly_activity" jsonb,
	"last_active" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "market_source_analytics_market_source_id_unique" UNIQUE("market_source_id")
);
--> statement-breakpoint
CREATE TABLE "market_source_mandis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_source_id" uuid NOT NULL,
	"mandi_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_source_parser_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_source_id" uuid NOT NULL,
	"parser_version" varchar,
	"language" varchar DEFAULT 'hi',
	"unknown_words" jsonb,
	"mapped_aliases" jsonb,
	"failed_messages" integer DEFAULT 0,
	"success_rate" numeric DEFAULT '0',
	"learned_keywords" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "market_source_parser_profiles_market_source_id_unique" UNIQUE("market_source_id")
);
--> statement-breakpoint
CREATE TABLE "market_source_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_source_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_source_timeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_source_id" uuid NOT NULL,
	"activity_type" varchar NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_name" varchar NOT NULL,
	"owner_name" varchar NOT NULL,
	"mobile_number" varchar NOT NULL,
	"whatsapp_number" varchar,
	"whatsapp_group_id" varchar,
	"alternative_number" varchar,
	"email" varchar,
	"mandi_id" uuid,
	"state_id" uuid,
	"district_id" uuid,
	"address" text,
	"languages" jsonb,
	"products_dealing_in" jsonb,
	"notes" text,
	"status" varchar DEFAULT 'ACTIVE' NOT NULL,
	"source_type" varchar DEFAULT 'WHATSAPP' NOT NULL,
	"trust_score" integer DEFAULT 0,
	"parser_accuracy" numeric DEFAULT '0',
	"login_enabled" boolean DEFAULT false NOT NULL,
	"user_id" uuid,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mandi_reference_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mandi_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"unit" varchar NOT NULL,
	"ref_min_price" numeric,
	"ref_max_price" numeric,
	"ref_avg_price" numeric,
	"trader_count" integer DEFAULT 0 NOT NULL,
	"weighted_confidence" numeric,
	"last_calculated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_source_id" uuid NOT NULL,
	"mandi_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"unit" varchar NOT NULL,
	"min_price" numeric,
	"max_price" numeric,
	"modal_price" numeric,
	"ai_confidence" integer,
	"source" varchar DEFAULT 'WHATSAPP_AI' NOT NULL,
	"status" varchar DEFAULT 'PENDING' NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "market_source_analytics" ADD CONSTRAINT "market_source_analytics_market_source_id_market_sources_id_fk" FOREIGN KEY ("market_source_id") REFERENCES "public"."market_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_source_analytics" ADD CONSTRAINT "market_source_analytics_most_reported_product_id_products_id_fk" FOREIGN KEY ("most_reported_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_source_mandis" ADD CONSTRAINT "market_source_mandis_market_source_id_market_sources_id_fk" FOREIGN KEY ("market_source_id") REFERENCES "public"."market_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_source_mandis" ADD CONSTRAINT "market_source_mandis_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_source_parser_profiles" ADD CONSTRAINT "market_source_parser_profiles_market_source_id_market_sources_id_fk" FOREIGN KEY ("market_source_id") REFERENCES "public"."market_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_source_products" ADD CONSTRAINT "market_source_products_market_source_id_market_sources_id_fk" FOREIGN KEY ("market_source_id") REFERENCES "public"."market_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_source_products" ADD CONSTRAINT "market_source_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_source_timeline" ADD CONSTRAINT "market_source_timeline_market_source_id_market_sources_id_fk" FOREIGN KEY ("market_source_id") REFERENCES "public"."market_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_source_timeline" ADD CONSTRAINT "market_source_timeline_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_sources" ADD CONSTRAINT "market_sources_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_sources" ADD CONSTRAINT "market_sources_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_sources" ADD CONSTRAINT "market_sources_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_sources" ADD CONSTRAINT "market_sources_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_sources" ADD CONSTRAINT "market_sources_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_reference_prices" ADD CONSTRAINT "mandi_reference_prices_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_reference_prices" ADD CONSTRAINT "mandi_reference_prices_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mandi_reference_prices" ADD CONSTRAINT "mandi_reference_prices_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_submissions" ADD CONSTRAINT "price_submissions_market_source_id_market_sources_id_fk" FOREIGN KEY ("market_source_id") REFERENCES "public"."market_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_submissions" ADD CONSTRAINT "price_submissions_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_submissions" ADD CONSTRAINT "price_submissions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_submissions" ADD CONSTRAINT "price_submissions_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;