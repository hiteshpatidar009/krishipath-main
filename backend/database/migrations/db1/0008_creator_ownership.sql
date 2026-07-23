ALTER TABLE "content_creators" ADD COLUMN IF NOT EXISTS "owner_user_id" uuid;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "content_creators_owner_user_id_unique" ON "content_creators" ("owner_user_id") WHERE "owner_user_id" IS NOT NULL;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content_creators" ADD CONSTRAINT "content_creators_owner_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN null; END $$;
