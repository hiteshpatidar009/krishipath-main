CREATE TABLE "content_creators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"bio" text,
	"avatar_url" varchar,
	"specialty" varchar,
	"followers_k" numeric DEFAULT '0' NOT NULL,
	"status" varchar DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_poll_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"text" varchar NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_polls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" varchar NOT NULL,
	"region" varchar,
	"target_districts" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"total_votes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"crop_id" uuid NOT NULL,
	"mandi_id" uuid,
	"predicted_price" numeric NOT NULL,
	"direction" varchar NOT NULL,
	"period" varchar NOT NULL,
	"confidence" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_schemes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"category" varchar,
	"state" varchar,
	"link" varchar,
	"image_url" varchar,
	"status" varchar DEFAULT 'ACTIVE' NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_shorts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"video_url" varchar NOT NULL,
	"thumbnail_url" varchar,
	"creator_id" uuid,
	"views" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"language" varchar DEFAULT 'hi',
	"status" varchar DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_poll_options" ADD CONSTRAINT "content_poll_options_poll_id_content_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."content_polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_predictions" ADD CONSTRAINT "content_predictions_crop_id_products_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_predictions" ADD CONSTRAINT "content_predictions_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_shorts" ADD CONSTRAINT "content_shorts_creator_id_content_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."content_creators"("id") ON DELETE no action ON UPDATE no action;