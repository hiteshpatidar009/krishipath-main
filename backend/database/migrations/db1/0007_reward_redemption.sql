CREATE TABLE IF NOT EXISTS "reward_catalog" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" varchar(80) NOT NULL UNIQUE,
  "title" varchar NOT NULL,
  "description" text,
  "points_cost" integer NOT NULL,
  "icon" varchar(16),
  "stock" integer,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "reward_catalog_positive_cost" CHECK ("points_cost" > 0),
  CONSTRAINT "reward_catalog_nonnegative_stock" CHECK ("stock" IS NULL OR "stock" >= 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reward_redemptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "farmer_id" uuid NOT NULL,
  "catalog_item_id" uuid NOT NULL,
  "points_cost" integer NOT NULL,
  "status" varchar(30) DEFAULT 'REQUESTED' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_farmer_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id");
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_catalog_item_id_fk" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."reward_catalog"("id");
EXCEPTION WHEN duplicate_object THEN null; END $$;
