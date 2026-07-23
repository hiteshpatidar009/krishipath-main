CREATE TABLE IF NOT EXISTS "farmer_market_watchlist" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "farmer_id" uuid NOT NULL,
  "mandi_id" uuid NOT NULL,
  "crop_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "farmer_market_watchlist_unique" UNIQUE("farmer_id", "mandi_id", "crop_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "farmer_market_watchlist" ADD CONSTRAINT "farmer_market_watchlist_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "farmer_market_watchlist" ADD CONSTRAINT "farmer_market_watchlist_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "farmer_market_watchlist" ADD CONSTRAINT "farmer_market_watchlist_crop_id_products_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."products"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null; END $$;
