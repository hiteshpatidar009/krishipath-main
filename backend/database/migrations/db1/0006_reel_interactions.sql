ALTER TABLE "content_shorts" ADD COLUMN IF NOT EXISTS "shares" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content_short_reactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "short_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "content_short_reactions_unique" UNIQUE("short_id", "user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content_short_saves" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "short_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "content_short_saves_unique" UNIQUE("short_id", "user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content_creator_follows" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "creator_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "content_creator_follows_unique" UNIQUE("creator_id", "user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content_short_comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "short_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "body" text NOT NULL,
  "status" varchar DEFAULT 'ACTIVE' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content_short_reactions" ADD CONSTRAINT "content_short_reactions_short_id_fk" FOREIGN KEY ("short_id") REFERENCES "public"."content_shorts"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content_short_reactions" ADD CONSTRAINT "content_short_reactions_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content_short_saves" ADD CONSTRAINT "content_short_saves_short_id_fk" FOREIGN KEY ("short_id") REFERENCES "public"."content_shorts"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content_short_saves" ADD CONSTRAINT "content_short_saves_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content_creator_follows" ADD CONSTRAINT "content_creator_follows_creator_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."content_creators"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content_creator_follows" ADD CONSTRAINT "content_creator_follows_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content_short_comments" ADD CONSTRAINT "content_short_comments_short_id_fk" FOREIGN KEY ("short_id") REFERENCES "public"."content_shorts"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null; END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content_short_comments" ADD CONSTRAINT "content_short_comments_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN null; END $$;
