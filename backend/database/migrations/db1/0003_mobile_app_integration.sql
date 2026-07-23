DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'official_mandi_prices' AND column_name = 'variant_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'official_mandi_prices' AND column_name = 'crop_id') THEN
    ALTER TABLE "official_mandi_prices" RENAME COLUMN "variant_id" TO "crop_id";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trader_mandi_prices' AND column_name = 'variant_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trader_mandi_prices' AND column_name = 'crop_id') THEN
    ALTER TABLE "trader_mandi_prices" RENAME COLUMN "variant_id" TO "crop_id";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mandi_price_history' AND column_name = 'variant_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mandi_price_history' AND column_name = 'crop_id') THEN
    ALTER TABLE "mandi_price_history" RENAME COLUMN "variant_id" TO "crop_id";
  END IF;
END $$;
--> statement-breakpoint
-- The legacy columns pointed at product_variants. Farmer-facing prices are
-- recorded against global products, so move all three foreign keys with the
-- renamed crop_id columns as part of the same migration.
ALTER TABLE "official_mandi_prices" DROP CONSTRAINT IF EXISTS "official_mandi_prices_variant_id_product_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "trader_mandi_prices" DROP CONSTRAINT IF EXISTS "trader_mandi_prices_variant_id_product_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "mandi_price_history" DROP CONSTRAINT IF EXISTS "mandi_price_history_variant_id_product_variants_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "official_mandi_prices" ADD CONSTRAINT "official_mandi_prices_crop_id_products_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."products"("id");
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trader_mandi_prices" ADD CONSTRAINT "trader_mandi_prices_crop_id_products_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."products"("id");
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mandi_price_history" ADD CONSTRAINT "mandi_price_history_crop_id_products_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."products"("id");
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
ALTER TABLE "official_mandi_prices" ADD COLUMN IF NOT EXISTS "grade" varchar;
--> statement-breakpoint
ALTER TABLE "official_mandi_prices" ADD COLUMN IF NOT EXISTS "unit" varchar DEFAULT 'QUINTAL' NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "farmer_calendar_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "farmer_id" uuid NOT NULL,
  "crop_id" uuid,
  "event_date" date NOT NULL,
  "event_type" varchar DEFAULT 'FARM_ACTIVITY' NOT NULL,
  "title" varchar NOT NULL,
  "description" text,
  "status" varchar DEFAULT 'SCHEDULED' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "farmer_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "farmer_id" uuid NOT NULL,
  "crop_id" uuid,
  "title" varchar NOT NULL,
  "description" text,
  "due_date" date NOT NULL,
  "priority" varchar DEFAULT 'MEDIUM' NOT NULL,
  "status" varchar DEFAULT 'PENDING' NOT NULL,
  "completed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "farmer_calendar_events" ADD CONSTRAINT "farmer_calendar_events_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "farmer_calendar_events" ADD CONSTRAINT "farmer_calendar_events_crop_id_products_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."products"("id");
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "farmer_tasks" ADD CONSTRAINT "farmer_tasks_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "farmer_tasks" ADD CONSTRAINT "farmer_tasks_crop_id_products_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."products"("id");
EXCEPTION WHEN duplicate_object THEN null; END $$;
