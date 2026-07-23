ALTER TABLE "official_mandi_prices"
  ADD COLUMN IF NOT EXISTS "arrival_quantity" numeric,
  ADD COLUMN IF NOT EXISTS "arrival_unit" varchar;
--> statement-breakpoint
ALTER TABLE "trader_mandi_prices"
  ADD COLUMN IF NOT EXISTS "price_date" date DEFAULT CURRENT_DATE NOT NULL,
  ADD COLUMN IF NOT EXISTS "grade" varchar;
--> statement-breakpoint
ALTER TABLE "market_insights"
  ADD COLUMN IF NOT EXISTS "weather_impact" jsonb,
  ADD COLUMN IF NOT EXISTS "storage_advice" text,
  ADD COLUMN IF NOT EXISTS "storage_expected_gain_min" numeric,
  ADD COLUMN IF NOT EXISTS "storage_expected_gain_max" numeric;
