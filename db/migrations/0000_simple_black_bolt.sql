CREATE TABLE "frames" (
	"id" serial PRIMARY KEY NOT NULL,
	"discipline" text NOT NULL,
	"frame_number" varchar(32) NOT NULL,
	"roll_tag" varchar(32),
	"title" text,
	"caption" text,
	"image_url" text,
	"stream_video_id" text,
	"project_id" integer,
	"display_order" integer DEFAULT 0 NOT NULL,
	"featured_on_home" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(128) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theme_palettes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"background" varchar(7) NOT NULL,
	"text_primary" varchar(7) NOT NULL,
	"accent_primary" varchar(7) NOT NULL,
	"accent_secondary" varchar(7) NOT NULL,
	"accent_tertiary" varchar(7) NOT NULL,
	"accent_soft" varchar(7) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "theme_palettes_name_unique" UNIQUE("name"),
	CONSTRAINT "background_is_hex" CHECK ("theme_palettes"."background" ~ '^#[0-9A-Fa-f]{6}$'),
	CONSTRAINT "text_primary_is_hex" CHECK ("theme_palettes"."text_primary" ~ '^#[0-9A-Fa-f]{6}$'),
	CONSTRAINT "accent_primary_is_hex" CHECK ("theme_palettes"."accent_primary" ~ '^#[0-9A-Fa-f]{6}$'),
	CONSTRAINT "accent_secondary_is_hex" CHECK ("theme_palettes"."accent_secondary" ~ '^#[0-9A-Fa-f]{6}$'),
	CONSTRAINT "accent_tertiary_is_hex" CHECK ("theme_palettes"."accent_tertiary" ~ '^#[0-9A-Fa-f]{6}$'),
	CONSTRAINT "accent_soft_is_hex" CHECK ("theme_palettes"."accent_soft" ~ '^#[0-9A-Fa-f]{6}$')
);
--> statement-breakpoint
CREATE TABLE "theme_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(64) NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "theme_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "frames" ADD CONSTRAINT "frames_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "only_one_active_palette" ON "theme_palettes" USING btree ("is_active") WHERE "theme_palettes"."is_active" = true;